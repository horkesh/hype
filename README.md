# Hype

Hype is a city-discovery app for venues, events, moods, and daily specials in Sarajevo.

The repository currently contains:
- an Expo / React Native app in the repo root
- a separate TypeScript backend service in `backend/`
- active project docs in `docs/` that track architecture, planning, and development history

## Current Status

Hype is in an early stabilization phase. The current focus is:
- making the mobile prototype reliable
- aligning the frontend with the live Supabase data model
- reducing prototype drift before broader feature expansion

For the latest project state, start with:
- `docs/00-overview/session_start_protocol.md`
- `docs/00-overview/execution_board.md`
- `docs/project_ledger.md`

## Repo Structure

```text
app/          Expo Router screens and route groups
components/   Shared UI building blocks
contexts/     App-wide state and preferences
integrations/ Shared service integrations
utils/        Adapters, logging, and helper utilities
backend/      Separate Node/TypeScript service
docs/         Project docs, roadmap, ledger, and architecture notes
```

## Frontend

The app boots through `index.ts`, initializes early logging, and hands off to Expo Router.

Key entrypoints:
- `index.ts`
- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`

Main user-facing routes include:
- Home
- Explore
- Tonight
- Saved
- Profile
- Event detail
- Venue detail
- Series detail

## Backend

The backend is a separate TypeScript service under `backend/`.

It currently includes:
- application startup in `backend/src/index.ts`
- database schema definitions and migration tooling
- a scaffold for route registration

The backend exists, but the frontend is still primarily aligned around direct Supabase usage today.

## Local Development

### Frontend

```bash
npm install
npm run dev
```

Other useful scripts:

```bash
npm run ios
npm run android
npm run web
npm run lint
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Useful backend scripts:

```bash
npm run typecheck
npm run build
npm run db:generate
npm run db:migrate
```

## Configuration

Some configuration is still being cleaned up as part of the stabilization work.

Current notes:
- Supabase client configuration should move toward environment-driven setup
- the Home screen weather integration now expects config instead of a hardcoded API key
- app/backend environment guidance is being documented in `docs/05-dev-ops/env_and_secrets.md`

## Documentation

The docs folder is actively maintained and is part of the normal workflow.

Useful starting points:
- `docs/00-overview/developer_workflow.md`
- `docs/01-repo-map/repo_map.md`
- `docs/02-entrypoints/app_entrypoints.md`
- `docs/02-entrypoints/backend_entrypoints.md`
- `docs/03-architecture/`
- `docs/04-product/screen_inventory.md`

## GitHub

Suggested repository description:

`Expo city-discovery app for venues, events, moods, and daily specials, backed by Supabase and a TypeScript service.`
