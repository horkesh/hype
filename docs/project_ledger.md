# Project Ledger

This is the living source of truth for active development. We should read it at the start of a work session and update it before wrapping up.

## Project snapshot

- Project: Hype
- Repo root: `C:\Users\haris.daul\OneDrive - United Nations Development Programme\Documents\Personal\Hype\Hype app`
- Primary frontend: Expo Router app in the repo root
- Secondary backend: Node service in `backend/`
- Current phase: Foundation and codebase mapping
- Last updated: 2026-03-09

## Product intent

- Help users discover venues, events, moods, and daily specials.
- Support mobile and web through Expo / React Native.
- Preserve a polished, location-aware, culturally grounded local discovery experience.

## Current repo reality

- Root app uses `expo-router` with route files under `app/`.
- Frontend boot starts at `index.ts`, which initializes `utils/errorLogger` and then loads `expo-router/entry`.
- Root UI shell lives in `app/_layout.tsx`.
- Main tab navigation lives in `app/(tabs)/_layout.tsx`.
- Backend is a separate TypeScript service under `backend/src/index.ts`.
- Supabase client code currently exists in both `integrations/supabase/client.ts` and `app/integrations/supabase/client.ts`.

## Active workstreams

| Workstream | Status | Notes |
| --- | --- | --- |
| Documentation foundation | In progress | Initial docs structure and ledger created on 2026-03-09. |
| Frontend app mapping | In progress | Route groups and shared components identified. |
| Backend mapping | In progress | Startup entrypoint identified; routes not yet implemented. |
| Architecture cleanup | Pending | Candidate topics: env handling, duplicated Supabase client, translation encoding review. |

## Known issues and observations

- Supabase anon credentials are hardcoded in client files. This is acceptable for public anon keys, but configuration should still move to environment-driven setup for safer maintenance.
- Supabase client setup appears duplicated in two locations, which creates drift risk.
- Some translated strings in `contexts/AppContext.tsx` appear to have encoding artifacts.
- Backend route modules are not yet registered, so the backend looks scaffolded more than feature-complete.

## Dos and don'ts

- Do verify local tool availability before relying on standard CLI workflows in this repo.
- Do fall back to PowerShell-native commands or direct HTTP fetches when needed.
- Don't assume `git`, `rg`, or a real Python interpreter are available on `PATH` in this environment.
- Don't rely on the Windows Store `python.exe` shim for automation; it is present on `PATH` but not usable for actual script execution here.

## Decisions log

- 2026-03-09: Create a dedicated docs system under `docs/` rather than keeping notes in ad hoc root files.
- 2026-03-09: Use this ledger as the first file to read and the last file to update during active work.
- 2026-03-09: Add a repo-level `.claude/napkin.md` as a curated execution runbook for recurring rules and gotchas.
- 2026-03-09: Adapt the Hype Crew blueprint into repo-native role docs under `docs/09-agents/` instead of importing its mismatched monorepo assumptions directly.

## Immediate next actions

- Fill in route-by-route behavior in `04-product/screen_inventory.md`.
- Document backend data model and API surface once routes are added.
- Standardize Supabase client location and env loading strategy.
- Add a lightweight architecture decision record whenever we make a non-trivial structural change.
- Use `docs/09-agents/` plus `00-overview/developer_workflow.md` as the default work protocol for future sessions.
- Treat prototype stabilization as the current milestone before expanding into new architecture-heavy features.
- Use `docs/00-overview/master_roadmap.md` as the primary sequencing guide for project-level planning.

## Session update template

Copy this block when adding a new work entry.

```md
### YYYY-MM-DD HH:MM
- Goal:
- Changes made:
- Files touched:
- Decisions:
- Follow-up:
```

## Session log

### 2026-03-09 09:00
- Goal: Create an organized docs foundation for the Hype app.
- Changes made: Added docs folder structure, repository maps, entrypoint notes, architecture notes, and this ledger.
- Files touched: `docs/`
- Decisions: Treat `project_ledger.md` as the working source of truth across sessions.
- Follow-up: Expand screen and data documentation as implementation work continues.

### 2026-03-09 09:20
- Goal: Install the Napkin skill and add its per-repo protocol.
- Changes made: Installed the `napkin` skill under `~/.codex/skills/napkin`, created `.claude/napkin.md`, and linked docs guidance to the new runbook.
- Files touched: `.claude/napkin.md`, `docs/README.md`, `docs/project_ledger.md`, `~/.codex/skills/napkin/`
- Decisions: Keep `project_ledger.md` for project status and use `.claude/napkin.md` for recurring execution guidance.
- Follow-up: Curate the napkin whenever we hit reusable repo-specific lessons.

