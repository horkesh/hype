# Project Ledger

This is the living source of truth for active development. We should read it at the start of a work session and update it before wrapping up.

## Project snapshot

- Project: Hype
- Repo root: the current local checkout of the `Hype app` repository
- Primary frontend: Expo Router app in the repo root
- Secondary backend: Node service in `backend/`
- Current phase: Stabilize and align the prototype against the live Supabase backend
- Last updated: 2026-03-10

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
| Documentation foundation | In progress | Core docs system is in place; current work is consistency cleanup and workflow refinement. |
| Frontend app mapping | In progress | Route groups and shared components identified. |
| Backend mapping | In progress | Startup entrypoint identified; routes not yet implemented. |
| Architecture cleanup | In progress | Current priorities include env handling, duplicated Supabase client cleanup, and translation encoding review. |

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

### 2026-03-10 09:00
- Goal: Reduce context loss between agents and machines with a formal handoff layer.
- Changes made: Added `handover.md` as a short high-signal cross-session briefing, added `handover_protocol.md` to define when it should be refreshed, and updated the session start protocol so cold starts and handoffs read the handover first.
- Files touched: `docs/00-overview/handover.md`, `docs/00-overview/handover_protocol.md`, `docs/00-overview/session_start_protocol.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: Use the handover docs to tighten continuity across home/work and across agents, instead of expecting every future session to reconstruct the project state from multiple documents.
- Follow-up: Refresh `handover.md` whenever the architecture stance, environment setup, or active workstreams materially change.

### 2026-03-10 09:15
- Goal: Record that the home-machine setup has advanced beyond planning.
- Changes made: Updated the execution board, handover, and home/work transition checklist to reflect that Git is now set up on the home machine and that the remaining transition work is Node/npm, Expo, EAS, and Vercel.
- Files touched: `docs/00-overview/execution_board.md`, `docs/00-overview/handover.md`, `docs/05-dev-ops/home_work_transition_checklist.md`, `docs/project_ledger.md`
- Decisions: Treat the home-machine transition as `In Progress` rather than merely planned.
- Follow-up: Confirm the next milestone on the home machine with `npm install`, `npx expo start`, and `npm run web`.

### 2026-03-10 09:35
- Goal: Remove stale user-specific absolute paths from shared workflow docs.
- Changes made: Replaced profile-specific Windows path references with relative links or generic path examples in the session start protocol, transition checklist, and project ledger.
- Files touched: `docs/00-overview/session_start_protocol.md`, `docs/05-dev-ops/home_work_transition_checklist.md`, `docs/project_ledger.md`
- Decisions: Shared coordination docs should stay machine-agnostic unless a local absolute path is explicitly required.
- Follow-up: Watch future handoff and setup docs for profile-specific path leakage during review.

### 2026-03-10 09:45
- Goal: Merge duplicate ledger files into one canonical project ledger.
- Changes made: Confirmed that repo docs already standardize on `docs/project_ledger.md`, removed the stray uppercase-ledger reference from the recent history, and retired the duplicate `docs/PROJECT_LEDGER.md` file.
- Files touched: `docs/project_ledger.md`, `.claude/napkin.md`
- Decisions: `docs/project_ledger.md` is the only canonical ledger for this repo; do not create or update a parallel uppercase ledger.
- Follow-up: Keep future doc-process cleanup aligned to the repo-native lowercase ledger rather than generic external conventions.

### 2026-03-10 10:00
- Goal: Align the core workflow docs after the handover and ledger cleanup changes.
- Changes made: Updated the docs index to reflect the current startup order, changed the execution board so the home/work transition epic matches its in-progress sprint item, and refreshed the top-level project ledger snapshot to match the current stabilize-and-align phase.
- Files touched: `docs/README.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: The docs index should describe the same startup flow as the session start protocol and handover docs, and status labels should match across overview documents.
- Follow-up: Keep the core workflow docs synchronized whenever startup order, active phase, or epic status changes.

### 2026-03-10 10:25
- Goal: Verify the actual home-machine runtime setup instead of assuming it is still a future step.
- Changes made: Confirmed `git` and `node` are installed locally, found that PowerShell execution policy blocks `npm.ps1` so `npm.cmd` and `npx.cmd` are required, reproduced a fresh `npm install` failure caused by the React 19 vs `react-leaflet@4.2.1` peer dependency conflict, and verified that Expo Metro and web preview can still boot on fixed ports. The web preview successfully bundled `index.ts`, but the app immediately hit repeated Home-screen `Maximum update depth exceeded` errors. Updated the execution board, transition checklist, and napkin to reflect these verified home-machine realities.
- Files touched: `.claude/napkin.md`, `docs/00-overview/execution_board.md`, `docs/05-dev-ops/home_work_transition_checklist.md`, `docs/project_ledger.md`
- Decisions: Treat the remaining home-machine work as an active runtime/debugging track, not just an environment-setup checklist item.
- Follow-up: Investigate the Home-screen render loop, then decide whether the install conflict should be resolved by dependency alignment or by documenting a repo-approved npm install mode.

### 2026-03-10 23:30
- Goal: Keep narrowing the web render loop with regression tests and route-surface cleanup.
- Changes made: Added regression tests for stable image sources, weather-driven mood merging, and accidental helper files under the Expo Router `app/` tree; moved Home weather mood updates to a functional state merge so the initialization callback no longer depends on `selectedMood`; extracted `utils/homeWeather.ts`; stabilized image source reuse through `utils/imageSource.ts`; and removed the duplicate `app/integrations/supabase/` compatibility files so Expo Router no longer treats helper code as routes.
- Files touched: `app/(tabs)/(home)/index.tsx`, `app/(tabs)/(home)/index.ios.tsx`, `components/ImageWithPlaceholder.tsx`, `utils/imageSource.ts`, `utils/homeWeather.ts`, `tests/imageSource.test.ts`, `tests/homeWeather.test.ts`, `tests/appRoutes.test.ts`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Helper-only integration modules should live outside `app/`, and Home weather should use functional state updates when it needs the current mood to avoid effect dependency loops.
- Follow-up: Reproduce the web runtime in a real browser again and inspect whether the remaining `Maximum update depth exceeded` errors persist after the route cleanup; if they do, instrument the browser-side error logger to surface component stack details.

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

### 2026-03-11 00:10
- Goal: Refresh the handover docs so work can resume cleanly on the home machine.
- Changes made: Updated `handover.md` with the concrete resume point, current runtime blockers, and the exact files tied to the latest Home/web stabilization pass; expanded `handover_protocol.md` so mid-debugging handoffs preserve symptom, mitigation, and next verification step; refreshed `current_state.md`; and aligned the execution board's recent-completion and next-wave notes with the current web-loop and install-conflict reality.
- Files touched: `docs/00-overview/handover.md`, `docs/00-overview/handover_protocol.md`, `docs/00-overview/current_state.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Treat the next session's first job as verification of the remaining Home/web loop on the home machine, not as open-ended new feature work.
- Follow-up: On resume, start with `docs/00-overview/handover.md`, then rerun the web path and capture a browser component stack if the loop still reproduces.

### 2026-03-11 10:30
- Goal: Start the first real migration from prototype-local user state to canonical Supabase favorites.
- Changes made: Added shared favorites helpers for current-user reads and venue favorite writes, switched the Saved venues tab on both default and iOS surfaces to load venue favorites from the Supabase `favorites` table, switched venue detail save/unsave to Supabase-backed favorites, and added a small auth-required error helper plus regression tests around that error contract. Also updated the execution board so favorites migration is now tracked as in progress.
- Files touched: `utils/favorites.ts`, `utils/favoritesErrors.ts`, `app/(tabs)/saved.tsx`, `app/(tabs)/saved.ios.tsx`, `app/venue/[id].tsx`, `tests/favorites.test.ts`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Use `sign in to save` as the first-pass UX instead of keeping guest-sync complexity during stabilization; keep saved events on AsyncStorage until their canonical backend model is confirmed separately.
- Follow-up: Verify the authenticated favorites flow on the home machine, decide whether to add optimistic refresh/listeners around auth state, and then begin the `profiles.taste_moods` migration.

### 2026-03-11 10:50
- Goal: Continue the migration of prototype-local user state by moving taste profile persistence into canonical user profiles.
- Changes made: Added shared profile taste helpers for reading and writing `profiles.taste_moods`, removed AsyncStorage-based taste persistence from both profile screen variants, changed mood toggles to require authentication, and added a small regression test for the new auth-required error contract. Updated the execution board so taste-profile migration is now also in progress.
- Files touched: `utils/profileTaste.ts`, `app/(tabs)/profile.tsx`, `app/(tabs)/profile.ios.tsx`, `tests/profileTaste.test.ts`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Use `sign in to personalize` as the first-pass UX for taste profile instead of maintaining guest-local taste state during stabilization; rely on a safe `profiles` upsert path for the first write, while leaving deeper profile bootstrap verification to the home machine.
- Follow-up: On the home machine, verify that authenticated mood selection persists across reloads and confirm whether any account path still lacks a writable `profiles` row.

### 2026-03-11 11:05
- Goal: Make the new Supabase-backed saved/profile flows react to auth changes without requiring an app restart.
- Changes made: Added a shared Supabase auth-session subscription helper and wired the Saved and Profile screens on both default and iOS surfaces to refresh when auth state changes. This should let sign-in and sign-out update favorites visibility and profile taste state immediately.
- Files touched: `utils/authSession.ts`, `app/(tabs)/saved.tsx`, `app/(tabs)/saved.ios.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/profile.ios.tsx`, `docs/project_ledger.md`
- Decisions: Keep auth refresh lightweight and screen-local for now rather than introducing a global auth context during stabilization.
- Follow-up: Verify on the home machine that signing in from Profile updates Saved/Profile state without reopening the app, then decide whether a broader session context is still needed.

### 2026-03-11 11:25
- Goal: Turn scraper planning into an executable backend-oriented ingestion slice.
- Changes made: Added a repo-native ingestion workflow doc, recorded an ADR that keeps Supabase ingestion tables as canonical storage with the separate backend as orchestration layer, added a first backend ingestion route registration surface with health/source/run placeholders, and updated backend/docs planning so scraper work now has a concrete entrypoint.
- Files touched: `docs/03-architecture/scraper_ingestion_workflow.md`, `docs/06-decisions/adr_0003_ingestion_orchestration.md`, `backend/src/routes/ingestion.ts`, `backend/src/index.ts`, `backend/README.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Keep the first ingestion slice route-first and contract-first rather than pretending full scraping is implemented; preserve a strict separation between raw intake tables and public canonical content tables.
- Follow-up: Implement real `scrape_sources` reads and `scrape_log`/`raw_events` write flows in the backend once a runtime-capable environment is available.

