# ReleaseReady

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

**Week 2 (relationships, readiness, transactions, tests, CI): in progress.**
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
- [ ] Submit-flow transaction
- [ ] Tests
- [ ] CI

UI screens (Week 3) not yet started.