### 2026-03-09 09:35
- Goal: Turn the Hype Crew blueprint into a repo-native role system for this codebase.
- Changes made: Reviewed `hype-crew.zip`, documented the mismatch with the current repo, and created adapted role docs for architect, frontend, backend, and chronicle under `docs/09-agents/`.
- Files touched: `docs/09-agents/`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: Keep the useful role split, but rewrite paths, source-of-truth order, and runtime assumptions around the actual repo.
- Follow-up: Add future `scraper` or `portal` roles only when those implementation surfaces truly exist in this repo.

### 2026-03-09 09:45
- Goal: Make the role system practical for day-to-day use.
- Changes made: Added a default developer workflow guide, expanded role docs with task checklists, and recorded the role system as part of the default project protocol.
- Files touched: `docs/00-overview/developer_workflow.md`, `docs/09-agents/`, `docs/README.md`, `docs/project_ledger.md`, `.claude/napkin.md`
- Decisions: Treat the workflow guide plus role docs as the default operating pattern for future work in this repo.
- Follow-up: Apply these checklists during actual implementation tasks and refine them as new task types repeat.

### 2026-03-09 10:05
- Goal: Fix the venue detail screen crash seen in Natively.
- Changes made: Moved `useEffect` hooks in `app/venue/[id].tsx` below the loader/helper function definitions so the screen no longer references `const` callbacks before initialization.
- Files touched: `app/venue/[id].tsx`, `docs/project_ledger.md`
- Decisions: For screen components using local async callbacks in effect dependency arrays, define the callbacks before the effects or use hoisted function declarations.
- Follow-up: Retest the venue detail screen in Natively and watch for the same pattern in other detail routes.

### 2026-03-09 10:10
- Goal: Fix the same initialization crash in the event detail screen.
- Changes made: Moved the `useEffect` hook in `app/event/[id].tsx` below `loadEventData` and `checkIfSaved` so the component no longer references `const` callbacks before initialization.
- Files touched: `app/event/[id].tsx`, `docs/project_ledger.md`
- Decisions: Treat this as a repeated detail-screen pattern and check similar routes for top-of-component effects that depend on later `const` function definitions.
- Follow-up: Retest the event detail screen in Natively and inspect `app/series/[id].tsx` for the same issue.

### 2026-03-09 10:20
- Goal: Stop infinite re-render loops in detail screens.
- Changes made: Updated `app/event/[id].tsx`, `app/venue/[id].tsx`, and `app/series/[id].tsx` so their effects depend on stable route/state values like `id` and `venue?.id` instead of local function references that change every render.
- Files touched: `app/event/[id].tsx`, `app/venue/[id].tsx`, `app/series/[id].tsx`, `docs/project_ledger.md`
- Decisions: In these route screens, effect dependency arrays should be based on stable inputs, not local callback identities, unless callbacks are intentionally memoized.
- Follow-up: Retest all three detail routes in Natively and watch for any remaining data-shape or query errors after the render loop is gone.

### 2026-03-09 10:30
- Goal: Fix the Explore screen debounce crash.
- Changes made: Replaced the wrapper-style debounced search setup in `app/(tabs)/explore.tsx` with a memoized debounced function instance so cleanup can safely call `.cancel()`.
- Files touched: `app/(tabs)/explore.tsx`, `docs/project_ledger.md`
- Decisions: When using `lodash.debounce`, keep a stable debounced instance and only call `.cancel()` on that instance, not on a wrapper callback.
- Follow-up: Retest Explore in Natively and watch for any query or UI-state issues after search input changes.

### 2026-03-09 10:45
- Goal: Compare the app repo against the master Hype architecture and Natively prompt docs.
- Changes made: Reviewed the parent-folder architecture and prompt files, mapped them against the actual implementation, and documented the current project state plus the recommended next milestone.
- Files touched: `docs/00-overview/project_status_from_master_docs.md`, `docs/05-dev-ops/next_milestone.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: The project should be treated as a real but still unstable prototype, and the next phase should focus on stabilization and architecture alignment rather than major feature expansion.
- Follow-up: Use the new status doc to guide prioritization, then expand `docs/04-product/screen_inventory.md` based on the real screens.

### 2026-03-09 11:05
- Goal: Create a concrete project roadmap from the architecture, schema, and scraping docs.
- Changes made: Read the broader Hype planning files and created a sequenced master roadmap covering prototype stabilization, schema alignment, backend ownership, Supabase setup, scraper rollout, canonical entities, city pulse, and later platform expansion.
- Files touched: `docs/00-overview/master_roadmap.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: Sequence the project as stabilize -> align contracts -> decide ownership -> set up Supabase -> build ingestion -> expand surfaces.
- Follow-up: Start executing the roadmap from Phase 1 and Phase 2, beginning with screen inventory and schema-to-UI alignment.

