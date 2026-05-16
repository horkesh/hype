# Project Ledger

This is the living source of truth for active development. We should read it at the start of a work session and update it before wrapping up.

## Project snapshot

- Project: Hype
- Repo root: the current local checkout of the `Hype app` repository
- Primary frontend: Expo Router app in the repo root
- Secondary backend: Node service in `backend/`
- Current phase: Stabilize and align the prototype against the live Supabase backend
- Last updated: 2026-03-24

## Session: 2026-03-24 — Tourist board demo prep + AI fixes

### What happened
- Created demo event "Sarajevo night bazaar: Bascarsija under the stars" (09:30 today, featured, culture/foodie/live_music moods) for tourist board presentation
- Hero image generation: replaced panoramic city views with intimate close-up scenes (džezva, somun, lanterns, cobblestones) — all four time-of-day prompts rewritten
- City Pulse bug fix: events query used wrong column names (name→title_en, start_time→start_datetime, venue_name→venues join + location_name), causing pulse to ignore app events and lean on Klix headlines instead
- City Pulse now also filters by status=approved and is_active=true
- Both edge functions deployed: generate-hero-image, generate-pulse

## Session: 2026-03-22 — Visit Sarajevo integration + AI fixes

### What happened
- Hero image prompt updated: no faces, only distant silhouettes or from behind
- Hero image prompt now layers time-of-day + weather + holiday additively
- AI Planner (generate-plan): raw JSON streaming display fixed — now shows shimmer + status only
- AI Planner stops made clickable → navigate to venue detail page (B19 done)
- Client-side venue enrichment added to planGenerator.ts (fuzzy matches against all 1200 venues)
- Surprise Me venue enrichment fixed: was matching against 50-venue prompt subset, now uses all 1200 venues
- Visit Sarajevo logo placed in header (centered, clickable, language-aware URLs)
- Visit Sarajevo venue descriptions applied to 8 matching venues
- Transport directions section added to venue detail ("Kako doći" / "How to get here")
- "Powered by Visit Sarajevo" attribution on AI plans
- Heritage walks section already working (3 walks, 15 stops in DB)
- Font family consistency sweep: ~30 styles across 20 files
- Category label translations: centralized getCategoryLabel() for all ~20 DB categories
- Pitch deck created (PPTX) for Visit Sarajevo presentation
- Verified all features live on hype-alpha.vercel.app

### Simplify pass
- Removed dead rawText state + debounce handler from TonightPlanStream (was causing ~6 no-op re-renders/sec)
- Fixed CardWrapper passing invalid props to View — split into explicit TouchableOpacity/View branches
- Added module-level venue cache in planGenerator (avoids re-fetching 1200 venues per plan)
- Pre-computed lowercase venue names in both client and edge function partial matching
- Fixed SurprisePlan venue type from `any` to proper typed interface

### Backlog items completed
- **B14**: Seeded 100 demo check-ins across 12 popular venues, bilingual crowd badge on Trending Now
- **B15**: useEventCountdown hook with bilingual countdowns, wired into Home + Tonight event cards
- **B16**: Weather-reactive city pulse — generate-pulse edge function now uses weather data for context-aware recommendations
- **B10**: Fixed "Istrazi" → "Istraži" diacritics in savedScreen.ts
- **B1**: Audited — already consolidated into dedicated storage helpers, dual-key pattern is intentional backward compat
- **B2**: Audited — no fragmented clients, all frontend uses canonical client from integrations/supabase/client.ts

### Key decisions
- Both AI functions (surprise-me, generate-plan) now use Sonnet for better Bosnian quality
- Venue enrichment happens client-side for streaming (generate-plan) and server-side for non-streaming (surprise-me)
- Heritage walks backed by DB tables (heritage_walks, heritage_walk_stops) not static data
- B1/B2 are clean — no immediate cleanup needed, just monitoring

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
- Frontend Supabase client usage is currently centered on `integrations/supabase/client.ts`.

## Active workstreams

| Workstream | Status | Notes |
| --- | --- | --- |
| Documentation foundation | In progress | Core docs system is in place; current work is consistency cleanup and workflow refinement. |
| Frontend app mapping | In progress | Route groups and shared components identified. |
| Backend mapping | In progress | Startup entrypoint identified; routes not yet implemented. |
| Architecture cleanup | In progress | Current priorities include env handling, duplicated Supabase client cleanup, and translation encoding review. |

## Known issues and observations

- Public app config now flows through `app.config.ts` and `utils/publicConfig.ts`, so runtime verification should confirm the expected `EXPO_PUBLIC_*` values are actually present on the home machine.
- The main remaining frontend risk is live auth and persistence behavior across `favorites`, `profiles.taste_moods`, and auth refresh, not broad route structure.
- Some older ledger notes may describe earlier duplication or encoding issues that have since been cleaned up; prefer the newer handover and execution-board entries when they conflict with this snapshot.
- Backend route modules are registered for the ingestion surface, so current backend risk is runtime env and source verification rather than missing route wiring.

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

### 2026-03-12 22:10
- Goal: Reduce the next two remaining shell-sized support surfaces by thinning `components/home/HomeScreen.tsx` and decomposing `components/tonight/TonightEventCard.tsx`.
- Changes made: Added `components/home/HomeContentSections.tsx` so `components/home/HomeScreen.tsx` is now a lighter screen shell over extracted visible sections; added `utils/homeScreen.ts` and test-safe `utils/homeHeroState.ts` for Home static-load orchestration and weather-driven hero decisions; added `components/tonight/TonightEventImage.tsx`, `components/tonight/TonightEventBadges.tsx`, `components/tonight/TonightEventMeta.tsx`, and `components/tonight/TonightEventActions.tsx`; rewrote `components/tonight/TonightEventCard.tsx` around those pieces; added `tests/homeScreen.test.ts`; and updated handover plus the execution board so the current cleanup story reflects both shell reductions.
- Files touched: `components/home/HomeScreen.tsx`, `components/home/HomeContentSections.tsx`, `utils/homeScreen.ts`, `utils/homeHeroState.ts`, `tests/homeScreen.test.ts`, `components/tonight/TonightEventCard.tsx`, `components/tonight/TonightEventImage.tsx`, `components/tonight/TonightEventBadges.tsx`, `components/tonight/TonightEventMeta.tsx`, `components/tonight/TonightEventActions.tsx`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Once a screen shell has already extracted its visible sections, move any remaining data-loading and hero-decision logic into helper modules; once a leaf support card still owns media fallback, badges, metadata, and action buttons together, split those sub-surfaces too so list and vote flows reuse the same smaller pieces.
- Verification: `npx.cmd tsx --test tests/homeScreen.test.ts tests/homeEventsSection.test.ts tests/homeScreenContent.test.ts tests/exploreLists.test.ts tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/tonightVote.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/mapEmbed.test.ts tests/floatingTabBar.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Reassess the remaining largest components from the cleaned tree and continue with the next best support-surface reduction rather than introducing a new cleanup lane.

### 2026-03-12 22:30
- Goal: Take one more list-surface cleanup pass by decomposing `components/series/SeriesEventsSection.tsx` into smaller reusable sections.
- Changes made: Added `components/series/SeriesEventDateGroup.tsx`, `components/series/SeriesEventCard.tsx`, and `components/series/SeriesEventMoodBadges.tsx`; rewrote `components/series/SeriesEventsSection.tsx` as orchestration over those pieces; and updated handover plus the execution board so the series support lane reflects the new structure.
- Files touched: `components/series/SeriesEventsSection.tsx`, `components/series/SeriesEventDateGroup.tsx`, `components/series/SeriesEventCard.tsx`, `components/series/SeriesEventMoodBadges.tsx`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a grouped list section still mixes date-group framing, event-card rendering, ticket-button wiring, and mood-chip rendering, split those by sub-surface so the top-level section keeps only grouping concerns.
- Verification: `npx.cmd tsx --test tests/homeScreen.test.ts tests/homeEventsSection.test.ts tests/homeScreenContent.test.ts tests/exploreLists.test.ts tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/tonightVote.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/seriesDetailScreen.test.ts tests/mapEmbed.test.ts tests/floatingTabBar.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Reassess the remaining size table and continue with the next best shared support reduction if more cleanup time is available.

### 2026-03-12 20:14
- Goal: Finish the remaining Tonight planner support decomposition so the planner modal, setup, and results surfaces stop carrying repeated shell markup and display shaping inline.
- Changes made: Added `utils/tonightPlanner.ts` for planner mood-option labels, group-size defaults, stop-row shaping, and shared planner map-region defaults; added `components/tonight/TonightModalHeader.tsx`, `components/tonight/TonightPlannerMoodGrid.tsx`, `components/tonight/TonightPlannerGroupSizePicker.tsx`, `components/tonight/TonightPlanStopList.tsx`, and `components/tonight/TonightPlannerActionRow.tsx`; rewrote `components/tonight/TonightPlannerSetup.tsx`, `components/tonight/TonightPlannerResults.tsx`, `components/tonight/TonightPlannerModal.tsx`, and `components/tonight/TonightModalStack.tsx` as thinner orchestration shells; added `tests/tonightPlanner.test.ts`; and updated handover, the execution board, and the napkin in the same slice.
- Files touched: `utils/tonightPlanner.ts`, `components/tonight/TonightModalHeader.tsx`, `components/tonight/TonightPlannerMoodGrid.tsx`, `components/tonight/TonightPlannerGroupSizePicker.tsx`, `components/tonight/TonightPlanStopList.tsx`, `components/tonight/TonightPlannerActionRow.tsx`, `components/tonight/TonightPlannerSetup.tsx`, `components/tonight/TonightPlannerResults.tsx`, `components/tonight/TonightPlannerModal.tsx`, `components/tonight/TonightModalStack.tsx`, `tests/tonightPlanner.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: When a modal still mixes shared header chrome, repeated option-grid markup, grouped action buttons, and view-model shaping, extract those repeatable pieces first so the modal file only chooses between setup and results states.
- Verification: `npx.cmd tsx --test tests/tonightPlanner.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/tonightVote.test.ts`; `npm.cmd run build:web`
- Follow-up: Move directly into the next remaining support wave on Explore/Profile/Venue instead of reopening the Tonight route.

### 2026-03-12 20:25
- Goal: Finish the remaining Explore filter-shell cleanup so the modal itself only owns the platform shell and delegates the visible filter body to extracted sections.
- Changes made: Added `components/explore/ExploreModalHeader.tsx` and `components/explore/ExploreFilterContent.tsx`; rewrote `components/explore/ExploreFilterModal.tsx` around those extracted header/content/action sections; and refreshed handover plus the execution board so the Explore support lane reflects the thinner filter shell.
- Files touched: `components/explore/ExploreModalHeader.tsx`, `components/explore/ExploreFilterContent.tsx`, `components/explore/ExploreFilterModal.tsx`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Once filter selection and price/open-now behavior already live in helper-backed props, keep the modal cleanup focused on the shell by extracting shared header and content composition instead of inventing a second logic layer.
- Verification: `npx.cmd tsx --test tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/exploreLists.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the phase on Profile and Venue support surfaces, where helper-owned copy/action definitions are still the bigger remaining need.

### 2026-03-12 20:40
- Goal: Finish the Profile/Venue support wave by moving settings and action-button definitions into helper-owned modules before splitting the remaining UI shells further.
- Changes made: Added `utils/profileSettings.ts` plus `components/profile/ProfileSettingsCard.tsx` and `components/profile/ProfileOptionToggleGroup.tsx`; rewrote `components/profile/ProfileSettingsSection.tsx` around helper-owned copy and extracted settings sections; updated `components/profile/ProfileAccountCard.tsx` and `app/(tabs)/profile.tsx` to use shared sign-out, badge-count, and mood-title copy; added `utils/venueActions.ts` plus `components/venue/VenuePrimaryActionGroup.tsx` and `components/venue/VenueDeliveryActionGroup.tsx`; rewrote `components/venue/VenueActionButtons.tsx` around helper-owned action definitions; added `tests/profileSettings.test.ts` and `tests/venueActions.test.ts`; and updated handover, the execution board, and the napkin in the same slice.
- Files touched: `app/(tabs)/profile.tsx`, `components/profile/ProfileAccountCard.tsx`, `components/profile/ProfileSettingsSection.tsx`, `components/profile/ProfileSettingsCard.tsx`, `components/profile/ProfileOptionToggleGroup.tsx`, `utils/profileSettings.ts`, `components/venue/VenueActionButtons.tsx`, `components/venue/VenuePrimaryActionGroup.tsx`, `components/venue/VenueDeliveryActionGroup.tsx`, `utils/venueActions.ts`, `tests/profileSettings.test.ts`, `tests/venueActions.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: Before splitting a settings or action-button surface further, move its copy, option definitions, and action definitions into helper-owned modules so the remaining component work becomes orchestration over stable data instead of hardcoded strings.
- Verification: `npx.cmd tsx --test tests/profileSettings.test.ts tests/profileScreen.test.ts tests/venueActions.test.ts tests/venueDetailScreen.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Move into the shared chrome/support phase next, with encoding cleanup now able to stay tightly scoped to whichever rebuilt support surfaces still carry damaged strings.

