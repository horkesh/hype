# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Startup Protocol
1. **[2026-03-10] Use handover first for cold starts, agent switches, and machine switches**
   Do instead: read `docs/00-overview/handover.md` before the rest of the startup stack whenever continuity may have broken, then continue with the execution board, napkin, and ledger.
2. **[2026-03-09] Every normal Hype session should begin with the same document order**
   Do instead: read `docs/00-overview/execution_board.md` first, `.claude/napkin.md` second, and `docs/project_ledger.md` third before substantial work so planning, recurring rules, and recent history stay aligned.
3. **[2026-03-09] Use the repo startup protocol instead of memory alone**
   Do instead: start from `docs/00-overview/session_start_protocol.md` whenever resuming Hype after a break or when you need the repo-defined read order and role guidance.
4. **[2026-03-11] Confirm machine identity before trusting environment assumptions**
   Do instead: check `C:\Users\haris.daul\.codex-machine.toml` at session start, and if it is missing on a machine, create it from `../machine-work.example.toml` or `../machine-home.example.toml` before treating the environment as `work` or `home`.
5. **[2026-03-11] Resume Supabase favorites work with a real authenticated check on home**
   Do instead: on the home machine, sign in, save and unsave a venue from `app/venue/[id].tsx`, then confirm the change appears in the Saved venues tab before starting the taste-profile migration.
6. **[2026-03-11] Verify taste-profile persistence on home before assuming profile bootstrap is complete**
   Do instead: on the home machine, sign in, change the selected moods in the Profile screen, reload, and confirm `profiles.taste_moods` persists correctly before broadening profile-based personalization work.

## Execution & Validation
1. **[2026-03-09] Treat `docs/00-overview/execution_board.md` as the structured planning source**
   Do instead: update the execution board whenever backlog state, active work, blockers, or next-wave sequencing changes.
2. **[2026-03-09] Treat `docs/project_ledger.md` as the chronological session source**
   Do instead: read the ledger before substantial work and update it after meaningful changes so recent decisions and implementation history do not drift into chat history only.
3. **[2026-03-09] Keep docs and code structure in sync**
   Do instead: when adding new architectural surfaces, entrypoints, or major folders, update `docs/` in the same work session.
4. **[2026-03-10] Refresh the handover docs when continuity assumptions change**
   Do instead: update `docs/00-overview/handover.md` and `docs/00-overview/handover_protocol.md` whenever architecture stance, environment setup, central workstreams, or major workarounds materially shift.
5. **[2026-03-11] New ingestion capabilities need matching contract and handover updates**
   Do instead: whenever backend ingestion gains a new live read/write step, update `docs/03-architecture/ingestion_endpoint_contract.md`, `docs/00-overview/handover.md`, and `docs/project_ledger.md` in the same session.
6. **[2026-03-11] Source-aware extraction changes need planning updates too**
   Do instead: whenever a new source-specific extractor is added, update `docs/00-overview/execution_board.md`, `docs/00-overview/handover.md`, and `docs/project_ledger.md` together so the supported-source set stays explicit.
7. **[2026-03-11] Schema exports are not the same as live content reality**
   Do instead: when the repo only has Supabase schema/policy/index exports, create a reconciliation doc plus operator query pack before treating import, promotion, or cleanup decisions as settled.
8. **[2026-03-11] Ingestion breadth should wait for publishability rules**
   Do instead: before adding many new scrape sources, write down the promotion workflow, venue matching strategy, and canonical update policy so raw intake can evolve into trusted public data instead of a wider review backlog.

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
3. **[2026-03-12] Collapse platform wrappers once behavior is truly shared**
   Do instead: keep `.ios.tsx` and `.web.tsx` files only when they represent real platform differences; otherwise re-export the shared screen and keep the logic in one place.
4. **[2026-03-09] Detail screens should define async helpers before effects**
   Do instead: declare local loaders and persistence helpers before any `useEffect` that calls them, or use hoisted function declarations instead of later `const` function expressions.
5. **[2026-03-09] Effect dependencies should use stable inputs, not local callback identities**
   Do instead: base detail-screen effects on stable values like route params or selected ids unless the callbacks are intentionally memoized.
6. **[2026-03-09] Debounced handlers need a real debounced instance**
   Do instead: create a stable debounced function with `useMemo` or equivalent and call `.cancel()` on that debounced instance, not on a wrapper callback.