### 2026-03-09 11:20
- Goal: Execute the first two roadmap deliverables.
- Changes made: Expanded the screen inventory into an implemented-vs-partial-vs-missing product checklist and created a schema-to-UI contract document highlighting current field assumptions and key mismatches against the canonical Supabase schema.
- Files touched: `docs/04-product/screen_inventory.md`, `docs/03-architecture/schema_to_ui_contract.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: The highest-priority schema cleanup targets are `venues` field naming and the `daily_specials` field-shape mismatch.
- Follow-up: Use the new contract doc to drive the first real schema alignment pass, starting with venues and daily specials.

### 2026-03-09 11:35
- Goal: Make the schema alignment phase executable.
- Changes made: Mapped current screen queries to tables and fields, wrote a concrete workplan for schema cleanup, and recorded the chosen hybrid strategy: direct alignment for `venues`/`events`/`event_series`, temporary compatibility options for `daily_specials`.
- Files touched: `docs/03-architecture/query_surface_map.md`, `docs/05-dev-ops/schema_alignment_workplan.md`, `docs/06-decisions/adr_0002_schema_alignment_strategy.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: Use a hybrid schema-alignment strategy instead of a full compatibility layer or a big-bang rewrite.
- Follow-up: Start the first code-facing alignment pass with `venues`, then resolve `daily_specials`.

### 2026-03-09 12:00
- Goal: Land the first code-facing schema alignment pass without breaking the current prototype.
- Changes made: Added `utils/dataAdapters.ts` to normalize canonical venue and daily-special rows into the flatter UI shape used by the current app, then wired that into `app/(tabs)/explore.tsx`, `app/(tabs)/explore.ios.tsx`, `app/(tabs)/saved.tsx`, `app/(tabs)/saved.ios.tsx`, and `app/venue/[id].tsx`. Also moved the `Saved` screen effect below its memoized loader to avoid the same callback-initialization bug pattern seen in the detail routes.
- Files touched: `utils/dataAdapters.ts`, `app/(tabs)/explore.tsx`, `app/(tabs)/explore.ios.tsx`, `app/(tabs)/saved.tsx`, `app/(tabs)/saved.ios.tsx`, `app/venue/[id].tsx`, `docs/project_ledger.md`
- Decisions: During stabilization, prefer a small shared normalization layer when the live UI still assumes legacy field names like `price_level`, `instagram`, `insider_tip`, `menu_title`, and `valid_times`.
- Follow-up: Retest Explore, Saved, and Venue Detail in Natively; then decide whether to keep expanding adapters or start replacing the remaining legacy field assumptions screen by screen.

### 2026-03-09 12:25
- Goal: Document the path off Natively while preserving preview ability from the work computer.
- Changes made: Added a concrete transition guide for using the home machine as the runtime/build environment and the work computer as a browser-preview and editing environment, with Expo, EAS, and Vercel responsibilities clearly separated.
- Files touched: `docs/05-dev-ops/home_work_transition_checklist.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: The preferred post-Natively workflow is Expo local dev plus EAS on the home machine, with Vercel preview deployments used for browser preview on the work computer.
- Follow-up: Once the home machine is set up, document the actual Supabase and Vercel environment variables used by this repo.

### 2026-03-09 12:45
- Goal: Review the live Supabase project instead of relying only on planned schema docs.
- Changes made: Read the exported live Supabase CSV snapshots and documented the architecture assessment, including canonical tables, RLS posture, ingestion foundations, and the main mismatch between the mature backend and the still-prototype frontend.
- Files touched: `docs/03-architecture/live_supabase_assessment.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: Treat the live Supabase project as the canonical backend architecture from now on; align the app to it instead of reshaping the backend around prototype field assumptions.
- Follow-up: Plan the first migration from AsyncStorage-backed user state to live Supabase tables, starting with `favorites` and `profiles.taste_moods`.

