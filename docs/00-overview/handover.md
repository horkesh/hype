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
- continue narrower follow-up cleanup instead of another broad structural sweep, with the main tab stack, detail screens, shared map surface, planner support, filter support, profile settings, venue actions, and shared chrome already on the helper-plus-components pattern
- keep the remaining Tonight follow-up on the new deterministic mock-plan path, with `utils/tonightMockPlans.ts` now owning planner sample generation so `utils/tonightScreen.ts` can stay focused on shared types, labels, and share text
- keep the favorites migration on the helper-owned storage path too, with `utils/favoritesStorage.ts` now owning legacy key reads, mirrored writes, and remote-missing calculations so `utils/favorites.ts` can stay focused on auth plus Supabase orchestration
- keep the runtime logging cleanup on the helper-owned utility path too, with `utils/errorLoggerUtils.ts` now owning mute rules, log-argument stringification, and stack parsing so `utils/errorLogger.ts` can stay focused on platform wiring and log forwarding
- keep the Saved support cleanup on the helper-owned content path too, with `utils/savedContent.ts` now owning venue/event/badge card shaping so `components/saved/SavedTabContent.tsx` can stay focused on loading, empty-state branching, and delegating to list/grid sections
- treat encoding cleanup and other long-tail consistency work as the next priority, starting from shared translation/config sources like `contexts/AppContext.tsx`, `utils/profileScreen.ts`, and `utils/savedScreen.ts` before touching leaf UI files
- keep handover, execution board, and project ledger in sync as route simplification changes file ownership or the current stabilization story
- keep the Hype map on the dependency-free web embed path unless a future requirement justifies reintroducing a heavier web map library

