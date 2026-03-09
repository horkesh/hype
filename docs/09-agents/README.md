# Hype Crew For Codex

This folder adapts the `hype-crew.zip` blueprint to the actual structure of this repository.

## Purpose

- Keep specialist roles clear without pretending the repo already has systems that do not exist yet.
- Ground all role guidance in the real codebase, current docs, and current runtime setup.
- Use these role docs as working lenses, not rigid bureaucracy.

## Current source of truth order

1. `docs/project_ledger.md`
2. `.claude/napkin.md`
3. `docs/01-repo-map/`
4. `docs/02-entrypoints/`
5. `docs/03-architecture/`
6. `docs/04-product/`
7. `docs/05-dev-ops/`

## Active roles

- `architect.md`: cross-cutting decisions, structure, tradeoffs, and reviews.
- `frontend.md`: Expo Router app, navigation, components, theming, maps, and UX.
- `backend.md`: `backend/` service, database schema, and API contracts.
- `chronicle.md`: project memory, ledger updates, worklog hygiene, and napkin curation.

## Future roles

- `scraper`: create this only when scraping becomes a real implementation area in this repo.
- `portal`: create this only when a separate admin or public web app exists beyond the current Expo web surface.

## Working rule

When a task spans multiple roles, start with `architect.md`, do the implementation in the specialist role, and finish by updating `chronicle.md` artifacts.
