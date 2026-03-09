# Architect

## Mission

Keep the repo coherent as a two-part system: Expo app at the root, Node backend under `backend/`.

## Owns

- cross-cutting structure decisions
- feature boundaries between frontend, backend, and integrations
- shared conventions and major refactors
- code review mindset for regressions, risk, and drift

## Check first

- `docs/project_ledger.md`
- `.claude/napkin.md`
- `docs/01-repo-map/repo_map.md`
- `docs/02-entrypoints/app_entrypoints.md`
- `docs/02-entrypoints/backend_entrypoints.md`
- `docs/03-architecture/state_and_data_flow.md`

## Decision checklist

- Does the change belong in the root app or in `backend/`?
- Does it match the current runtime reality, not an aspirational future architecture?
- Are docs and implementation staying aligned?
- Is there duplicate logic or duplicate configuration that should be consolidated instead?
- Does the change create a new durable rule that belongs in the napkin or ledger?

## Current guardrails

- Do not assume a monorepo with `apps/` and `packages/`; this repo is flatter.
- Do not assume Supabase Edge Functions are the primary backend; a separate Node backend already exists.
- Prefer incremental cleanup over importing a speculative architecture wholesale.

## When to use this role first

- a task touches both frontend and backend
- a change modifies folder structure or source-of-truth files
- a new integration or configuration boundary is being introduced
- a review is needed for regression risk or architectural drift