### 2026-03-11 11:40
- Goal: Make the ingestion route scaffold backend-ready by grounding it in the actual live Supabase ingestion schema.
- Changes made: Read the live schema, index, and policy exports for `scrape_sources`, `raw_events`, and `scrape_log`; documented the exact live field contract plus first-pass route request/response shapes; and captured the current unique/dedupe and privilege assumptions in a dedicated ingestion endpoint contract doc.
- Files touched: `docs/03-architecture/ingestion_endpoint_contract.md`, `docs/03-architecture/scraper_ingestion_workflow.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Use `raw_events.source_url` as the first duplicate guard where available, keep ingestion endpoints privileged/admin-oriented, and treat parse/promotion as a later slice after raw-intake wiring is working.
- Follow-up: On a runtime-capable machine, implement real `scrape_sources` reads and `scrape_log`/`raw_events` writes against this contract.

### 2026-03-11 11:55
- Goal: Convert the first ingestion route from a placeholder into a real backend read path.
- Changes made: Added an explicit backend-only Supabase admin helper, added an ingestion-source service that maps `scrape_sources` rows into operator-facing route summaries with a derived `readyToRun` flag, and upgraded `GET /ingestion/sources` to return live data when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured. Updated backend and env docs to describe the new admin-only variables.
- Files touched: `backend/src/lib/supabaseAdmin.ts`, `backend/src/services/ingestionSources.ts`, `backend/src/routes/ingestion.ts`, `backend/README.md`, `docs/05-dev-ops/env_and_secrets.md`, `docs/03-architecture/ingestion_endpoint_contract.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Use explicit REST-based backend admin access for the first ingestion read instead of relying on hidden framework DB magic; keep the service-role path backend-only and do not expose it to the Expo client.
- Follow-up: On a runtime-capable machine, hit `GET /ingestion/sources` with backend admin env configured and then implement the first `POST /ingestion/run/:sourceId` write path.

### 2026-03-11 12:10
- Goal: Land the first safe ingestion write path without pretending fetch/parser orchestration already exists.
- Changes made: Extended the backend Supabase admin helper to support write requests, added source lookup by id plus scrape-log creation services, and upgraded `POST /ingestion/run/:sourceId` so it now validates the source, rejects inactive/missing sources cleanly, creates a real `scrape_log` row, and returns a queued run summary with the new `logId`. Updated the ingestion contract and planning docs to match the new behavior.
- Files touched: `backend/src/lib/supabaseAdmin.ts`, `backend/src/services/ingestionSources.ts`, `backend/src/services/ingestionRuns.ts`, `backend/src/routes/ingestion.ts`, `docs/03-architecture/ingestion_endpoint_contract.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Treat queued log creation as the first backend write milestone before adding fetch or raw-event persistence; default manual route calls to `dryRun = true` until the source fetch path is implemented.
- Follow-up: On a runtime-capable machine, verify that `POST /ingestion/run/:sourceId` creates `scrape_log` rows correctly, then add source fetch plus `raw_events` insert/skip logic.

### 2026-03-11 12:20
- Goal: Make sure the app repo itself preserves the intended Instagram scraping strategy instead of relying on older root planning docs.
- Changes made: Folded the documented Instagram ingestion policy into the app repo architecture docs, including the phased execution path of Apify first, self-hosted headless fallback later, and official connected-account APIs long term.
- Files touched: `docs/03-architecture/scraper_ingestion_workflow.md`, `docs/03-architecture/ingestion_endpoint_contract.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Treat Instagram as a first-class ingestion source type in repo-native docs, with raw provenance preserved before canonical promotion.
- Follow-up: Add explicit `scrape_config` conventions for Instagram and other source types when the source-type taxonomy doc is created.

### 2026-03-11 12:35
- Goal: Transport the next highest-value scraping architecture pieces into the app repo so ingestion planning becomes self-contained.
- Changes made: Added repo-native docs for source taxonomy and `scrape_config` conventions, source priority tiers and cadence guidance, and dedupe/promotion policy between raw intake and canonical content. Linked these surfaces back into the main ingestion workflow and handover context.
- Files touched: `docs/03-architecture/source_types_and_scrape_config.md`, `docs/03-architecture/source_priority_and_cadence.md`, `docs/03-architecture/dedupe_and_promotion_policy.md`, `docs/03-architecture/scraper_ingestion_workflow.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Keep source richness in `scrape_config` first instead of prematurely expanding schema columns; keep promotion conservative and confidence-based, especially for Instagram-origin content.
- Follow-up: Add a dedicated source-seeding strategy doc and Facebook-policy doc if we keep deepening ingestion planning before runtime implementation.

### 2026-03-11 12:45
- Goal: Add a practical seeding strategy so the new source taxonomy can turn into a real `scrape_sources` inventory.
- Changes made: Added a repo-native source seeding strategy covering source seeding order, Instagram account discovery, venue-linked versus citywide source rules, provenance metadata, and conservative activation guidance. Linked it into the ingestion workflow and handover docs.
- Files touched: `docs/03-architecture/source_seeding_strategy.md`, `docs/03-architecture/scraper_ingestion_workflow.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Seed citywide high-signal sources first, then venue-linked sources, and only activate uncertain sources after a manual validation pass; keep source provenance in `scrape_config` until repeated use justifies schema expansion.
- Follow-up: Transport Facebook policy and media enrichment policy if we want the ingestion architecture to be fully self-contained in the app repo.

### 2026-03-11 12:55
- Goal: Finish the remaining major ingestion-policy transfers so the app repo can stand on its own without the older root architecture docs.
- Changes made: Added repo-native docs for Facebook acquisition strategy and policy, plus a media enrichment policy for venue/event imagery discovered during ingestion. Linked both back into the ingestion workflow and handover docs.
- Files touched: `docs/03-architecture/facebook_source_policy.md`, `docs/03-architecture/media_enrichment_policy.md`, `docs/03-architecture/scraper_ingestion_workflow.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Use Facebook-proxy sources as the practical default before direct Facebook scraping, and treat scraped media as enrichment input first rather than automatic canonical truth.
- Follow-up: If we keep deepening architecture transport, the next likely doc is a source-review/admin workflow note tying together source health, raw review, and image review.

### 2026-03-11 13:05
- Goal: Close the ingestion architecture loop with an operator-facing review workflow.
- Changes made: Added a repo-native operator workflow doc covering source health review, manual run review, raw event review, venue matching, dedupe/promotion decisions, and media review. Linked it into the main ingestion workflow and handover context.
- Files touched: `docs/03-architecture/operator_review_workflow.md`, `docs/03-architecture/scraper_ingestion_workflow.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Keep the first operator/admin workflow lightweight and backend/reporting-first rather than building a full admin UI too early.
- Follow-up: If implementation continues before home-machine verification, the next strongest step is the first `raw_events` insert/skip path behind `POST /ingestion/run/:sourceId`.