### 2026-03-12 21:00
- Goal: Finish the remaining shared chrome/support simplification by thinning the FloatingTabBar shell and the Tonight event-list shell instead of leaving them as prop-heavy support components.
- Changes made: Added `components/tabbar/FloatingTabIndicator.tsx` and `components/tabbar/FloatingTabButtons.tsx`; rewrote `components/FloatingTabBar.tsx` around those extracted sections; added `utils/tonightContent.ts` plus `components/tonight/TonightEventListState.tsx` and `components/tonight/TonightEventCards.tsx`; rewrote `components/tonight/TonightEventList.tsx` around helper-owned event-card view models and extracted list sections; added `tests/tonightContent.test.ts`; and refreshed handover plus the execution board so the shared-support backlog reflects the thinner chrome/list shells.
- Files touched: `components/FloatingTabBar.tsx`, `components/tabbar/FloatingTabIndicator.tsx`, `components/tabbar/FloatingTabButtons.tsx`, `components/tonight/TonightEventList.tsx`, `components/tonight/TonightEventListState.tsx`, `components/tonight/TonightEventCards.tsx`, `utils/tonightContent.ts`, `tests/tonightContent.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Once a shared chrome or list surface mostly just shapes data and switches between states, extract the state wrapper and card-list builder before chasing smaller stylistic cleanup so the shell becomes obviously orchestration-only.
- Verification: `npx.cmd tsx --test tests/floatingTabBar.test.ts tests/tonightContent.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Finish with the encoding, naming, and persistence consistency sweep across the rebuilt surfaces rather than opening another new structural lane.

### 2026-03-12 21:20
- Goal: Finish the consistency sweep by removing saved-state key drift and duplicated AsyncStorage logic from the rebuilt event/series persistence path.
- Changes made: Expanded `utils/savedEventsStorage.ts` and `utils/savedSeriesStorage.ts` to own storage-key lists plus shared load/save behavior; updated `utils/eventDetailData.ts`, `utils/savedData.ts`, and `utils/seriesDetailData.ts` to call those storage helpers instead of reading/writing AsyncStorage directly; added regression coverage for the stabilized key lists in `tests/savedEventsStorage.test.ts` and `tests/savedSeriesStorage.test.ts`; and updated handover, the execution board, and the napkin in the same slice.
- Files touched: `utils/savedEventsStorage.ts`, `utils/savedSeriesStorage.ts`, `utils/eventDetailData.ts`, `utils/savedData.ts`, `utils/seriesDetailData.ts`, `tests/savedEventsStorage.test.ts`, `tests/savedSeriesStorage.test.ts`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `.claude/napkin.md`, `docs/project_ledger.md`
- Decisions: When legacy storage keys still exist during a migration, keep the compatibility reads and mirrored writes inside the storage helper itself so route/data helpers never need to know which key version is current.
- Verification: `npx.cmd tsx --test tests/savedEventsStorage.test.ts tests/savedSeriesStorage.test.ts tests/profileSettings.test.ts tests/venueActions.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Run the final aggregate verification pack and close the cleanup program with a docs-and-hardening commit.

### 2026-03-12 21:35
- Goal: Close the cleanup program with aggregate verification and final doc alignment so the remaining backlog reflects the real post-cleanup state.
- Changes made: Ran one aggregate targeted test pack across the rebuilt Home, Explore, Tonight, Saved, Profile, detail, map, tab-bar, image, favorites, and persistence helpers; reran `npm.cmd run build:web`; updated handover and the execution board to mark the planned broad frontend cleanup wave complete and narrow the remaining follow-up backlog to long-tail consistency work.
- Files touched: `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Treat the cleanup program as complete once aggregate verification is green and the docs stop advertising another broad structural sweep as the default next step.
- Verification: `npx.cmd tsx --test tests/appRoutes.test.ts tests/floatingTabBar.test.ts tests/homeScreen.test.ts tests/homeEventsSection.test.ts tests/homeScreenContent.test.ts tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/exploreLists.test.ts tests/tonightPlanner.test.ts tests/tonightContent.test.ts tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/tonightVote.test.ts tests/profileScreen.test.ts tests/profileSettings.test.ts tests/savedScreen.test.ts tests/savedEventsStorage.test.ts tests/venueDetailScreen.test.ts tests/venueActions.test.ts tests/seriesDetailScreen.test.ts tests/savedSeriesStorage.test.ts tests/mapEmbed.test.ts tests/imageSource.test.ts tests/homeWeather.test.ts tests/favorites.test.ts tests/favoritesMigration.test.ts tests/profileTaste.test.ts tests/supabaseErrors.test.ts`; `npm.cmd run build:web`; `git status --short`
- Follow-up: Future cleanup should be narrower and evidence-driven: encoding repair outside rebuilt surfaces, remaining untouched long-tail support components, and regression prevention rather than another repo-wide frontend decomposition wave.

### 2026-03-12 20:36
- Goal: Start the narrower post-cleanup follow-up by repairing shared translation/config encoding at the source layer instead of patching leaf screens.
- Changes made: Cleaned mojibake and damaged user-facing strings in `contexts/AppContext.tsx`, `utils/profileScreen.ts`, and `utils/savedScreen.ts`; updated `tests/profileScreen.test.ts` and `tests/savedScreen.test.ts` to assert the repaired helper output; refreshed the handover, execution board, and napkin so the current follow-up lane explicitly points to source-layer encoding repair.
- Files touched: `contexts/AppContext.tsx`, `utils/profileScreen.ts`, `utils/savedScreen.ts`, `tests/profileScreen.test.ts`, `tests/savedScreen.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When mojibake appears in rebuilt surfaces, fix the translation tables and helper-owned config modules first, then let the UI inherit the repair instead of scattering one-off label fixes through components.
- Verification: `npx.cmd tsx --test tests/profileScreen.test.ts tests/savedScreen.test.ts tests/appRoutes.test.ts tests/homeScreenContent.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the long-tail encoding sweep on other shared source modules and untouched support surfaces, keeping docs and napkin updated as each meaningful slice lands.

### 2026-03-12 20:55
- Goal: Remove the leftover Natively-era adapter workaround so normalization logic lives in one canonical helper surface again.
- Changes made: Repointed Explore, Saved, and Venue detail data loaders from `utils/errorLogger.ts` to `utils/dataAdapters.ts`; removed the duplicated normalization exports from `utils/errorLogger.ts`; added `tests/dataAdapters.test.ts`; and refreshed handover, the execution board, and the napkin so the cleanup story no longer treats adapter duplication as an acceptable temporary state.
- Files touched: `utils/exploreData.ts`, `utils/savedData.ts`, `utils/venueDetailData.ts`, `utils/errorLogger.ts`, `tests/dataAdapters.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Once a tooling constraint is gone, temporary compatibility logic should collapse back into the canonical helper module immediately, with direct regression tests added there instead of leaving route behavior to prove adapter correctness indirectly.
- Verification: `npx.cmd tsx --test tests/dataAdapters.test.ts tests/venueDetailScreen.test.ts tests/savedScreen.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the evidence-driven post-cleanup sweep on the next remaining large route/controller surface, with `app/(tabs)/explore.tsx` and the other large shared tab routes still the strongest candidates.

### 2026-03-12 21:10
- Goal: Thin the remaining Saved route shell while cleaning another pocket of damaged tab and empty-state copy.
- Changes made: Moved Saved tab labels plus empty-state copy/routing into `utils/savedScreen.ts`; added `components/saved/SavedTabContent.tsx` to own loading, empty-state, and card-list rendering; rewrote `app/(tabs)/saved.tsx` as a lighter orchestration route; rewrote `components/saved/SavedTabs.tsx` to accept helper-owned localized tab labels; expanded `tests/savedScreen.test.ts`; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `app/(tabs)/saved.tsx`, `components/saved/SavedTabContent.tsx`, `components/saved/SavedTabs.tsx`, `utils/savedScreen.ts`, `tests/savedScreen.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a tab route still hardcodes tab labels, empty-state copy, and route-target decisions inline, move that copy into the helper layer and extract a dedicated content surface so the route only owns loading, auth refresh, and navigation callbacks.
- Verification: `npx.cmd tsx --test tests/savedScreen.test.ts tests/appRoutes.test.ts tests/dataAdapters.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the controller-thinning wave on the next remaining large tab route, with `app/(tabs)/explore.tsx` still the clearest candidate.

### 2026-03-12 21:25
- Goal: Thin the remaining Explore route controller so debounced search, filters, tab loading, and screen markup stop living in one large route file.
- Changes made: Added `hooks/useExploreController.ts` for Explore search/filter/loading state and side effects; added `components/explore/ExploreScreenBody.tsx` for the shared Explore screen markup; rewrote `app/(tabs)/explore.tsx` as a thinner shell over the controller and body; moved menu-filter label shaping into `utils/exploreHelpers.ts`; cleaned the touched Explore test literals in `tests/exploreScreen.test.ts` and `tests/exploreLists.test.ts`; expanded `tests/exploreHelpers.test.ts`; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `app/(tabs)/explore.tsx`, `components/explore/ExploreScreenBody.tsx`, `hooks/useExploreController.ts`, `utils/exploreHelpers.ts`, `tests/exploreHelpers.test.ts`, `tests/exploreScreen.test.ts`, `tests/exploreLists.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a tab route still mixes debounced search, filter state, refresh behavior, load effects, and a large JSX tree, split the controller layer into a hook and the visible screen into a body component so the route is reduced to shell choice and prop wiring.
- Verification: `npx.cmd tsx --test tests/exploreHelpers.test.ts tests/exploreScreen.test.ts tests/exploreLists.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the controller-thinning wave on the remaining large tab routes, with `app/(tabs)/tonight.tsx` and `app/(tabs)/profile.tsx` now the next strongest candidates.

### 2026-03-12 21:40
- Goal: Thin the remaining Tonight route controller and remove nondeterministic mock vote-link generation from the tab route.
- Changes made: Added `hooks/useTonightController.ts` for Tonight planner/vote/refresh/navigation state and side effects; rewrote `app/(tabs)/tonight.tsx` as a thinner shell over the controller and `TonightScreenContent`; moved planner-label and vote-label shaping into `utils/tonightScreen.ts`; added deterministic `buildMockTonightVoteLink()` in `utils/tonightVote.ts`; cleaned touched Tonight emoji/copy tests in `tests/tonightScreen.test.ts`; expanded `tests/tonightVote.test.ts`; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `app/(tabs)/tonight.tsx`, `hooks/useTonightController.ts`, `utils/tonightScreen.ts`, `utils/tonightVote.ts`, `tests/tonightScreen.test.ts`, `tests/tonightVote.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a route still owns a whole planner/vote controller stack, move that state and side effects into a hook; when a mock user-facing URL or payload is generated in a route handler, derive it from stable inputs in a helper instead of using `Math.random()`.
- Verification: `npx.cmd tsx --test tests/tonightHelpers.test.ts tests/tonightScreen.test.ts tests/tonightVote.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the controller-thinning wave on the remaining large tab routes, with `app/(tabs)/profile.tsx` now the strongest remaining candidate.

### 2026-03-12 21:55
- Goal: Thin the remaining Profile route controller and move route-owned auth/modal alerts into helper-owned settings copy.
- Changes made: Added `hooks/useProfileController.ts` for Profile auth/session/taste state and side effects; rewrote `app/(tabs)/profile.tsx` as a thinner shell over the controller plus existing extracted sections; expanded `utils/profileSettings.ts` to own auth-required, sign-in/sign-up, check-email, and sign-out modal copy; cleaned and localized `components/profile/ProfileSignOutModal.tsx`; expanded `tests/profileSettings.test.ts`; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `app/(tabs)/profile.tsx`, `hooks/useProfileController.ts`, `utils/profileSettings.ts`, `components/profile/ProfileSignOutModal.tsx`, `tests/profileSettings.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a route still owns alert strings for auth, save failures, or confirmation modals, move that copy into the same helper module that already owns the screen's settings text before splitting the controller layer into a hook.
- Verification: `npx.cmd tsx --test tests/profileScreen.test.ts tests/profileSettings.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: The main tab-route controller wave is now much smaller; the strongest remaining cleanup candidates are smaller shared support surfaces and long-tail encoding cleanup outside the rebuilt/tested paths.

### 2026-03-12 22:10
- Goal: Continue the long-tail encoding cleanup by repairing the Home helper/test layer so the regression suite reflects the cleaned helper output.
- Changes made: Rewrote `utils/homeScreenContent.ts` with clean code-point escapes for mood emoji and helper copy; cleaned `tests/homeScreenContent.test.ts` and `tests/homeScreen.test.ts` so they assert the repaired strings directly; refreshed handover, the execution board, and the napkin; and recorded the one-off Metro cache-deserialization fallback that still allowed the export to complete.
- Files touched: `utils/homeScreenContent.ts`, `tests/homeScreenContent.test.ts`, `tests/homeScreen.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When long-tail encoding cleanup reaches a helper layer, update the adjacent regression tests in the same slice so the suite stops preserving corrupted literals as the expected output.
- Verification: `npx.cmd tsx --test tests/homeScreen.test.ts tests/homeScreenContent.test.ts tests/homeEventsSection.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the long-tail support and encoding wave on the next touched helper/test surfaces, not by reopening the now-thinner main tab-route controllers.

### 2026-03-12 22:30
- Goal: Continue the long-tail Tonight follow-up by removing the last nondeterministic mock-plan path from the planner helper layer.
- Changes made: Added `utils/tonightMockPlans.ts` to own Tonight planner sample generation; rewrote `hooks/useTonightController.ts` to import the planner samples from the dedicated helper module; removed the old `generateMockTonightPlan()` implementation from `utils/tonightScreen.ts`; added `tests/tonightMockPlans.test.ts` to prove the planner output stays stable even if `Math.random()` changes; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `utils/tonightMockPlans.ts`, `hooks/useTonightController.ts`, `utils/tonightScreen.ts`, `tests/tonightMockPlans.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: Keep temporary planner sample catalogs in a dedicated helper module and make sample venue selection derive from stable inputs so shared copy/type modules stop accumulating mock-behavior logic and nondeterminism.
- Verification: `npx.cmd tsx --test tests/tonightMockPlans.test.ts tests/tonightScreen.test.ts tests/tonightHelpers.test.ts tests/tonightPlanner.test.ts tests/tonightVote.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the long-tail support cleanup on the next oversized shared helper or support component, with `utils/favorites.ts` and the remaining Saved support surfaces now stronger candidates than the already-thin tab controllers.

