# Hype Crew Blueprint Review

## Summary

`hype-crew.zip` is a useful blueprint, but it reflects a different repository shape and a more advanced planned architecture than this repo currently has.

## Keep

- specialist role split: architect, frontend, backend, chronicle
- emphasis on project memory and recurring guidance
- bilingual product awareness
- strong data and configuration discipline

## Adapt

- replace monorepo paths such as `apps/mobile/` and `packages/shared/` with this repo's real root structure
- treat `docs/project_ledger.md` as the status source instead of `PROGRESS.md`
- treat `.claude/napkin.md` as recurring guidance, not general session logging
- align backend guidance with the real `backend/` Node service before assuming Supabase Edge Functions

## Defer

- scraper-specific agent rules until scraping code exists in this repo
- portal/admin role until a distinct admin or public web app exists beyond the current Expo web app

## Output

The adapted version lives in `docs/09-agents/`.
