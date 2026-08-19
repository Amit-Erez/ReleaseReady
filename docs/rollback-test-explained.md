# How the rollback test works

A walkthrough of `apps/api/tests/submit.test.ts`'s third test — "rolls back if a
failure happens between the two writes" — the most technically involved test
in the project, and the one the original brief calls "the one you build the
story and the test around." Written up in full after working through it
step by step, so it can be re-read before an interview instead of
re-derived from scratch.

## What this test proves

`submitRelease` (`apps/api/src/services/submissions.ts`) does two writes
inside one transaction: insert a `submissions` row, then flip
`releases.status` to `'submitted'`. The whole point of wrapping them in a
transaction is a guarantee: if the second write fails for any reason, the
first write gets undone too — there must never be a submission row for a
release that isn't marked submitted, or vice versa. This test exists to
*prove* that guarantee actually holds, not just assume it from reading the
code.

## Why it needs mocking at all

The problem: with valid, real data, there's no natural way to make the
second write (`UPDATE releases SET status = 'submitted' ...`) fail. It's a
trivially valid statement on a release we already know exists. To test the
failure path honestly, the test has to *deliberately inject* a fake failure
at exactly the right moment — which is what mocking is for.

## Core vocabulary (for when the terms get fuzzy)

- **A method is just a value.** `client.query` is a regular property sitting
  on an object, same as any other value — you're allowed to replace it with
  a different function at runtime.
- **Mocking** means temporarily swapping a real function for a fake one you
  control, so you can pretend something happened (succeeded, failed,
  returned specific data) without needing those real-world conditions to
  actually occur.
- **`vi.spyOn(object, "methodName")`** replaces a method with a controllable
  wrapper. By itself it still calls through to the real method — it's just
  "watching" until you tell it to do otherwise.
- **`.mockImplementation(fn)`** tells that wrapper to stop watching and
  start fully replacing — `fn` runs instead of the real method, completely.
- **`.bind(someObject)`** is unrelated to mocking — it's a general JS fix for
  the fact that pulling a method off an object into a plain variable makes
  it forget which object it came from. `client.query.bind(client)` gives a
  permanently-glued copy of the real method, saved *before* it gets
  replaced, so there's still a way to call the true original later.

## The two traps, and why both are needed

```ts
const client = await pool.connect();
let callCount = 0;
const originalQuery = client.query.bind(client);
vi.spyOn(client, "query").mockImplementation((text, values) => {
  callCount++;
  if (callCount === 3) {
    return Promise.reject(new Error("forced failure for rollback test"));
  }
  return originalQuery(text, values);
});

const originalConnect = pool.connect.bind(pool);
vi.spyOn(pool, "connect").mockImplementation((callback) => {
  if (callback) {
    return originalConnect(callback);
  }
  return Promise.resolve(client);
});
```

**Trap 1 (`client.query`)** rigs *one specific connection's* query method to
fail on its 3rd call and behave normally otherwise. `submitRelease` calls
`client.query` four times in order: `BEGIN` (1st), the `INSERT` (2nd), the
`UPDATE` (3rd — the target), `ROLLBACK` (4th, from the `catch` block). Only
call #3 gets faked; everything else is forwarded to the real thing via
`originalQuery`.

**Trap 2 (`pool.connect`)** exists to solve a different problem: how does
the *rigged* client from Trap 1 actually end up in `submitRelease`'s hands,
specifically, and not anywhere else?

## The discovery that mattered most: `pool.connect` has two calling styles

`pool.connect` can be called two different ways:
- **Promise style** (what `submitRelease` uses): `const client = await pool.connect();` — no argument, just wait for the answer.
- **Callback style**: `pool.connect((err, client, done) => { ... })` — hand it a helper function to run once a connection's ready.

The non-obvious part, only found by debugging: `pg`'s own `pool.query()` —
used everywhere else in this codebase (`getReleaseById`,
`listTracksByRelease`, `listTrackContributorsByTrack`, and the test's own
setup inserts) — is implemented *internally* using the callback style. This
is invisible from the outside; nothing in this project's own code reveals
it. It only became relevant once `pool.connect` itself got mocked.

So Trap 2 has to tell the two kinds of callers apart:
```ts
if (callback) {
  return originalConnect(callback);   // pool.query()'s hidden internal calls — leave alone
}
return Promise.resolve(client);       // submitRelease's own call — hand it the rigged client
```
Without this check, the very first `pool.query()` call anywhere in the
request (`getReleaseById`, which runs *before* `submitRelease` even starts)
would have consumed a naive "just intercept the next call" mock, using the
callback style our mock didn't know how to answer — which is exactly what
caused the first hang encountered while building this test.

