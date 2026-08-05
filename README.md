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

**Week 1 (Database and basic API), in progress:**
- [x] Repository/project structure, local PostgreSQL set up
- [x] Migrations for all 5 tables (`releases`, `tracks`, `contributors`,
      `track_contributors`, `submissions`) with constraints — see
      `apps/api/migrations/` and `docs/decisions.md`
- [x] Seed script (`apps/api/scripts/seed.ts`)
- [ ] `GET /api/releases`, `POST /api/releases`, release-detail endpoint
      (next up — needs a Zod schema in `packages/shared` for request
      validation first)

UI screens (Week 3) not yet started.
