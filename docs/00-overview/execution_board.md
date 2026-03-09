# Execution Board

This is the structured planning and delivery tracker for Hype.

Use this document to track:
- active milestone
- epics
- backlog
- in-progress work
- implemented work
- blockers
- near-term sequencing

This is the planning board.

It complements, but does not replace:
- `docs/project_ledger.md` for chronological work history
- `docs/00-overview/master_roadmap.md` for the long-range sequence
- `docs/05-dev-ops/next_milestone.md` for the current milestone statement

## Status legend

- `Backlog`: agreed work, not started
- `Planned`: defined enough to start soon
- `In Progress`: actively being implemented
- `Blocked`: cannot proceed until a dependency is resolved
- `Done`: implemented or documented enough to move out of active planning
- `Deferred`: intentionally postponed

## Current milestone

`Stabilize the mobile prototype into a reliable v0.1 app`

Primary goal:
- make the current app stable enough to validate real product behavior
- align the app with the live Supabase backend
- stop relying on prototype-only assumptions for new work

## Active architectural position

Current default assumptions:
- the live Supabase project is the canonical backend architecture
- the mobile app is still a prototype frontend being aligned to that backend
- adapter layers are temporary stabilization tools, not the final contract
- Expo local development plus EAS should replace Natively
- Vercel should serve browser previews, not primary mobile runtime duties

## Epics

### E1. Mobile stability

Goal:
- remove repeated runtime crashes, render loops, and broken route behavior

Status:
- `In Progress`

### E2. Schema alignment

Goal:
- align frontend reads and display assumptions with the live Supabase schema

Status:
- `In Progress`

### E3. User-state migration

Goal:
- move prototype-local user state out of AsyncStorage and into canonical Supabase tables where appropriate

Status:
- `Planned`

### E4. Home/work environment transition

Goal:
- use home machine for runtime/builds and work machine for browser preview and planning

Status:
- `Planned`

### E5. Ingestion and scraper pipeline

Goal:
- operationalize scraping and ingestion on top of `scrape_sources`, `raw_events`, and related moderation flows

Status:
- `Backlog`

### E6. Submission, ownership, and admin flows

Goal:
- expose venue claims, submissions, event submissions, and moderation capabilities in product surfaces

Status:
- `Backlog`

### E7. Code quality and simplification

Goal:
- reduce prototype-generated complexity, duplication, and avoidable drift

Status:
- `Planned`

## Current sprint board

### In Progress

#### E1-P1. Route stability pass

- Status: `In Progress`
- Scope:
  - Home
  - Explore
  - Tonight
  - Saved
  - Profile
  - Event detail
  - Venue detail
  - Series detail
- Notes:
  - repeated callback initialization bugs have been found and fixed across several routes
  - remaining runtime issues should be treated as stabilization-first work

#### E2-P1. Frontend schema-alignment pass

- Status: `In Progress`
- Scope:
  - `venues` field normalization
  - `daily_specials` field normalization
  - shared adapter strategy during transition
- Notes:
  - see `docs/03-architecture/schema_to_ui_contract.md`
  - see `docs/03-architecture/live_supabase_assessment.md`

### Planned next

#### E3-P1. Favorites migration

- Status: `Planned`
- Goal:
  - replace AsyncStorage-based saved venues with Supabase `favorites`
- Plan:
  - `docs/03-architecture/favorites_migration_plan.md`

#### E3-P2. Taste profile migration

- Status: `Planned`
- Goal:
  - replace AsyncStorage taste profile with `profiles.taste_moods`
- Plan:
  - `docs/03-architecture/profile_taste_migration_plan.md`

#### E4-P1. Home machine transition

- Status: `Planned`
- Goal:
  - move active development from Natively to Expo/EAS on the home machine
- Plan:
  - `docs/05-dev-ops/home_work_transition_checklist.md`

#### E7-P1. Code quality baseline