### 2026-03-11 13:20
- Goal: Extend manual ingestion runs into the first real raw-intake path instead of stopping at queued log creation.
- Changes made: Added source-fetch and generic candidate-extraction helpers for `direct_html` sources, added raw-event insert/skip and `last_scraped_at` update services, upgraded `POST /ingestion/run/:sourceId` so it now fetches source HTML, extracts anchor-based candidates, logs the intake summary, and inserts `raw_events` on non-dry runs. Added a small pure extraction test and updated the ingestion contract and handover context accordingly.
- Files touched: `backend/src/services/ingestionFetch.ts`, `backend/src/services/rawEvents.ts`, `backend/src/lib/supabaseAdmin.ts`, `backend/src/services/ingestionRuns.ts`, `backend/src/routes/ingestion.ts`, `backend/tests/ingestionFetch.test.ts`, `docs/03-architecture/ingestion_endpoint_contract.md`, `docs/00-overview/execution_board.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Limit the first raw-intake implementation to `direct_html` sources and generic anchor extraction; defer source-specific parsing and non-HTML fetch methods until runtime verification exists.
- Follow-up: On a runtime-capable machine, verify the new raw-intake path against one safe `direct_html` source, then improve source-aware extraction quality and begin parse-stage work.

### 2026-03-11 13:30
- Goal: Start replacing generic raw-intake extraction with source-aware logic for one safe Tier 1 source.
- Changes made: Added a source-extractor layer, implemented a first Pozorista-aware extractor that prefers `?event=` links, and wired raw-intake extraction to use source-aware logic before falling back to generic anchor harvesting. Added a focused pure test for the new extractor and refreshed handover context.
- Files touched: `backend/src/services/sourceExtractors.ts`, `backend/src/services/ingestionFetch.ts`, `backend/tests/sourceExtractors.test.ts`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Start source-aware extraction with Pozorista because its event-link structure is relatively predictable and lower-risk than jumping straight to noisier sources.
- Follow-up: Add the next source-aware extractor for another Tier 1 source such as AllEvents or KupiKartu once the home machine verifies the current raw-intake path.

### 2026-03-11 13:40
- Goal: Extend source-aware raw-intake extraction to a second Tier 1 pattern so manual ingestion runs produce higher-signal candidates.
- Changes made: Added an AllEvents-aware extractor that recognizes Sarajevo event links with stable event-id tails, kept source-aware extraction ahead of generic fallback, expanded the pure extractor test coverage, and refreshed planning context to reflect that raw intake now branches by source type for both Pozorista and AllEvents.
- Files touched: `backend/src/services/sourceExtractors.ts`, `backend/tests/sourceExtractors.test.ts`, `docs/00-overview/execution_board.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Expand source-aware extraction one safe Tier 1 source at a time so ingestion quality improves without overfitting the raw-intake path before runtime verification.
- Follow-up: Add the next safe extractor candidate such as KupiKartu, then verify the manual run route on the home machine against at least one `direct_html` source for each supported extractor pattern.

### 2026-03-11 13:55
- Goal: Extend source-aware raw-intake extraction to the first ticketing-platform source so backend intake starts recognizing cleaner paid-event links too.
- Changes made: Added a KupiKartu-aware extractor that recognizes `/karte/event/{id}/{slug}` links, trims common homepage card noise like leading dates and trailing `@Venue` text from candidate titles, expanded extractor test coverage, and updated planning docs plus parser-hint vocabulary to reflect the new supported pattern.
- Files touched: `backend/src/services/sourceExtractors.ts`, `backend/tests/sourceExtractors.test.ts`, `docs/03-architecture/source_types_and_scrape_config.md`, `docs/00-overview/execution_board.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Treat KupiKartu as the next safe source-aware extractor because its event URL structure is stable and its homepage cards already expose useful title/date/venue context without requiring a headless-first solution.
- Follow-up: On the home machine, verify `POST /ingestion/run/:sourceId` against one KupiKartu source and one previous website/aggregator source, then decide whether to add category-page coverage or start a detail-enrichment pass for source-specific fetches.

### 2026-03-11 14:05
- Goal: Align the first raw-intake fetch path with the repo-native source contract so source-specific list pages are actually usable.
- Changes made: Upgraded the ingestion fetch flow to prefer `scrape_config.list_url` over `source_url` for `direct_html` sources, carried the fetched page URL through extraction and run logging, updated extractor and fetch tests to cover list-page-relative URLs, and refreshed the ingestion contract plus backend README to match the implementation.
- Files touched: `backend/src/services/ingestionFetch.ts`, `backend/src/services/sourceExtractors.ts`, `backend/src/services/ingestionRuns.ts`, `backend/src/routes/ingestion.ts`, `backend/tests/ingestionFetch.test.ts`, `docs/03-architecture/ingestion_endpoint_contract.md`, `backend/README.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Treat `scrape_config.list_url` as the first-class direct-html fetch target when present so sources can point at a stable homepage while still scraping a more useful listings URL operationally.
- Follow-up: On the home machine, verify at least one source that uses a dedicated list page and confirm the run summary/log captures the fetched URL correctly before expanding to multi-page category fetches.

### 2026-03-11 14:20
- Goal: Extend the direct-html intake path so ticketing and aggregator sources can fetch more than one configured listing page in a single manual run.
- Changes made: Upgraded the fetch path to resolve and fetch `scrape_config.list_url`, `list_urls`, and `category_urls`, merged candidate intake across those pages with source-url dedupe, exposed fetched page arrays in run summaries/logging, and updated the source-config and ingestion contract docs to reflect multi-page support.
- Files touched: `backend/src/services/ingestionFetch.ts`, `backend/src/services/ingestionRuns.ts`, `backend/src/routes/ingestion.ts`, `docs/03-architecture/source_types_and_scrape_config.md`, `docs/03-architecture/ingestion_endpoint_contract.md`, `backend/README.md`, `docs/00-overview/execution_board.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Treat multi-page direct-html intake as config-driven rather than source-hardcoded so ticketing and aggregator sources can expand coverage without route changes.
- Follow-up: On the home machine, verify one source that uses `category_urls` or `list_urls`, then decide whether the next backend slice should be detail-page enrichment or operator-facing source seeding for the first real source inventory.

### 2026-03-11 14:35
- Goal: Add one compact planning surface that answers what remains, in what order, and on which machine, without replacing the existing docs system.
- Changes made: Added `docs/00-overview/program_map.md` as a concise synthesis of current phase, workstreams, now/next/later sequencing, machine-specific ownership, blockers, and the working definition of v0.1 done. Linked it into the docs index, startup protocol, and handover so future sessions can find it quickly.
- Files touched: `docs/00-overview/program_map.md`, `docs/README.md`, `docs/00-overview/session_start_protocol.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Keep the planning system layered: `master_roadmap.md` for long-range sequencing, `execution_board.md` for active planning, `handover.md` for the next resume point, and `program_map.md` for the shortest end-to-end view of remaining work.
- Follow-up: Keep `program_map.md` high-signal and short; update it when the current phase, machine split, or definition of near-term done materially changes.

