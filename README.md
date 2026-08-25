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
      Tailwind's preflight reset
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
- [ ] Track & contributor editor
      (`/releases/:releaseId/tracks/:trackId`) — UI built
      (`ContributorSplitEditor` with a running total, track number
      intentionally read-only — see `docs/decisions.md`), but still on
      placeholder data; not yet wired to the real API.
- [ ] "Submit release" action — button exists on the release detail
      page, but has no mutation wired up yet.
- [ ] Track reordering (drag/up-down on the release detail page's
      Tracks card) — planned but not built; track number is
      intentionally read-only everywhere else specifically so this is
      the one place a track's position changes (see `docs/decisions.md`).

Fixture data for what's still unwired lives in
`apps/web/src/lib/placeholderData.ts`, typed against the real
`@release-ready/shared` schemas.
