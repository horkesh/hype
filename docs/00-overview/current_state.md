# Current State

## High-level summary

Hype is a split repository with a user-facing Expo Router client in the root and a separate backend service under `backend/`, and the current phase is runtime stabilization plus frontend alignment to the live Supabase backend.

## What exists today

- Route-based frontend app under `app/`
- Shared UI components under `components/`
- Shared app state in `contexts/`
- Canonical Supabase integration under `integrations/`
- Node backend with database schema and migration files under `backend/src/`
- Test coverage for selected stabilization regressions under `tests/`

## What this means for development

- Frontend feature work will mostly touch `app/`, `components/`, `contexts/`, `styles/`, and `integrations/`.
- Backend/API work will mostly touch `backend/src/`.
- Shared product understanding should be captured in `docs/project_ledger.md` and `docs/04-product/`.
- Current implementation work should assume Expo Router route hygiene matters, so helper-only files should stay out of `app/`.
- The most immediate engineering focus is finishing Home/runtime stabilization on the home machine before expanding scope.
