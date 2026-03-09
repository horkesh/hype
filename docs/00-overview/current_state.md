# Current State

## High-level summary

Hype currently looks like a split repository with a user-facing Expo Router client in the root and a separate backend service under `backend/`.

## What exists today

- Route-based frontend app under `app/`
- Shared UI components under `components/`
- Shared app state in `contexts/`
- Supabase integration under `integrations/` and `app/integrations/`
- Node backend with database schema and migration files under `backend/src/`

## What this means for development

- Frontend feature work will mostly touch `app/`, `components/`, `contexts/`, `styles/`, and `integrations/`.
- Backend/API work will mostly touch `backend/src/`.
- Shared product understanding should be captured in `docs/project_ledger.md` and `docs/04-product/`.