Most relevant changed surfaces:
- `app/(tabs)/_layout.tsx`
- `components/FloatingTabBar.tsx`
- `components/tabbar/FloatingTabButton.tsx`
- `utils/floatingTabBar.ts`
- `tests/floatingTabBar.test.ts`
- `app/(tabs)/saved.tsx`
- `app/(tabs)/saved.ios.tsx`
- `components/saved/SavedTabs.tsx`
- `components/saved/SavedVenueCard.tsx`
- `components/saved/SavedEventCard.tsx`
- `components/saved/SavedBadgeCard.tsx`
- `components/saved/SavedEmptyState.tsx`
- `components/saved/SavedTabContent.tsx`
- `components/saved/SavedVenueList.tsx`
- `components/saved/SavedEventList.tsx`
- `components/saved/SavedBadgeGrid.tsx`
- `components/saved/SwipeDeleteAction.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/profile.ios.tsx`
- `components/profile/ProfileAuthCard.tsx`
- `components/profile/ProfileAccountCard.tsx`
- `components/profile/ProfileMoodSection.tsx`
- `components/profile/ProfileSettingsSection.tsx`
- `components/profile/ProfileSignOutModal.tsx`
- `hooks/useProfileController.ts`
- `app/venue/[id].tsx`
- `app/event/[id].tsx`
- `app/series/[id].tsx`
- `components/event/EventDetailHero.tsx`
- `components/event/EventVenueAndBadges.tsx`
- `components/event/EventPurchaseSection.tsx`
- `components/series/SeriesDetailHero.tsx`
- `components/series/SeriesDetailActions.tsx`
- `components/series/SeriesEventsSection.tsx`
- `components/series/SeriesEventDateGroup.tsx`
- `components/series/SeriesEventCard.tsx`
- `components/series/SeriesEventMoodBadges.tsx`
- `components/venue/VenueDetailHeader.tsx`
- `components/venue/VenueHoursSection.tsx`
- `components/venue/VenueActionButtons.tsx`
- `components/venue/VenueDetailTabs.tsx`
- `components/venue/VenueInfoSection.tsx`
- `components/venue/VenueEventsSection.tsx`
- `components/venue/VenueSpecialsSection.tsx`
- `utils/dataAdapters.ts`
- `utils/favorites.ts`
- `utils/favoritesStorage.ts`
- `utils/favoritesErrors.ts`
- `utils/errorLogger.ts`
- `utils/errorLoggerUtils.ts`
- `utils/eventDetailData.ts`
- `utils/eventDetailScreen.ts`
- `utils/seriesDetailData.ts`
- `utils/seriesDetailScreen.ts`
- `utils/venueDetailData.ts`
- `utils/venueDetailScreen.ts`
- `tests/dataAdapters.test.ts`
- `tests/eventDetailScreen.test.ts`
- `tests/seriesDetailScreen.test.ts`
- `tests/venueDetailScreen.test.ts`
- `utils/savedSeriesStorage.ts`
- `tests/savedSeriesStorage.test.ts`
- `utils/profileData.ts`
- `utils/profileScreen.ts`
- `utils/savedData.ts`
- `utils/savedScreen.ts`
- `utils/savedContent.ts`
- `utils/savedEventsStorage.ts`
- `contexts/AppContext.tsx`
- `tests/favorites.test.ts`
- `tests/favoritesStorage.test.ts`
- `tests/errorLoggerUtils.test.ts`
- `tests/savedScreen.test.ts`
- `tests/savedContent.test.ts`
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
- `components/home/HomeScreen.tsx`
- `components/home/HomeHeroSection.tsx`
- `components/home/HomeMoodSection.tsx`
- `components/home/HomeFeaturedCafeSection.tsx`
- `components/home/HomeEventsSection.tsx`
- `components/home/HomeContentSections.tsx`
- `components/home/HomeCardRail.tsx`
- `components/home/HomeEventCard.tsx`
- `components/home/HomeSeriesCard.tsx`
- `utils/homeHeroState.ts`
- `utils/homeData.ts`
- `utils/homeScreenContent.ts`
- `utils/homeEventsSection.ts`
- `utils/homeScreen.ts`
- `utils/homeWeather.ts`
- `utils/imageSource.ts`
- `components/ImageWithPlaceholder.tsx`
- `tests/homeWeather.test.ts`
- `tests/homeScreen.test.ts`
- `tests/homeScreenContent.test.ts`
- `tests/homeEventsSection.test.ts`
- `tests/imageSource.test.ts`
- `tests/appRoutes.test.ts`
- `app/(tabs)/tonight.tsx`
- `app/(tabs)/tonight.ios.tsx`
- `components/tonight/TonightScreenContent.tsx`
- `components/tonight/TonightEventCard.tsx`
- `components/tonight/TonightEventImage.tsx`
- `components/tonight/TonightEventBadges.tsx`
- `components/tonight/TonightEventMeta.tsx`
- `components/tonight/TonightEventActions.tsx`
- `components/tonight/TonightActionButtons.tsx`
- `components/tonight/TonightSegmentTabs.tsx`
- `components/tonight/TonightEventList.tsx`
- `components/tonight/TonightPlannerModal.tsx`
- `components/tonight/TonightPlannerSetup.tsx`
- `components/tonight/TonightPlannerResults.tsx`
- `components/tonight/TonightModalStack.tsx`
- `components/tonight/TonightVoteModal.tsx`
- `components/tonight/TonightVoteEventCard.tsx`
- `components/tonight/TonightVoteSetup.tsx`
- `components/tonight/TonightVoteResults.tsx`
- `components/tonight/TonightVoteResultCard.tsx`
- `hooks/useTonightController.ts`
- `components/Map.tsx`
- `components/Map.web.tsx`
- `utils/mapEmbed.ts`
- `tests/mapEmbed.test.ts`
- `utils/tonightScreen.ts`
- `utils/tonightMockPlans.ts`
- `utils/tonightData.ts`
- `utils/tonightHelpers.ts`
- `utils/tonightVote.ts`
- `tests/tonightHelpers.test.ts`
- `tests/tonightScreen.test.ts`
- `tests/tonightMockPlans.test.ts`
- `tests/tonightVote.test.ts`
- `app/(tabs)/explore.tsx`
- `app/(tabs)/explore.ios.tsx`
- `components/explore/ExploreSearchSection.tsx`
- `components/explore/ExploreScreenBody.tsx`
- `components/explore/ExploreControls.tsx`
- `components/explore/ExploreVenueList.tsx`
- `components/explore/ExploreMenuList.tsx`
- `components/explore/ExploreFilterModal.tsx`
- `components/explore/ExploreResultsState.tsx`
- `components/explore/ExploreVenueCard.tsx`
- `components/explore/ExploreVenueMoodBadges.tsx`
- `components/explore/ExploreMenuFilterChips.tsx`
- `components/explore/ExploreMenuCard.tsx`
- `utils/exploreScreen.ts`
- `utils/exploreHelpers.ts`
- `utils/exploreData.ts`
- `utils/exploreLists.ts`
- `hooks/useExploreController.ts`
- `tests/exploreHelpers.test.ts`
- `tests/exploreLists.test.ts`
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
- shared-screen simplification across the largest tab routes, with Home, Explore, Tonight, Saved, and Profile now all moved onto shared helper/render structures, Home support now using extracted data/render sections too, Venue detail plus Event detail plus Series detail following the same route-orchestration pattern, and the shared cross-platform map surface now using one helper-owned embed builder
- the planned broad frontend cleanup wave is complete across Tonight planner support, Explore filter shell, Profile settings, Venue actions, shared tab chrome, Tonight list support, and saved-state helper consistency, so frontend maintenance has shifted to narrower follow-up cleanup like shared translation/config encoding repair and regression prevention rather than another broad structural sweep
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
   with Home support and the main detail screens complete, the next best targets are the remaining mixed-support screens and the still-unfixed encoding cleanup outside rebuilt surfaces
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