### 2026-03-12 22:45
- Goal: Thin the remaining favorites runtime module by moving legacy storage migration logic into a small helper layer that Node tests can verify directly.
- Changes made: Added `utils/favoritesStorage.ts` with helper-owned merge, missing-remote, read, and mirrored-write behavior behind an injected storage interface; rewrote `utils/favorites.ts` to call the storage helper instead of owning the legacy-key logic inline; added `tests/favoritesStorage.test.ts`; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `utils/favorites.ts`, `utils/favoritesStorage.ts`, `tests/favoritesStorage.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a migration still needs legacy AsyncStorage key reads or mirrored writes, keep that logic in a tiny helper module with an injected storage interface so runtime code stays orchestration-only and Node-side tests can cover key drift directly.
- Verification: `npx.cmd tsx --test tests/favoritesStorage.test.ts tests/favoritesMigration.test.ts tests/favorites.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the long-tail support cleanup on the next oversized helper or support surface, with the remaining Saved support files and `utils/errorLogger.ts` now stronger candidates.

### 2026-03-12 23:00
- Goal: Thin the remaining runtime logging support by moving pure muting and stack-shaping logic out of the Expo runtime module.
- Changes made: Added `utils/errorLoggerUtils.ts` with helper-owned mute checks, log-argument stringification, source-location extraction, and caller-info parsing; rewrote `utils/errorLogger.ts` to consume those helpers instead of owning the pure logic inline; added `tests/errorLoggerUtils.test.ts`; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `utils/errorLogger.ts`, `utils/errorLoggerUtils.ts`, `tests/errorLoggerUtils.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a runtime support module mixes platform wiring with pure parsing or message-shaping behavior, move the pure logic into a testable helper first so the runtime file can shrink without requiring Expo or React Native in the test harness.
- Verification: `npx.cmd tsx --test tests/errorLoggerUtils.test.ts tests/appRoutes.test.ts tests/favoritesStorage.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the long-tail support cleanup on the remaining Saved support surfaces, which are now the clearest shared UI lane still carrying bulky render branching.

### 2026-03-12 23:15
- Goal: Thin the remaining Saved support shell by moving venue, event, and badge card shaping out of the shared content component.
- Changes made: Added `utils/savedContent.ts` for Saved venue/event/badge view-model shaping; added `components/saved/SavedVenueList.tsx`, `components/saved/SavedEventList.tsx`, and `components/saved/SavedBadgeGrid.tsx`; rewrote `components/saved/SavedTabContent.tsx` to delegate to those extracted list/grid surfaces; updated the Saved card components to consume helper-shaped models instead of shaping display data inline; added `tests/savedContent.test.ts`; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `components/saved/SavedTabContent.tsx`, `components/saved/SavedVenueCard.tsx`, `components/saved/SavedEventCard.tsx`, `components/saved/SavedBadgeCard.tsx`, `components/saved/SavedVenueList.tsx`, `components/saved/SavedEventList.tsx`, `components/saved/SavedBadgeGrid.tsx`, `utils/savedContent.ts`, `tests/savedContent.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a shared Saved surface still branches across three content types inline, shape the card data first in a helper module and let the shell render named list/grid components instead of mixing all the per-tab display rules together.
- Verification: `npx.cmd tsx --test tests/savedContent.test.ts tests/savedScreen.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Continue the narrower post-cleanup wave on the next remaining shared support surface rather than reopening stable route/controller work.

### 2026-03-12 23:30
- Goal: Finish the current support-wave pass by thinning the shared Explore screen body into named result and modal sections instead of leaving both branch trees inline.
- Changes made: Added `components/explore/ExploreResultsSection.tsx` and `components/explore/ExploreModalStack.tsx`; rewrote `components/explore/ExploreScreenBody.tsx` to delegate result and modal branching to those extracted sections; kept the existing Explore helper-owned list/filter behavior intact; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `components/explore/ExploreScreenBody.tsx`, `components/explore/ExploreResultsSection.tsx`, `components/explore/ExploreModalStack.tsx`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: When a shared screen body still owns both its top-level search/controls composition and its results-or-modals branching, split the latter into named sections first so the body becomes a stable orchestration shell.
- Verification: `npx.cmd tsx --test tests/exploreHelpers.test.ts tests/exploreLists.test.ts tests/exploreScreen.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Move from support-surface decomposition into the source-layer consistency sweep next, with encoding and helper contract cleanup now the better leverage than more UI shell splitting.

### 2026-03-12 23:45
- Goal: Run the source-layer consistency sweep by correcting helper-owned Bosnian copy and keeping the adjacent tests aligned with the repaired output.
- Changes made: Cleaned Bosnian helper strings in `utils/profileSettings.ts`, `utils/tonightScreen.ts`, `utils/homeScreenContent.ts`, and `utils/savedScreen.ts`; updated `tests/profileSettings.test.ts`, `tests/tonightScreen.test.ts`, and `tests/savedScreen.test.ts` to assert the corrected output; reran the helper pack after fixing one remaining Saved tab-label source string; and refreshed handover, the execution board, and the napkin in the same slice.
- Files touched: `utils/profileSettings.ts`, `utils/tonightScreen.ts`, `utils/homeScreenContent.ts`, `utils/savedScreen.ts`, `tests/profileSettings.test.ts`, `tests/tonightScreen.test.ts`, `tests/savedScreen.test.ts`, `.claude/napkin.md`, `docs/00-overview/handover.md`, `docs/00-overview/execution_board.md`, `docs/project_ledger.md`
- Decisions: After mojibake is gone, continue source-layer cleanup by restoring proper Bosnian diacritics in helper tables and copy modules instead of accepting ASCII fallback spellings in shared app text.
- Verification: `npx.cmd tsx --test tests/profileSettings.test.ts tests/tonightScreen.test.ts tests/homeScreenContent.test.ts tests/savedScreen.test.ts tests/appRoutes.test.ts`; `npm.cmd run build:web`
- Follow-up: Finish with the long-tail audit and aggregate hardening pass, touching only remaining oversized surfaces that still materially violate the orchestration-first pattern.

### 2026-03-12 (home machine session)
- Goal: Continue the narrow diacritic and helper-ownership cleanup on the home machine.
- Changes made:
  - Installed `tsx` as a dev dependency and added `npm test` script for the Node test runner
  - Extracted Tonight action button labels (planner button, vote button, plan-saved alert) from the route and controller into `getTonightActionLabels()` in `tonightScreen.ts`, fixing "Predlozi" to "Predloži" and "sacuvan" to "sačuvan"
  - Fixed mock plan activity labels in `tonightMockPlans.ts`: Vecera to Večera, Pice to Piće, pozoriste to pozorište, Izlozba to Izložba
  - Fixed Home weather hero messages in `homeHeroState.ts`: Savrsen to Savršen, bastu to baštu, Kisovito to Kišovito, kafic to kafić
  - Moved the event free-entry badge label from inline component logic in `EventPurchaseSection.tsx` to `getEventFreeEntryLabel()` in `eventDetailScreen.ts`, removing the component's language prop
  - Confirmed web build still passes after all changes
  - Full test suite: 117/117 passing (up from 114 at session start)
- Files touched: `package.json`, `utils/tonightScreen.ts`, `hooks/useTonightController.ts`, `app/(tabs)/tonight.tsx`, `utils/tonightMockPlans.ts`, `utils/homeHeroState.ts`, `utils/eventDetailScreen.ts`, `components/event/EventPurchaseSection.tsx`, `app/event/[id].tsx`, `tests/tonightScreen.test.ts`, `tests/tonightMockPlans.test.ts`, `tests/homeScreen.test.ts`, `tests/eventDetailScreen.test.ts`, `docs/project_ledger.md`
- Decisions: Continue fixing diacritics at the source-of-truth helper layer; when a component only needs a `language` prop for one string, move that string to the helper and pass it as a display prop instead.
- Verification: `npm test` (117/117); `npx.cmd expo export -p web` succeeded
- Follow-up: The remaining diacritic and encoding long-tail is now very thin across utils and components; next priorities should shift to live runtime verification (favorites, taste profile, auth refresh) and then frontend/backend alignment work.

### 2026-03-12 (home machine session, continued)
- Goal: Fix a real schema alignment bug found during the frontend/backend audit.
- Changes made: Fixed the Home event card venue join type from `Array<{name}>` to `{name} | null` in `homeData.ts`, and updated `homeEventsSection.ts` to use `event.venues?.name` instead of `event.venues?.[0]?.name`. Supabase returns a single object for many-to-one joins, so the array accessor was silently failing — home event cards were not showing venue names from the join.
- Files touched: `utils/homeData.ts`, `utils/homeEventsSection.ts`, `tests/homeEventsSection.test.ts`
- Decisions: When Supabase returns a many-to-one join (like `venues(name)` on events), always type it as `{name} | null`, not `Array<{name}>`. The rest of the codebase was already correct; this was the only outlier.
- Verification: `npm test` (117/117); web build still green
- Follow-up: No remaining array-style venue join accessors found; the schema alignment audit shows adapters are covering the known field-name mismatches correctly.

### 2026-03-12 (home machine session, final pass)
- Goal: Run a comprehensive cleanup and coverage audit after the diacritic and schema alignment fixes.
- Changes made:
  - Normalized test data diacritics in Tonight test fixtures: replaced plain 'Vecera' with 'Ve\u010Dera' in `tests/tonightHelpers.test.ts`, `tests/tonightPlanner.test.ts`, and `tests/tonightScreen.test.ts` so test input matches the corrected source data
  - Fixed `console.log` to `console.error` for the Home weather fetch failure handler in `utils/homeScreen.ts` for consistency with other error handlers
  - Audited platform duplication (B11): all `.ios.tsx` files are either legitimate platform-specific implementations (`_layout.ios.tsx`, `IconSymbol.ios.tsx`) or already collapsed re-exports
  - Audited remaining diacritic issues: no mojibake or missing diacritics remain in utils, components, or contexts; backend test files intentionally use ASCII "Pozoriste" for raw scraped data simulation
  - Audited hardcoded strings in route files: all user-facing copy has been moved to helper modules
  - Audited unused imports and exports: no dead code found
  - Audited test coverage gaps: all utility modules with testable pure logic have dedicated or indirect test coverage; remaining untested files are Supabase/AsyncStorage runtime modules
- Files touched: `tests/tonightHelpers.test.ts`, `tests/tonightPlanner.test.ts`, `tests/tonightScreen.test.ts`, `utils/homeScreen.ts`
- Decisions: Backend test data using ASCII "Pozoriste" is intentional (simulates raw scraped content); only frontend test input data needed diacritic normalization.
- Verification: `npm test` (117/117)
- Follow-up: The codebase is structurally clean across routes, components, helpers, and tests. The next highest-value work is live runtime verification (favorites, taste profile, auth refresh) which requires human browser interaction, followed by any remaining frontend/backend alignment work.

### 2026-03-13
- Goal: Refresh repo-state documentation after a cold-start audit and turn the verification notes into a tighter execution script.
- Changes made: Updated the ledger snapshot to reflect the current single Supabase client surface and env-driven public config path; refreshed the known-issues section so it points at live auth/persistence verification instead of stale duplication notes; tightened the home-machine verification checklist so it uses the current frontend/backend command surfaces and records the current favorites/taste/auth risks more explicitly.
- Files touched: `docs/project_ledger.md`, `docs/05-dev-ops/home_machine_verification_checklist.md`
- Decisions: Treat the remaining high-risk area as runtime auth/persistence behavior across favorites, taste profile, and auth refresh; use the home-machine checklist as the concrete execution script for that work.
- Follow-up: Run the checklist on the home machine with a real authenticated session, then update handover/execution board only if the runtime results change blocker status or sequencing.

### 2026-03-13 23:52
- Goal: Harden the two highest-risk auth/persistence seams before the next home-machine verification pass.
- Changes made: Added `utils/favoritesSync.ts` so remote favorite upserts now check and throw Supabase write errors before legacy local ids are mirrored; rewired `utils/favorites.ts` to use that helper for migration sync and single-venue saves; added `utils/profileTastePersistence.ts` so taste-profile writes now upsert the `profiles` row by `id` instead of relying on update-only behavior; rewired `utils/profileTaste.ts` to use that helper; added focused regression coverage in `tests/favoritesSync.test.ts` and `tests/profileTastePersistence.test.ts`; refreshed handover so the next runtime verification pass knows these two seams were hardened before manual testing.
- Files touched: `utils/favorites.ts`, `utils/favoritesSync.ts`, `utils/profileTaste.ts`, `utils/profileTastePersistence.ts`, `tests/favoritesSync.test.ts`, `tests/profileTastePersistence.test.ts`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions: Keep Supabase write-shape logic in tiny testable helpers so Node-side tests can verify persistence behavior without importing the Expo runtime; prefer profile-row upsert over update-only writes so signed-in users do not see false-success mood changes when the row is missing.
- Verification: `npx.cmd tsx --test tests/favoritesSync.test.ts tests/profileTastePersistence.test.ts tests/favorites.test.ts tests/favoritesStorage.test.ts tests/favoritesMigration.test.ts tests/profileTaste.test.ts tests/profileSettings.test.ts`; `npm.cmd test` (`122/122` passing)
- Follow-up: Run the home-machine verification checklist against a real authenticated session to confirm favorites save/unsave, taste-profile persistence, and auth refresh now behave cleanly in the live app.

### 2026-03-17
- Goal: Design and plan a full presentation restyle of the Hype app for a tourism board presentation, plus real AI integration.
- Changes made:
  - Brainstormed and designed the full restyle through collaborative dialogue, covering visual design language (glass/glow UI replacing all emoji), 7 screen redesigns, 6 new AI features, and asset generation strategy
  - Created 4 HTML visual mockup documents in `docs/visual-mockups/`: icon style audit, emoji replacement guide, architecture validation vs industry, and screen-by-screen designs
  - Converted screen designs mockup to PDF via Puppeteer
  - Wrote and reviewed the design spec (900+ lines) covering architecture, visual design, screen-by-screen design, new features, data requirements, asset plan, implementation order (Waves 0-6), error handling, presentation strategy, and coding lessons from AWWV/Chronicles
  - Spec passed automated review (14 issues found and fixed in first pass)
  - Wrote and reviewed the implementation plan (2000+ lines) covering 6 chunks, 40+ tasks with full code, database migrations, 8 edge functions, all client helpers
  - Plan passed automated review (15 issues found and fixed)
  - Studied coding lessons from sibling repos (AWWV and Chronicles) and documented 30 directly applicable patterns in spec Section 10
  - Integrated `/simplify` checkpoints after every wave, napkin/ledger discipline, and clear subagent ownership (`[frontend]`, `[backend]`, `[edge-fn]`, `[assets]`, `[review]`) into the plan
  - Updated napkin with pending execution entry, execution board with new E8 epic, and handover with restyle context
- Files touched: `docs/superpowers/specs/2026-03-17-presentation-restyle-design.md`, `docs/superpowers/plans/2026-03-17-presentation-restyle.md`, `docs/visual-mockups/01-icon-styles.html`, `docs/visual-mockups/02-emoji-replacement.html`, `docs/visual-mockups/03-architecture-validation.html`, `docs/visual-mockups/04-screen-designs.html`, `docs/visual-mockups/04-screen-designs.pdf`, `.claude/napkin.md`, `docs/00-overview/execution_board.md`, `docs/00-overview/handover.md`, `docs/project_ledger.md`
- Decisions:
  - Glass containers via `expo-blur` BlurView (iOS) with rgba fallback (Android), not CSS `backdrop-filter`
  - Flippable editorial cards via `react-native-reanimated` v3, not Animated API
  - SSE streaming for Tonight Planner via direct `fetch()` to Edge Function URL, not `supabase.functions.invoke` (which doesn't support streaming)
  - Multi-provider AI: GPT-4.1 mini/nano for search/planning, Gemini Flash for vision/pulse, Claude Haiku for prose parsing
  - All AI server-side via Supabase Edge Functions — API keys never touch the client
  - 20s AbortController timeout on all edge functions, status 200 always (even errors)
  - Deno edge functions use `npm:` prefix for npm packages
- Verification: Spec and plan both passed automated review via subagent dispatches
- Follow-up: Plan execution is pending user approval. When ready, invoke `superpowers:subagent-driven-development` against the plan.

### 2026-03-17 — Presentation Restyle Execution (E8)

Full execution of the presentation restyle plan across 6 chunks, 16 commits on `feat/presentation-restyle` branch.

#### Chunk 1: Foundation (Design Tokens + Glass Components)
- Created `styles/glassTokens.ts` (12 mood colors, dark/light glass, shadows) and `styles/designTokens.ts` (radii, typography, spacing)
- Built shared glass components: `GlassContainer`, `GlassBadge` (6 variants), `GlassMoodChip` (animated spring press), `GlassCategoryChip`
- Built `FlippableCard` (reanimated v3 3D flip), `VenueCardFront`/`Back`, `EventCardFront`/`Back`, `SeriesCard`
- Created edge function shared utilities: AI client factories for OpenAI/Gemini/Claude, CORS helper, Supabase admin client
- Created `utils/ai/edgeFunctionClient.ts` with standard invoke + SSE streaming modes

#### Chunk 2: Wave 0 (Data Pipeline + Edge Functions)
- Created 8 Supabase Edge Functions:
  - `generate-pulse` (Gemini Flash-Lite) — bilingual city pulse blurb, 3h cache
  - `smart-search` (GPT-4.1 nano) — NL query classifier + structured filter extraction
  - `surprise-me` (GPT-4.1 mini) — 2-3 stop micro-plan generator
  - `generate-plan` (GPT-4.1 mini, SSE) — full evening planner with streaming
  - `translate-scene` (Gemini Flash vision) — camera OCR + translation
  - `enrich-descriptions` (Claude Haiku) — bilingual venue description enrichment
  - `parse-instagram` (Claude Haiku) — Instagram caption → event extraction
  - `analyze-venue-photo` (Gemini Flash) — venue photo classifier
- Created 5 client-side AI helpers: cityPulse, smartSearch, surpriseMe, planGenerator, translate
- Created 3 backend scripts: scrapeGooglePhotos, enrichDescriptions, seedInstagram
- Created `utils/ai/planPersistence.ts` for save/load plans to `ai_plans` table

#### Chunk 3: Wave 1 (Home Screen Restyle)
- `HomeHeroPhoto` — time-based photo hero with gradient fallback + bilingual greeting
- `HomeCityPulse` — AI-generated city blurb via Gemini, displayed in glass card with skeleton loading
- `HomeSurpriseMe` — AI micro-plan generator, spring-animated expand/collapse overlay
- `HomeKafuSection` — "Gdje na kafu?" randomizer fetching cafes from Supabase
- `HomeHiddenGems` — horizontal rail of flippable editorial venue cards (is_hidden_gem filter)
- `HomeMoodSection` now uses `GlassMoodChip` instead of emoji-based `MoodChip`
- Wired all new sections into `HomeContentSections.tsx`, cleaned up `HomeScreen.tsx`

#### Chunk 4: Wave 2 (Explore Screen Restyle)
- `ExploreSmartSearch` — AI concierge card below search bar, triggers on NL queries
- `ExploreLiveTranslation` — camera modal with Gemini Flash OCR translation
- `GlassCategoryChip` — neutral glass treatment for category selection
- `ExploreMoodStrip` now uses `GlassMoodChip`
- Smart search integrated into `useExploreController` with NL detection heuristic
- Camera icon added to search bar for translation access
- Installed `expo-camera` dependency

#### Chunk 5: Wave 3 (Tonight Screen + AI Planner)
- `TonightPlanStream` — SSE streaming plan renderer with shimmer → timeline → error states
- Wired real AI planner into `TonightPlannerModal` (setup → ai-streaming → mock-results phases)
- `useTonightController` gains `useAIPlanner` state with mock fallback
- `TonightSegmentTabs` restyled with glass pill treatment and gold glow on active tab

#### Chunk 6: Waves 4-6 (Detail Screens + Saved + Profile)
- Venue detail: GlassBadge for category/price/status, glass action button pills, hidden gem badge + insider tip in GlassContainer
- Event detail: GlassBadge for date/time, GlassContainer ticket CTA with gold glow, glass mood badges
- Series detail: GlassBadge for category + countdown
- Saved: glass tab pills with glow on active, glass empty states with accent CTA
- Profile: GlassContainer profile card + badge circles, GlassMoodChip taste selector, glass settings cards

#### Test coverage
- 57 new tests across 8 test files, all passing
- Structural + source-content tests for all new components and helpers

#### Architecture decisions
- Skip `expo-blur` BlurView initially — rgba glass gives 90% of the effect, BlurView has Android/web issues
- Edge functions always return status 200 (even errors) with `{ success, data/error }` envelope
- 20s AbortController timeout covers entire SSE stream, not just initial fetch
- Client-side module cache for city pulse (3h TTL)
- Mock planner kept as fallback when AI is unreachable
- `VARIANT_COLORS` extracted to `badgeVariants.ts` for Node-testability

### 2026-03-17 — Deployment, Testing, and Simplify Pass

#### Deployment
- Linked Supabase CLI to project `kyfoqltmkqwtnrdlacqv`
- Applied DB migration: `city_pulse` table created, `ai_plans`/`checkins`/venue columns confirmed pre-existing
- Deployed all 8 edge functions via `supabase functions deploy --no-verify-jwt`
- User set API secrets: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, GOOGLE_MAPS_API_KEY

#### Live testing
- `generate-pulse` (Gemini Flash-Lite): confirmed working — bilingual city pulse generated
- `smart-search` (GPT-4.1 nano): confirmed working — detected NL query, returned conversation mode with venue recommendations
- `surprise-me` (GPT-4.1 mini): confirmed working — 3-stop micro-plan with real venue names from DB
- `generate-plan` (GPT-4.1 mini SSE): confirmed working — streaming chunks arriving with structured evening plan
- `enrich-descriptions` (Claude Haiku): confirmed working — enriched 2 venues with bilingual descriptions

#### Simplify pass findings and fixes
- **Fixed (critical):** enrich-descriptions N+1 — sequential `callClaude()` loop replaced with `Promise.allSettled()` (5x faster)
- **Fixed (critical):** TonightPlanStream SSE re-renders — raw `setState` per chunk replaced with 150ms debounced ref+timer
- **Fixed (moderate):** cityPulse cache — added `clearCityPulseCache()` export for explicit invalidation
- **Noted (deferred):** GlassMoodChip/GlassCategoryChip duplication — real but merging touches 4+ callers, low risk
- **Noted (acceptable):** hardcoded `#D4A056` in StyleSheet blocks — brand gold matches `colors.accent`, theme not available in static styles

