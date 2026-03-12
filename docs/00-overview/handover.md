# Handover

This document is the high-signal cross-session and cross-agent handoff for Hype.

Use it when:
- another agent picks up work
- switching from work computer to home machine
- resuming after a long gap
- onboarding a new contributor

## Current project state

Hype is in a `stabilize + align` phase.

That means:
- the app already has meaningful route and product coverage
- the live Supabase backend is more mature than the current frontend
- the main work right now is reliability, alignment, and simplification

The project should not be treated as feature-complete.

It should also not be treated as an empty prototype anymore.

## Resume here first

If you are continuing work on the home machine, resume with this exact focus:
- use `docs/05-dev-ops/home_machine_verification_checklist.md` as the concrete execution script for the verification pass
- confirm whether `C:\Users\haris.daul\.codex-machine.toml` exists on the home machine and, if not, create it from `../machine-home.example.toml` in the workspace root before assuming home-machine capabilities
- confirm `backend/.env` exists and that `SUPABASE_SERVICE_ROLE_KEY` is filled in before trying backend ingestion or live reconciliation work
- verify the new Supabase favorites flow with a real authenticated session: sign in, save and unsave a venue from the venue detail screen, then confirm the Saved venues tab reflects the change
- verify the new taste-profile flow with a real authenticated session: sign in, change selected moods in Profile, reload, and confirm the selection persists from `profiles.taste_moods`
- verify auth refresh behavior: after signing in or out from Profile, confirm Saved and Profile update without forcing a full app restart
- continue the shared-screen simplification pass on the largest remaining routes, with Explore now partly collapsed and Tonight already moved onto shared helpers
- treat Venue detail as already on the shared-route pattern; the next large non-tab cleanup targets are Event detail and Series detail
- keep handover, execution board, and project ledger in sync as route simplification changes file ownership or the current stabilization story
- keep the Hype map on the dependency-free web embed path unless a future requirement justifies reintroducing a heavier web map library

Most relevant changed surfaces:
- `app/(tabs)/saved.tsx`
- `app/(tabs)/saved.ios.tsx`
- `components/saved/SavedTabs.tsx`
- `components/saved/SavedVenueCard.tsx`
- `components/saved/SavedEventCard.tsx`
- `components/saved/SavedBadgeCard.tsx`
- `components/saved/SavedEmptyState.tsx`
- `components/saved/SwipeDeleteAction.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/profile.ios.tsx`
- `components/profile/ProfileAuthCard.tsx`
- `components/profile/ProfileAccountCard.tsx`
- `components/profile/ProfileMoodSection.tsx`
- `components/profile/ProfileSettingsSection.tsx`
- `components/profile/ProfileSignOutModal.tsx`
- `app/venue/[id].tsx`
- `components/venue/VenueDetailHeader.tsx`
- `components/venue/VenueHoursSection.tsx`
- `components/venue/VenueActionButtons.tsx`
- `components/venue/VenueDetailTabs.tsx`
- `components/venue/VenueInfoSection.tsx`
- `components/venue/VenueEventsSection.tsx`
- `components/venue/VenueSpecialsSection.tsx`
- `utils/favorites.ts`
- `utils/favoritesErrors.ts`
- `utils/venueDetailData.ts`
- `utils/venueDetailScreen.ts`
- `tests/venueDetailScreen.test.ts`
- `utils/profileData.ts`
- `utils/profileScreen.ts`
- `utils/savedData.ts`
- `utils/savedScreen.ts`
- `utils/savedEventsStorage.ts`
- `tests/favorites.test.ts`
- `tests/savedScreen.test.ts`
- `tests/savedEventsStorage.test.ts`
- `utils/profileTaste.ts`
- `utils/authSession.ts`
- `tests/profileTaste.test.ts`
- `tests/profileScreen.test.ts`
- `docs/03-architecture/source_types_and_scrape_config.md`
- `docs/03-architecture/source_priority_and_cadence.md`
- `docs/03-architecture/dedupe_and_promotion_policy.md`
- `docs/03-architecture/source_seeding_strategy.md`
- `docs/03-architecture/facebook_source_policy.md`
- `docs/03-architecture/media_enrichment_policy.md`
- `docs/03-architecture/operator_review_workflow.md`
- `docs/03-architecture/initial_source_inventory.md`
- `docs/03-architecture/raw_intake_enrichment_plan.md`
- `docs/03-architecture/parse_preview_workflow.md`
- `docs/03-architecture/promotion_workflow.md`
- `docs/03-architecture/venue_matching_strategy.md`
- `docs/03-architecture/canonical_event_update_policy.md`
- `docs/03-architecture/venue_seed_reconciliation.md`
- `docs/03-architecture/events_series_reconciliation.md`
- `docs/03-architecture/daily_specials_reconciliation.md`
- `backend/sql/initial_scrape_sources_seed.sql`
- `backend/sql/ingestion_operator_queries.sql`
- `backend/sql/venue_reconciliation_queries.sql`
- `backend/sql/events_series_reconciliation_queries.sql`
- `backend/sql/daily_specials_reconciliation_queries.sql`
- `backend/src/services/ingestionFetch.ts`
- `backend/src/services/parsePreview.ts`
- `backend/src/services/sourceDetailEnrichment.ts`
- `backend/src/services/sourceExtractors.ts`
- `backend/src/services/rawEvents.ts`
- `backend/tests/ingestionFetch.test.ts`
- `backend/tests/parsePreview.test.ts`
- `backend/tests/sourceDetailEnrichment.test.ts`
- `backend/tests/sourceExtractors.test.ts`
- `app/(tabs)/(home)/index.tsx`
- `app/(tabs)/(home)/index.ios.tsx`
- `utils/homeWeather.ts`
- `utils/imageSource.ts`
- `components/ImageWithPlaceholder.tsx`
- `tests/homeWeather.test.ts`
- `tests/imageSource.test.ts`
- `tests/appRoutes.test.ts`
- `app/(tabs)/tonight.tsx`
- `app/(tabs)/tonight.ios.tsx`
- `components/tonight/TonightScreenContent.tsx`
- `components/tonight/TonightEventCard.tsx`
- `components/tonight/TonightPlannerModal.tsx`
- `components/tonight/TonightVoteModal.tsx`
- `utils/tonightScreen.ts`
- `utils/tonightData.ts`
- `utils/tonightHelpers.ts`
- `tests/tonightHelpers.test.ts`
- `app/(tabs)/explore.tsx`
- `app/(tabs)/explore.ios.tsx`
- `components/explore/ExploreSearchSection.tsx`
- `components/explore/ExploreControls.tsx`
- `components/explore/ExploreVenueList.tsx`
- `components/explore/ExploreMenuList.tsx`
- `components/explore/ExploreFilterModal.tsx`
- `utils/exploreScreen.ts`
- `utils/exploreHelpers.ts`
- `utils/exploreData.ts`
- `tests/exploreHelpers.test.ts`
- `docs/04-product/design_direction_brief.md`
- `docs/04-product/pencil_prompt_pack.md`