The latest Tonight support cleanup pass added four more important outcomes:
- split the remaining bulky Tonight support surfaces into focused components for action buttons, segment tabs, event-list framing, planner setup, and planner results under `components/tonight/`
- made `components/tonight/TonightScreenContent.tsx` and `components/tonight/TonightPlannerModal.tsx` orchestration-heavy instead of mixed UI monoliths
- moved planner map marker generation into deterministic helper logic in `utils/tonightHelpers.ts` so the mock planner map no longer jitters across renders
- cleaned the touched Tonight mood, segment, and share copy and added targeted regression coverage in `tests/tonightScreen.test.ts`

The latest Tonight planner cleanup pass added four more important outcomes:
- moved planner mood-option shaping, group-size defaults, stop-row shaping, and shared planner map-region defaults into `utils/tonightPlanner.ts`
- split planner modal/header/setup/results support into `TonightModalHeader`, `TonightPlannerMoodGrid`, `TonightPlannerGroupSizePicker`, `TonightPlanStopList`, and `TonightPlannerActionRow`
- made `TonightPlannerSetup.tsx`, `TonightPlannerResults.tsx`, and `TonightPlannerModal.tsx` thinner orchestration shells over those extracted sections
- added targeted regression coverage in `tests/tonightPlanner.test.ts` so the planner helper layer stays stable while the remaining mixed-support cleanup moves to Explore/Profile/Venue

The latest Tonight vote cleanup pass added four more important outcomes:
- split `components/tonight/TonightVoteModal.tsx` into focused vote-setup, vote-results, and vote-result-card sections under `components/tonight/`
- moved selected-event-to-result-row mapping and vote-creation gating into `utils/tonightVote.ts` so the vote flow now has a testable helper layer instead of inline modal logic
- kept the modal itself as a thin header and state-switch shell, with the create-vote path and vote-results path rendered by dedicated subcomponents
- added targeted regression coverage in `tests/tonightVote.test.ts` so vote-result shaping and the two-event create threshold stay stable while the remaining Tonight support cleanup continues

The latest Tonight shell cleanup pass added three more important outcomes:
- split the remaining modal composition out of `components/tonight/TonightScreenContent.tsx` into `components/tonight/TonightModalStack.tsx`
- moved the vote-only event-card adapter into `components/tonight/TonightVoteEventCard.tsx` so the screen-content shell no longer owns a large inline render function
- left `TonightScreenContent` focused on action chrome, segment tabs, event-list framing, and modal visibility wiring instead of mixing all screen-level sub-surfaces together

