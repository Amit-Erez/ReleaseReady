# Architecture decisions

Decisions made in a pre-build planning session (2026-07-29) for things the
project scope deliberately left open. Everything here is scaled to a
5-table, 8-endpoint, 3-screen, four-week project — bigger or more
"correct-looking" alternatives (repository layers, an ORM, query-file
loaders, transaction-wrapped tests, Next.js) were considered and passed
over because they don't pay for themselves at this size.

## Monorepo

npm workspaces: `apps/api` (Express backend), `apps/web` (Vite/React
frontend), `packages/shared` (Zod schemas + inferred TS types). No build
step for `packages/shared` — both apps consume its `.ts` source directly
since they already compile/bundle TypeScript themselves.

## TypeScript everywhere

Chosen specifically so `packages/shared`'s Zod schemas can drive
compile-time types on both sides, not just runtime validation.

## Backend layering

Routes handle HTTP only. Services hold business logic, including SQL (via
`pg`, parameterized inline template-literal queries — no query-file
abstraction, no ORM). No repository layer. The readiness-check function is
a pure function (data in, list of failures out) with zero I/O, specifically
so it's unit-testable without a database or HTTP layer — this was the
deciding factor over a flatter or more-layered alternative.

## Frontend

- **Vite**, not Next.js — deliberately avoided so there's no temptation to
  put backend logic in frontend API routes, which would undercut the
  project's whole point.
- **React Router** for the 3 screens.
- **React Hook Form + `@hookform/resolvers/zod`**, using the shared Zod
  schemas directly — "Zod-mirrored validation" means literally the same
  schema object, not hand-duplicated rules.
- **Tailwind CSS v4** via `@tailwindcss/vite` (no PostCSS/autoprefixer
  needed — v4 changed this).
- **Native HTML `<dialog>`** for the create/edit modal — accessible
  focus-trap/Escape/backdrop behavior for free, in line with a preference
  for semantic HTML over hand-rolled ARIA.

## Error response shape

Every endpoint returns:

```ts
{
  error: string;
  message: string;
  details?: Array<{ code: string; message: string; field?: string }>;
}
```

Chosen so validation errors (400) and readiness failures (422) can share
one rendering component on the frontend — both are fundamentally "a list
of problems," just at different scope (per-field vs. per-release-rule).

## Test database strategy

A separate test database, `TRUNCATE` on all tables in a `beforeEach`,
rather than wrapping tests in a rolled-back transaction. The
transaction-wrapping pattern was deliberately avoided because the app's own
submit-flow transaction is itself under test, and nesting transactions
(savepoints) would muddy what the rollback test actually proves.

## Config

`dotenv` (not Node's native `--env-file`, for tutorial-standard
predictability) plus a Zod schema validating `process.env` once at
startup, so a missing `DATABASE_URL` fails loudly and immediately rather
than surfacing as a confusing runtime error deep in a request handler.
Implemented in `apps/api/src/config.ts`.

## Database schema

Defined in `apps/api/migrations/1785872392108_create-initial-schema.ts` —
that file is the source of truth for exact column types and constraints.
The decisions below cover the reasoning that isn't obvious from reading
the migration alone.

**Nullability: strict by default.** Every column is `NOT NULL` unless a
specific reason requires it to be optional. The main reason is the 6
readiness rules (`releases.title`, `releases.upc`, `tracks.isrc`): each of
these must stay nullable, because a `NOT NULL` constraint would make the
database *guarantee* the value is always present — which would make the
corresponding readiness check permanently unfireable. Separately, this is
also a deliberate product stance: the app should not let users create
mostly-empty records freely, so every other column (`artist_name`,
`release_date`, track `title`, `track_number`, `contributors.default_role`,
etc.) defaults to required.

**Primary keys: integer identity, not UUID.** `GENERATED ALWAYS AS
IDENTITY` integers on every table. This is a single local Postgres
instance with no auth and no distributed/offline ID generation need — the
problems UUIDs solve don't apply here, and small sequential integers are
far easier to read by eye in pgAdmin/psql while developing and debugging.
Note that integer sequences can and do have gaps (failed inserts, rolled
back transactions) — this is normal Postgres behavior and not a
correctness concern, since IDs are never used to count rows or infer
creation order (`created_at` exists for that).

**`track_contributors` uses a composite primary key**
`(track_id, contributor_id, role)` instead of a surrogate `id` column.
This lets the same contributor be credited on the same track under
multiple roles (e.g. both "Composer" and "Producer") while still
preventing an exact duplicate credit (same track, contributor, and role
twice) — the composite key enforces uniqueness on the combination of all
three columns, not just the first two.