7. **[2026-03-12] Shared tab screens should use a common shell**
   Do instead: put tab-safe scrolling, empty/loading state framing, and section headers in shared primitives like `TabScreen`, `ContentState`, and `SectionHeader` before rebuilding another large screen.
8. **[2026-03-12] Web stability beats decorative animation in core primitives**
   Do instead: keep image, card, and loading primitives explicitly web-safe first, then add native motion only when browser verification stays clean.

## Backend Conventions
1. **[2026-03-09] Backend startup is registration-driven**
   Do instead: add new backend features through route registration functions wired from `backend/src/index.ts` to avoid circular imports and hidden startup behavior.
2. **[2026-03-09] Schema and migrations should move together**
   Do instead: keep database changes aligned across `backend/src/db/schema/schema.ts` and the Drizzle migration workflow instead of making schema-only edits.
3. **[2026-03-09] Treat the backend as a separate package**
   Do instead: run backend scripts from `backend/` and keep its dependencies, build flow, and docs distinct from the Expo app.

## Integrations & Data
1. **[2026-03-10] Expo Router must not contain helper-only files under `app/`**
   Do instead: keep non-route helpers like Supabase clients and generated types outside the `app/` tree so Expo Router does not treat them as screens.
2. **[2026-03-09] Public config should still be maintainable**
   Do instead: favor environment-driven configuration even for public anon keys so app settings can change without source churn.
3. **[2026-03-11] Backend ingestion should use explicit admin credentials**
   Do instead: keep ingestion reads and writes behind backend-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` instead of relying on implicit framework database access.
4. **[2026-03-11] Backend admin credentials belong in `backend/.env`**
   Do instead: keep `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env` on the trusted machine, and never place the service-role key in the Expo app root `.env`.
5. **[2026-03-11] First raw intake is only safe for conservative HTML sources**
   Do instead: use `POST /ingestion/run/:sourceId` for `direct_html` fetch plus anchor-based candidate intake first, then add source-aware extraction before expanding to noisier source types.
6. **[2026-03-11] Grow source-aware extraction one safe Tier 1 source at a time**
   Do instead: add extractor rules for predictable source patterns like Pozorista or AllEvents before attempting noisier parsers, and keep generic anchor harvesting as the fallback path.
7. **[2026-03-11] Source fetches should honor listing-page config instead of homepage defaults**
   Do instead: when a source defines `scrape_config.list_url`, `list_urls`, or `category_urls`, fetch those configured pages and carry the fetched page URL into raw candidate provenance and scrape logs.
8. **[2026-03-12] Pure error-tag tests should not import the full app client graph**
   Do instead: keep reusable auth/error tagging in tiny helper modules so Node-side tests can verify them without pulling in `react-native` or the Supabase client bootstrap.

## Shell & Environment
1. **[2026-03-09] This Windows environment may not have working `git`, `rg`, or real `python` on PATH**
   Do instead: verify tool availability first and fall back to PowerShell commands or direct HTTP fetches when standard CLI tools are unavailable.
2. **[2026-03-10] PowerShell may block the `npm.ps1` shim on this machine**
   Do instead: use `npm.cmd` and `npx.cmd` from PowerShell when execution policy rejects `npm` or `npx`.
3. **[2026-03-11] Work and home machines should advertise their role explicitly**
   Do instead: install one machine marker file at `C:\Users\haris.daul\.codex-machine.toml` on each machine so future sessions can distinguish protected work flows from full-dev home flows without guesswork.
4. **[2026-03-12] Local runtime artifacts should never stay unignored**
   Do instead: ignore Expo log files and `test-results/` as soon as they appear so sync noise does not turn into fake repo work.

## User Directives
1. **[2026-03-09] Keep a living project ledger in `docs/`**
   Do instead: use `docs/project_ledger.md` for ongoing progress, decisions, blockers, and next actions rather than scattering those notes across multiple files.

## Documentation Hygiene
1. **[2026-03-10] Shared docs should not hardcode one contributor's local path**
   Do instead: use relative links for repo documents and machine-agnostic placeholder paths in setup examples unless an intentionally local absolute path is required.
2. **[2026-03-10] This repo uses one lowercase project ledger**
   Do instead: treat `docs/project_ledger.md` as the only canonical ledger and avoid creating parallel `PROJECT_LEDGER` files from generic process templates.

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