The latest Tonight event-card cleanup pass added three more important outcomes:
- split `components/tonight/TonightEventCard.tsx` into focused image, badge, meta, and action support sections under `components/tonight/`
- removed the inline image fallback and button-row wiring from the card so the card shell now reads as one clear composition surface instead of a leaf monolith
- kept the Tonight event interactions unchanged while making the remaining card-level support surfaces easier to reuse from list and vote flows

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

The latest Profile settings cleanup pass added three more important outcomes:
- moved settings copy, language options, mood-title copy, badge-count copy, and sign-out labels into `utils/profileSettings.ts`
- split the settings surface into `ProfileSettingsCard.tsx` and `ProfileOptionToggleGroup.tsx`, leaving `ProfileSettingsSection.tsx` as orchestration over helper-owned settings data
- cleaned the touched Profile route copy by routing badge-count, sign-out, and mood-title text through the shared settings helper

The latest Venue detail cleanup pass added four more important outcomes:
- moved Venue detail Supabase reads and favorite-state mutations out of the route and into `utils/venueDetailData.ts`
- moved Venue detail localized copy, hours math, event-date formatting, and mood metadata into `utils/venueDetailScreen.ts`
- decomposed Venue detail rendering into focused UI sections under `components/venue/` and switched it onto the shared `ImageWithPlaceholder` path
- added targeted regression coverage for Venue detail helper behavior in `tests/venueDetailScreen.test.ts`

The latest Venue action cleanup pass added three more important outcomes:
- moved venue action-button and delivery-button definitions into `utils/venueActions.ts`
- split the action surface into `VenuePrimaryActionGroup.tsx` and `VenueDeliveryActionGroup.tsx`, leaving `VenueActionButtons.tsx` as dispatch orchestration over helper-owned action data
- added targeted regression coverage in `tests/venueActions.test.ts` so action ordering and saved-state icon behavior stay stable

The latest persistence consistency cleanup pass added three more important outcomes:
- moved saved-event and saved-series storage reads/writes fully behind `utils/savedEventsStorage.ts` and `utils/savedSeriesStorage.ts`
- kept both `saved_events` and `savedEvents` event keys in sync during the transition so rebuilt surfaces stop depending on whichever legacy key happened to be used earlier
- removed the remaining duplicated AsyncStorage read/write logic from `utils/eventDetailData.ts`, `utils/savedData.ts`, and `utils/seriesDetailData.ts`, leaving persistence ownership in the storage helpers

The latest Event detail cleanup pass added four more important outcomes:
- moved Event detail Supabase reads and saved-event persistence out of the route and into `utils/eventDetailData.ts`
- moved Event detail localized title/description, price/date/ticket formatting, and emoji metadata into `utils/eventDetailScreen.ts`
- decomposed Event detail rendering into focused UI sections under `components/event/` and switched it onto the shared `ImageWithPlaceholder` path
- expanded `utils/savedEventsStorage.ts` so event-save parsing and toggling now live in one reusable helper layer, with targeted regression coverage in `tests/eventDetailScreen.test.ts` and `tests/savedEventsStorage.test.ts`

The latest Series detail cleanup pass added four more important outcomes:
- moved Series detail Supabase reads and saved-series persistence out of the route and into `utils/seriesDetailData.ts`
- moved Series detail localized title/description, countdown/date formatting, event grouping, and emoji metadata into `utils/seriesDetailScreen.ts`
- decomposed Series detail rendering into focused UI sections under `components/series/` and switched it onto the shared `ImageWithPlaceholder` path
- added shared `savedSeries` storage helpers plus targeted regression coverage in `tests/seriesDetailScreen.test.ts` and `tests/savedSeriesStorage.test.ts`

The latest Series events cleanup pass added three more important outcomes:
- split `components/series/SeriesEventsSection.tsx` into focused date-group, event-card, and mood-badge sections under `components/series/`
- removed inline ticket-button and mood-badge wiring from the section so the top-level series-events surface is now mostly grouping orchestration
- kept the existing series event formatting helpers in `utils/seriesDetailScreen.ts` while making the remaining list rendering more reusable and easier to scan