### 2026-03-11 14:50
- Goal: Add a durable home-machine runtime-validation playbook so the next runtime-capable session can execute checks in a fixed order with explicit evidence capture.
- Changes made: Added `docs/05-dev-ops/home_machine_verification_checklist.md` covering machine preflight, Home/web verification, favorites verification, taste-profile verification, auth refresh verification, backend ingestion verification, and post-run documentation rules. Linked it into the docs index, startup protocol, and handover so future sessions can use it as the standard home-machine execution script.
- Files touched: `docs/05-dev-ops/home_machine_verification_checklist.md`, `docs/README.md`, `docs/00-overview/session_start_protocol.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Keep setup concerns in `home_work_transition_checklist.md` and use the new checklist only for runtime/backend verification; require explicit failure evidence capture instead of vague `retest` notes.
- Follow-up: On the home machine, use this checklist as the first runtime pass and update the ledger/handover with pass/fail evidence for Home, favorites, taste profile, auth refresh, and ingestion.

### 2026-03-11 15:05
- Goal: Turn the ingestion architecture into a concrete first `scrape_sources` shortlist so the next runtime-capable session knows exactly which sources to seed and validate.
- Changes made: Added `docs/03-architecture/initial_source_inventory.md` with a repo-native first source inventory, including recommended active sources, seeded-but-inactive sources, skip-for-now sources, and the preferred home-machine verification order. Linked it into the docs index, handover, and program map.
- Files touched: `docs/03-architecture/initial_source_inventory.md`, `docs/README.md`, `docs/00-overview/handover.md`, `docs/00-overview/program_map.md`, `docs/project_ledger.md`
- Decisions: Treat Pozorista, AllEvents, and KupiKartu as the first active ingestion sources because they best fit the current backend; keep Entrio, FiestaLama, CineStar, and first Instagram accounts seeded later or inactive until fetch/parser support catches up.
- Follow-up: On the home machine, use the source inventory together with the verification checklist to run Pozorista first, AllEvents second, and KupiKartu third.

### 2026-03-11 15:20
- Goal: Make the initial source inventory directly usable on the home machine by adding a repo-native SQL seed artifact.
- Changes made: Added `backend/sql/initial_scrape_sources_seed.sql` covering the first active sources plus seeded-but-inactive follow-ons, and linked that seed into the backend README, handover, and program map so the next runtime-capable session can apply it without reconstructing inserts from docs.
- Files touched: `backend/sql/initial_scrape_sources_seed.sql`, `backend/README.md`, `docs/00-overview/handover.md`, `docs/00-overview/program_map.md`, `docs/project_ledger.md`
- Decisions: Keep the first seed conservative and aligned to the current backend capabilities: activate Pozorista, AllEvents, and KupiKartu first; seed Entrio, FiestaLama, CineStar, and first Instagram accounts as inactive until their fetch paths are ready.
- Follow-up: On the home machine, apply the seed, confirm `GET /ingestion/sources` returns the seeded rows, and then use the verification checklist in the recommended source order.

### 2026-03-11 15:40
- Goal: Push the next meaningful ingestion slice in one pass by improving raw-row quality and adding operator inspection support.
- Changes made: Extended the raw candidate shape so first source-aware extractors can carry `date_raw`, `image_url`, `venue_raw`, and `venue_name_raw` into `raw_events`; enriched KupiKartu, AllEvents, and Pozorista extraction accordingly; updated raw-event inserts to persist those fields; added focused extractor assertions; added `backend/sql/ingestion_operator_queries.sql`; and documented the new raw-intake enrichment layer in repo-native architecture and handover docs.
- Files touched: `backend/src/services/ingestionFetch.ts`, `backend/src/services/sourceExtractors.ts`, `backend/src/services/rawEvents.ts`, `backend/tests/sourceExtractors.test.ts`, `backend/sql/ingestion_operator_queries.sql`, `docs/03-architecture/raw_intake_enrichment_plan.md`, `docs/03-architecture/ingestion_endpoint_contract.md`, `backend/README.md`, `docs/README.md`, `docs/00-overview/handover.md`, `docs/00-overview/program_map.md`, `docs/project_ledger.md`
- Decisions: Improve raw-intake usefulness before building detail-page enrichment; keep listing-level metadata provisional and source-specific instead of pretending generic parsing is reliable enough for canonical promotion.
- Follow-up: On the home machine, seed the first sources, run the verification checklist, then use the operator queries to inspect how much date/venue/image metadata actually landed for Pozorista, AllEvents, and KupiKartu.

### 2026-03-11 16:00
- Goal: Push detail-page enrichment into the first active ingestion sources so raw rows arrive with better metadata before the later parse stage.
- Changes made: Added `backend/src/services/sourceDetailEnrichment.ts`, wired `fetchSourceContent` to apply limited source-specific detail enrichment, implemented AllEvents event-page JSON-LD enrichment plus KupiKartu detail-page metadata enrichment, added focused pure tests for those enrichers, and refreshed the enrichment contract/docs/handover context to reflect the new behavior.
- Files touched: `backend/src/services/sourceDetailEnrichment.ts`, `backend/src/services/ingestionFetch.ts`, `backend/tests/sourceDetailEnrichment.test.ts`, `docs/03-architecture/raw_intake_enrichment_plan.md`, `docs/03-architecture/ingestion_endpoint_contract.md`, `backend/README.md`, `docs/00-overview/handover.md`, `docs/00-overview/program_map.md`, `docs/project_ledger.md`
- Decisions: Keep detail enrichment source-specific and capped to the first candidates per run instead of turning raw intake into an unbounded generic crawler; enrich AllEvents and KupiKartu now, leave Pozorista on listing-context enrichment until real run data proves a detail pass is worth the extra fetches.
- Follow-up: On the home machine, validate that AllEvents and KupiKartu raw rows now land with richer description/date/venue/image data, then decide whether the next slice should be Pozorista detail enrichment or the first parse/match workflow.

### 2026-03-11 16:20
- Goal: Add the first parse-stage scaffolding so recent `raw_events` can be normalized and reviewed before any canonical promotion work starts.
- Changes made: Added `backend/src/services/parsePreview.ts`, added admin read routes for recent raw rows and parse previews, added a focused pure parse-preview test, extended the operator SQL pack with a parse-preview-oriented query, and documented the new preview/review stage in repo-native architecture, backend, handover, and program docs.
- Files touched: `backend/src/services/parsePreview.ts`, `backend/src/routes/ingestion.ts`, `backend/tests/parsePreview.test.ts`, `backend/sql/ingestion_operator_queries.sql`, `docs/03-architecture/parse_preview_workflow.md`, `docs/03-architecture/operator_review_workflow.md`, `docs/03-architecture/ingestion_endpoint_contract.md`, `backend/README.md`, `docs/README.md`, `docs/00-overview/handover.md`, `docs/00-overview/program_map.md`, `docs/project_ledger.md`
- Decisions: Keep the first parse stage preview-only and backend-admin-only; derive normalized candidate fields, confidence, and review reasons without writing to canonical tables yet.
- Follow-up: On the home machine, run ingestion first, then inspect `GET /ingestion/raw/recent` and `GET /ingestion/parse-preview` to see whether the first active sources are producing enough structured rows to justify the first real parse/match workflow.

### 2026-03-11 16:35
- Goal: Correct the venue planning posture by grounding it in the real 1233-venue seed instead of treating venue population as a greenfield problem.
- Changes made: Inspected `hype-venues-seed.json`, confirmed it contains 1233 venues with strong schema overlap against live `venues`, documented the current findings and remaining unknowns in `docs/03-architecture/venue_seed_reconciliation.md`, and added `backend/sql/venue_reconciliation_queries.sql` so the home machine can compare the large seed against the actual live `venues` table.
- Files touched: `docs/03-architecture/venue_seed_reconciliation.md`, `backend/sql/venue_reconciliation_queries.sql`, `docs/README.md`, `backend/README.md`, `docs/00-overview/handover.md`, `docs/00-overview/program_map.md`, `docs/project_ledger.md`
- Decisions: Treat the existing 1233-venue seed as a primary import candidate; do not plan a fresh venue-discovery effort; reconcile against live `venues` first and then decide whether to backfill, merge, or mostly validate the current live table.
- Follow-up: On the home machine, run the venue reconciliation queries against live Supabase, then decide whether the next venue slice is an upsert import, a cleanup merge, or only a targeted backfill.

### 2026-03-11 16:55
- Goal: Extend the same reconciliation discipline from venues to the other canonical content tables whose schema is known but whose live row reality is not yet repo-visible.
- Changes made: Added repo-native reconciliation docs for `events` plus `event_series` and for `daily_specials`, added matching SQL query packs for live content-quality inspection, and wired those assets into the docs index, backend README, handover, program map, and execution board.
- Files touched: `docs/03-architecture/events_series_reconciliation.md`, `docs/03-architecture/daily_specials_reconciliation.md`, `backend/sql/events_series_reconciliation_queries.sql`, `backend/sql/daily_specials_reconciliation_queries.sql`, `docs/README.md`, `backend/README.md`, `docs/00-overview/handover.md`, `docs/00-overview/program_map.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Treat `events`, `event_series`, and `daily_specials` the same way as venues for planning purposes: canonical schema is understood, but import/promotion/UI decisions should wait for live row-level reconciliation on the home machine instead of being treated as pure architecture exercises.
- Follow-up: On the home machine, run the new reconciliation query packs against live Supabase, then decide whether the next canonical-content slice is event promotion design, series matching, daily-specials UI cleanup, or targeted data cleanup based on actual live quality.

### 2026-03-11 17:05
- Goal: Make sure the new live-content reconciliation work becomes part of the standard home-machine execution path instead of living only in architecture docs and handover notes.
- Changes made: Extended `home_machine_verification_checklist.md` with a dedicated live canonical-content reconciliation step covering venues, events, event series, and daily specials, and updated the session-start protocol so future sessions can find those reconciliation docs quickly when the task is live Supabase reality-checking.
- Files touched: `docs/05-dev-ops/home_machine_verification_checklist.md`, `docs/00-overview/session_start_protocol.md`, `docs/project_ledger.md`
- Decisions: Treat live-data reconciliation as a standard home-machine verification responsibility alongside runtime, auth, and ingestion checks, not as an ad hoc investigation.
- Follow-up: On the home machine, use the checklist section after the runtime and ingestion checks so the next planning decisions are grounded in real canonical-content quality, not schema assumptions alone.

### 2026-03-11 17:20
- Goal: Close the biggest remaining ingestion-to-publishing architecture gaps by documenting the rulebook for canonical promotion, venue matching, and safe event enrichment.
- Changes made: Added repo-native strategy docs for the first promotion workflow, venue matching, and canonical event update policy, then linked them into the ingestion workflow, parse-preview workflow, operator-review workflow, docs index, handover, and program map.
- Files touched: `docs/03-architecture/promotion_workflow.md`, `docs/03-architecture/venue_matching_strategy.md`, `docs/03-architecture/canonical_event_update_policy.md`, `docs/03-architecture/scraper_ingestion_workflow.md`, `docs/03-architecture/operator_review_workflow.md`, `docs/03-architecture/parse_preview_workflow.md`, `docs/README.md`, `docs/00-overview/handover.md`, `docs/00-overview/program_map.md`, `docs/project_ledger.md`
- Decisions: Treat the next ingestion implementation wave as publishability work, not just more scraping breadth; require explicit staged decisions for venue matching, duplicate handling, and field-level canonical updates before broader automatic promotion is attempted.
- Follow-up: After home-machine reconciliation verifies live canonical-content quality, use these docs to design the first backend promotion-preview implementation rather than expanding source coverage first.

### 2026-03-11 17:30
- Goal: Prepare the backend-only Supabase admin env surface so the home machine can add the service-role key without guessing where it belongs.
- Changes made: Added `backend/.env` and `backend/.env.example` with `SUPABASE_URL` preset and an empty `SUPABASE_SERVICE_ROLE_KEY` placeholder, then documented that location in the backend README.
- Files touched: `backend/.env`, `backend/.env.example`, `backend/README.md`, `docs/project_ledger.md`
- Decisions: Keep the service-role key in `backend/.env`, not the Expo app root `.env`, so admin credentials stay backend-only.
- Follow-up: On the home machine, paste the real `SUPABASE_SERVICE_ROLE_KEY` into `backend/.env`, then use it for ingestion and reconciliation work.

