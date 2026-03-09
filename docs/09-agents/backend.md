# Backend

## Mission

Build and stabilize the separate backend service under `backend/` and keep its data model and runtime conventions explicit.

## Primary paths

- `backend/src/index.ts`
- `backend/src/db/schema/schema.ts`
- `backend/src/db/migrate.ts`
- `backend/tests/`
- `supabase/`

## Owns

- backend route registration and API surface
- database schema and migration flow
- backend runtime configuration
- integration boundaries with Supabase and the frontend app

## Check first

- `backend/package.json`
- `backend/src/index.ts`
- `docs/01-repo-map/backend_map.md`
- `docs/02-entrypoints/backend_entrypoints.md`
- `docs/03-architecture/integrations.md`
- `docs/05-dev-ops/runbook.md`

## Current conventions

- Treat `backend/` as its own package with its own scripts and build flow.
- Add new backend modules through registration patterns wired from `backend/src/index.ts`.
- Keep schema and migration work coordinated.
- Use environment-driven configuration when introducing new backend secrets or endpoints.

## Current watchlist

- The backend looks scaffolded more than feature-complete, so document new surface area as it appears.
- Supabase exists in the repo, but backend ownership versus direct frontend access is still not fully defined.
- Do not import Supabase Edge Function rules here unless the repo actually adds those functions.

## Task checklist: new backend route

1. Check `backend/src/index.ts` to understand current registration flow.
2. Add the route through a registration pattern that keeps startup explicit.
3. Keep request and response shapes consistent and typed.
4. Update docs if the API surface becomes part of the repo's stable behavior.
5. Add a ledger entry for the new backend capability.

## Task checklist: schema or migration change

1. Review `backend/src/db/schema/schema.ts` before editing related data behavior.
2. Keep schema and migration workflow aligned.
3. Check for downstream frontend or integration assumptions that may drift.
4. Record any new durable data convention in docs or an ADR.

## Task checklist: backend integration boundary

1. Decide whether the integration belongs in frontend direct access, backend mediation, or both.
2. Avoid introducing duplicate ownership between `backend/` and frontend integration code.
3. Move secrets and runtime configuration toward environment-based setup.
4. Update `docs/03-architecture/integrations.md` if the system boundary changes.