The latest Home support cleanup pass added four more important outcomes:
- moved Home Supabase reads and weather fetching out of `components/home/HomeScreen.tsx` and into `utils/homeData.ts`
- cleaned the mojibake in `utils/homeScreenContent.ts` and normalized Home series countdown logic to local calendar dates instead of raw date-string parsing
- decomposed Home rendering into focused `components/home/` sections for hero, moods, featured cafe, and event/series rails
- refreshed regression coverage in `tests/homeScreenContent.test.ts` so cleaned copy and countdown behavior stay stable

The latest Home events cleanup pass added four more important outcomes:
- split `components/home/HomeEventsSection.tsx` into shared `HomeCardRail`, `HomeEventCard`, and `HomeSeriesCard` support components so the section is now orchestration-heavy instead of a mixed rail/card monolith
- moved Home event-card and series-card display copy into `utils/homeEventsSection.ts` so localized title, venue, price, and countdown behavior live in a testable helper layer
- kept web/native rail behavior shared behind one thin component instead of repeating the same event and series layout branches inside the section
- added targeted regression coverage in `tests/homeEventsSection.test.ts` so event-card and series-card display formatting stay stable while the remaining Home support cleanup continues

The latest Home shell cleanup pass added three more important outcomes:
- split `components/home/HomeScreen.tsx` into a thinner screen shell plus `components/home/HomeContentSections.tsx` for the visible Home sections
- moved Home static-load orchestration and weather-driven hero decision logic behind `utils/homeScreen.ts` and test-safe `utils/homeHeroState.ts`
- added targeted regression coverage in `tests/homeScreen.test.ts` so the weather-to-hero-message fallback and suggested-mood behavior stay stable

The latest shared tab-bar cleanup pass added four more important outcomes:
- moved FloatingTabBar route matching, indicator sizing, and theme-surface color decisions into `utils/floatingTabBar.ts`
- split tab-button rendering into `components/tabbar/FloatingTabButton.tsx` so `components/FloatingTabBar.tsx` is now mostly shared-chrome orchestration
- aligned the tab bar with the repo `useTheme()` hook instead of mixing in a separate navigation-theme source
- added targeted regression coverage for tab-bar helper behavior in `tests/floatingTabBar.test.ts`

The latest shared chrome cleanup pass added three more important outcomes:
- split the remaining FloatingTabBar support into `components/tabbar/FloatingTabIndicator.tsx` and `components/tabbar/FloatingTabButtons.tsx`, leaving `components/FloatingTabBar.tsx` as thinner shell orchestration
- moved Tonight event-card view-model shaping into `utils/tonightContent.ts` and split the list surface into `TonightEventListState.tsx` plus `TonightEventCards.tsx`
- added targeted regression coverage in `tests/tonightContent.test.ts` so the Tonight list view-model layer stays stable while the final consistency sweep cleans the remaining touched copy

The latest encoding cleanup pass added four more important outcomes:
- cleaned shared translation and label strings in `contexts/AppContext.tsx` so app-wide copy stops inheriting mojibake from the main translation source
- cleaned shared mood and badge config in `utils/profileScreen.ts` and `utils/savedScreen.ts` so rebuilt Profile and Saved surfaces now read stable emoji and currency output from helper-owned config
- updated `tests/profileScreen.test.ts` and `tests/savedScreen.test.ts` to assert the repaired helper output directly, keeping future encoding regressions closer to the source layer
- kept the route and component layer unchanged for this pass by fixing the source-of-truth context/helper modules first instead of patching leaf UI files

The latest adapter cleanup pass added three more important outcomes:
- removed the old Natively-era normalization workaround from `utils/errorLogger.ts`, leaving that module focused on runtime log forwarding instead of UI data compatibility
- moved Explore, Saved, and Venue detail normalization back onto the canonical `utils/dataAdapters.ts` module
- added `tests/dataAdapters.test.ts` so the shared venue and daily-special adapter layer now has direct regression coverage instead of being validated only indirectly through route tests