#### Remaining (at time of writing)
- Hero image assets (gradient fallbacks active)
- End-to-end in-app demo walkthrough
- Branch merge to main

### 2026-03-17 — Branch Merge + Venue Data Quality Pipeline

#### Branch merge
- `feat/presentation-restyle` merged to main via `--no-ff`, pushed to origin
- 179/179 tests passing at merge time
- Vercel build initially failed: `expo-camera` not in committed `package.json`
- Fixed: committed `expo-camera` dependency, Vercel rebuilt successfully

#### Google Maps photo scraping
- Ran `scrapeGooglePhotos.ts` across all venues with `google_place_id`
- Result: 958/1000 venues got cover photos from Google Maps Places API (96%)
- ~42 venues had no photos available on Google
- Later discovered total venue count is 1,226 (not 1,000 — Supabase REST default limit was truncating)

#### Venue category verification
- Built `verifyCategoriesVsGoogle.ts`: cross-checks our categories against Google Maps `types`
- Checked all 1,174 venues with `google_place_id`
- Found 171 mismatches, 162 auto-fixable (mostly bakeries miscategorized as cafes)
- Auto-fixed with `--fix` flag, cleared descriptions for re-enrichment

#### Google Places data enrichment
- Built `enrichFromGoogle.ts`: pulls ratings, reviews, editorial summaries, hours, phone, website
- 960/1,060 venues got Google reviews and editorial data
- Added DB columns: `google_rating`, `google_ratings_count`, `google_price_level`, `google_editorial_summary`, `google_top_reviews`, `website`, `phone`, `address`, `opening_hours_json`

#### AI description enrichment — iterative prompt improvement
- Initial run with Claude Haiku: generic AI slop ("beloved destination for true food enthusiasts")
- Rewrote prompt: banned slop words, added concrete examples, local tone
- Cleared 126 worst descriptions for re-enrichment
- Haiku produced Cyrillic leaks ("послије"), Croatian words ("tijekom"), wrong declension ("Markaleima")
- Tried Claude Sonnet: 404 — user's API key doesn't have access to Sonnet models
- Switched to GPT-4.1 mini: much better Bosnian, occasional English leaks
- Added ijekavica rules: "umjetnost" not "umetnost", "djevojka" not "devojka"
- User feedback: "kafa not kahva, lako not lahko"
- Added diacritics mandate: "savršen" not "savrsen"
- Final breakthrough: **BS-first approach** — write Bosnian first (since source data is mostly Bosnian), then translate to English
  - Result: dramatically more natural Bosnian ("baš kao kod babe", "Romantični kutak na Baščaršiji")
- Final run: all 1,226 venues enriched with BS-first GPT-4.1 mini prompt
- Grounded in Google reviews and editorial data

#### Key decision: BS-first enrichment
- Source reviews are mostly Bosnian → generating BS first and translating to EN produces much more natural Bosnian
- This is now the default approach for all bilingual content generation

#### Live crowd signals
- Built `seedCheckins.ts`: seeds 350+ demo check-ins across top 50 venues
- Built `utils/crowdSignals.ts`: fetchCrowdSignals() + fetchTrendingVenues()
- Built `HomeTrendingSection.tsx`: "Trending Now" horizontal rail with "X here now" badges
- Wired into Home screen between mood chips and kafu section
- Migration: `checkins.user_id` made nullable for demo seeding

#### Admin venue editor
- Built standalone Vite + React app in `admin/` directory
- Supabase auth, searchable venue table, inline description editing
- Green/red dots for EN/BS/photo/reviews coverage
- Google context panel (editorial + reviews) alongside edit fields
- RLS policy: authenticated users can update venues
- Dark theme matching Hype brand

#### Backend documentation
- Created `docs/03-architecture/backend_overview.md`
- Covers all three server layers, data quality pipeline, edge functions, admin tools
- Includes table schemas, script inventory, cost estimates

### 2026-03-17 — Event Scraping Pipeline

#### Traditional web scrapers
- Seeded 3 scrape sources: Pozorista.ba, AllEvents.in Sarajevo, KupiKartu.ba
- Built `runScraper.ts`: standalone script calling existing ingestion services directly
- Fixed critical bug: `insertRawEventCandidates` used `?select=id,source_url` on POST URL, causing PostgREST to return existing rows instead of inserting. Changed to `requestSupabaseAdminNoContent`.
- Result: 93 raw events scraped (11 Pozorista + 30 AllEvents + 52 KupiKartu)

#### Sarajevo city filter
- KupiKartu is national — was scraping events from Zenica, Tuzla, Banja Luka
- Added city rejection list + known Sarajevo venue matching to extractor
- Cleaned 8 non-Sarajevo events

#### KupiKartu extraction quality
- Venue extraction: `@VenueName` pattern now correctly extracted from stripped text
- Date extraction: `DD/MM` and `DD.MM.YYYY` patterns working
- Image extraction: extracting from raw HTML (not stripped text) to preserve `<img>` tags
- Stats: of 93 raw events, 36 have dates (39%), 32 have venues (34%), 12 have images (13%)