### 2026-03-11 17:40
- Goal: Make sure the new backend admin env location is explicit in the home-machine continuity layer instead of only in README and chat.
- Changes made: Updated `handover.md` and `home_machine_verification_checklist.md` to call out `backend/.env` as the backend admin env source of truth, and added a reusable napkin rule to keep the service-role key out of the Expo app root `.env`.
- Files touched: `docs/00-overview/handover.md`, `docs/05-dev-ops/home_machine_verification_checklist.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Treat `backend/.env` as part of the standard home-machine preflight for ingestion and live reconciliation work.
- Follow-up: On the home machine, verify the backend runtime actually loads `backend/.env` before using the ingestion and reconciliation routes as proof of connectivity.

### 2026-03-11 18:00
- Goal: Turn the Hype pitch into an actionable product-design direction and a usable exploration workflow instead of leaving design advice only in chat.
- Changes made: Reviewed the pitch proposal against the current product surfaces, added a repo-native design-direction brief focused on Hype as a warm Sarajevo-first concierge rather than a generic event app, and added a Pencil prompt pack meant to generate exploratory directions before convergence in Figma. Linked both into the docs index.
- Files touched: `docs/04-product/design_direction_brief.md`, `docs/04-product/pencil_prompt_pack.md`, `docs/README.md`, `docs/project_ledger.md`
- Decisions: Use Pencil for fast divergent concept exploration and Figma for the actual design system and source of truth; anchor the visual direction in mood-first discovery, city pulse, local trust, and editorial warmth.
- Follow-up: Generate a few Pencil directions for Home first, choose one, then move the winning direction into Figma for the first component and layout system pass.

### 2026-03-11 18:10
- Goal: Make sure the new design-direction work is visible in the home-machine continuity layer, not only in product docs and chat.
- Changes made: Updated `handover.md` to list the design brief and Pencil prompt pack as relevant changed surfaces and explicit design-direction pickup docs for the home-machine session.
- Files touched: `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Treat the design brief and Pencil prompt pack as real continuity assets, because the next design exploration will start on the home machine.
- Follow-up: On the home machine, open the design brief and prompt pack before generating the first Home concepts in Pencil.

### 2026-03-12 01:30
- Goal: Rebuild the unstable frontend shell in place, starting with the shared tab foundation and Home, then finish the home-machine verification pass against the live backend.
- Changes made: Added shared tab-shell primitives (`TabScreen`, `SectionHeader`, `ContentState`), rebuilt Home into `components/home/HomeScreen.tsx` with extracted copy/date helpers, collapsed Home/Profile/Saved iOS wrappers to shared implementations, made `ImageWithPlaceholder` explicitly web-safe to remove the remaining Home render loop, fixed the Home cafe query to match the real `venues` schema, and cleaned up a few touched theme/type issues in `FloatingTabBar`, `MoodChip`, and `SkeletonLoader`.
- Files touched: `components/TabScreen.tsx`, `components/SectionHeader.tsx`, `components/ContentState.tsx`, `components/home/HomeScreen.tsx`, `components/ImageWithPlaceholder.tsx`, `components/MoodChip.tsx`, `components/SkeletonLoader.tsx`, `components/FloatingTabBar.tsx`, `app/(tabs)/(home)/index.tsx`, `app/(tabs)/(home)/index.ios.tsx`, `app/(tabs)/saved.ios.tsx`, `app/(tabs)/profile.ios.tsx`, `app/(tabs)/saved.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/_layout.tsx`, `utils/homeScreenContent.ts`, `tests/homeScreenContent.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Use one shared Home implementation for web and native unless a platform branch is clearly necessary; prefer static, web-safe card layouts over decorative motion when stability is at stake; keep the current backend contracts and migration helpers as the architecture boundary instead of rewriting backend assumptions.
- Verification: `npx.cmd tsx --test tests/homeScreenContent.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/favoritesMigration.test.ts tests/favorites.test.ts tests/supabaseErrors.test.ts`; real Expo web verification on port `8123` confirmed no `Maximum update depth exceeded`, taste-profile persistence to `profiles.taste_moods`, venue save/unsave behavior against `favorites`, Saved reflecting the backend favorite state, and the sign-out prompt flow in dedicated browser runs.
- Follow-up: Keep reducing large screen files and remaining `.tsx` / `.ios.tsx` duplication, repair mojibake outside the rebuilt shell, and decide the repo-approved fix for the React 19 versus `react-leaflet@4.2.1` install conflict.

### 2026-03-12 02:10
- Goal: Remove the last repo setup blocker by resolving Hype's React 19 install conflict without affecting other repos on the machine.
- Changes made: Replaced the Hype-only `react-leaflet` web implementation in `components/Map.web.tsx` with a dependency-free iframe/Leaflet HTML embed, removed `react-leaflet`, `leaflet`, and `@types/leaflet` from `package.json`, and updated the execution board to mark the install conflict resolved.
- Files touched: `components/Map.web.tsx`, `package.json`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Treat Hype's map as a self-contained web embed for now instead of carrying a React DOM map dependency that the product does not otherwise need; keep this scoped to Hype so other repos can continue using `react-leaflet` independently.
- Verification: `npm.cmd install`; `npm.cmd run build:web`; `npx.cmd tsx --test tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: Continue the shared-shell cleanup through the next large screens, and only reintroduce a heavier web map dependency if a future Hype requirement truly needs it.

### 2026-03-12 03:05
- Goal: Simplify the duplicated Tonight planner flow without changing route structure or backend contracts.
- Changes made: Added `utils/tonightScreen.ts` to hold shared Tonight types, moods, segment config, mock-plan generation, and share-text helpers; rewired both `app/(tabs)/tonight.tsx` and `app/(tabs)/tonight.ios.tsx` to consume those helpers instead of carrying their own copies of the same planning data and share logic; switched both screens to the shared image resolver and removed their local duplicated persistence/display helper definitions.
- Files touched: `utils/tonightScreen.ts`, `app/(tabs)/tonight.tsx`, `app/(tabs)/tonight.ios.tsx`, `docs/project_ledger.md`
- Decisions: Keep the two route files for now because they still differ in shell chrome (`HypeHeader` versus `Stack.Screen`), but move duplicated screen-state contracts and planner content into a shared helper first so future consolidation is smaller and safer.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: Finish the Tonight cleanup with a second pass focused only on user-facing copy normalization and then continue the same shared-helper extraction pattern into the next large duplicated tab screen.

### 2026-03-12 03:20
- Goal: Finish the first Tonight follow-up by normalizing the remaining user-facing planner copy left behind after the helper extraction.
- Changes made: Cleaned the remaining Bosnian planner labels and alerts in both Tonight route files, replaced the placeholder modal close glyph with a stable `X`, and removed the last stale `MOODS.map` usage so both route files now consistently use `TONIGHT_MOODS`.
- Files touched: `app/(tabs)/tonight.tsx`, `app/(tabs)/tonight.ios.tsx`, `docs/project_ledger.md`
- Decisions: Keep the shared helper as the source of truth for mood definitions and leave this pass focused on copy/UI polish only, rather than broadening it into another structural refactor.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: Continue with the next large duplicated tab screen and use the same pattern of shared helper extraction first, then copy/surface cleanup as a second pass where needed.

### 2026-03-12 03:40
- Goal: Remove the remaining full-file Explore duplication now that Saved, Profile, Home, and Tonight have already been trimmed down.
- Changes made: Made `app/(tabs)/explore.tsx` platform-aware for the only real shell difference (`HypeHeader` + `SafeAreaView` on non-iOS versus `Stack.Screen` + top padding on iOS), switched it to the shared `resolveImageSource` helper, and reduced `app/(tabs)/explore.ios.tsx` to a thin re-export of the shared implementation.
- Files touched: `app/(tabs)/explore.tsx`, `app/(tabs)/explore.ios.tsx`, `docs/project_ledger.md`
- Decisions: Collapse Explore into one shared implementation instead of introducing another intermediate component layer, because the route-body logic was already effectively identical and only the outer shell differed.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: Continue the remaining large-screen simplification by extracting Explore's duplicated constants/types next or moving to the next oversized shared tab surface if that yields a bigger stability win.

### 2026-03-12 03:55
- Goal: Shrink the shared Explore route further by moving local screen contracts and catalog constants out of the route file.
- Changes made: Added `utils/exploreScreen.ts` with the Explore venue/menu/search types plus the mood and category lookup tables, then rewired `app/(tabs)/explore.tsx` to import those shared definitions instead of declaring them inline.
- Files touched: `utils/exploreScreen.ts`, `app/(tabs)/explore.tsx`, `docs/project_ledger.md`
- Decisions: Keep the current Explore logic in the route file for now, but move passive screen metadata and contracts into a utility module first so future Explore refactors work on behavior/layout rather than re-parsing embedded lookup data.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: Continue with Explore-specific behavior simplification next, especially the loader/filter/search sections, or switch to the next oversized shared screen if a bigger stability payoff appears.

### 2026-03-12 04:05
- Goal: Continue the Explore simplification by moving pure filter/state helper logic out of the route file.
- Changes made: Added `utils/exploreHelpers.ts` with pure helpers for open-now evaluation, price-display formatting, client-side venue and menu filtering, and selection toggling; rewired `app/(tabs)/explore.tsx` to use those helpers instead of carrying local copies of the same logic.
- Files touched: `utils/exploreHelpers.ts`, `app/(tabs)/explore.tsx`, `docs/project_ledger.md`
- Decisions: Keep Explore's Supabase loading logic in the route for now, but extract pure behavior first so the remaining route code is closer to “load data, set state, render” and easier to split further if needed.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: If we keep pushing Explore, the next clean seam is the debounced search plus the venue/daily-special loaders; otherwise the next shared-shell cleanup can move to another oversized route.