The latest Saved cleanup pass added three more important outcomes:
- moved Saved tab labels and empty-state copy into `utils/savedScreen.ts`, cleaning another pocket of damaged user-facing text at the helper layer instead of inside the route
- added `components/saved/SavedTabContent.tsx`, leaving `app/(tabs)/saved.tsx` focused on loading, auth refresh, and navigation callbacks instead of render branching
- expanded `tests/savedScreen.test.ts` so localized tab labels and empty-state routing/copy are now covered directly

The latest Explore controller cleanup pass added four more important outcomes:
- moved Explore search, filter, refresh, and tab-loading state into `hooks/useExploreController.ts`, so the route no longer owns the full debounced-search and load-effect stack inline
- added `components/explore/ExploreScreenBody.tsx`, leaving `app/(tabs)/explore.tsx` focused on shell selection and prop wiring instead of holding the full screen markup
- moved menu-filter label shaping into `utils/exploreHelpers.ts` and added direct regression coverage for it in `tests/exploreHelpers.test.ts`
- cleaned the touched Explore emoji test fixtures in `tests/exploreScreen.test.ts` and `tests/exploreLists.test.ts` so the Explore helper surface no longer carries damaged literal assertions

The latest Tonight controller cleanup pass added four more important outcomes:
- moved Tonight segment, planner, vote, refresh, and navigation controller state into `hooks/useTonightController.ts`, so the route no longer owns the full planner/vote state machine inline
- moved planner-label and vote-label shaping into `utils/tonightScreen.ts`, leaving the route with less hardcoded controller copy
- replaced the old `Math.random()` vote-link mock with deterministic helper-owned link generation in `utils/tonightVote.ts`
- cleaned the touched Tonight emoji/copy assertions in `tests/tonightScreen.test.ts` and expanded `tests/tonightVote.test.ts` so the deterministic vote-link behavior is covered directly

The latest Profile controller cleanup pass added four more important outcomes:
- moved Profile auth/session/taste controller state into `hooks/useProfileController.ts`, so the route no longer owns the full auth flow inline
- moved sign-in, sign-up, sign-out, and auth-required alert copy into `utils/profileSettings.ts`, keeping route-owned alert text aligned with the rest of the helper-owned settings copy
- cleaned and localized `components/profile/ProfileSignOutModal.tsx` so the modal no longer carries hardcoded damaged Bosnian strings
- expanded `tests/profileSettings.test.ts` so the touched modal/auth copy is covered directly

The latest Home helper cleanup pass added three more important outcomes:
- normalized `utils/homeScreenContent.ts` onto clean code-point escapes for mood emoji and helper copy, keeping the source helper layer readable and consistent with the rest of the rebuilt app
- cleaned `tests/homeScreenContent.test.ts` and `tests/homeScreen.test.ts` so Home helper regressions now assert the repaired output instead of preserving old mojibake literals
- confirmed the Home helper pack still passes under Expo web export; Metro logged a cache-deserialization fallback once during export, but the build recovered and completed successfully

The latest Tonight mock-plan cleanup pass added three more important outcomes:
- moved Tonight planner sample generation into `utils/tonightMockPlans.ts`, leaving `utils/tonightScreen.ts` focused on shared types, labels, moods, segments, and share text
- replaced the remaining `Math.random()` venue picking in the mock planner with stable seed-based selection derived from mood and plan index
- added targeted regression coverage in `tests/tonightMockPlans.test.ts` so future planner cleanup cannot quietly reintroduce nondeterministic sample output

The latest favorites storage cleanup pass added three more important outcomes:
- moved legacy favorite-key reads, mirrored writes, and remote-missing calculations into `utils/favoritesStorage.ts`, leaving `utils/favorites.ts` focused on auth and Supabase orchestration
- kept the current dual-key migration behavior intact while making the storage path testable without importing the React Native runtime
- added targeted regression coverage in `tests/favoritesStorage.test.ts` so storage-key drift and mirrored writes now have direct Node-side coverage

