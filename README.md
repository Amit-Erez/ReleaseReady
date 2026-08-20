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

**Week 3 (frontend, static UI pass): done.**
- [x] Tailwind v4 CSS-first theming (`apps/web/src/index.css`) — light
      ("warm & analog") and dark ("studio console") themes via a
      `data-theme` attribute, a full custom type scale, and semantic
      `good`/`critical` colors kept separate from the accent color
- [x] `AppShell`/`TopBar`/`ThemeToggle` — stable-label toggle button
      driven by `aria-pressed` (not swapped text), skip-to-main-content
      link, native `<dialog>` centering and cursor fixes for gaps in
      Tailwind's preflight reset
- [x] Landing page (`/`) — logo wordmark linking to `/dashboard`
- [x] Releases list (`/dashboard`) — filterable table, real
      keyboard-focusable links (not clickable rows), `CreateReleaseDialog`
- [x] Release detail (`/releases/:releaseId`) — track list with a
      per-track split-status column, `ReadinessPanel` covering all 6 real
      `checkReadiness()` codes with accessible pass/fail rows,
      `AddTrackDialog`, submit bar
- [x] Track & contributor editor
      (`/releases/:releaseId/tracks/:trackId`) — track metadata,
      `ContributorSplitEditor` with a running total, disabled Save until
      splits reach 100%; track number is intentionally read-only here
      (see `docs/decisions.md` — reordering will live on the Release
      Detail page's Tracks card instead, to avoid the unique-constraint
      trap of typing a number another track already holds)
- [x] Fixture data (`apps/web/src/lib/placeholderData.ts`) typed against
      the real `@release-ready/shared` schemas, hand-typed (not computed)
      to match what real `checkReadiness()` output would look like

Everything above is static markup — no `fetch`, no TanStack Query, no
form validation, no real computation (splits/readiness are hand-typed
fixture values, deliberately not derived via `.reduce()`). Wiring this
UI up to the real API is the next pass.