### 2026-03-12 04:20
- Goal: Finish the next Explore simplification seam by moving its debounced search and Supabase loading paths out of the route file, then refresh the stale continuity docs to match the real current state.
- Changes made: Added `utils/exploreData.ts` for Explore search, venue loading, and daily-special loading; rewired `app/(tabs)/explore.tsx` so the route now mostly orchestrates state plus rendering; updated `docs/00-overview/handover.md` and `docs/00-overview/execution_board.md` so they no longer describe the already-fixed Home render loop or the resolved React 19 map-install blocker as current blockers, and now reflect the active route-simplification program.
- Files touched: `utils/exploreData.ts`, `app/(tabs)/explore.tsx`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Treat route simplification work as continuity-critical documentation work too; when the active frontend story changes, update handover and the execution board in the same slice instead of leaving the docs one or two cleanup waves behind.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: The next clean seam is the remaining Explore state orchestration around the debounced search lifecycle, or a move to the next oversized shared route if that will buy more stability faster.

### 2026-03-12 04:45
- Goal: Finish the remaining Explore route bulk by moving its render sections into focused shared components and cleaning the touched helper output.
- Changes made: Added `components/explore/ExploreSearchSection.tsx`, `components/explore/ExploreControls.tsx`, `components/explore/ExploreVenueList.tsx`, `components/explore/ExploreMenuList.tsx`, and `components/explore/ExploreFilterModal.tsx`; rewired `app/(tabs)/explore.tsx` so the route is now primarily state orchestration plus navigation; fixed `utils/exploreHelpers.ts` so price-level display returns clean `€` output; added `tests/exploreHelpers.test.ts`; and refreshed `docs/00-overview/handover.md` plus `docs/00-overview/execution_board.md` to reflect that Explore is now decomposed beyond helper extraction.
- Files touched: `components/explore/ExploreSearchSection.tsx`, `components/explore/ExploreControls.tsx`, `components/explore/ExploreVenueList.tsx`, `components/explore/ExploreMenuList.tsx`, `components/explore/ExploreFilterModal.tsx`, `app/(tabs)/explore.tsx`, `utils/exploreHelpers.ts`, `tests/exploreHelpers.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Finish a large-screen cleanup slice by leaving the route responsible for state and navigation only, while moving bulky render sections into named components and adding a small regression test whenever helper output is cleaned up.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/exploreHelpers.test.ts tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: Move to the next largest shared route and use the same pattern: extract pure helpers first, then extract bulky render sections, and keep handover/execution-board/ledger aligned in the same slice.

### 2026-03-12 04:55
- Goal: Make the napkin expectation explicit so recurring Hype rules are captured as the work evolves, not only after the fact.
- Changes made: Updated `.claude/napkin.md` with one frontend simplification rule from the Explore cleanup wave and one working-style rule that napkin updates belong inside the same slice whenever a reusable repo lesson becomes clear.
- Files touched: `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Treat napkin maintenance as part of normal slice completion for Hype, alongside handover, execution board, and ledger updates when a reusable rule emerges.
- Follow-up: Keep reading the napkin at session start and update it during future slices whenever the repo yields a durable working rule.

### 2026-03-12 05:35
- Goal: Finish the biggest remaining shared tab cleanup wave by collapsing Tonight into one implementation with extracted render/data/helper layers instead of keeping two 1,100-line route files alive.
- Changes made: Added `utils/tonightHelpers.ts` for segment/time/price/urgency/vote helpers, added `utils/tonightData.ts` for event and venue loading, added `components/tonight/TonightEventCard.tsx`, `components/tonight/TonightPlannerModal.tsx`, `components/tonight/TonightVoteModal.tsx`, and `components/tonight/TonightScreenContent.tsx`, rewrote `app/(tabs)/tonight.tsx` as the single shared Tonight implementation, reduced `app/(tabs)/tonight.ios.tsx` to a re-export, updated handover plus the execution board to reflect that Tonight now follows the same shared-route simplification pattern as Explore, and added the reusable extraction rule to `.claude/napkin.md`.
- Files touched: `utils/tonightHelpers.ts`, `utils/tonightData.ts`, `components/tonight/TonightEventCard.tsx`, `components/tonight/TonightPlannerModal.tsx`, `components/tonight/TonightVoteModal.tsx`, `components/tonight/TonightScreenContent.tsx`, `app/(tabs)/tonight.tsx`, `app/(tabs)/tonight.ios.tsx`, `tests/tonightHelpers.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Treat large-screen cleanup as complete only when platform duplication is removed, bulky UI sections are named components, and route-local data/time helper logic is extracted into reusable modules with targeted tests.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/tonightHelpers.test.ts tests/exploreHelpers.test.ts tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: Continue with the next largest shared route and keep cleaning touched mojibake or brittle helper logic while the route is open.

### 2026-03-12 06:05
- Goal: Take the next large shared-route cleanup wave on Saved by moving persistence concerns and render bulk out of the route while preserving the verified favorites migration behavior.
- Changes made: Added `utils/savedData.ts` for Saved venue/event/badge loading and mutations, added `utils/savedScreen.ts` plus `utils/savedEventsStorage.ts` for Saved screen types and pure formatting/storage helpers, added `components/saved/` render components for tabs, cards, empty state, and swipe delete behavior, rewrote `app/(tabs)/saved.tsx` around those shared helpers/components, and refreshed handover, the execution board, and the napkin to reflect that Saved now follows the shared-route simplification pattern too.
- Files touched: `utils/savedData.ts`, `utils/savedScreen.ts`, `utils/savedEventsStorage.ts`, `components/saved/SavedTabs.tsx`, `components/saved/SavedVenueCard.tsx`, `components/saved/SavedEventCard.tsx`, `components/saved/SavedBadgeCard.tsx`, `components/saved/SavedEmptyState.tsx`, `components/saved/SwipeDeleteAction.tsx`, `app/(tabs)/saved.tsx`, `tests/savedScreen.test.ts`, `tests/savedEventsStorage.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: When a large tab screen still owns both persistence logic and UI bulk, move storage/network access into `utils/<surface>Data.ts` before extracting cards and states into `components/<surface>/`, so the route ends as orchestration instead of a mixed UI/data file.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/savedScreen.test.ts tests/savedEventsStorage.test.ts tests/tonightHelpers.test.ts tests/exploreHelpers.test.ts tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: Move to Profile next, since it is now the largest remaining tab route with mixed persistence and presentation responsibilities.

