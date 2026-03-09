# Developer Workflow

This is the practical operating flow for working in the Hype repo.

## Start of session

1. Read `docs/00-overview/session_start_protocol.md`.
2. Read `docs/00-overview/execution_board.md` for structured planning state, backlog, blockers, and what is actively in motion.
3. Read `.claude/napkin.md` for recurring repo-specific rules and environment gotchas.
4. Read `docs/project_ledger.md` for recent chronology, decisions, and follow-up.
5. If the task is specialized, check `docs/09-agents/` and pick the most relevant role lens.
6. Use `docs/01-repo-map/` and `docs/02-entrypoints/` before making structural changes.

## While working

1. Keep changes grounded in the real repo, not aspirational architecture.
2. Update docs in the same session when a structural rule, entrypoint, or workflow changes.
3. Use the relevant role checklist:
   - `docs/09-agents/frontend.md` for screens, navigation, components, and app UX
   - `docs/09-agents/backend.md` for backend runtime, schema, and API work
   - `docs/09-agents/architect.md` for cross-cutting or risky decisions

## End of session

1. Update `docs/project_ledger.md` with what changed, what was decided, and what should happen next.
2. Update `docs/00-overview/execution_board.md` if backlog state, active work, blockers, or next waves changed.
3. Add or curate `.claude/napkin.md` only if a lesson is reusable across future sessions.
4. If a decision is durable and architectural, promote it into `docs/06-decisions/`.

## Document roles

- `docs/00-overview/session_start_protocol.md`: default startup order for every Hype session.
- `docs/00-overview/execution_board.md`: structured planning state, backlog, blockers, and active work.
- `docs/project_ledger.md`: chronological project history and recent session continuity.
- `.claude/napkin.md`: recurring execution rules and lessons.
- `docs/07-worklog/`: temporary or raw notes.
- `docs/06-decisions/`: durable decisions with rationale.
- `docs/09-agents/`: specialist role lenses and task checklists.

## Quick examples

### New screen

- Start with the ledger.
- Review `docs/09-agents/frontend.md`.
- Trace navigation from `app/_layout.tsx` or `app/(tabs)/_layout.tsx`.
- Implement the screen.
- Update `docs/04-product/screen_inventory.md` if the user-facing surface changed.
- Log the work in the ledger.

### New backend route

- Start with the ledger.
- Review `docs/09-agents/backend.md`.
- Check `backend/src/index.ts` and current registration flow.
- Add route code and keep schema or integration notes aligned if needed.
- Update backend docs if the API surface changed.
- Log the work in the ledger.