## Canonical sources of truth

Read in this order:

1. `docs/00-overview/execution_board.md`
2. `.claude/napkin.md`
3. `docs/project_ledger.md`
4. `docs/00-overview/session_start_protocol.md`

For backend truth:
- `docs/03-architecture/live_supabase_assessment.md`
- `docs/03-architecture/initial_source_inventory.md`

For long-range sequencing:
- `docs/00-overview/master_roadmap.md`

For the shortest "what remains" synthesis:
- `docs/00-overview/program_map.md`

For the concrete home-machine verification sequence:
- `docs/05-dev-ops/home_machine_verification_checklist.md`

For design-direction pickup on the home machine:
- `docs/04-product/design_direction_brief.md`
- `docs/04-product/pencil_prompt_pack.md`

## Current architecture position

- live Supabase is the canonical backend
- frontend is being aligned to that backend
- adapter layers are temporary transition tools
- AsyncStorage is still present in the app but should not remain the long-term architecture for canonical user state
- home machine should become the main Expo/EAS/Git environment
- work machine remains useful for planning, docs, and browser-based preview
- helper-only modules should not live under `app/` because Expo Router will treat them as routes

## Current planning system

- `execution_board.md`
  - structured planning source of truth
- `project_ledger.md`
  - chronological narrative of work done
- `.claude/napkin.md`
  - recurring rules and operational memory
- `session_start_protocol.md`
  - default startup order for every session

## Active workstreams