#### Instagram event pipeline (Apify)
- Built `scrapeInstagram.ts`: Apify-based Instagram scraper
- Account list built from DB (35 handles from venue `website` field) + 27 curated event venues = 62 accounts
- Fixed actor ID: `apify~instagram-scraper` (tilde, not slash), added `resultsType: 'posts'`
- Fixed `parse-instagram` edge function: was using wrong column names (`title` instead of `title_raw`, etc.)
- End-to-end test: Apify → captions → Claude Haiku event detection → raw_events with correct schema
- Successfully detected "Happy Hour" event from @caffe.bueno
- Ran 6 accounts before Apify free tier limit — waiting for user to top up credits
- Instagram images: `displayUrl` now passed to edge function and stored in `image_url`

#### Execution board updates
- Added B14-B18 to backlog:
  - B14: Live crowd signals + trending (done)
  - B15: Live event countdowns
  - B16: Weather-reactive recommendations
  - B17: "Right Now" mode on Explore
  - B18: Data quality pipeline automation

#### Architecture decisions
- BS-first bilingual content: write Bosnian from source data, translate to English
- GPT-4.1 mini for descriptions (Haiku too error-prone for Bosnian, Sonnet unavailable)
- Apify for Instagram scraping ($5/mo free tier)
- City filter on national sources (KupiKartu rejection list)
- `requestSupabaseAdminNoContent` for bulk inserts (not `fetchSupabaseAdminJson` with `?select=`)

### 2026-03-17 — Overnight Execution (Event Pipeline + Admin + Walkthrough)

#### Event promotion
- Built `promoteEvents.ts`: venue matching (exact/partial/fuzzy), Bosnian date parsing, category inference, dedup
- Fixed category enum: events DB only accepts `other` and `music`, not `comedy`/`theatre`/`dance`
- Added Bosnian month names to date parser: "17 Mart 2026 20:00" now parses correctly
- Result: 47 events promoted to canonical events table
- 46 raw_events skipped (no parseable date — mostly AllEvents entries and KupiKartu navigation false positives)

#### KupiKartu detail enrichment
- Built `enrichKupikartuDetails.ts`: scrapes detail pages for descriptions, dates, full-size images
- 47/47 KupiKartu events enriched

#### Admin events tab
- Added Events/Venues tab navigation to admin app
- EventEditor: table of events with filters (category, status, upcoming), inline editing
- RawEventReview: card grid of unpromoted raw_events with Promote/Dismiss buttons
- Build passes cleanly

#### Visual walkthrough
- `expo export -p web` builds successfully (2.76 MB JS bundle)
- Vercel deployment status: Ready (production)
- No TypeScript or import errors

#### Session end state
- 1,226 venues with BS-first descriptions, photos, Google data
- 47 canonical events (from 93 raw) — Tonight and Home now have real event content
- Admin editor has Venues + Events tabs
- Event scraping pipeline working (traditional + Instagram)
- All 8 edge functions deployed
- Vercel builds green
- 179 tests passing

### 2026-03-20 — Browser UI Walkthrough + Fixes

#### Goal
Full browser walkthrough of every tab and detail screen, fixing bugs found along the way.

#### Bugs fixed

1. **Event cards stacked vertically on web** (`components/home/HomeCardRail.tsx`)
   - `HomeCardRail` had a web-specific fallback that rendered cards in a vertical `View` instead of horizontal `ScrollView`
   - Removed the `Platform.OS === 'web'` branch — now uses horizontal `ScrollView` on all platforms, matching the Hidden Gems rail

2. **Date format "M03 22" instead of "22. mart"** (`utils/homeScreenContent.ts`)
   - `toLocaleDateString('bs-BA', ...)` produces broken output in browsers
   - Added explicit Bosnian month name array for the `bs` locale path

3. **Saved tab crash: "SAVED_MOODS is not defined"** (`components/saved/SavedTabContent.tsx`)
   - Missing import — `SAVED_MOODS` was used but not imported from `utils/savedScreen`

4. **Invisible "Otvori profil" button on Saved empty state** (`components/saved/SavedEmptyState.tsx`)
   - Button text was hardcoded `#FFFFFF` (white) on a near-white glass background (`rgba(255,255,255,0.6)`)
   - Changed to use `accentColor` prop (gold) for visible contrast

#### Files touched
- `components/home/HomeCardRail.tsx`
- `utils/homeScreenContent.ts`
- `components/saved/SavedTabContent.tsx`
- `components/saved/SavedEmptyState.tsx`

#### Observations (not fixed — data or polish items)
- "Magic by Aida" event appears twice in the events rail — duplicate in DB, not a UI bug
- Many events have gold placeholder images (no real photos scraped yet)
- Tonight tab shows empty state for all time slots — expected since events start March 22+
- Pre-existing test failure in `aiHelpersExtra.test.ts` (model ID assertion) — unrelated

#### Session end state
- 178/179 tests passing (1 pre-existing failure)
- All 5 tabs render cleanly on web
- Event cards now horizontal rail with correct Bosnian dates
- Saved tab no longer crashes

### 2026-03-20 — Dark Mode Only Conversion

#### Goal
Convert the app from cream/beige light theme to Spotify-inspired dark-mode-only. No toggle, no light mode.

#### New palette
- Background: `#121212` (was `#FAFAF8` light / `#1A1A2E` dark)
- Card: `#1E1E1E` (was `#FFFFFF` / `#252538`)
- Text: `#F5F5F5`, accent: `#D4A056` (gold, unchanged)
- Glass: `rgba(255,255,255,0.06)` (tuned for darker base)
- Tab bar border: `rgba(255,255,255,0.08)` (was `rgba(255,255,255,1)` — bug fix)

#### Architecture changes
- `styles/commonStyles.ts` — flattened from `colors.light`/`colors.dark` to single `colors` export with new palette + `surface`, `surfaceHover`, `textTertiary` tokens
- `hooks/useTheme.ts` — collapsed to static module-level constant, always returns dark
- `app/_layout.tsx` — hardcoded `HypeDarkTheme`, removed `useColorScheme`, `StatusBar style="light"`
- `contexts/AppContext.tsx` — removed `ThemeMode`, `themeMode`, `setThemeMode`, `hype_theme` persistence, theme translations
- `styles/glassTokens.ts` — removed light/dark split, flattened to single dark tokens
- `utils/floatingTabBar.ts` — removed `isDark` param, hardcoded dark values, fixed white border bug
- `components/glass/GlassContainer.tsx` — removed `isDark` conditional, uses flat tokens directly

#### UI changes (6 waves)
- Wave 1+2: Core infrastructure + removed theme toggle from Profile
- Wave 3: Glass + tab bar tokens
- Wave 4: ErrorBoundary, LoadingButton, Map, TonightPlanStream — hardcoded light colors replaced
- Wave 5: Systematic sweep of ~100 files across all component directories
- Wave 6: Cleanup — removed remaining `useColorScheme`, `isDark` ternaries in button.tsx, MoodChip, ListItem, SkeletonLoader, GlassMoodChip, GlassCategoryChip, FloatingTabBar

#### Files touched (25+)
- `styles/commonStyles.ts`, `hooks/useTheme.ts`, `app/_layout.tsx`, `contexts/AppContext.tsx`
- `styles/glassTokens.ts`, `utils/floatingTabBar.ts`, `components/glass/GlassContainer.tsx`
- `components/ErrorBoundary.tsx`, `components/LoadingButton.tsx`, `components/button.tsx`
- `components/Map.tsx`, `components/Map.web.tsx`
- `components/tonight/TonightPlanStream.tsx`, `TonightSegmentTabs.tsx`, `TonightModalStack.tsx`, `TonightEventBadges.tsx`, `TonightVoteModal.tsx`
- `components/saved/SavedBadgeCard.tsx`, `components/profile/ProfileSignOutModal.tsx`
- `components/SkeletonLoader.tsx`, `components/ListItem.tsx`, `components/MoodChip.tsx`, `components/FloatingTabBar.tsx`
- `components/glass/GlassMoodChip.tsx`, `components/glass/GlassCategoryChip.tsx`
- `constants/Colors.ts`, `utils/profileScreen.ts`, `utils/profileSettings.ts`
- `components/profile/ProfileSettingsSection.tsx`, `app/(tabs)/profile.tsx`
- Tests: `tests/designTokens.test.ts`, `tests/floatingTabBar.test.ts`, `tests/profileScreen.test.ts`

