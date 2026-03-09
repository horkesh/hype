# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Startup Protocol
1. **[2026-03-09] Every Hype session should begin with the same document order**
   Do instead: read `docs/00-overview/execution_board.md` first, `.claude/napkin.md` second, and `docs/project_ledger.md` third before substantial work so planning, recurring rules, and recent history stay aligned.
2. **[2026-03-09] Use the repo startup protocol instead of memory alone**
   Do instead: start from `docs/00-overview/session_start_protocol.md` whenever resuming Hype after a break or machine switch.

## Execution & Validation
1. **[2026-03-09] Treat `docs/00-overview/execution_board.md` as the structured planning source**
   Do instead: update the execution board whenever backlog state, active work, blockers, or next-wave sequencing changes.
2. **[2026-03-09] Treat `docs/project_ledger.md` as the chronological session source**
   Do instead: read the ledger before substantial work and update it after meaningful changes so recent decisions and implementation history do not drift into chat history only.
3. **[2026-03-09] Keep docs and code structure in sync**
   Do instead: when adding new architectural surfaces, entrypoints, or major folders, update `docs/` in the same work session.

## Repo Structure
1. **[2026-03-09] This repo is split between app and backend**
   Do instead: check whether a change belongs in the Expo app at the repo root or in the separate Node service under `backend/` before editing.
2. **[2026-03-09] Navigation starts from Expo Router layouts**
   Do instead: trace UI behavior from `index.ts` to `app/_layout.tsx` to `app/(tabs)/_layout.tsx` before changing app-wide flow.

## Frontend Patterns
1. **[2026-03-09] App-wide providers belong in the root layout**
   Do instead: place cross-cutting UI setup such as theming, fonts, and global providers in `app/_layout.tsx` unless a narrower route scope is clearly better.
2. **[2026-03-09] Navigation changes should respect Expo Router structure**
   Do instead: make route and tab changes through the relevant `_layout.tsx` files and route folders instead of patching navigation behavior ad hoc inside leaf screens.
3. **[2026-03-09] Check platform-specific variants before editing shared screens**
   Do instead: look for `.ios.tsx` and `.web.tsx` siblings before assuming one file controls all platforms.
4. **[2026-03-09] Detail screens should define async helpers before effects**
   Do instead: declare local loaders and persistence helpers before any `useEffect` that calls them, or use hoisted function declarations instead of later `const` function expressions.
5. **[2026-03-09] Effect dependencies should use stable inputs, not local callback identities**
   Do instead: base detail-screen effects on stable values like route params or selected ids unless the callbacks are intentionally memoized.
6. **[2026-03-09] Debounced handlers need a real debounced instance**
   Do instead: create a stable debounced function with `useMemo` or equivalent and call `.cancel()` on that debounced instance, not on a wrapper callback.

## Backend Conventions
1. **[2026-03-09] Backend startup is registration-driven**
   Do instead: add new backend features through route registration functions wired from `backend/src/index.ts` to avoid circular imports and hidden startup behavior.
2. **[2026-03-09] Schema and migrations should move together**
   Do instead: keep database changes aligned across `backend/src/db/schema/schema.ts` and the Drizzle migration workflow instead of making schema-only edits.
3. **[2026-03-09] Treat the backend as a separate package**
   Do instead: run backend scripts from `backend/` and keep its dependencies, build flow, and docs distinct from the Expo app.

## Integrations & Data
1. **[2026-03-09] Supabase client setup is duplicated**
   Do instead: look in both `integrations/supabase/client.ts` and `app/integrations/supabase/client.ts` before changing auth or data client behavior, and prefer consolidation over parallel edits.
2. **[2026-03-09] Public config should still be maintainable**
   Do instead: favor environment-driven configuration even for public anon keys so app settings can change without source churn.

## Shell & Environment
1. **[2026-03-09] This Windows environment may not have working `git`, `rg`, or real `python` on PATH**
   Do instead: verify tool availability first and fall back to PowerShell commands or direct HTTP fetches when standard CLI tools are unavailable.

## User Directives
1. **[2026-03-09] Keep a living project ledger in `docs/`**
   Do instead: use `docs/project_ledger.md` for ongoing progress, decisions, blockers, and next actions rather than scattering those notes across multiple files.

## Working Style
1. **[2026-03-09] Prefer organized project memory over scattered notes**
   Do instead: put structured planning in `docs/00-overview/execution_board.md`, recurring execution guidance in `.claude/napkin.md`, chronological history in `docs/project_ledger.md`, and durable structural decisions in `docs/06-decisions/`.
2. **[2026-03-09] Keep changes grounded in the real codebase**
   Do instead: inspect entrypoints, configs, and active implementation files before proposing structure or documenting behavior.
3. **[2026-03-09] Favor concise, actionable guidance**
   Do instead: record short rules with clear next actions rather than long explanations or session-history prose.
4. **[2026-03-09] Use repo-native role docs, not imported assumptions**
   Do instead: consult `docs/09-agents/` for specialist lenses and adapt blueprints to the current repo before adopting them wholesale.
5. **[2026-03-09] Follow the repo workflow guide by default**
   Do instead: use `docs/00-overview/session_start_protocol.md` and `docs/00-overview/developer_workflow.md` as the standard session flow, then apply the relevant role checklist from `docs/09-agents/`.