Main active work:
- mobile runtime stabilization
- frontend schema alignment against live Supabase
- shared-screen simplification across the largest tab routes, with Home, Explore, Tonight, Saved, and Profile now all moved onto shared helper/render structures and Venue detail now following the same route-orchestration pattern, leaving the next cleanup wave to focus on Event detail, Series detail, and remaining encoding cleanup
- transition off Natively
- setup for future user-state migration away from AsyncStorage
- ingestion architecture now also carries an explicit Instagram strategy: Apify first, self-hosted headless fallback later, official connected-account APIs long term
- backend ingestion now supports live source listing plus first-pass raw intake for `direct_html` sources, but still needs runtime verification and source-aware parsing improvements
- backend ingestion now includes source-aware extractors for Pozorista, AllEvents, and KupiKartu event-link patterns, with generic anchor harvesting still used as fallback for other `direct_html` sources
- backend ingestion now prefers `scrape_config.list_url` over `source_url` for `direct_html` fetches when a dedicated listing page is configured
- backend ingestion now also honors `scrape_config.list_urls` and `scrape_config.category_urls` for multi-page direct-html intake when those arrays are configured
- the first repo-native source inventory now recommends Pozorista, AllEvents, and KupiKartu as the initial active sources, with Entrio, FiestaLama, CineStar, and first Instagram accounts seeded later or kept inactive
- a repo-native SQL seed now exists for the first `scrape_sources` set, matching the current source inventory and recommended activation order
- raw intake now carries first-pass date, venue, and image metadata into `raw_events` when the first source-aware extractors can see it, and operator SQL queries now exist for inspecting seeded sources, scrape runs, and fresh raw rows
- raw intake now also performs limited detail-page enrichment for AllEvents and KupiKartu before insert, so the first active sources can land richer `raw_events` rows without waiting for the later parse stage
- backend ingestion now also has a first parse-preview stage for recent `raw_events`, exposed through admin read routes and operator queries so the next session can inspect candidate quality before any canonical promotion work
- the publishable-data rulebook is now repo-native too: promotion workflow, venue matching, and canonical event update policy are documented, so the next implementation passes can move from raw candidates toward canonical events without relying on ad hoc instincts
- the existing 1233-venue seed is now explicitly recognized as a primary import candidate, but live venue-row reconciliation still needs to be run on the home machine because the repo only contains schema/policy/index exports, not the current live venue data
- `events`, `event_series`, and `daily_specials` now also have repo-native reconciliation docs and query packs, because we know their live schema shape but still need real home-machine row-level inspection before promotion or UI-cleanup decisions should be treated as settled

Important next planned work:
- favorites migration to Supabase `favorites`
- taste-profile migration to `profiles.taste_moods`
- home-machine live-data reconciliation for `venues`, `events`, `event_series`, and `daily_specials`
- home-machine Pencil exploration for the first Hype Home visual direction, then convergence in Figma later

Immediate resume sequence:
1. use `npm.cmd` or `npx.cmd` from PowerShell on the home machine
2. rerun the web app on the fixed working port
3. spot-check Home, Explore, Tonight, Saved, and Profile after the latest simplification commits
4. if the shared routes stay stable, continue reducing oversized route files by moving route-local orchestration and remaining bulky render sections into shared components or helper modules
   with Venue detail complete, the next best route targets are `app/event/[id].tsx` and `app/series/[id].tsx`
5. update `handover.md`, `execution_board.md`, and `project_ledger.md` in the same slice whenever route ownership or current blockers materially change

## Important known realities

### Environment split

Work machine:
- may lack Git, Node, npm, or other normal tooling
- is still useful for docs, planning, and some edits

Home machine:
- now has Git set up
- now has Node installed
- should become the real runtime and build environment
- should have a local machine marker at `C:\Users\haris.daul\.codex-machine.toml` with `machine_name = "home"`
- backend admin env template now exists at `backend/.env`; the real service-role key should be filled there, not in the Expo app root `.env`
- PowerShell may require `npm.cmd` and `npx.cmd`
- `expo start` and web preview can boot on fixed ports
- `npm.cmd install` now succeeds after removing Hype's unused `react-leaflet` dependency and replacing the web map with an iframe/Leaflet embed
- next setup targets after stabilization are EAS and Vercel

### Temporary Natively workaround

Because Natively could not create new source files easily, some temporary compatibility logic was mirrored into:
- `utils/errorLogger.ts`

The real architectural home for that logic is:
- `utils/dataAdapters.ts`

This workaround should be removed once Natively is no longer in the loop.

### Latest stabilization pass

The latest verified code changes did three important things:
- moved Home weather mood updates to a functional merge helper in `utils/homeWeather.ts`
- extracted image-source normalization to `utils/imageSource.ts`
- removed `app/integrations/supabase/` helper files so Expo Router no longer misclassifies them as routes

The latest home-machine rebuild pass added four more important outcomes:
- rebuilt Home as a shared `components/home/HomeScreen.tsx` implementation composed from shared tab-shell primitives instead of a monolithic screen
- added `TabScreen`, `SectionHeader`, and `ContentState` so rebuilt tab screens have a cleaner common shell
- made `ImageWithPlaceholder` explicitly web-safe, which removed the remaining Home/web `Maximum update depth exceeded` loop in real browser verification
- confirmed against live Supabase that Home is stable on web, `profiles.taste_moods` persists, and venue save/unsave updates the Saved screen through `favorites`