The latest runtime logging cleanup pass added three more important outcomes:
- moved mute rules, log-argument stringification, source-location extraction, and caller-info parsing into `utils/errorLoggerUtils.ts`, leaving `utils/errorLogger.ts` focused on runtime log forwarding and platform wiring
- kept the existing runtime logging behavior intact while making the pure shaping logic testable without importing Expo or React Native
- added targeted regression coverage in `tests/errorLoggerUtils.test.ts` so future cleanup can keep shrinking `errorLogger.ts` without losing the stack/muting behavior

The latest Saved content cleanup pass added three more important outcomes:
- moved Saved venue, event, and badge card shaping into `utils/savedContent.ts`, leaving `components/saved/SavedTabContent.tsx` focused on loading and empty-state branching
- split the Saved content branches into `SavedVenueList.tsx`, `SavedEventList.tsx`, and `SavedBadgeGrid.tsx`, so the top-level Saved content shell no longer renders all three list/grid variants inline
- added targeted regression coverage in `tests/savedContent.test.ts` so localized card titles, date/price text, mood badges, and badge earned/progress state are now covered directly

The latest Explore support cleanup pass added four more important outcomes:
- decomposed `components/explore/ExploreFilterModal.tsx` into focused filter sections for chips, price, open-now toggle, and actions under `components/explore/`
- decomposed `components/explore/ExploreControls.tsx` into focused mood-strip, category-grid, and tab-switcher sections under `components/explore/`
- cleaned the shared Explore mood/category lookup emoji data in `utils/exploreScreen.ts` so rebuilt Explore support surfaces no longer depend on encoded lookup artifacts
- added targeted regression coverage for Explore lookup data in `tests/exploreScreen.test.ts` alongside the refreshed helper coverage in `tests/exploreHelpers.test.ts`

The latest Explore filter-shell cleanup pass added three more important outcomes:
- split the remaining filter-modal shell into `components/explore/ExploreModalHeader.tsx` and `components/explore/ExploreFilterContent.tsx`
- made `components/explore/ExploreFilterModal.tsx` a thin modal shell over extracted header, content, and action sections
- kept the filter-selection behavior on the existing helper-owned Explore path while reducing one more support file to orchestration-first structure

The latest Explore results cleanup pass added four more important outcomes:
- split `components/explore/ExploreVenueList.tsx` and `components/explore/ExploreMenuList.tsx` into focused result-state, venue-card, venue-mood, menu-filter, and menu-card sections under `components/explore/`
- moved Explore list-only helpers into `utils/exploreLists.ts` so venue mood-badge selection and daily-special price formatting now live in a testable helper layer
- cleaned the touched venue-card image fallback path while replacing the old encoded marker emoji source with a stable shared icon string
- added targeted regression coverage in `tests/exploreLists.test.ts` so mood-badge selection and menu price formatting stay stable while the remaining Explore support cleanup continues

The latest map cleanup pass added four more important outcomes:
- moved shared map HTML generation, popup escaping, and default-region config into `utils/mapEmbed.ts`
- rewrote both `components/Map.tsx` and `components/Map.web.tsx` to use the same helper-owned embed builder instead of carrying duplicated marker and HTML generation logic
- removed the unused native routing-machine payload from the map surface, because the current app only uses static planner markers and has no real route-calculation callers
- added targeted regression coverage in `tests/mapEmbed.test.ts` so popup escaping and marker output stay stable across both platforms

New regression coverage now exists for:
- weather mood merging
- image-source normalization
- accidental helper files under the Expo Router `app/` tree

### Current quality risks

Known cleanup targets include:
- oversized screen files
- remaining oversized shared route files whose behavior sections still need extraction
- broader encoding cleanup outside the rebuilt/touched surfaces, with the shared translation/config source layer now partially cleaned
- any future regressions that reintroduce hardcoded copy or route-level persistence into rebuilt screens
- mojibake and encoding-damaged strings
- long-tail persistence cleanup that still belongs in helper layers rather than UI files

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
