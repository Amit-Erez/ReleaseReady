# ReleaseReady

[![CI](https://github.com/Amit-Erez/ReleaseReady/actions/workflows/ci.yml/badge.svg)](https://github.com/Amit-Erez/ReleaseReady/actions/workflows/ci.yml)

A small full-stack tool for tracking music release readiness — catalogue releases and tracks, manage contributor credits and splits, and run a readiness check before submission. Built as a portfolio project rooted in real digital-distribution QA experience.

## Stack

- **Backend**: Node, Express, TypeScript, PostgreSQL (via `pg`, hand-written SQL), `node-pg-migrate`
- **Frontend**: React, TypeScript, Vite, React Router, React Hook Form + Zod, TanStack Query, Tailwind CSS
- **Shared**: Zod schemas shared between frontend and backend (`packages/shared`)
- **Testing**: Vitest, Supertest, React Testing Library

## Project structure

```
apps/
  api/      Express API
  web/      React frontend
packages/
  shared/   Shared Zod schemas and types
```

See [`docs/decisions.md`](docs/decisions.md) for the architecture decisions behind this structure.

## Getting started

```
npm install
npm run build -w apps/api      # compiles the backend
npm run build -w apps/web      # builds the frontend
npm run migrate:up -w apps/api # applies all database migrations
npm run seed -w apps/api       # wipes and reseeds sample data (safe to rerun)
```

Requires a local PostgreSQL database and a `DATABASE_URL` set in
`apps/api/.env` (see `apps/api/.env` — gitignored, not committed).

## Status

**Week 1 (Database and basic API): done.**
- [x] Repository/project structure, local PostgreSQL set up
- [x] Migrations for all 5 tables (`releases`, `tracks`, `contributors`,
      `track_contributors`, `submissions`) with constraints — see
      `apps/api/migrations/` and `docs/decisions.md`
- [x] Seed script (`apps/api/scripts/seed.ts`)
- [x] `GET /api/releases`, `GET /api/releases/:id`, `POST /api/releases`
      — Zod-validated via `packages/shared`, manually tested in Postman

**Week 2 (relationships, readiness, transactions, tests, CI): done.**
- [x] `POST /api/releases/:releaseId/tracks`, `POST /api/contributors`
      — Zod-validated via `packages/shared`, manually tested in Postman
      (success + error paths, incl. foreign-key and unique-constraint
      conflicts)
- [x] `GET /api/releases/:releaseId/tracks`, `GET /api/releases/:releaseId/contributors`
      — the latter joins across `track_contributors`/`tracks` to power the
      future contributor-reuse picker; both 404 on a nonexistent release,
      manually tested in Postman
- [x] Readiness-check function (`checkReadiness`, pure/unit-testable) and
      `GET /api/releases/:releaseId/readiness`, covering all 6 readiness
      rules — manually tested in Postman
- [x] `PATCH /api/releases/:id` — edits release metadata (all-or-nothing);
      409 on duplicate UPC, 409 if the release is already submitted
      (checked before the write, so a submitted release can never be
      silently modified); manually tested in Postman
- [x] `PATCH /api/tracks/:id` — edits track metadata (all-or-nothing);
      409 on duplicate ISRC or track number, 409 if the track's parent
      release is already submitted; manually tested in Postman
- [x] `PUT /api/tracks/:id/contributors` — the second (and last) project
      transaction: atomically replaces a track's whole contributor set,
      422 if the new splits don't sum to exactly 100%, 409 on a submitted
      release or a duplicate contributor+role pair in the same request.
      Replaces the earlier `POST /api/tracks/:trackId/contributors`
      (removed — see `docs/decisions.md` "Process note" for why it
      existed and why it was retired). Manually tested in Postman across
      all paths.
- [x] `POST /api/releases/:id/submit` — the submit-flow transaction (the
      project's primary transaction): rechecks readiness, then atomically
      inserts the `submissions` row and flips `status` to `submitted`,
      rolling back if either write fails. 404 if not found, 422 with the
      failure list if not ready, 409 if already submitted. Manually
      tested in Postman across all paths.
- [x] Tests — 11 total: readiness unit tests (one per rule + one all-clear
      case, `services/readiness.test.ts`) and three submit-flow
      integration tests (`tests/submit.test.ts`, Supertest against a
      separate test database) covering a successful submission, a failed
      readiness check, and the rollback test forcing a mid-transaction
      failure and asserting zero partial state. Run via
      `npm run test -w apps/api`; see `docs/rollback-test-explained.md`
      for how the rollback test's mocking works.
- [x] CI — GitHub Actions (`.github/workflows/ci.yml`): installs
      dependencies, starts a temporary PostgreSQL service container, runs
      migrations, then runs the test suite, on every push and pull
      request to `main`. Badge at the top of this README.

**Week 3 (small frontend — connect React to the real API): in progress.**
Built in two deliberate passes: static UI first (placeholder data, no
`fetch`), then wired to the real API screen by screen. Both passes are
part of this same week's deliverable, not separate milestones.
- [x] Tailwind v4 CSS-first theming (`apps/web/src/index.css`) — light
      ("warm & analog") and dark ("studio console") themes via a
      `data-theme` attribute, a full custom type scale, and semantic
      `good`/`critical` colors kept separate from the accent color
- [x] `AppShell`/`TopBar`/`ThemeToggle` — stable-label toggle button
      driven by `aria-pressed` (not swapped text), skip-to-main-content
      link, native `<dialog>` centering and cursor fixes for gaps in
      Tailwind's preflight reset. Real logo assets (icon + wordmark,
      text swapped via the `dark:` variant) replaced the placeholder
      text wordmark in the top bar and landing page.
- [x] Landing page (`/`) — logo wordmark linking to `/dashboard`
- [x] Releases list (`/dashboard`) — real `useQuery` fetch, filterable
      table, real keyboard-focusable links (not clickable rows),
      `CreateReleaseDialog`, loading skeleton, and an accessible error
      state with retry. Readiness indicator is now computed
      server-side (`GET /api/releases`), closing a gap between the
      brief's spec and what Week 1 actually built.
- [x] Release detail (`/releases/:releaseId`) — real fetch for the
      release and its tracks (each with a computed `splitsTotal`), a
      full readiness breakdown (all 6 rules, pass/fail, not just
      failures) via `ReadinessPanel`, a loading skeleton, and two error
      states (full-page if the release fails to load, a smaller
      in-card one if only the tracks fetch fails). `AddTrackDialog` is
      fully wired — React Hook Form + a Zod resolver, a real mutation
      that creates the track and refreshes the list on success.
- [x] Track & contributor editor
      (`/releases/:releaseId/tracks/:trackId`) — real data wiring
      done: fetches the release, its tracks, and a new
      `GET /api/tracks/:id/contributors` endpoint (joins
      `track_contributors` to `contributors` for names, mirroring the
      existing `PUT` sibling), plus a matching loading skeleton
      (`TrackEditorSkeleton`) and two error states (full-page if the
      release or tracks fail to load, in-card if only the credits fetch
      fails). Track number stays intentionally read-only here — see
      `docs/decisions.md`.
      - Title/ISRC: fully working, its own "Save details" action
        (React Hook Form + a new `updateTrackSchema`, independent from
        the contributor splits save so one can't block the other),
        enabled only when a field actually differs from the saved
        value (`formState.isDirty`, seeded via `reset()` once the
        track loads).
      - Contributors & splits: row add/remove is fully wired
        (`useFieldArray`'s `append`/`remove`), matched to each row by
        `contributor_id` rather than array position so the right
        name/role/split stay together after a row is added or
        removed. The "Total split" figure and the "Save splits"
        button (now living inside `ContributorSplitEditor` itself,
        alongside the fields it submits) update live as rows change
        (`useWatch`), not from the last-saved server value.
        `contributor_id`/`split_percent` use `z.coerce.number()`
        (HTML inputs always deliver strings) with a `.positive()`
        constraint and a custom message on `contributor_id`, and both
        fields show a real error state (red border + message) driven
        by `formState.errors`; `role` deliberately has none, since its
        `<select>` can never hold an invalid value. A new
        `AddContributorDialog` creates a genuinely new contributor
        (`POST /api/contributors`) and injects it into the release-
        scoped picker list via `queryClient.setQueryData` rather than
        an invalidation — the release-scoped `GET` endpoint only
        returns people already credited somewhere on the release, so
        a freshly-created, not-yet-credited person would never come
        back from a refetch. Known, accepted limitation: creating a
        contributor and abandoning the flow before assigning/saving
        them leaves a permanently orphaned, unreachable `contributors`
        row — deliberately not solved yet. "Save splits" now calls the
        real `PUT /api/tracks/:id/contributors`; on success the
        credits query is invalidated and a `useEffect` watching the
        refetched rows calls `reset()` to resync the form's own
        internal state, since `defaultValues` only seeds once at mount
        and doesn't otherwise follow prop updates — without it, a
        newly-added row's picker wouldn't turn back into plain text
        after saving.
- [ ] "Submit release" action — button exists on the release detail
      page, but has no mutation wired up yet.
- [x] Track reordering — `PATCH /api/tracks/:id/move` swaps a track
      with its neighbor via a single atomic `UPDATE`; required making
      the `(release_id, track_number)` unique constraint deferrable,
      since Postgres checks it per-row rather than once per statement.
      Up/down buttons on the release detail page's Tracks card are
      keyboard-accessible by default (native `<button>`s), disabled at
      the list's edges and while the release is submitted. Track number
      is intentionally read-only everywhere else specifically so this
      is the one place it changes (see `docs/decisions.md`). Mouse
      drag-and-drop is deferred to a later pass; the same endpoint will
      support it without backend changes.

Fixture data for what's still unwired lives in
`apps/web/src/lib/placeholderData.ts`, typed against the real
`@release-ready/shared` schemas.