**`split_percent` is `NUMERIC(5,2)` with a per-row `CHECK (split_percent >
0 AND split_percent <= 100)`.** The per-row check only guards against an
individual value being obviously wrong; the actual readiness rule ("splits
sum to exactly 100%") is enforced separately by the application's
readiness-check function, which sums all of a track's `split_percent`
values — the database has no cross-row check for that.

**Foreign key `ON DELETE` behavior**, decided per relationship rather than
applying one rule everywhere:

| Relationship | Behavior | Why |
|---|---|---|
| `tracks.release_id → releases` | `CASCADE` | Tracks have no independent existence outside their release (no standalone "browse tracks" screen) — deleting a release should sweep its tracks. |
| `track_contributors.track_id → tracks` | `CASCADE` | Same reasoning one level down — a credit row is meaningless without its track. |
| `track_contributors.contributor_id → contributors` | `RESTRICT` | Contributors are a shared, reusable entity credited across many tracks/releases. `CASCADE` would let deleting one contributor silently wipe every credit they've ever had, anywhere. `RESTRICT` forces removing them from tracks first. |
| `submissions.release_id → releases` | `RESTRICT` | A submitted release must never be deletable — submission records are permanent, like a real distribution log. This is the actual business rule (not just a safety net): the database physically refuses to delete a release while its submission row exists, which is a stronger guarantee than relying on application code (e.g. hiding a delete button in the UI) to remember to enforce it. Note this only protects against *accidental or buggy application code* — it is not a defense against someone with direct, privileged database access, which is an access-control concern outside what a schema constraint can solve. |

**`releases.status`** is `text` with a `CHECK (status IN ('draft',
'submitted'))` rather than a Postgres `ENUM` type — enums are awkward to
extend later (`ALTER TYPE ... ADD VALUE` has real restrictions), and this
column only ever needs two values.

**`releases.upc` and `tracks.isrc`** are both `UNIQUE` *and* nullable at
the same time — this works because Postgres never considers two `NULL`
values equal, so multiple draft rows without a UPC/ISRC yet don't conflict
with each other; the uniqueness only kicks in once a real value is set.

**`submissions.release_id` is `UNIQUE`.** A release can be submitted at
most once, ever. There is no "resubmit" concept — a real-world
cancellation is a brand new release with a new UPC, not a reset of the
same row.

## Contributor identity and reuse scope (Week 2)

Adding a contributor to a track credit needs to resolve a typed name to a
`contributor_id`. This raised a real design question: how does a user
pick (or create) the right `contributors` row without either crediting a
name-collision stranger by mistake, or duplicating the same real person
every single time?

Three approaches were considered and rejected before landing on the
decision below:

- **Global search across every contributor in the system.** Names are not
  unique identifiers — the music industry addresses this for real with
  dedicated identifiers (ISNI for individuals, IPI for songwriters)
  specifically because two unrelated people can share a name. A search box
  over the whole system risks silently crediting the wrong "Chris Smith."
- **Always create a new contributor row, never offer reuse.** This looks
  safe (no matching step, no wrong-click risk) but quietly defeats the
  point of `contributors` being a separate table at all: if a row is never
  reused, `default_role` (a "this person's usual role" convenience field)
  never has anything to apply to, and every "contributor" is really just a
  one-off set of extra columns on `track_contributors` in disguise.
- **Artist-name-scoped reuse** (suggest contributors already credited on
  any release sharing the same `artist_name`). Rejected because
  `artist_name` is free text with no backing identity, same as contributor
  names — and unlike band names, individual artist/stage names collide
  often, for real, not just as typos. This doesn't reduce the ambiguity,
  it relocates it one level up.

**Decision: contributor reuse suggestions are scoped to the release
currently being edited** — people already credited somewhere on *this*
release (`track_contributors` joined through `tracks`, filtered by
`release_id`), not the whole system and not by artist name. A `release_id`
is a real primary key with zero string-matching ambiguity, so anything
already linked to it is correct by construction — this is the tightest
safe boundary available without adding real identity infrastructure. New
people are still added via a normal "create contributor" action when
they're not already in that list.

Implementation implication: needs a read endpoint scoped by release (e.g.
`GET /api/releases/:releaseId/contributors`) to power this list, in
addition to the create endpoints already planned.

**Known limitation, deliberately out of scope:** true reuse across an
artist's *entire* catalogue (not just one release), and eliminating
same-name collisions entirely, both require a dedicated identity concept
this project doesn't have — a real `artists` table (its own primary key,
`releases.artist_id` instead of, or alongside, free-text `artist_name`)
would mirror ISNI/IPI for artists the same way an equivalent addition
would for contributors. Both are legitimate Phase 2 ideas, not oversights.

## Process note: a scope drift, caught and corrected (Week 2)

Worth documenting honestly, since it's a real example of catching and
fixing a mistake rather than one to hide.

