# Hype — Claude Code Instructions

## Session Start

Follow `docs/00-overview/session_start_protocol.md` at the beginning of every session:
1. Cold start / handoff → read `docs/00-overview/handover.md` first
2. Read `docs/00-overview/execution_board.md`
3. Read `.claude/napkin.md`
4. Read tail of `docs/project_ledger.md`
5. Read task-specific docs as needed

## Crew Roles

Before substantial work, read the relevant agent lens from `docs/09-agents/`:

- **Architect** (`architect.md`) — structural decisions, code review, cross-cutting changes
- **Frontend** (`frontend.md`) — Expo/RN components, theming, navigation, UX
- **Backend** (`backend.md`) — Node service, DB schema, Edge Functions, API contracts
- **Chronicle** (`chronicle.md`) — ledger updates, napkin curation, session hygiene

**Default rule:** if work spans domains, start with Architect, implement in the specialist role, finish by updating Chronicle artifacts (ledger, execution board, napkin).

## End of Session

1. Update `docs/project_ledger.md`
2. Update `docs/00-overview/execution_board.md` if status/backlog/sequencing changed
3. Update `.claude/napkin.md` only if a reusable rule was learned

## Key Conventions

- This repo is split: Expo app at root, Node backend under `backend/`
- Use `npm.cmd` / `npx.cmd` on this Windows machine (PowerShell blocks `.ps1` shims)
- Supabase is the canonical backend — adapter layers are temporary
- Run `/simplify` after meaningful implementation work
- Keep changes grounded in the real codebase — inspect before proposing