## The full call-by-call trace

The thing that made this finally click: writing out every single call the
production code makes, in order, and marking which trap (if any) touches
each one.

**Step 1 — `getReleaseById` (via `pool.query`)**
- Call: `pool.connect(callback)`
- Seen by: Trap 2
- Outcome: callback present → not the target → forwarded to the real `connect` → ordinary connection

**Step 2 — `listTracksByRelease` (via `pool.query`)**
- Call: `pool.connect(callback)`
- Seen by: Trap 2
- Outcome: same as step 1

**Step 3 — `listTrackContributorsByTrack` (via `pool.query`)**
- Call: `pool.connect(callback)`
- Seen by: Trap 2
- Outcome: same as step 1

**Step 4 — `submitRelease`, first line**
- Call: `pool.connect()` — no callback
- Seen by: Trap 2
- Outcome: **the target** → hands back the rigged `client` instead of a fresh one

**Step 5 — `submitRelease`**
- Call: `client.query("BEGIN")`
- Seen by: Trap 1
- Outcome: count 1, not 3 → forwarded → real `BEGIN` runs

**Step 6 — `submitRelease`**
- Call: `client.query("INSERT...")`
- Seen by: Trap 1
- Outcome: count 2, not 3 → forwarded → real `INSERT` runs

**Step 7 — `submitRelease`**
- Call: `client.query("UPDATE...")`
- Seen by: Trap 1
- Outcome: **count 3 — the target** → fakes a rejected promise, real `UPDATE` never runs

**Step 8 — `submitRelease`'s `catch` block**
- Call: `client.query("ROLLBACK")`
- Seen by: Trap 1
- Outcome: count 4, not 3 → forwarded → real `ROLLBACK` undoes everything since `BEGIN`, including the `INSERT` from step 6

Rows 1-3 never touch `client.query` at all — they're a different call
(`pool.query`) on different, ordinary connections, invisible to Trap 1.
Only row 4 is where Trap 2 actually intervenes; only row 7 is where Trap 1
actually intervenes. Every other row is the trap just getting out of the
way.

## Why `vi.restoreAllMocks()` has to run immediately, not eventually

```ts
const res = await request(app).post(`/api/releases/${releaseId}/submit`);
vi.restoreAllMocks();

expect(res.status).toBe(500);
// ...DB assertions follow...
```

This was the second real bug hit while building this test — a second hang,
after the first one (the callback-vs-promise issue) was already fixed.

`submitRelease`'s `finally` block calls `client.release()`, handing the
*real* underlying connection back to `pg`'s pool. `.release()` isn't a note
to ourselves — it's `pg` tearing down that connection's active-use
machinery, because `pg` now considers it unclaimed and free for anyone
else. If Trap 2 were still active at that point, it would keep handing out
this same, now-retired `client` object to any future no-callback caller —
including the test's own follow-up `pool.query(...)` assertions. Using a
client `pg` itself considers "done with" doesn't throw a clean error; the
part of `pg` responsible for resolving a query's promise has already been
detached from it, so the call just hangs forever, waiting for a response
that will never arrive.

Restoring the mocks *immediately* after capturing `res` — before running
any further queries — guarantees everything afterward, including this same
test's own DB checks, runs against a completely normal, unmocked `pool`.

## Possible interview talking points

- "I wrote an integration test proving a database transaction's rollback
  behavior actually works — not just trusting the code, but forcing a
  failure between the two writes and asserting zero partial state was left
  behind."
- "Since there was no natural way to make the second write fail with valid
  data, I used dependency mocking (Vitest's `vi.spyOn`) to inject a failure
  at the exact right moment in the transaction."
- "While building it, I hit and debugged a real infinite hang, caused by
  `pg`'s connection-pool API secretly supporting two different calling
  conventions (promise-based and callback-based) — `pool.query()` uses the
  callback style internally, invisibly, which broke a naive mock that only
  handled the promise style."
- "I debugged it systematically with targeted logging at each layer of the
  call stack, rather than guessing, and confirmed the fix by watching
  execution actually reach the intended failure point."
- "I hit a second, related hang from reusing an already-released database
  connection, and fixed it by making sure test mocks are torn down the
  moment they're no longer needed, not just at the end of the test."