Early in Week 2, `POST /api/tracks/:trackId/contributors` was built as an
endpoint to add one contributor credit to a track at a time. This wasn't
in the original project brief — it was based on an AI assistant's
condensed *summary* of that brief from an earlier session, not the
primary source document itself. That summary, while confident and
detailed-looking, had silently dropped real specifics: the brief's actual
8-endpoint design has no incremental single-credit endpoint at all. It
specifies exactly one way to manage a track's contributor set:
`PUT /api/tracks/:id/contributors`, which atomically *replaces* the whole
set in one transaction and enforces that the splits sum to exactly 100%
before committing — matching the real frontend workflow (a live split
editor where you balance a track's whole roster in one sitting, then
save).

The mismatch surfaced while starting work on the submit-flow transaction:
a scope question ("did we forget track editing, and the transactional
split endpoint the brief mentions?") didn't match what the AI's own
condensed memory claimed the scope was. Rather than trust that memory
either way, the original brief document was located and read directly,
which confirmed the gap — and also caught two other missing endpoints
(`PATCH /api/releases/:id`, `PATCH /api/tracks/:id`) the same summary had
dropped.

**The fix:** build the correct `PUT /api/tracks/:id/contributors` per the
actual spec, and retire `POST /api/tracks/:trackId/contributors` once it
exists — so there's exactly one way to change a track's contributors, and
it's the one that actually enforces the 100% rule. Keeping both would
have left a real hole: the strict endpoint's whole purpose is defeated if
a looser one can write the same data without checking it.

**The lesson:** an AI assistant's own summary of something is a claim to
verify, not ground truth — especially anything structurally precise (an
exact API surface, a numbered list of rules). A summary can look complete
and still have quietly lost detail in the condensing. The fix here wasn't
"trust the AI less" so much as "when scope is in question, go back to the
primary source" — the same instinct that would apply to trusting a
teammate's paraphrase of a spec over the spec itself.

## Process note: a readiness check with only one real trigger (Week 3)

`splits_not_100` is one of the 6 checks in `checkReadiness()`, but it
cannot currently be reached through any real path in the app. The only
way to write to `track_contributors` is `PUT /tracks/:id/contributors`,
which itself rejects (422, atomic — nothing persists on failure) any
split set that doesn't sum to exactly 100%, for any caller of that
endpoint. The sole way this state exists in the database today is
`scripts/seed.ts`, which writes directly to Postgres and bypasses that
validation entirely.

The check stays anyway. `checkReadiness()` is deliberately a pure
function over whatever's currently in the database, independent of how
it got there — that's a design choice (a correctness check shouldn't be
coupled to trusting any one write path), not evidence the check is dead
code. Hiding it from the frontend's readiness panel because "the current
UI can't produce this state" would make the UI misrepresent what the
real function actually validates, and the gap it protects against is
concrete, not hypothetical: `scripts/seed.ts` already exists in this
codebase today, and any future direct-database tooling (a migration, an
admin script, a bulk-fix) would have the same gap.

## Track ordering vs. ISRC uniqueness — same symptom, different cause, different fix (Week 3, forward design)

Both `tracks.isrc` and `(release_id, track_number)` are unique
constraints that can raise a 409 on save, but they need opposite UX
treatment, because they're unique at different scopes for different
reasons:

**`track_number` is unique per release** (`unique: [['release_id',
'track_number']]`) and carries no meaning beyond ordering within that
one release. A conflict here almost always means the user is doing
something completely legitimate — reordering two tracks — and the naive
constraint just gets in the way of it (rename Track 2 to "1" while
Track 1 still holds "1", and the save fails, even though swapping their
order is exactly what should be allowed).

**Decision:** stop treating track number as a raw field the user types a
specific integer into. Treat it as *position* instead — moving a track
shifts every other track between its old and new spot by one, computed
and written in a single transaction, the same mental model as any
real-world playlist/tracklist reorder. This means:
- The per-track editor (`TrackEditorPage`) does not expose an editable
  track-number field at all — the track's number is shown as read-only
  text ("Track N") near the title.
- Reordering happens from the Release Detail page's Tracks card instead
  (drag or up/down controls, not yet built — this pass only removed the
  editable field from the per-track page in anticipation of it).
- The backend implication: a future `reorderTrack(trackId, newPosition)`
  service function, not a raw `PATCH` of `track_number` — bounded,
  transactional logic consistent with what's already in this project
  (the contributor-replace transaction, the submit transaction), not
  over-engineering for this app's scale.

**`isrc` is unique globally** (`isrc: { type: 'text', unique: true }`,
no `release_id` scoping) because it identifies one specific real-world
recording — two different tracks legitimately sharing one is essentially
never correct. A conflict here is almost always a typo or a genuine
duplicate-entry mistake, not a normal editing action being blocked, and
there's no sensible "shift" or "swap" operation for an identifier that
isn't positional. **Decision:** no special handling needed beyond a
clear validation error, ideally naming which existing track already
holds that code, so the user can tell "I mistyped it" from "I'm about to
log a genuine duplicate" apart.