The latest route-simplification passes added four more important outcomes:
- removed Hype's React 19 install blocker by replacing the web map dependency with a lightweight embed path
- moved Tonight planner types, moods, segments, and share text into `utils/tonightScreen.ts`
- collapsed Explore to one real shared route implementation, with `app/(tabs)/explore.ios.tsx` now only re-exporting the shared screen
- extracted Explore's route metadata, pure filter helpers, and Supabase loading helpers into `utils/exploreScreen.ts`, `utils/exploreHelpers.ts`, and `utils/exploreData.ts`

The latest Explore cleanup pass added three more important outcomes:
- decomposed the shared Explore route into focused UI sections under `components/explore/` for search, controls, venue rendering, menu rendering, and the filter modal
- fixed the Explore price-level display mojibake at the helper layer so the rebuilt route no longer emits broken `€` strings
- added explicit regression coverage for Explore helper behavior in `tests/exploreHelpers.test.ts`

The latest Tonight cleanup pass added four more important outcomes:
- collapsed `app/(tabs)/tonight.ios.tsx` to a re-export so Tonight now has one real shared route implementation
- moved Tonight event loading and venue loading into `utils/tonightData.ts`
- moved Tonight segment, urgency, ticket, price, and vote-selection helpers into `utils/tonightHelpers.ts`
- decomposed Tonight rendering into focused UI sections under `components/tonight/` and added helper regression coverage in `tests/tonightHelpers.test.ts`

The latest Saved cleanup pass added four more important outcomes:
- moved Saved venue, event, and badge loading out of the route and into `utils/savedData.ts`
- moved Saved screen types, formatting helpers, and event-id parsing into `utils/savedScreen.ts` and `utils/savedEventsStorage.ts`
- decomposed Saved rendering into focused UI sections under `components/saved/`
- added targeted regression coverage for Saved helper behavior in `tests/savedScreen.test.ts` and `tests/savedEventsStorage.test.ts`

The latest Profile cleanup pass added four more important outcomes:
- moved Profile auth/session and taste-loading logic out of the route and into `utils/profileData.ts`
- moved Profile mood/theme/demo-badge config into `utils/profileScreen.ts`
- decomposed Profile rendering into focused UI sections under `components/profile/`
- added targeted regression coverage for Profile helper behavior in `tests/profileScreen.test.ts`

The latest Venue detail cleanup pass added four more important outcomes:
- moved Venue detail Supabase reads and favorite-state mutations out of the route and into `utils/venueDetailData.ts`
- moved Venue detail localized copy, hours math, event-date formatting, and mood metadata into `utils/venueDetailScreen.ts`
- decomposed Venue detail rendering into focused UI sections under `components/venue/` and switched it onto the shared `ImageWithPlaceholder` path
- added targeted regression coverage for Venue detail helper behavior in `tests/venueDetailScreen.test.ts`

New regression coverage now exists for:
- weather mood merging
- image-source normalization
- accidental helper files under the Expo Router `app/` tree

### Current quality risks

Known cleanup targets include:
- oversized screen files
- remaining oversized shared route files whose behavior sections still need extraction
- remaining oversized non-tab detail screens, especially Event detail and Series detail
- mojibake and encoding-damaged strings
- direct AsyncStorage use scattered across screens
- inconsistent saved-state naming

See:
- `docs/08-reference/code_quality_audit_2026_03_09.md`

## Live backend position

The live Supabase project already supports:
- canonical discovery tables
- profiles
- favorites
- badges and user badges
- tips
- AI plans
- submissions and venue claims
- scraper-related ingestion tables
- RLS and useful indexes

This means future work should align the frontend to the backend, not redesign the backend around prototype assumptions.

## Recommended default behavior for any new agent

1. do not assume the frontend model is canonical
2. check live Supabase assessment before proposing backend changes
3. treat execution board as the structured plan
4. update the ledger after meaningful work
5. update the execution board if statuses or sequencing change
6. update napkin only when a rule is reusable

## If picking up implementation work

Start with:
- runtime bug reproduction or current blocker
- execution board item IDs
- relevant migration or architecture plan docs

For the next session, the most likely concrete start point is:
- E1-P1 route stability and further screen simplification
- B10 translation and encoding cleanup

Do not start by expanding product scope unless the stabilization and alignment state is understood first.