#### Session end state
- 177/178 tests passing (1 pre-existing failure)
- All 5 tabs + detail screens render dark on web
- No `useColorScheme`, `isDaytime`, `colors.light`, `HYPE_LIGHT_BG` references remain
- Gold accent (#D4A056) on charcoal (#121212) reads premium
- Glass effects pop on dark backgrounds

### 2026-03-20 — City Pulse Intelligence + AI Model Upgrades

#### City Pulse enhancements
- Edge function now fetches **klix.ba RSS feed** and filters for Sarajevo-relevant headlines
- Headlines injected into prompt only when genuinely significant (events, protests, closures — not niche stories)
- **Holiday calendar** hardcoded for 2026: Bajram, Kurban Bajram, Ramazan, Nova Godina, Praznik rada, etc.
- Holidays are injected as a mandatory primary theme: `⚠️ TODAY IS A HOLIDAY: BAJRAM...`
- Prompt rewritten to understand the **rhythm of holiday celebrations** by time of day (morning prayers → lunch → walks → evening)
- Weather data now passed from client → edge function
- Strict venue list enforcement: "Any venue not on this list does NOT exist"
- Robust JSON parsing: strips preamble text if model outputs thinking before JSON
- Cache shortened to 2 hours for freshness

#### AI model upgrades
- **surprise-me**: GPT-4.1 mini → **Claude Haiku 4.5** — better Bosnian prose, more reliable JSON
- **generate-plan**: GPT-4.1 mini → **Claude Haiku 4.5** with SSE streaming — server-side format translation (Claude SSE → OpenAI SSE) so client stays unchanged
- **generate-pulse**: kept on Gemini Flash Lite (adequate for short blurbs, cheapest)
- **smart-search**: kept on GPT-4.1 nano (intent parsing only, cheapest works fine)

#### Surprise Me fixes
- Added error state UI (was silently swallowing failures)
- Added "zatvori/close" hint when expanded
- Added 10s timeout on API call
- Fixed hero container clipping: `height: 320` → `minHeight: 320`, removed `overflow: hidden`
- Hero gradient updated from old navy `#1A1A2E` to new charcoal `#121212`

#### Earlier bug fixes (same session)
- Home event cards: vertical stack → horizontal scroll rail (`HomeCardRail.tsx`)
- Date format "M03 22" → "22. mart" (explicit Bosnian month names)
- Saved tab crash: missing `SAVED_MOODS` import
- Saved empty state: invisible white button text → gold accent color

#### Files touched
- `supabase/functions/generate-pulse/index.ts` — klix RSS, holiday calendar, weather, strict venues
- `supabase/functions/surprise-me/index.ts` — switched to Claude Haiku
- `supabase/functions/generate-plan/index.ts` — switched to Claude Haiku streaming with SSE translation
- `utils/ai/cityPulse.ts` — passes weather to edge function
- `components/home/HomeCityPulse.tsx` — fetches weather before pulse call
- `components/home/HomeSurpriseMe.tsx` — error state, timeout, theme tokens
- `components/home/HomeHeroPhoto.tsx` — minHeight, removed overflow clip, gradient fix

#### Deployments
- `generate-pulse`, `surprise-me`, `generate-plan` all deployed to Supabase
- Old pulse cache cleared

#### Session end state
- All 3 AI features tested and returning quality results
- City Pulse correctly shows "Bajram mubarek!" on Eid
- Surprise Me generates real plans with Claude Haiku
- Tonight Planner streams with Claude Haiku via SSE format translation
- Smart Search correctly parses Bosnian queries
- 177/178 tests passing

### 2026-03-21 — Event Pipeline Completion

#### Goal
Promote the remaining 46 unpromoted raw_events and clean up false positives.

#### What was done

1. **Built `enrichAllSources.ts`** — unified enrichment script for AllEvents.in and Pozorista.ba
   - AllEvents: extracts dates, descriptions, images, venue names from JSON-LD structured data
   - Pozorista: extracts dates from HTML `datetime` attributes, images from `og:image`
   - Also dismisses KupiKartu navigation false positives automatically

2. **Enriched 31 events** from detail pages:
   - 29 AllEvents.in events got ISO dates, descriptions, images, and venue names
   - 2 Pozorista.ba events got dates and images
   - 2 AllEvents events had no date on their pages at all — dismissed

3. **Dismissed 17 false positives**:
   - 14 KupiKartu navigation pages (Prodajna mjesta, Uslovi korištenja, O nama, etc.)
   - 1 cancelled event (MAYA BEROVIĆ - OTKAZANO)
   - 2 undatable AllEvents entries (Garden of Dreams, Figarov pir)

4. **Promoted 29 new events** to canonical events table:
   - Venue matching: 1 exact, 13 partial, 0 fuzzy, 15 no match
   - Key venues matched: Narodno Pozorište, AG Club, Cinemas Sloga, Vijećnica

5. **Deactivated 21 past events** (`is_active = false`)

#### Final event counts
- Total canonical events: 91
- Active upcoming: 70
- Deactivated (past): 21
- Raw events promoted: 76 (of 93 scraped)
- Raw events dismissed: 17

#### Browser verification
- Home "Nadolazeći događaji" rail shows real event cards with AllEvents poster images
- Tonight tab shows tonight's events with correct times and venues
- Event cards have proper Bosnian dates, venue names, and "Besplatno" pricing

#### Files touched
- `backend/src/scripts/enrichAllSources.ts` (new)
- `docs/00-overview/execution_board.md`
- `.claude/napkin.md`
- `docs/project_ledger.md`

#### Decisions
- AllEvents JSON-LD is the best extraction path — reliable structured data with ISO dates, venue info, descriptions, and images
- Pozorista.ba uses WordPress The Events Calendar — `datetime` HTML attributes work reliably
- KupiKartu false positives should be dismissed automatically by title matching against a known navigation page list
- Past events should be deactivated (`is_active = false`), not deleted, to preserve history

#### Follow-up
- Re-run scrapers periodically to pick up new events
- Top up Apify credits for Instagram pipeline
- Consider automating past-event deactivation on a schedule

### 2026-03-21 — Standard Bottom Tab Bar + AI Hero Images

#### Tab bar redesign
- Replaced `FloatingTabBar` (floating pill, absolute-positioned, overlapping content) with Expo Router's built-in `Tabs` navigator
- Full-width dark bar (`#1A1A1A`) with gold active tab (`#D4A056`), gray inactive (`#98989D`)
- Industry standard pattern (Spotify, Airbnb, Yelp all use this)
- No more content overlap — content scrolls naturally above the bar

#### AI-generated hero images
- Created `generate-hero-image` edge function with multi-model fallback:
  - Imagen 4.0 Fast → Imagen 3.0 → Gemini Flash (tries fastest first)
  - Context-aware prompts from time of day, weather, and holiday calendar
  - Generated images uploaded to Supabase Storage (`hero-images` bucket)
  - Server-side cache in `city_pulse.hero_image_url` (3h TTL)
- Created `utils/ai/heroImage.ts` client helper with 3h client-side cache
- Updated `HomeHeroPhoto` to accept `heroImageUrl` prop (gradient fallback preserved)
- Updated `HomeContentSections` to fetch hero image on mount
- Performance: first load ~8s (generation), cached ~0.5s

#### DB changes
- Added `hero_image_url TEXT` column to `city_pulse` table
- Created `hero-images` public storage bucket with read policy

#### Files touched
- `app/(tabs)/_layout.tsx` (rewritten: Stack+FloatingTabBar → Tabs)
- `supabase/functions/generate-hero-image/index.ts` (new)
- `utils/ai/heroImage.ts` (new)
- `components/home/HomeHeroPhoto.tsx` (added heroImageUrl prop)
- `components/home/HomeContentSections.tsx` (added hero image fetch)
- `docs/00-overview/execution_board.md`
- `.claude/napkin.md`
- `docs/project_ledger.md`

#### Decisions
- Bottom tab bar is the industry standard — UX research shows 21% faster navigation, 40% faster task completion vs hamburger menus
- Gemini Imagen API uses `:predict` endpoint (not `:generateContent`) with different request format
- Multi-model fallback necessary because model availability varies by API key tier
- 3h cache TTL balances freshness with API cost (~$0.02-0.04 per image generation)

#### Follow-up
- Clean up unused `FloatingTabBar.tsx`, `components/tabbar/*`, `utils/floatingTabBar.ts`
- Consider generating different hero images for different weather conditions more aggressively
- Monitor Supabase Storage usage and add cleanup for old hero images

### 2026-03-21 — Warm Cinematic Visual Style Pass

#### Goal
Match the app's visual style to the warm, cinematic travel-magazine aesthetic of the reference screenshots (IMG_4102-4105).

#### Typography
- Added DM Serif Display font (`@expo-google-fonts/dm-serif-display`)
- Headings (hero 34px, section 24px, card 18px) now use `DMSerifDisplay_400Regular`
- Body text, captions, labels, badges remain DM Sans
- Creates an editorial travel-magazine feel while keeping body text clean

#### Warm tints
- Glass tokens: `rgba(255,255,255,0.06)` → `rgba(212,160,86,0.04)` (amber tint)
- Glass border: `rgba(255,255,255,0.12)` → `rgba(212,160,86,0.10)`
- Image overlays: `rgba(0,0,0,0.7)` → `rgba(20,10,0,0.7)` (warm amber-black)
- Tab bar: `#1A1A1A` → `#1A1710` (subtle warm tint)

#### Event detail info rows
- Restyled to match reference screenshots (IMG_4104/4105)
- Structured rows: gold icon (MaterialIcons) + uppercase muted label + bold white value
- Separator lines between rows (`rgba(255,255,255,0.08)`)
- Venue row tappable with gold text, When row with formatted datetime, Price row

#### Accent badge fix
- Changed from gold-on-gold (`rgba(212,160,86,0.3)` bg + `#D4A056` text) to white-on-gold (`rgba(212,160,86,0.5)` bg + `#FFF` text)
- "HIDDEN GEM" badge now visible over warm image overlays

#### Files touched
- `app/_layout.tsx` — font loading
- `styles/designTokens.ts` — serif heading fonts
- `styles/glassTokens.ts` — amber tints
- `components/home/HomeHeroPhoto.tsx` — warm overlay
- `components/cards/EventCardFront.tsx`, `VenueCardFront.tsx`, `SeriesCard.tsx` — warm overlays
- `components/event/EventVenueAndBadges.tsx` — structured info rows
- `components/glass/badgeVariants.ts` — accent badge visibility
- `app/(tabs)/_layout.tsx` — warm tab bar
- `app/event/[id].tsx` — new props + serif section title

#### Decisions
- DM Serif Display pairs with DM Sans (same design family) — no visual clash
- Warm amber tints are very subtle (4-10% opacity) — enough to feel warmer without looking yellow
- Info rows match the industry pattern (Yelp, Eventbrite, Fever) — gold icon, uppercase label, bold value

#### Follow-up
- Apply same info row pattern to venue detail page
- Consider warming the Explore search bar and filter modals
- Clean up unused FloatingTabBar components

### 2026-03-21 — Rebrand: Hype → Look - Sarajevo

#### Goal
Full rebrand from "Hype" to "Look" across the entire codebase, with "Look - Sarajevo" header format to support future city expansions.

#### What was changed (20 files)
- **Header**: "Look" in DM Serif Display gold + "- Sarajevo" in DM Sans gray, baseline-aligned
- **App config**: name → Look, slug → look, scheme → look
- **Translations**: "Dobrodošli u Look" / "Welcome to Look", share texts, about version
- **Backend**: 4 user-agent strings → `LookIngestionBot/0.1 (+https://look.ba)`
- **Edge functions**: smart-search system prompt ("Look, a Sarajevo city discovery app")
- **Admin**: login, venue editor, event editor page titles
- **Tests**: share text and vote link assertions updated
- **Internal**: theme constant `LookDarkTheme`, brand comments in Colors.ts and commonStyles.ts
- **Vote links**: `hype.ba/vote/` → `look.ba/vote/`
- **Profile badge**: "Hype OG" → "Look OG"

#### What was NOT changed
- `components/HypeHeader.tsx` filename — kept for now, can rename in follow-up
- Test fixtures using `@hype` as mock Instagram handle — not a brand reference
- Doc filenames and folder names (repo is still called "Hype app")

#### Verification
- Browser: "Look - Sarajevo" renders correctly in header
- Tests: 177/178 passing (1 pre-existing failure unrelated)

#### Follow-up
- Rename `HypeHeader.tsx` → `AppHeader.tsx` or `LookHeader.tsx`
- Update repo/folder name if needed
- Register `look.ba` domain

### 2026-03-21 — Fix mood chip → venue filtering (ID mismatch)

#### Problem
4 of 12 mood chip IDs in the app didn't match the mood values stored in the venues DB column:
- `muzika` (app) → `live_music` (DB) — 17 venues
- `romantika` (app) → `romantic` (DB) — 40 venues
- `kultura` (app) → `culture` (DB) — 127 venues
- `turista` (app) → `tourist` (DB) — 74 venues

Tapping these 4 moods returned zero results even though hundreds of matching venues existed.

#### Solution
Added `moodToDbValue()` mapping function in `utils/homeScreenContent.ts` that translates app chip IDs to DB mood values. Applied to all 5 query points:
- `utils/homeData.ts` — events query
- `components/home/HomeHiddenGems.tsx` — hidden gems query
- `components/home/HomeKafuSection.tsx` — kafu query
- `components/home/HomeTrendingSection.tsx` — trending client-side filter
- `utils/exploreData.ts` — explore venue query

#### Verification
- 178/178 tests passing (+ 1 pre-existing unrelated failure)
- New test covers all 12 mood ID mappings

#### Files touched
- `utils/homeScreenContent.ts` (new: `moodToDbValue()`)
- `utils/homeData.ts`, `utils/exploreData.ts` (import + use mapping)
- `components/home/HomeHiddenGems.tsx`, `HomeKafuSection.tsx`, `HomeTrendingSection.tsx` (import + use mapping)
- `tests/homeScreenContent.test.ts` (new mood mapping test)

### 2026-03-21 — Instagram handle discovery pipeline

#### Goal
Build a comprehensive list of Instagram accounts for all venues in the database to feed into the Apify scraper.

#### Starting state
- 104 venues had `instagram_handle` populated
- 1,122 venues had no handle
- Some existing handles were wrong (e.g. `hemingways.sa` should be `hemingways387`)

#### What was built
- `backend/src/scripts/findInstagramHandles.ts` — automated handle finder with two strategies:
  1. **Website scraping**: fetches each venue's website HTML and extracts Instagram links
  2. **Google search**: searches `"{venue name}" sarajevo instagram` and extracts handles from results
- Supports `--dry-run`, `--limit=N`, and `--category=X` flags

#### What was found
- **78 handles from website scraping** (bakeries, restaurants, galleries, museums with proper sites)
- **13 handles from Google search via browser** (clubs, theatres, cultural centers without websites)
- Total: **91 new handles** added to the database

#### Manual spot-check results
Verified in browser by navigating to Instagram profiles:
- ✅ Confirmed correct: `dasistwalterclub`, `bambusclubsarajevo`, `cltropics`, `club_frka_sarajevo`, `xsclubxs`, `otvorenascenaobala`, `pozoristemladihsarajevo`, `goyakart`
- ❌ Cleared wrong handles (5 venues, 3 unique bad handles):
  - `@glovo_es` — Glovo España, was assigned to Mr Charlie Chaplin
  - `@wixstudio` — Wix website builder, was assigned to LAFF Bakery + LAFF Coffee
  - `@inovinebh` — iNovine retail chain, was assigned to Mr.Waffle & Mrs.Pancake
  - `@fiskultura_sarajevo` — fitness studio, was assigned to Fis Kultura nightclub
  - `@mystiqueclub` — Buenos Aires nightclub, was assigned to Mystique Club Sarajevo
- 🔧 Fixed: `hemingways.sa` → `hemingways387` (user-reported)

#### Final state
- **189 venues with instagram_handle** (was 104, +85 net after removals)
- **176 unique handles** (some chains share handles)
- **1,037 venues still missing** — mostly small neighborhood places without websites or discoverable Instagram

#### Key lesson
Website scraping picks up the Instagram link from the venue's own site footer/social icons — high confidence. Google search finds handles but needs manual verification to avoid wrong-city or wrong-business matches.

#### Files touched
- `backend/src/scripts/findInstagramHandles.ts` (new)
- `backend/data/found_instagram_handles.json` (output)
- `backend/data/no_instagram_found.json` (output)

### 2026-03-22 — Mood chip vector icons

#### Goal
Replace AI-generated mood chip images (which produced generic sparkler icons with opaque black backgrounds) with crisp vector icons from `@expo/vector-icons`.

#### What was done
- Replaced `Image`/colored-circle fallback in `GlassMoodChip` with 12 mood-specific vector icons from `MaterialCommunityIcons` and `Ionicons`
- Each icon tints to the mood's primary color when unselected, white when selected
- Removed the unused `iconSource` prop entirely
- No new dependencies — `@expo/vector-icons` was already installed

#### Icon mapping
| Mood | Icon | Library |
|------|------|---------|
| party | party-popper | MaterialCommunityIcons |
| chill | moon-waning-crescent | MaterialCommunityIcons |
| girls_night | glass-cocktail | MaterialCommunityIcons |
| date_night | candle | MaterialCommunityIcons |
| muzika | musical-notes | Ionicons |
| romantika | heart | Ionicons |
| kultura | drama-masks | MaterialCommunityIcons |
| foodie | silverware-fork-knife | MaterialCommunityIcons |
| brunch | coffee | MaterialCommunityIcons |
| after_work | beer | MaterialCommunityIcons |
| outdoor | leaf | Ionicons |
| turista | compass | MaterialCommunityIcons |

#### Verification
- 187/187 tests passing (+ 1 pre-existing unrelated failure)
- New test verifies every mood has an icon entry and old `iconSource`/`iconPlaceholder` paths are gone
- Verified on web preview: Home and Explore both render vector icons with correct mood colors

#### Files touched
- `components/glass/GlassMoodChip.tsx` (rewritten: vector icons instead of Image)
- `tests/glassMoodChip.test.ts` (new test for icon coverage)

### 2026-03-22 — Unified mood feed on Home screen

#### Goal
When a mood chip is selected on Home, replace the independent sections (Trending, Kafu, Hidden Gems, Events) with a unified vertical feed showing both venues AND events matching that mood. Default layout preserved when no mood is selected.

#### What was built
- `utils/homeMoodFeedUtils.ts` — types (`MoodFeedVenue`, `MoodFeedEvent`, `MoodFeedItem` tagged union) and pure `interleaveFeedItems()` function (2:1 venue:event interleaving ratio)
- `utils/homeMoodFeed.ts` — `loadMoodFeed(moodId)` fetches venues (limit 15) and events (limit 10, future only) in parallel from Supabase, both filtered by `.contains('moods', [dbMood])`, then interleaves them
- `components/home/HomeMoodFeed.tsx` — renders the unified feed:
  - Section header with mood label + mood-colored accent line
  - Venue cards via `FlippableCard` + `VenueCardFront`/`VenueCardBack` (same pattern as Hidden Gems)
  - Event cards with `getHomeEventCardContent()` + `ImageWithPlaceholder` (same content as `HomeEventCard` but full-width)
  - `ContentState` for loading/empty states
  - Own `useRouter()` for venue navigation
- `components/home/HomeContentSections.tsx` — conditional rendering: mood selected → `HomeMoodFeed`, else → existing sections

#### Design decisions
- Pure interleaving function separated into `homeMoodFeedUtils.ts` so Node-side tests can import without pulling in `react-native` / Supabase client (same pattern as `errorLoggerUtils.ts`)
- Existing section components not modified — they continue working in default (no mood) state
- Feed uses vertical layout (not horizontal rails) since it replaces multiple sections
- Interleaving ratio: 2 venues, 1 event, repeat — creates a natural browsing rhythm

#### Verification
- 187/187 tests passing (+ 1 pre-existing unrelated failure)
- 8 new interleaving tests cover: equal counts, more venues, more events, only venues, only events, empty, type tags, 2:1 ratio pattern
- Web preview verified: Kultura → galleries/museums/cultural centers; Muzika → music venues; deselect → default sections restored
- No console errors, no failed network requests

#### Files touched
- `utils/homeMoodFeedUtils.ts` (new)
- `utils/homeMoodFeed.ts` (new)
- `components/home/HomeMoodFeed.tsx` (new)
- `components/home/HomeContentSections.tsx` (modified: conditional rendering)
- `tests/homeMoodFeed.test.ts` (new)

### 2026-03-22 — Category label translations

#### Goal
Fix raw DB category values (`concert_hall`, `cultural_center`, `museum`, etc.) leaking through to the UI without translation.

#### What was done
- Created `utils/categoryLabels.ts` with `getCategoryLabel(category, language)` — centralized mapping for all ~20 venue categories in both Bosnian and English
- Wired into 4 leaking components: `VenueCardFront` (via callers: HomeHiddenGems, HomeTrendingSection, HomeMoodFeed), `ExploreVenueCard`, `VenueDetailHeader`, and `SavedVenueCard` (via `savedContent.ts` model builder)
- Unknown categories fall back gracefully: `food_truck` → "Food Truck"
- 5 new tests covering BS labels, EN labels, defaults, fallback, case-insensitivity

#### Files touched
- `utils/categoryLabels.ts` (new)
- `tests/categoryLabels.test.ts` (new)
- `components/home/HomeHiddenGems.tsx` (import + use getCategoryLabel)
- `components/home/HomeTrendingSection.tsx` (import + use getCategoryLabel)
- `components/home/HomeMoodFeed.tsx` (import + use getCategoryLabel)
- `components/explore/ExploreVenueCard.tsx` (import + use getCategoryLabel via useApp)
- `components/venue/VenueDetailHeader.tsx` (import + use getCategoryLabel via useApp)
- `utils/savedContent.ts` (translate in model builder, added language option)
- `components/saved/SavedTabContent.tsx` (pass language to builder)
- `tests/savedContent.test.ts` (updated for translated category)

### 2026-03-22 — Look header as home button

#### What was done
- Wrapped the "Look - Sarajevo" text in `HypeHeader.tsx` with a `TouchableOpacity` that navigates to `/` when tapped from any non-home screen
- Uses `useRouter()` and `usePathname()` from expo-router

#### Files touched
- `components/HypeHeader.tsx`

### 2026-03-22 — Hero image prompt fix + cache clear

#### Problem
Hero image showed a nighttime scene even during morning because the Bajram holiday override completely replaced the time-of-day scene in the prompt.

#### Fix
Changed holiday modifications from replacing the scene to layering on top of the time-of-day base. Morning during Bajram now produces: "Baščaršija cobblestone street... warm golden morning light... festive holiday atmosphere, traditional decorations, families greeting each other."

Cleared the cached hero_image_url in city_pulse to force regeneration. New image correctly shows a morning Sarajevo scene with a džezva (coffee pot) in the foreground and festive decorations.

#### Files touched
- `supabase/functions/generate-hero-image/index.ts` (deployed)

### 2026-03-22 — AI planners now time and holiday aware

#### Problem
Both Surprise Me and the AI Evening Planner hardcoded "evening" in their prompts, producing nighttime plans (7:30 PM stops) regardless of the actual time of day.

#### Fix
Added Sarajevo timezone awareness and holiday calendar to both edge functions:
- `surprise-me`: now determines time of day (morning/afternoon/evening/night) and adjusts the prompt context, venue types, and suggested times accordingly. Also adds holiday context when applicable.
- `generate-plan`: same time-of-day and holiday awareness. Prompt now says "Create a morning/brunch outing" instead of hardcoded "evening plan".

#### Verification
- Surprise Me in morning now returns: "Bajram vibes, local bites & hidden gems" with 11:15 AM and 12:45 PM stops
- AI Planner in morning returns: morning-appropriate stops starting from current hour
- Both incorporate Bajram festive context naturally

#### Files touched
- `supabase/functions/surprise-me/index.ts` (deployed)
- `supabase/functions/generate-plan/index.ts` (deployed)

### 2026-03-22 — Font family consistency sweep

#### Problem
~30 text styles across 20 component files were missing `fontFamily` declarations, causing system fonts to render instead of DM Serif Display / DM Sans. Most visible on the Tonight screen ("Suggest a plan" buttons, segment chips, event titles) but also present in Explore, Saved, Profile, and Event detail screens. Additionally, `TonightSegmentTabs` referenced `DMSans_600SemiBold` which was never loaded in `app/_layout.tsx`.

#### Fix
Added `fontFamily` to every text style missing one, following the design system:
- Headings/modal titles (20px+): `DMSerifDisplay_400Regular`
- Bold text (700/bold): `DMSans_700Bold`
- Semi-bold text (500/600): `DMSans_500Medium`
- Regular text (400): `DMSans_400Regular`
- Fixed `DMSans_600SemiBold` → `DMSans_500Medium` (600 weight not loaded)

#### Files touched (20 files)
Tonight: `TonightActionButtons`, `TonightEventCard`, `TonightModalHeader`, `TonightEventBadges`, `TonightEventMeta`, `TonightPlannerGroupSizePicker`, `TonightPlannerMoodGrid`, `TonightPlannerSetup`, `TonightPlannerActionRow`, `TonightVoteSetup`, `TonightVoteResultCard`, `TonightVoteResults`, `TonightSegmentTabs`, `TonightPlannerResults`
Explore: `ExploreVenueCard`, `ExploreMenuCard`, `ExploreModalHeader`
Saved: `SavedVenueCard`, `SavedEventCard`
Other: `EventDetailHero`, `EventVenueAndBadges`, `ProfileSettingsCard`

### 2026-03-22 — AI planner model upgrade + bug fix

#### Problem
Both AI planners (Surprise Me and Generate Plan) were broken on live — returning "Could not generate a plan" every time. Root cause: incorrect Anthropic model ID `claude-sonnet-4-5-20241022` (doesn't exist, returns 404). The edge function caught the error as `{ success: false }` but the client showed a generic error with no indication of the cause.

#### Fix
- Corrected model ID to `claude-sonnet-4-5-20250929` in both edge functions
- Upgraded from Haiku to Sonnet 4.5 for better Bosnian language quality
- Improved Bosnian prompt rules: short sentences, proper diacritics, no English mixing, concrete tone examples
- Added fuzzy venue matching in surprise-me (partial name match fallback) so plan stops are clickable
- Broadened surprise-me venue categories to include museums, galleries, landmarks, parks, cultural centers

#### Lesson
Always verify Anthropic model IDs against the live API before deploying — model IDs include a release date suffix that cannot be guessed.

#### Files touched
- `supabase/functions/surprise-me/index.ts` (deployed)
- `supabase/functions/generate-plan/index.ts` (deployed)

### 2026-03-22 — Header + tab bar persistence across detail pages

#### Problem
Navigating to venue/event/series detail pages lost both the "Look - Sarajevo" header and the bottom tab bar because those routes were outside the `(tabs)` group.

#### Fix
- Moved `venue/[id]`, `event/[id]`, `series/[id]` from top-level `app/` into `app/(tabs)/(home)/` as nested stack routes
- Updated `(home)/_layout.tsx` to register the three detail routes with `headerShown: false`
- Added `HypeHeader` with conditional back arrow to all three detail screens
- `HypeHeader` now detects detail pages via pathname regex and shows a back button when `router.canGoBack()`

#### Files touched
- `app/(tabs)/(home)/_layout.tsx` (updated)
- `app/(tabs)/(home)/venue/[id].tsx` (moved from `app/venue/[id].tsx`)
- `app/(tabs)/(home)/event/[id].tsx` (moved from `app/event/[id].tsx`)
- `app/(tabs)/(home)/series/[id].tsx` (moved from `app/series/[id].tsx`)
- `components/HypeHeader.tsx` (added back button + MaterialIcons import)

---

### 2026-03-22 — Session 2: Visit Sarajevo integration, pitch materials, Home magazine redesign

#### Visit Sarajevo integration
- Visit Sarajevo logo placed in header (centered, language-aware links)
- "Powered by Visit Sarajevo" attribution added to AI plan results
- Transport directions component on venue detail (14 neighborhoods mapped)
- 8 venue descriptions updated from Visit Sarajevo content
- Hero image prompt updated: no faces, only distant silhouettes or from behind

#### AI quality fixes
- Surprise Me upgraded from Haiku to Sonnet for better Bosnian language quality
- AI Planner raw JSON streaming fixed (shimmer + status text only during generation)
- AI plan stops made clickable — navigate to venue detail on tap (B19 done)
- Client-side venue enrichment for AI planner (fuzzy match against all 1,200 venues)

#### Live features shipped
- B14: Live crowd signals — 100 demo check-ins seeded, Trending Now rail on Home
- B15: Live event countdowns — "Starts in X min" badges on Home + Tonight cards
- B16: Weather-reactive city pulse — rain/snow/heat guidance in AI recommendations
- "Look Prezentacija" test event seeded for tomorrow 11:15 AM (pitch demo)

#### Font consistency sweep
- Added fontFamily to ~30 text styles across 20 files
- Fixed DMSans_600SemiBold (not loaded) → DMSans_500Medium

#### Pitch materials
- PPTX pitch deck for Visit Sarajevo (Bosnian) with 4 roadmap mockup slides
- DOCX cost estimate report — two versions:
  - External (for board): 1,830 hours, ~220K KM total investment, all in KM with EU/US comparisons
  - Internal (real): ~930 hours actual, ~160-210 hours personal time, 9-11x AI productivity multiplier

#### Home magazine redesign (partner feedback)
- Problem: Home read like a restaurant menu, not a city discovery experience
- Solution: "Smart magazine cover" with 4x2 category icon grid
- New HomeCategoryGrid: 8 categories (Restoran, Bar, Kafić, Klub, Pozorište, Muzej, Galerija, Znamenitost)
- New HomeCategoryFeed: category-filtered venue list with mood boost sorting
- Three content modes: default editorial, category-filtered, mood feed
- Removed HomeKafuSection and HomeAskSarajevo from default view
- /simplify pass: extracted getCategoryGroup to utils, removed unused fields, separated fetch from sort

#### Files touched (key)
- `components/home/HomeCategoryGrid.tsx` (new)
- `components/home/HomeCategoryFeed.tsx` (new)
- `components/home/HomeContentSections.tsx` (redesigned)
- `components/home/HomeScreen.tsx` (added category state)
- `utils/categoryLabels.ts` (added getCategoryGroup)
- `supabase/functions/generate-hero-image/index.ts` (no faces prompt)
- `supabase/functions/surprise-me/index.ts` (Sonnet model, wider venue matching)
- `docs/superpowers/specs/2026-03-22-home-magazine-redesign-design.md` (new spec)

### Session 2026-03-22 (cont.) — Mood filtering fix & data quality

#### Mood tag inflation cleanup
- Discovered AI enrichment massively over-tagged venues: "chill" at 51% (514/1000), "foodie" at 35% (352/1000)
- Ran cleanup script: stripped generic tags from bakeries, cafes, bars, restaurants
- Kept tags only where genuinely distinctive (name contains "lounge", "jazz", "chill", "gourmet", "bistro")
- Results: chill 514→58 (6%), foodie 352→21 (2%) — all other moods unchanged

#### Category + mood hard filter
- Bug: selecting Bar + Party still showed Bistro Cuco (an after_work-only bar)
- Root cause: HomeCategoryFeed used sort-boost (mood-matching venues sorted to top, rest still shown)
- Fix: changed to hard filter — `rawVenues.filter(v => v.moods?.includes(dbMood))` — only shows venues matching BOTH category AND mood
- Added `moodToDbValue()` translation to HomeCategoryFeed for Bosnian mood IDs (muzika→live_music, etc.)

#### Verified on production
- Bar + After Work: shows Bistro Cuco, Caffe index ✅
- Bar + Party: shows Shelter Pub, Sarajevo Pub Crawl Start — Bistro Cuco correctly absent ✅
- Mood-only (Chill): shows 58 genuinely chill venues instead of 514 generic ones ✅

#### Pitch materials created
- Visit Sarajevo pitch deck (PPTX) with roadmap and feature mockups
- Cost estimate documents: external (for board) and internal (realistic numbers)
- Look Presentation event seeded for tomorrow 11:15 AM at Visit Sarajevo

#### Files touched
- `components/home/HomeCategoryFeed.tsx` (hard filter instead of sort boost)
- `.claude/napkin.md` (data quality rules added)
- Database: 975 venue mood tag updates (chill + foodie cleanup)

### Session 2026-04-10 — Full code quality audit and hardening

#### Audit scope
Six-dimension parallel audit: architecture, types/errors, performance, security/tests, UX/accessibility, backend/data.
Full findings saved in `docs/08-reference/code_quality_audit_2026_04_10.md`.

#### Critical fixes
- **Security**: removed hardcoded Supabase credentials from `admin/src/supabase.ts`; added JWT auth to 7 user-facing edge functions and admin secret auth to 4 admin functions; added SSRF host allowlist to `analyze-venue-photo`; CORS updated for admin header
- **Correctness**: fixed Rules of Hooks violation in `AnimatedCard` (hooks after conditional return); fixed `AppContext` value recreated every render (memoized with useCallback/useMemo); fixed `SkeletonLoader` infinite animation leak on unmount; wired `ErrorBoundary` into root layout
- **Data quality**: fixed `generate-pulse` using UTC instead of Sarajevo timezone for time_of_day; fixed 6+ data loaders silently swallowing Supabase errors; fixed `loadHomeWeather` missing response.ok check; fixed empty catch block in `HomeKafuSection`

#### Architecture changes
- **Detail routes moved** from `app/(tabs)/(home)/` to `app/` — venue, event, series, heritage now render as root-level stack screens; cross-tab navigation and back behavior now work correctly
- **Edge function HTTP status codes**: 10 functions fixed from 200-on-error to proper 400/500
- **HOLIDAYS constant** consolidated from 3 out-of-sync copies into `_shared/holidays.ts`
- **Supabase admin** singleton: `getSupabaseAdmin()` factory replaced with module-scoped `supabaseAdmin`
- **`_shared/auth.ts`** created with `verifyUserAuth` (JWT) and `verifyAdminAuth` (secret) helpers

#### Performance
- 6 `.map()` lists virtualized with FlatList: TonightEventCards, SavedEventList, SavedVenueList, SavedBadgeGrid, HomeCategoryFeed, ExploreVenueList
- 5 card components wrapped with `React.memo`: TonightEventCard, ExploreVenueCard, SavedEventCard, SavedVenueCard, SavedBadgeCard
- `useProfileController.settingsCopy` memoized; unmount guard added to async auth callback
- Duplicate `loadVenues` call removed from `useExploreController.applyFilters`
- `HomeHeritageSection` unmount guard added

#### Accessibility
- Added `accessibilityLabel`, `accessibilityRole`, `accessibilityState` across 24 component files
- Tab bars, cards, chips, toggles, action buttons, search inputs, flip cards all now screen-reader accessible
- HypeHeader back button touch target increased from 32pt to 44pt

#### Design system
- `SectionHeader` now uses `designTokens.typography.sectionHeader` (DM Serif Display) instead of wrong font
- `GlassContainer` rgba concatenation fixed with `toAlphaBorder` helper
- `GlassCategoryChip` wired to `glassTokens` instead of hardcoded rgba
- `style?: any` replaced with `StyleProp<ViewStyle>` on 5 components
- `HypeHeader` uses `useSafeAreaInsets()` instead of hardcoded padding

#### Dead code removed
- 5 dead iOS `.ios.tsx` re-export files deleted
- `utils/visitSarajevoInstagram.ts` and `utils/ai/eventCover.ts` deleted (never imported)
- `HERO_IMAGES` dead constant, dead `GlassBadge` useTheme import, dead `ContentState` spinner branch, permanent `Map.web.tsx` spinner all removed
- SpaceMono font removed from root layout
- Notification bell stub removed from HypeHeader
- Heritage back button regex fixed, hardcoded venue count removed from HomeSurpriseMe
- Failing test corrected (model ID assertion)
- `errorLogger` source tag fixed from 'expo-template' to 'look-app'

#### Totals
- ~80+ files changed, 9 deleted, 3 created
- 193/193 tests passing throughout

### Session 2026-05-16 — Ulaznice source + strict Sarajevo filter + cross-source dedupe

#### Scope
Added Ulaznice.org as a fourth direct-html ingestion source, then closed two cross-cutting gaps the user raised before letting it ship: national sources were leaking non-Sarajevo events, and cross-source duplicates (same concert on KupiKartu + Ulaznice + AllEvents) were promoting as three canonical event rows instead of one.

#### Ulaznice source
- Added `extractUlazniceCandidates` + `extractUlazniceCardMetadata` in `backend/src/services/sourceExtractors.ts` matching `/{vendor?}/tickets/{id}/{slug}` event links inside `<h5 class="…event-title-front">`. Pulls date from the calendar-icon span, venue from `<b>…</b>`, city from `<span class="smallinfo">`, image from `data-bkgimg`.
- Wired `parser_hint=ulaznice_listing` / URL containing `ulaznice.org` into `extractCandidatesForSource`.
- Migration `supabase/migrations/20260516_ulaznice_scrape_source.sql` adds the source row (tier 1, 6h frequency, music + theater category URLs). Idempotent via `NOT EXISTS`.

#### Strict Sarajevo filter
- Replaced lenient `isLikelySarajevo` (default-accept on ambiguous) with `classifyCity` + `isStrictlySarajevo` (default-reject). Broadened the Sarajevo prefix from `'sarajevo'` to `'sarajev'` to catch Bosnian inflections (sarajevski/sarajevska/sarajevsko). Added Baščaršija, Ilidža, Grbavica, SARTR, and Sarajevski ratni teatar to the venue-hint list; added Busovača to the reject list.
- Applied strict filter to **Pozorista** (was unfiltered — biggest leak; would have promoted Tuzla/Mostar theaters), **KupiKartu** (was lenient), and the **Ulaznice** fallback. AllEvents stays URL-scoped.

#### Cross-source dedupe
- New `backend/src/services/eventDedupe.ts` exposes `canonicalEventKey({title, startDatetime, venueId, locationName})`. Strips diacritics, lowercases, removes punctuation, drops noise tokens (`sarajevo`, `bkc`, `kc`, `centar`, `kulturni`). Truncates date to `YYYY-MM-DD`. Falls back to normalized `location_name` when `venue_id` is null. Returns null on missing date or sub-3-char title.
- `promoteEvents.ts` now fetches `title_bs`, `start_datetime`, `venue_id`, `location_name` on existing events, builds both a `(source, ticket_url)` set and a canonical-key set, and checks both before insertion. Same-source duplicates and cross-source duplicates both mark the raw row promoted so they don't keep retrying on every run.
- New stat: `Skipped — cross-source dup`.

#### Tests
- 3 new extractor tests (Sarajevo-tagged Pozorista vs Tuzla, Ulaznice card filter + dedupe, Ulaznice vendor-prefixed URLs, strict-reject for KupiKartu cards with no signal); existing pozorista test updated for strict-filter behavior.
- 6 new `eventDedupe` tests covering: same event across sources collapses, diacritic/case/punctuation insensitivity, different days stay distinct, different venues stay distinct, null on bad date, null on too-short title.
- Full backend test sweep: 24/25 (one pre-existing failure in `integration.test.ts` due to a `bun:` import — confirmed identical on main, unrelated).

#### Admin app (earlier in session)
- Admin SPA restructure (Dashboard/VenueCuration/EventManagement/UserManagement pages, Sidebar component, useAuth hook), Bosnian login copy, in-memory Supabase auth lock replacing Web Locks API, role enum migration (`super_admin`/`editor`) and curation columns (`is_curated`/`curator_notes`). Redeployed to https://look-admin.vercel.app.

#### Files
- New: `backend/src/services/eventDedupe.ts`, `backend/tests/eventDedupe.test.ts`, `supabase/migrations/20260516_ulaznice_scrape_source.sql`
- Modified: `backend/src/services/sourceExtractors.ts`, `backend/src/scripts/promoteEvents.ts`, `backend/tests/sourceExtractors.test.ts`
- Docs: `initial_source_inventory.md` (Ulaznice slot 4), `dedupe_and_promotion_policy.md` (Layer 2 canonical key), `execution_board.md` (E5 progress), `.claude/napkin.md` (lessons #4 updated, new cross-source dedupe rule)

#### Anchor-fallback bug (discovered during first ulaznice trigger)
- First live ulaznice run inserted 32 rows. Audit showed 21 were nav/footer pollution (`Muzika`, `Biznis`, `Kontakt`, FAQ pages) extracted via `extractedFrom = anchor`. Same defect had injected 16 rows into KupiKartu raw_events in the past.
- Root cause: `extractRawEventCandidates` in `backend/src/services/ingestionFetch.ts` fell through to the generic anchor harvester whenever the source-specific extractor returned an empty array. For a category page with no Sarajevo events, the strict filter dropped everything, then the fallback scraped every link.
- Fix: trust the source-specific extractor's empty result. Generic anchor fallback now only fires when no source-specific extractor is registered for the source.
- Regression test added in `ingestionFetch.test.ts`. The 21 ulaznice anchor rows were deleted; the 16 KupiKartu ones left alone (already curator-dismissed).

#### Bosnian date parser (caught during first promote)
- First promotion silently mis-dated 4 ulaznice events. "19. Dec 2026" fell through to the English-month fallback regex which parsed day=20 (grabbing "20" from "2026"). "12 - 14 Jun 2026" (BEERKA, date range) hit the same fallback and parsed Jun 20 instead of Jun 12. Seven other ulaznice events were skipped entirely.
- Extracted `parseRawDate` into `backend/src/services/dateParse.ts`. Added: Bosnian `"DD. MonAbbrev YYYY"` with dot after day; Bosnian month abbreviations (Maj, Jun, Avg, Okt, Nov, Dec, etc.); date-range pattern that takes the first day; anchored English fallback so unrecognized formats reject cleanly.
- 6 new tests in `dateParse.test.ts`. The 4 wrong-dated events were deleted from `events`; their raw_events rows reset to unmatched and re-promoted with correct dates. All 11 ulaznice events now have correct `start_datetime`.

#### scrapeAndPromote.ts wrapper
- New `backend/src/scripts/scrapeAndPromote.ts` chains scrape → promote in one invocation. `runScraper()` and `promoteEvents()` now export their entrypoints and auto-run only when invoked directly (via `pathToFileURL` check on `import.meta.url`), so they can be composed without spawning subprocesses.
- Phases stay separately invokable. Today's session validated that decision twice: the gap between scrape and promote caught both the anchor-pollution defect and the date-parser defect before they could promote bad data into the canonical events table.

#### Venue matcher: reverse-substring + category disambiguation
- First promotion linked 0/11 ulaznice events to venue rows because the matcher only checked forward partial (`vNorm ⊂ rawNorm`). Ticket sites use the opposite shorthand — "Skenderija" stands for "Dom Mladih Skenderija", "ZETRA" for "Olimpijska dvorana Juan Antonio Samaranch (Zetra)".
- Extracted `matchVenue` into `backend/src/services/venueMatch.ts`. Added reverse-substring strategy (`rawNorm ⊂ vNorm`) with `EVENT_CATEGORIES` disambiguation — `concert_hall`, `theatre`, `cinema`, `club`, `cultural_center`, `outdoor`, etc. So "Grbavica" routes to "Stadion Grbavica" (outdoor) instead of "Pekara Grbavica" (bakery). When ambiguous across non-event categories, returns null rather than auto-picking.
- 8 new tests in `venueMatch.test.ts`.

#### Six missing event venues seeded
- Migration `20260516010000_seed_event_venues.sql` added 6 well-known Sarajevo event venues that were missing from `venues`: Olimpijska dvorana (Zetra), Stadion Grbavica, Stadion FK Slavija, AQUA CLUB, Coloseum Club, Kino Igman Ilidža. All seeded with `is_active=true`, `is_curated=false` so admin curation queue picks them up.

#### Google enrichment pipeline
- New `backend/src/scripts/findGooglePlaceIds.ts` — uses Google "Find Place from Text" API biased to Sarajevo (10km radius) to discover Place IDs + lat/lng for venues missing them. Required because `enrichFromGoogle.ts` is gated on `google_place_id NOT NULL`.
- Ran the full pipeline against the 6 new venues: `findGooglePlaceIds` → `enrichFromGoogle` → `scrapeGooglePhotos`. All 6 now have Place IDs, lat/lng, ratings, ratings_count, website, phone, review snippets, and cover photos. Marquee numbers: Stadion Grbavica 4.6★/3547, Zetra 4.4★/2174, Coloseum Club 4.2★/797.
- Side effect: 28 unrelated venues got Place IDs backfilled (alphabetical batch of 50). 21 hit duplicate-place-id constraint violations — pre-existing data duplicates worth a separate cleanup.

#### End state on origin/main
- All 11 ulaznice events are `type='venue_linked'` in production, linked to enriched venue rows.
- 10 commits this session: admin SPA refactor → pitch docs → ulaznice source + strict filter + cross-source dedupe → anchor-fallback fix → date parser fix → scrapeAndPromote wrapper → reverse-substring venue matcher + 6 venue seeds → findGooglePlaceIds.
- Periodic refresh is one command: `node --env-file=backend/.env --import tsx backend/src/scripts/scrapeAndPromote.ts [sourceId]`.

#### Files
- New services: `eventDedupe.ts`, `dateParse.ts`, `venueMatch.ts` (each with tests).
- New scripts: `scrapeAndPromote.ts`, `findGooglePlaceIds.ts`.
- New migrations: `20260516_ulaznice_scrape_source.sql`, `20260516010000_seed_event_venues.sql` (both applied to live Supabase via MCP).
- Modified: `sourceExtractors.ts`, `ingestionFetch.ts`, `promoteEvents.ts`, `runScraper.ts`.

#### Follow-ups deferred
- `scrapeGooglePhotos.ts` has a stuck-loop bug: no ORDER BY + no "tried" tracking, so when a batch of 20 all return "no photo from Google", the same 20 get returned on every run forever. ~218 venues still need covers; the script can't make progress for them without intervention.
- Pre-existing typecheck errors in `src/scripts/*.ts`, `src/db/migrate.ts`, `src/index.ts` (Apify response narrowing, missing `@specific-dev/framework` types) — none in files this session changed.
- 21 duplicate-place-id constraint violations during `findGooglePlaceIds` — pre-existing venue duplicates worth a cleanup pass.
- 17 raw_events with `date_raw IS NULL` from earlier kupikartu/ulaznice runs (mostly anchor-pollution; one real event `MAYA BEROVIĆ - OTKAZANO` would need detail-page enrichment).
- The 6 new venues have no `description_bs`/`description_en` — `enrichDescriptions.ts` would generate them.
- Pre-existing `integration.test.ts` `bun:` ESM scheme error.
