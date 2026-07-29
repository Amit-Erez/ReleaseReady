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

## Getting started

```
npm install
npm run build -w apps/api   # compiles the backend
npm run build -w apps/web   # builds the frontend
```

Local dev scripts and database setup instructions will be added once those pieces are in place.

## Status

Currently in early scaffolding — database schema, API routes, and UI screens are not yet implemented.