- Status: `Planned`
- Goal:
  - turn current quality audit findings into tracked cleanup work
- Plan:
  - `docs/08-reference/code_quality_audit_2026_03_09.md`
  - `docs/05-dev-ops/quality_guardrail_plan.md`

## Backlog

### High priority

#### B1. Consolidate saved-state key strategy

- Status: `Backlog`
- Problem:
  - the app uses multiple storage key naming styles for favorites and saved state
- Desired outcome:
  - one canonical saved-state strategy during transition, then backend-backed persistence

#### B2. Canonical Supabase client cleanup

- Status: `Backlog`
- Problem:
  - duplicate or fragmented Supabase client usage still exists in the repo structure
- Desired outcome:
  - one clear frontend client surface

#### B3. Environment variable cleanup

- Status: `Backlog`
- Problem:
  - public config and API keys need a cleaner home for long-term development and deployment
- Desired outcome:
  - documented env strategy for Expo, Vercel, and backend use

### Medium priority

#### B4. AI planner persistence alignment

- Status: `Backlog`
- Goal:
  - align planner behavior with live `ai_plans`

#### B5. Submission flow surfacing

- Status: `Backlog`
- Goal:
  - expose event and venue submission flows in product surfaces

#### B6. Venue claim flow surfacing

- Status: `Backlog`
- Goal:
  - expose venue owner claim flows against `venue_claims`

### Later

#### B7. Scraper orchestration plan

- Status: `Backlog`
- Goal:
  - define end-to-end ingestion flow using live scraper tables and backend orchestration

#### B8. Admin and moderation surfaces

- Status: `Backlog`
- Goal:
  - define admin workflow and implementation surface for review queues and moderation

#### B9. Public web and city pulse expansion

- Status: `Deferred`
- Goal:
  - build outward-facing web and richer city-intelligence surfaces after core app and data stability

#### B10. Translation and encoding cleanup

- Status: `Backlog`
- Goal:
  - repair mojibake and user-facing string corruption

#### B11. Platform duplication reduction

- Status: `Backlog`
- Goal:
  - collapse near-identical `.tsx` and `.ios.tsx` files where behavior is effectively shared

#### B12. Quality audit automation

- Status: `Backlog`
- Goal:
  - automate recurring checks for oversized screens, encoding issues, hardcoded config, and persistence drift

## Implemented recently

### Done in the current phase

- docs operating system
- project ledger
- repo napkin
- repo-native role docs
- master roadmap
- schema-to-UI contract documentation
- query surface map
- live Supabase assessment
- first schema-alignment adapter pass
- several route stability fixes across detail screens and Explore
- home/work transition checklist

## Blockers and risks

### R1. Expo runtime package mismatch

- Status: `Blocked until fixed on home machine`
- Problem:
  - AsyncStorage native module mismatch is currently breaking saved/profile flows in Expo
- Action:
  - align dependency versions using Expo-compatible install flow on the home machine

### R2. Natively copy/paste workflow

- Status: `Active risk`
- Problem:
  - manual file syncing makes it easy for the runtime to lag behind the real repo
- Action:
  - move off Natively as soon as home-machine Expo flow is working

### R3. Frontend/backend maturity gap

- Status: `Active risk`
- Problem:
  - live Supabase is ahead of the current app, so old prototype assumptions still cause friction
- Action:
  - keep aligning frontend code to canonical backend fields

## Next two implementation waves

### Wave 1

1. finish route stability
2. fix Expo AsyncStorage environment issue
3. complete current schema-alignment pass

### Wave 2

1. migrate favorites to Supabase
2. migrate taste profile to Supabase
3. document env variables and deployment settings

## Maintenance rule

Update this board when:
- a new workstream becomes real
- a backlog item changes status
- a milestone shifts
- a major architectural assumption changes

Do not use this board as a daily diary.

Use `project_ledger.md` for the day-by-day narrative.
