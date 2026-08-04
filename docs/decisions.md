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