### 2026-03-09 13:00
- Goal: Create a structured planning system in addition to the chronological ledger.
- Changes made: Added a master execution board to track active milestone, epics, backlog, in-progress work, blockers, and recently implemented work, then added concrete migration plans for moving saved venues to `favorites` and taste profile state to `profiles.taste_moods`.
- Files touched: `docs/00-overview/execution_board.md`, `docs/03-architecture/favorites_migration_plan.md`, `docs/03-architecture/profile_taste_migration_plan.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: Use the execution board as the structured planning source of truth, while keeping `project_ledger.md` as the historical narrative and session log.
- Follow-up: Keep the execution board current whenever backlog status changes or a new workstream becomes real.

### 2026-03-09 13:10
- Goal: Make the planning system part of the default startup behavior for every Hype session.
- Changes made: Added a dedicated session start protocol and updated the developer workflow, docs index, and napkin so the default read order is now execution board first, napkin second, and ledger third.
- Files touched: `docs/00-overview/session_start_protocol.md`, `docs/00-overview/developer_workflow.md`, `.claude/napkin.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: The startup protocol for Hype is now explicit and repo-documented, rather than implied through scattered guidance.
- Follow-up: Use the new session start protocol consistently across home and work machines.

### 2026-03-09 13:25
- Goal: Raise the professionalism of the planning system and start a formal quality-improvement track.
- Changes made: Added stable work IDs to the execution board, documented a first code-quality audit covering prototype-generated rough edges and simplification opportunities, and created a quality-guardrail plan for future recurring checks and automation.
- Files touched: `docs/00-overview/execution_board.md`, `docs/08-reference/code_quality_audit_2026_03_09.md`, `docs/05-dev-ops/quality_guardrail_plan.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: Treat code quality and simplification as a managed workstream, not an occasional cleanup impulse; use the execution board to track cleanup items alongside feature and infrastructure work.
- Follow-up: After the home-machine workflow is stable, implement the first lightweight automated quality scan for oversized screens, mojibake, hardcoded config, and persistence drift.

### 2026-03-09 13:35
- Goal: Make the adapted Hype team roles more useful during normal session startup.
- Changes made: Added a short role guide to the session start protocol so future work can quickly choose the right leading lens across architect, frontend, backend, and chronicle.
- Files touched: `docs/00-overview/session_start_protocol.md`, `docs/project_ledger.md`
- Decisions: Keep the role guide lightweight and practical rather than turning it into ceremony or duplicate documentation.
- Follow-up: Use the role guide implicitly during future sessions and expand it only if a recurring ambiguity appears.

### 2026-03-09 23:35
- Goal: Publish the project to GitHub with repo-facing documentation that matches the actual codebase.
- Changes made: Created the GitHub remote, pushed the initial repository, removed a hardcoded OpenWeather API key from the Home screens, and rewrote the root `README.md` to describe the real app/backend split, current status, and local development flow.
- Files touched: `README.md`, `app/(tabs)/(home)/index.tsx`, `app/(tabs)/(home)/index.ios.tsx`, `app.json`, `docs/project_ledger.md`
- Decisions: Treat GitHub-facing metadata as part of the docs system and avoid committing third-party API secrets; optional integrations should read config and fail gracefully when unset.
- Follow-up: Add final GitHub topics/description in the web UI, decide on a canonical env strategy for public config, and enable basic branch protection for `main`.

### 2026-03-09 23:50
- Goal: Tighten the public configuration strategy and remove remaining hardcoded frontend config drift.
- Changes made: Added `utils/publicConfig.ts` as the shared public-config loader, moved the canonical frontend Supabase client to env-driven config, turned `app/integrations/supabase/client.ts` into a compatibility re-export, added `.env.example`, broadened `.gitignore` to ignore local env files, and updated repo/env docs.
- Files touched: `utils/publicConfig.ts`, `integrations/supabase/client.ts`, `app/integrations/supabase/client.ts`, `app/(tabs)/(home)/index.tsx`, `app/(tabs)/(home)/index.ios.tsx`, `.env.example`, `.gitignore`, `app.json`, `README.md`, `docs/05-dev-ops/env_and_secrets.md`, `docs/project_ledger.md`
- Decisions: Use one canonical frontend public-config surface and one canonical frontend Supabase client surface; keep Expo `extra` as a fallback, but prefer `EXPO_PUBLIC_*` variables for day-to-day setup.
- Follow-up: Fill `.env` with the real public values locally, verify Expo startup against the new config, and later decide whether to replace `app.json` with a fully dynamic app config file.