### 2026-03-12 06:30
- Goal: Finish the remaining large tab-route cleanup wave by collapsing Profile into shared auth/data/render modules instead of leaving auth, taste selection, settings, and sign-out UI mixed together in one screen file.
- Changes made: Added `utils/profileData.ts` for Profile auth/session/taste operations, added `utils/profileScreen.ts` for Profile mood/theme/demo-badge config, added `components/profile/ProfileAuthCard.tsx`, `components/profile/ProfileAccountCard.tsx`, `components/profile/ProfileMoodSection.tsx`, `components/profile/ProfileSettingsSection.tsx`, and `components/profile/ProfileSignOutModal.tsx`, rewrote `app/(tabs)/profile.tsx` around those shared helpers/components, and refreshed handover, the execution board, and the napkin so the rebuilt tab-stack story now includes Profile too.
- Files touched: `utils/profileData.ts`, `utils/profileScreen.ts`, `components/profile/ProfileAuthCard.tsx`, `components/profile/ProfileAccountCard.tsx`, `components/profile/ProfileMoodSection.tsx`, `components/profile/ProfileSettingsSection.tsx`, `components/profile/ProfileSignOutModal.tsx`, `app/(tabs)/profile.tsx`, `tests/profileScreen.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Treat a large settings/profile route as incomplete cleanup until its auth operations, reusable config, and modal/card sections are separated, so the route becomes flow orchestration instead of a mixed auth/settings/ui file.
- Verification: `npm.cmd run build:web`; `npx.cmd tsx --test tests/profileScreen.test.ts tests/savedScreen.test.ts tests/savedEventsStorage.test.ts tests/tonightHelpers.test.ts tests/exploreHelpers.test.ts tests/appRoutes.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`
- Follow-up: With the main tab stack now largely simplified, move the next cleanup wave to remaining oversized non-tab surfaces and broader encoding cleanup.

### 2026-03-12 17:37
- Goal: Take the next big non-tab cleanup wave on Venue detail by moving fetch/save/hours/copy logic out of the route and cleaning the touched user-facing strings while keeping the live favorites flow intact.
- Changes made: Added `utils/venueDetailData.ts` for Venue detail reads and favorite mutations, added `utils/venueDetailScreen.ts` for localized copy plus hours/date/price helpers and mood metadata, added `components/venue/VenueDetailHeader.tsx`, `components/venue/VenueHoursSection.tsx`, `components/venue/VenueActionButtons.tsx`, `components/venue/VenueDetailTabs.tsx`, `components/venue/VenueInfoSection.tsx`, `components/venue/VenueEventsSection.tsx`, and `components/venue/VenueSpecialsSection.tsx`, rewrote `app/venue/[id].tsx` as a thinner orchestration route on top of those modules, added `tests/venueDetailScreen.test.ts`, and refreshed handover, the execution board, and the napkin so Venue detail is now part of the shared-route simplification story too.
- Files touched: `app/venue/[id].tsx`, `utils/venueDetailData.ts`, `utils/venueDetailScreen.ts`, `components/venue/VenueDetailHeader.tsx`, `components/venue/VenueHoursSection.tsx`, `components/venue/VenueActionButtons.tsx`, `components/venue/VenueDetailTabs.tsx`, `components/venue/VenueInfoSection.tsx`, `components/venue/VenueEventsSection.tsx`, `components/venue/VenueSpecialsSection.tsx`, `tests/venueDetailScreen.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: For large detail screens, extract data loading and localized display helpers first, then split the remaining hero/tab/card rendering into named components so the route ends as state orchestration instead of a mixed fetch/save/UI file.
- Verification: `npx.cmd tsx --test tests/venueDetailScreen.test.ts tests/exploreHelpers.test.ts tests/tonightHelpers.test.ts tests/savedScreen.test.ts tests/profileScreen.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the oversized non-tab cleanup with `app/event/[id].tsx` and `app/series/[id].tsx`, while keeping translation and encoding cleanup tied to the surfaces being rebuilt.

### 2026-03-12 17:55
- Goal: Keep the non-tab cleanup wave moving by decomposing Event detail and removing its inline AsyncStorage save-state handling from the route.
- Changes made: Added `utils/eventDetailData.ts` for Event detail reads and saved-event persistence, added `utils/eventDetailScreen.ts` for localized title/description/date/price/ticket helpers plus category/mood emoji metadata, added `components/event/EventDetailHero.tsx`, `components/event/EventVenueAndBadges.tsx`, and `components/event/EventPurchaseSection.tsx`, rewrote `app/event/[id].tsx` around those modules and the shared `ImageWithPlaceholder` path, expanded `utils/savedEventsStorage.ts` with reusable membership/toggle helpers, added `tests/eventDetailScreen.test.ts`, updated `tests/savedEventsStorage.test.ts`, and refreshed handover, the execution board, and the napkin so Event detail now sits in the same simplification program as Venue detail.
- Files touched: `app/event/[id].tsx`, `utils/eventDetailData.ts`, `utils/eventDetailScreen.ts`, `components/event/EventDetailHero.tsx`, `components/event/EventVenueAndBadges.tsx`, `components/event/EventPurchaseSection.tsx`, `utils/savedEventsStorage.ts`, `tests/eventDetailScreen.test.ts`, `tests/savedEventsStorage.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Treat the saved-events AsyncStorage list as a shared helper-owned concern, not a detail-route-local JSON parsing task, so Event detail can end as orchestration like the other rebuilt surfaces.
- Verification: `npx.cmd tsx --test tests/eventDetailScreen.test.ts tests/savedEventsStorage.test.ts tests/venueDetailScreen.test.ts tests/exploreHelpers.test.ts tests/tonightHelpers.test.ts tests/savedScreen.test.ts tests/profileScreen.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Move straight to `app/series/[id].tsx`, which is now the largest remaining non-tab detail surface still carrying mixed data, copy, and rendering responsibilities.

### 2026-03-12 18:05
- Goal: Finish the oversized non-tab detail cleanup lane by decomposing Series detail and removing its inline saved-series persistence from the route.
- Changes made: Added `utils/seriesDetailData.ts` for Series detail reads and saved-series persistence, added `utils/seriesDetailScreen.ts` for localized title/description/countdown/date/event-grouping helpers plus emoji metadata, added `components/series/SeriesDetailHero.tsx`, `components/series/SeriesDetailActions.tsx`, and `components/series/SeriesEventsSection.tsx`, rewrote `app/series/[id].tsx` around those modules and the shared `ImageWithPlaceholder` path, added `utils/savedSeriesStorage.ts` plus `tests/savedSeriesStorage.test.ts`, added `tests/seriesDetailScreen.test.ts`, fixed the countdown helper to normalize date-only strings to local calendar dates before diffing, and refreshed handover plus the execution board to show that the main detail-screen lane is now simplified too.
- Files touched: `app/series/[id].tsx`, `utils/seriesDetailData.ts`, `utils/seriesDetailScreen.ts`, `components/series/SeriesDetailHero.tsx`, `components/series/SeriesDetailActions.tsx`, `components/series/SeriesEventsSection.tsx`, `utils/savedSeriesStorage.ts`, `tests/savedSeriesStorage.test.ts`, `tests/seriesDetailScreen.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Treat date-only backend fields as calendar values, not raw timezone-shiftable timestamps, so series countdown and range helpers stay stable across environments while the route remains focused on orchestration.
- Verification: `npx.cmd tsx --test tests/seriesDetailScreen.test.ts tests/savedSeriesStorage.test.ts tests/eventDetailScreen.test.ts tests/savedEventsStorage.test.ts tests/venueDetailScreen.test.ts tests/exploreHelpers.test.ts tests/tonightHelpers.test.ts tests/savedScreen.test.ts tests/profileScreen.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: With the big tab and detail routes now decomposed, shift the next cleanup wave toward remaining mixed-support surfaces and broader mojibake cleanup rather than another large-screen decomposition pass.

### 2026-03-12 18:35
- Goal: Start the mixed-support cleanup wave by decomposing Home support and cleaning the most visible mojibake in its copy/helper layer.
- Changes made: Added `utils/homeData.ts` for Home venue/event/series/weather loading, split `components/home/HomeScreen.tsx` into `components/home/HomeHeroSection.tsx`, `components/home/HomeMoodSection.tsx`, `components/home/HomeFeaturedCafeSection.tsx`, and `components/home/HomeEventsSection.tsx`, rewrote `components/home/HomeScreen.tsx` as orchestration around those sections, rewrote `utils/homeScreenContent.ts` with cleaned copy and calendar-safe series countdown logic, refreshed `tests/homeScreenContent.test.ts`, and updated handover, the execution board, and the napkin so Home is no longer treated as the main remaining oversized support surface.
- Files touched: `components/home/HomeScreen.tsx`, `components/home/HomeHeroSection.tsx`, `components/home/HomeMoodSection.tsx`, `components/home/HomeFeaturedCafeSection.tsx`, `components/home/HomeEventsSection.tsx`, `utils/homeData.ts`, `utils/homeScreenContent.ts`, `tests/homeScreenContent.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Treat large shared support components the same way as routes: move network/state orchestration into helpers first, keep pure copy and date logic testable, and split hero/list/feature sections into named components before doing a wider encoding sweep.
- Verification: `npx.cmd tsx --test tests/homeScreenContent.test.ts tests/seriesDetailScreen.test.ts tests/savedSeriesStorage.test.ts tests/eventDetailScreen.test.ts tests/savedEventsStorage.test.ts tests/venueDetailScreen.test.ts tests/exploreHelpers.test.ts tests/tonightHelpers.test.ts tests/savedScreen.test.ts tests/profileScreen.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/homeWeather.test.ts tests/imageSource.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the mixed-support wave on larger shared modal/filter/navigation components and keep tying mojibake cleanup to the exact surfaces being simplified.

### 2026-03-12 19:10
- Goal: Finish the remaining Tonight support monoliths by decomposing the planner modal and screen-content chrome while cleaning the touched Tonight copy.
- Changes made: Added `components/tonight/TonightActionButtons.tsx`, `components/tonight/TonightSegmentTabs.tsx`, `components/tonight/TonightEventList.tsx`, `components/tonight/TonightPlannerSetup.tsx`, and `components/tonight/TonightPlannerResults.tsx`; rewrote `components/tonight/TonightScreenContent.tsx` and `components/tonight/TonightPlannerModal.tsx` as orchestration over those sections; moved deterministic planner-map marker generation into `utils/tonightHelpers.ts`; cleaned the touched mood/segment/share copy in `utils/tonightScreen.ts` and `app/(tabs)/tonight.tsx`; added `tests/tonightScreen.test.ts`; and refreshed handover, the execution board, and the napkin so the mixed-support cleanup story now includes Tonight support too.
- Files touched: `app/(tabs)/tonight.tsx`, `components/tonight/TonightActionButtons.tsx`, `components/tonight/TonightSegmentTabs.tsx`, `components/tonight/TonightEventList.tsx`, `components/tonight/TonightPlannerSetup.tsx`, `components/tonight/TonightPlannerResults.tsx`, `components/tonight/TonightPlannerModal.tsx`, `components/tonight/TonightScreenContent.tsx`, `utils/tonightHelpers.ts`, `utils/tonightScreen.ts`, `tests/tonightHelpers.test.ts`, `tests/tonightScreen.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Treat support-surface cleanup as incomplete until bulky tab chrome and planner modals are also decomposed, and keep mock UI data deterministic instead of generating render-time randomness inside shared components.
- Verification: `npx.cmd tsx --test tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/exploreHelpers.test.ts tests/homeScreenContent.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the mixed-support wave on shared filters and navigation chrome, with encoding cleanup still tied to the exact surfaces being simplified.

### 2026-03-12 19:40
- Goal: Decompose the shared FloatingTabBar chrome so route matching, theme math, and button rendering no longer live in one app-wide component.
- Changes made: Added `utils/floatingTabBar.ts` for active-route matching, indicator sizing, and tab-bar surface colors; added `components/tabbar/FloatingTabButton.tsx`; rewrote `components/FloatingTabBar.tsx` around those helpers/components; aligned it to the repo `useTheme()` hook instead of `@react-navigation/native` theme state; added `tests/floatingTabBar.test.ts`; and refreshed handover, the execution board, and the napkin so the mixed-support cleanup story now includes shared navigation chrome too.
- Files touched: `components/FloatingTabBar.tsx`, `components/tabbar/FloatingTabButton.tsx`, `utils/floatingTabBar.ts`, `tests/floatingTabBar.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Treat app-wide navigation chrome like any other rebuilt surface: keep the main component on orchestration, move route heuristics and layout math into pure helpers, and keep theme inputs consistent with the repo-wide theme hook.
- Verification: `npx.cmd tsx --test tests/floatingTabBar.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the mixed-support wave on `components/explore/ExploreFilterModal.tsx`, with encoding cleanup still tied to the exact surface being simplified.

### 2026-03-12 20:05
- Goal: Finish the next Explore support wave by decomposing the filter modal and controls strip while cleaning the shared lookup emoji source they both rely on.
- Changes made: Added `components/explore/ExploreFilterChipGrid.tsx`, `components/explore/ExploreFilterPriceSection.tsx`, `components/explore/ExploreFilterOpenNowRow.tsx`, `components/explore/ExploreFilterActions.tsx`, `components/explore/ExploreMoodStrip.tsx`, `components/explore/ExploreCategoryGrid.tsx`, and `components/explore/ExploreTabSwitcher.tsx`; rewrote `components/explore/ExploreFilterModal.tsx` and `components/explore/ExploreControls.tsx` as orchestration over those sections; cleaned `utils/exploreScreen.ts` lookup emoji data; refreshed `tests/exploreHelpers.test.ts`; added `tests/exploreScreen.test.ts`; and updated handover, the execution board, and the napkin so the mixed-support cleanup story now includes Explore support too.
- Files touched: `components/explore/ExploreFilterModal.tsx`, `components/explore/ExploreControls.tsx`, `components/explore/ExploreFilterChipGrid.tsx`, `components/explore/ExploreFilterPriceSection.tsx`, `components/explore/ExploreFilterOpenNowRow.tsx`, `components/explore/ExploreFilterActions.tsx`, `components/explore/ExploreMoodStrip.tsx`, `components/explore/ExploreCategoryGrid.tsx`, `components/explore/ExploreTabSwitcher.tsx`, `utils/exploreScreen.ts`, `tests/exploreHelpers.test.ts`, `tests/exploreScreen.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: When support UI depends on shared lookup chips or emoji metadata, clean the lookup source and add lookup-focused regression coverage in the same slice instead of only patching the leaf components.
- Verification: `npx.cmd tsx --test tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/floatingTabBar.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue into the next remaining mixed-support surface instead of stopping at the Explore filter shell.

### 2026-03-12 20:25
- Goal: Simplify the shared cross-platform map surface so native and web stop carrying separate embed-building logic and unused routing-machine baggage.
- Changes made: Added `utils/mapEmbed.ts` for shared default-region config, popup escaping, and Leaflet HTML generation; rewrote `components/Map.tsx` and `components/Map.web.tsx` to use that helper; removed the unused native routing-machine payload because the current app only renders static planner markers; added `tests/mapEmbed.test.ts`; and updated handover, the execution board, and the napkin so the mixed-support cleanup story now includes the map surface too.
- Files touched: `components/Map.tsx`, `components/Map.web.tsx`, `utils/mapEmbed.ts`, `tests/mapEmbed.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: When a cross-platform support surface still duplicates embed or markup generation across native and web, move that builder into one helper-owned module first and only keep the true platform-shell differences in the component files.
- Verification: `npx.cmd tsx --test tests/mapEmbed.test.ts tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/floatingTabBar.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue on the next oversized support component, with `components/home/HomeEventsSection.tsx` the clearest remaining target.

### 2026-03-12 20:45
- Goal: Keep the Home support cleanup moving by decomposing the event and series rails into smaller shared components instead of leaving `components/home/HomeEventsSection.tsx` as a mixed rail/card monolith.
- Changes made: Added `components/home/HomeCardRail.tsx`, `components/home/HomeEventCard.tsx`, and `components/home/HomeSeriesCard.tsx`; added `utils/homeEventsSection.ts` for localized event-card and series-card display content; rewrote `components/home/HomeEventsSection.tsx` as orchestration over those smaller pieces; added `tests/homeEventsSection.test.ts`; and updated handover plus the execution board so the current cleanup story reflects that Home events support is now on the same extracted-helper pattern as the rest of the rebuilt Home surface.
- Files touched: `components/home/HomeEventsSection.tsx`, `components/home/HomeCardRail.tsx`, `components/home/HomeEventCard.tsx`, `components/home/HomeSeriesCard.tsx`, `utils/homeEventsSection.ts`, `tests/homeEventsSection.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a rebuilt support section still repeats the same platform rail shell and card rendering for multiple content types, extract the shared rail first, then move localized card copy into a helper so the section becomes orchestration instead of another nested monolith.
- Verification: `npx.cmd tsx --test tests/homeEventsSection.test.ts tests/homeScreenContent.test.ts tests/mapEmbed.test.ts tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/floatingTabBar.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue on the next oversized support component, with `components/tonight/TonightVoteModal.tsx` now one of the clearest remaining big surfaces.

### 2026-03-12 21:05
- Goal: Keep Tonight support cleanup moving by decomposing the vote modal into focused setup/results sections and removing its inline result-shaping logic.
- Changes made: Added `utils/tonightVote.ts` for vote-creation gating and selected-event result shaping, added `components/tonight/TonightVoteSetup.tsx`, `components/tonight/TonightVoteResults.tsx`, and `components/tonight/TonightVoteResultCard.tsx`, rewrote `components/tonight/TonightVoteModal.tsx` as a thin header plus state-switch shell over those sections, added `tests/tonightVote.test.ts`, and updated handover plus the execution board so the remaining Tonight backlog reflects the new vote-support structure.
- Files touched: `components/tonight/TonightVoteModal.tsx`, `components/tonight/TonightVoteSetup.tsx`, `components/tonight/TonightVoteResults.tsx`, `components/tonight/TonightVoteResultCard.tsx`, `utils/tonightVote.ts`, `tests/tonightVote.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a support modal has a clear pre-submit flow and post-submit flow, extract those branches into dedicated sections and move any row-shaping logic into a helper so the modal itself only owns the shell and state switch.
- Verification: `npx.cmd tsx --test tests/tonightVote.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/homeEventsSection.test.ts tests/homeScreenContent.test.ts tests/mapEmbed.test.ts tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/floatingTabBar.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue on the next oversized support component instead of stopping inside the Tonight surface cleanup.

### 2026-03-12 21:30
- Goal: Take one broader Explore results sweep by decomposing both the venue-results and menu-results surfaces instead of leaving them as parallel list-and-card monoliths.
- Changes made: Added `utils/exploreLists.ts` for venue mood-badge selection and daily-special price formatting, added `components/explore/ExploreResultsState.tsx`, `components/explore/ExploreVenueCard.tsx`, `components/explore/ExploreVenueMoodBadges.tsx`, `components/explore/ExploreMenuFilterChips.tsx`, and `components/explore/ExploreMenuCard.tsx`, rewrote `components/explore/ExploreVenueList.tsx` and `components/explore/ExploreMenuList.tsx` as orchestration over those pieces, added `tests/exploreLists.test.ts`, and updated handover plus the execution board so the Explore support lane now includes the results tabs as well as the filters/controls.
- Files touched: `components/explore/ExploreVenueList.tsx`, `components/explore/ExploreMenuList.tsx`, `components/explore/ExploreResultsState.tsx`, `components/explore/ExploreVenueCard.tsx`, `components/explore/ExploreVenueMoodBadges.tsx`, `components/explore/ExploreMenuFilterChips.tsx`, `components/explore/ExploreMenuCard.tsx`, `utils/exploreLists.ts`, `tests/exploreLists.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When two adjacent support surfaces both repeat the same loading/empty framing and card-level rendering patterns, clean them in one sweep so they converge on a shared state wrapper and smaller result cards instead of drifting into two different micro-architectures.
- Verification: `npx.cmd tsx --test tests/exploreLists.test.ts tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/tonightVote.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/homeEventsSection.test.ts tests/homeScreenContent.test.ts tests/mapEmbed.test.ts tests/floatingTabBar.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue on the next oversized shared support component, with `components/tonight/TonightScreenContent.tsx` and `components/home/HomeScreen.tsx` still among the biggest remaining targets.

### 2026-03-12 21:45
- Goal: Finish the next Tonight support reduction by moving modal wiring and vote-event-card adaptation out of `components/tonight/TonightScreenContent.tsx`.
- Changes made: Added `components/tonight/TonightModalStack.tsx` to own planner/vote modal composition, added `components/tonight/TonightVoteEventCard.tsx` for the vote-only `TonightEventCard` adapter, rewrote `components/tonight/TonightScreenContent.tsx` around those extracted sections, and updated handover plus the execution board so the current Tonight cleanup story reflects that the screen shell is now mostly visible-screen orchestration.
- Files touched: `components/tonight/TonightScreenContent.tsx`, `components/tonight/TonightModalStack.tsx`, `components/tonight/TonightVoteEventCard.tsx`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a support screen has already decomposed its visible sections and modals separately, move the remaining modal wiring into a dedicated stack component so the screen shell only coordinates top-level sections and visibility state.
- Verification: `npx.cmd tsx --test tests/exploreLists.test.ts tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/tonightVote.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/homeEventsSection.test.ts tests/homeScreenContent.test.ts tests/mapEmbed.test.ts tests/floatingTabBar.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue on the remaining biggest shells, with `components/home/HomeScreen.tsx` and `components/tonight/TonightEventCard.tsx` still standing out.
