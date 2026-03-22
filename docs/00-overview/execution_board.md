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
- `In Progress`

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
- `In Progress`

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
  - Home web/runtime verification is now green after the shared Home rebuild and web-safe image path changes
- current route-stability work has shifted toward simplification of the largest shared routes, support surfaces, and detail surfaces, with Home support plus Venue detail plus Event detail plus Series detail now moved onto extracted data/helper/render modules
- the shared map surface now also uses one helper-owned embed path across native and web, so current cleanup focus is narrowing toward the remaining oversized support components and encoding cleanup

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

- Status: `In Progress`
- Goal:
  - replace AsyncStorage-based saved venues with Supabase `favorites`
- Plan:
  - `docs/03-architecture/favorites_migration_plan.md`
- Progress:
  - shared Supabase favorites helper added
  - Saved venues tab now reads venue favorites from Supabase for authenticated users
  - Venue detail save/unsave now targets `favorites`
  - current first-pass UX is `sign in to save`
  - saved events remain on AsyncStorage until their backend model is confirmed

#### E3-P2. Taste profile migration

- Status: `In Progress`
- Goal:
  - replace AsyncStorage taste profile with `profiles.taste_moods`
- Plan:
  - `docs/03-architecture/profile_taste_migration_plan.md`
- Progress:
  - shared profile taste helper added
  - Profile screens now read and write `profiles.taste_moods` for authenticated users
  - current first-pass UX is `sign in to personalize`
  - home-machine verification is still needed for the authenticated flow and any required profile bootstrap behavior

#### E4-P1. Home machine transition

- Status: `In Progress`
- Goal:
  - move active development from Natively to Expo/EAS on the home machine
- Plan:
  - `docs/05-dev-ops/home_work_transition_checklist.md`
- Progress:
  - Git setup on the home machine is complete
  - Node and npm are installed, but PowerShell requires `npm.cmd` and `npx.cmd` because `npm.ps1` is blocked by execution policy
  - `expo start` can boot on this machine when run on a fixed port
  - `npm.cmd install` now succeeds after removing Hype's old `react-leaflet` dependency path
  - web preview is stable enough for the current simplification and verification loop
  - remaining work is finishing EAS and Vercel preview flow after the frontend cleanup wave settles

#### E7-P1. Code quality baseline

- Status: `In Progress`
- Goal:
  - turn current quality audit findings into tracked cleanup work
- Plan:
  - `docs/08-reference/code_quality_audit_2026_03_09.md`
  - `docs/05-dev-ops/quality_guardrail_plan.md`
- Progress:
  - Home, Saved, and Profile platform wrappers are already collapsed
  - Home now also uses `utils/homeData.ts` and focused `components/home/` sections instead of a large mixed data/render support component
  - Saved now uses shared data/persistence helpers and extracted render components instead of one large route-local implementation
  - Profile now uses shared auth/data helpers and extracted render components instead of one large mixed auth/settings/taste route
  - Tonight now has one shared route implementation with extracted planner/vote/event rendering, data loaders, and helper logic
  - Explore now has one shared route implementation with extracted route metadata, filter helpers, data loaders, and focused render components under `components/explore/`
  - Venue detail now uses `utils/venueDetailData.ts`, `utils/venueDetailScreen.ts`, and focused `components/venue/` sections instead of one mixed fetch/save/render route
  - Event detail now uses `utils/eventDetailData.ts`, `utils/eventDetailScreen.ts`, focused `components/event/` sections, and shared saved-event storage helpers instead of one mixed fetch/save/render route
  - Series detail now uses `utils/seriesDetailData.ts`, `utils/seriesDetailScreen.ts`, focused `components/series/` sections, and shared saved-series storage helpers instead of one mixed fetch/save/render route
  - the shared cross-platform map now uses `utils/mapEmbed.ts` so native and web share one embed/marker builder instead of carrying duplicated HTML-generation paths
  - Home events support now uses `components/home/HomeCardRail.tsx`, `components/home/HomeEventCard.tsx`, `components/home/HomeSeriesCard.tsx`, and `utils/homeEventsSection.ts` so the remaining Home section is orchestration-heavy too
  - Tonight vote support now uses `utils/tonightVote.ts` plus focused `components/tonight/` vote sections, so the modal itself is mostly a state-switch shell instead of another mixed support monolith
  - Explore results support now uses `utils/exploreLists.ts` plus focused venue/menu card and state sections, so both result tabs are orchestration-heavy instead of list-and-card monoliths
  - Tonight screen shell now uses `components/tonight/TonightModalStack.tsx` and `components/tonight/TonightVoteEventCard.tsx`, so the last large inline modal wiring path is out of `TonightScreenContent.tsx`
  - Home screen shell now uses `components/home/HomeContentSections.tsx` plus helper-owned weather/hero orchestration, and Tonight event cards now use focused image/badge/meta/action sections instead of one leaf monolith
  - Series events support now uses focused date-group, event-card, and mood-badge sections under `components/series/`, so the last large series list surface is thinner too
  - Tonight planner support now uses `utils/tonightPlanner.ts` plus extracted modal header, mood-grid, group-size, stop-list, and action-row sections, so the remaining planner files are mostly orchestration instead of one bulky support stack
  - Explore filter support now also uses extracted modal-header and filter-content sections, so `ExploreFilterModal.tsx` is down to shell orchestration over helper-owned filter behavior
  - Profile settings now use helper-owned copy plus extracted settings-card and option-toggle sections, so the route and settings surface no longer carry hardcoded settings copy
  - Venue actions now use helper-owned action definitions plus extracted primary and delivery action groups, so `VenueActionButtons.tsx` is down to dispatch orchestration
  - shared chrome now also uses extracted tab-indicator and tab-button-row sections, and Tonight list rendering now uses helper-owned event-card view models plus extracted list-state/card-list sections
  - saved-event and saved-series persistence now live behind shared storage helpers, with legacy event keys kept in sync so rebuilt surfaces no longer duplicate AsyncStorage logic
- the planned broad frontend cleanup wave is complete; follow-on work should now be narrower consistency cleanup, future regression prevention, and remaining non-rebuilt-surface cleanup instead of another cross-app structural sweep
- shared translation and helper-owned config cleanup has started in `contexts/AppContext.tsx`, `utils/profileScreen.ts`, and `utils/savedScreen.ts`, with matching regression assertions added so encoding fixes land at the source layer instead of in leaf screens
- the old Natively-era adapter workaround has been removed from `utils/errorLogger.ts`, with Explore, Saved, and Venue detail normalization callers now back on `utils/dataAdapters.ts` and covered by direct adapter tests
- Saved tab labels and empty-state routing/copy now live in `utils/savedScreen.ts` plus `components/saved/SavedTabContent.tsx`, so the route is back to orchestration and the touched Saved copy is helper-owned
- Explore search, filter, and refresh controller state now lives in `hooks/useExploreController.ts` plus `components/explore/ExploreScreenBody.tsx`, so the route itself is down to shell selection and prop wiring
- Tonight planner, vote, refresh, and navigation controller state now lives in `hooks/useTonightController.ts`, and the mock vote-link path is deterministic through `utils/tonightVote.ts`
- Tonight mock planner samples now live in `utils/tonightMockPlans.ts`, and the remaining sample venue selection is deterministic instead of depending on `Math.random()`
- Profile auth/session/taste controller state now lives in `hooks/useProfileController.ts`, and route-owned auth/modal alerts now come from `utils/profileSettings.ts`
- Home helper/test literals are now cleaned in `utils/homeScreenContent.ts`, `tests/homeScreenContent.test.ts`, and `tests/homeScreen.test.ts`, so the Home regression suite no longer preserves mojibake
- favorites legacy-key reads and mirrored writes now live in `utils/favoritesStorage.ts`, leaving `utils/favorites.ts` focused on auth and Supabase orchestration with direct storage-helper coverage in `tests/favoritesStorage.test.ts`
- runtime log muting, stringification, and stack parsing now live in `utils/errorLoggerUtils.ts`, leaving `utils/errorLogger.ts` focused on platform wiring with direct helper coverage in `tests/errorLoggerUtils.test.ts`
- Saved venue/event/badge card shaping now lives in `utils/savedContent.ts`, leaving `components/saved/SavedTabContent.tsx` focused on loading and empty-state branching with direct helper coverage in `tests/savedContent.test.ts`
- Explore result and modal branching now lives in `ExploreResultsSection.tsx` and `ExploreModalStack.tsx`, leaving `ExploreScreenBody.tsx` focused on top-level composition over search, controls, results, and modal sections
- source-layer Bosnian helper copy is now cleaned further in `utils/profileSettings.ts`, `utils/tonightScreen.ts`, `utils/homeScreenContent.ts`, and `utils/savedScreen.ts`, with adjacent Node-side assertions updated to enforce the corrected output

### Planned next — Presentation Restyle

#### E8. Tourism board presentation restyle + AI integration

- Status: `Done`
- Goal:
  - restyle the Hype app for a tourism board presentation: replace all emoji usage with glass/glow UI, add real AI integration (planner, search, city pulse, surprise me, translation), generate proper image assets
- Spec: `docs/superpowers/specs/2026-03-17-presentation-restyle-design.md`
- Plan: `docs/superpowers/plans/2026-03-17-presentation-restyle.md`
- Branch: `feat/presentation-restyle` (merged to main)
- Architecture:
  - glass containers via rgba backgrounds (expo-blur deferred to polish phase)
  - flippable editorial cards via `react-native-reanimated` v3
  - 8 Supabase Edge Functions as AI proxy layer (GPT-4.1 mini/nano, Gemini Flash, Claude Haiku)
  - SSE streaming for Tonight Planner via direct `fetch()` to Edge Function URL
  - multi-provider tiered model routing (cheapest model per task)
- What was delivered:
  - glass design token system + 6 reusable glass components
  - 8 edge functions + 5 client AI helpers + 3 backend scripts
  - Home: photo hero, AI city pulse, surprise me, kafu randomizer, hidden gems rail
  - Explore: AI smart search concierge, live camera translation, glass chips
  - Tonight: real AI planner with SSE streaming, glass tabs
  - All detail screens + Saved + Profile: glass badges, containers, mood chips, action buttons
- Completed post-implementation:
  - all 8 edge functions deployed to Supabase
  - DB migrations applied (city_pulse table created, existing tables confirmed)
  - AI API secrets set (OpenAI, Anthropic, Google AI, Google Maps)
  - all 5 core edge functions tested live and confirmed working
  - `/simplify` pass completed: parallelized enrichment N+1, debounced SSE re-renders, added pulse cache cleanup
- Remaining: end-to-end in-app demo walkthrough

#### E12. AI-generated hero images

- Status: `Done`
- Goal:
  - replace the static gradient hero with AI-generated Sarajevo photographs that match the current context
- Architecture:
  - `generate-hero-image` edge function with multi-model fallback (Imagen 4.0 Fast → Imagen 3.0 → Gemini Flash)
  - context-aware prompts: time of day, weather conditions, holiday calendar
  - generated images uploaded to Supabase Storage (`hero-images` bucket)
  - server-side cache in `city_pulse.hero_image_url` (3h TTL)
  - client-side cache in `utils/ai/heroImage.ts` (3h TTL)
- What was delivered:
  - 1 edge function + 1 client helper
  - `HomeHeroPhoto` accepts dynamic `heroImageUrl` prop
  - `HomeContentSections` fetches hero image on mount alongside weather
  - first load: ~8s (image generation), cached loads: ~0.5s
  - gradient fallback preserved for loading/error states

#### E13. Standard bottom tab bar

- Status: `Done`
- Goal:
  - replace floating pill tab bar with industry-standard full-width bottom tab bar
- What was delivered:
  - switched from `Stack` + `FloatingTabBar` overlay to Expo Router `Tabs` navigator
  - dark bar (`#1A1A1A`), gold active (`#D4A056`), gray inactive (`#98989D`)
  - no content overlap — content flows above the bar naturally
  - all 5 tabs verified on web

#### E15. Rebrand Hype → Look - Sarajevo

- Status: `Done`
- Goal:
  - rebrand from "Hype" to "Look" across the entire codebase
  - "Look - Sarajevo" header format supports future city expansions
- What was delivered:
  - 20 files updated: header, app config, translations, backend user-agents, edge functions, admin, tests
  - header shows "Look" in serif gold + "- Sarajevo" in gray sans-serif
  - 177/178 tests passing

#### E14. Warm cinematic visual style

- Status: `Done`
- Goal:
  - match the app's visual feel to the warm cinematic travel-magazine aesthetic of reference screenshots
- What was delivered:
  - DM Serif Display for headings (hero, section, card titles), DM Sans for body
  - glass tokens warmed to amber tint, image overlays use warm amber-black gradients
  - event detail info rows restyled: gold icons, uppercase labels, bold values, separator lines
  - accent badge visibility fix (white text on stronger gold)
  - 12 files touched, 1 new font dependency

#### E11. Dark mode only conversion

- Status: `Done`
- Goal:
  - convert app from cream/beige light theme to Spotify-inspired dark-mode-only
- Plan: `~/.claude/plans/linear-churning-mist.md`
- Architecture:
  - single dark palette: `#121212` background, `#1E1E1E` card, `#D4A056` accent
  - `useTheme()` collapsed to static constant (no dynamic theme resolution)
  - theme toggle removed from Profile
  - glass tokens flattened from light/dark to single dark-only set
  - tab bar white border bug fixed
- What was delivered:
  - 25+ component files updated across 6 waves
  - all `isDark` ternaries collapsed, all `useColorScheme` references removed
  - `commonStyles.ts` now flat `colors` export with `surface`, `surfaceHover`, `textTertiary` tokens
  - ErrorBoundary, LoadingButton, Map, MoodChip, ListItem, SkeletonLoader updated for dark
  - 3 test files updated for new token structure
  - 177/178 tests passing

#### E9. Venue data quality pipeline

- Status: `Done`
- Goal:
  - verify venue categories, scrape photos, enrich with Google data, generate grounded AI descriptions
- What was delivered:
  - 1,226/1,226 venues with BS-first AI descriptions (GPT-4.1 mini, grounded in Google reviews)
  - 958 venues with Google Maps cover photos (96%)
  - 162 miscategorized venues auto-corrected against Google Maps types
  - 960 venues with Google reviews/editorial data
  - Admin venue editor (Vite + React, `admin/` directory)
- Key scripts: `verifyCategoriesVsGoogle.ts`, `enrichFromGoogle.ts`, `enrichDescriptions.ts`, `scrapeGooglePhotos.ts`

#### E10. Event scraping pipeline

- Status: `Done`
- Goal:
  - populate events from web scrapers and Instagram
- What was delivered:
  - 3 web scrapers working (Pozorista, AllEvents, KupiKartu) → 93 raw events
  - Sarajevo city filter on KupiKartu
  - Instagram pipeline built (Apify → Claude Haiku → raw_events), tested end-to-end
  - `parse-instagram` edge function schema fixed
  - `runScraper.ts` standalone script working
  - `enrichKupikartuDetails.ts` — detail page scraper for KupiKartu (descriptions, dates, images)
  - `enrichAllSources.ts` — detail page scraper for AllEvents.in (JSON-LD) and Pozorista.ba (datetime attrs)
  - `promoteEvents.ts` — venue matching + date parsing + category inference + dedup
  - 15 KupiKartu navigation false positives dismissed, 1 cancelled event dismissed, 2 undatable events dismissed
  - 76 raw_events promoted to canonical events table (47 first pass + 29 second pass)
  - 21 past events deactivated
  - 70 upcoming events live in the app (Home rail + Tonight tab verified)
- What's next:
  - Top up Apify credits for full Instagram run
  - Re-scrape sources periodically for new events

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
- Progress:
  - repo-native ingestion workflow doc added
  - ADR added for Supabase-plus-backend ingestion ownership
  - backend ingestion route scaffold added for future source listing and manual source runs
  - endpoint/data contract added for `scrape_sources`, `raw_events`, and `scrape_log`
  - `GET /ingestion/sources` now has an env-driven live-read implementation path for backend/admin use
  - `POST /ingestion/run/:sourceId` now creates a real `scrape_log` row before fetch/parser work exists
  - `POST /ingestion/run/:sourceId` now performs first-pass raw intake for `direct_html` sources, including fetch, candidate extraction, raw-event insert/skip, and `last_scraped_at` updates
  - source-aware extraction now exists ahead of generic anchor fallback for Pozorista, AllEvents, and KupiKartu event-link patterns
  - direct-html ingestion now honors source-configured list and category page URLs instead of assuming one homepage fetch
  - raw-intake enrichment, detail enrichment, and parse-preview scaffolding now exist for the first active sources
  - repo-native SQL and architecture notes now exist for reconciling live `venues`, `events`, `event_series`, and `daily_specials` before import or promotion work
  - repo-native publishability rules now exist for promotion workflow, venue matching, and canonical event updates, so the next backend wave can move toward promotion-preview logic instead of just expanding source breadth

#### B8. Admin and moderation surfaces

- Status: `Backlog`
- Goal:
  - define admin workflow and implementation surface for review queues and moderation

#### B14. Live crowd signals + trending venues

- Status: `Planned`
- Goal:
  - seed realistic check-in data and show live "Who's Here" counts on venue cards
  - add "Trending Now" rail on Home showing venues with check-in spikes in the last 2 hours
- Notes:
  - `checkins` table already exists
  - `GlassBadge` urgency variants already available for flame/count display

#### B15. Live event countdowns

- Status: `Backlog`
- Goal:
  - events happening in the next 3 hours show a live "starts in X min" countdown badge on Tonight and Home
- Notes:
  - `GlassBadge` + `EventCardFront` urgency prop already support this pattern
  - needs a timer hook and filtered Supabase query

#### B16. Weather-reactive recommendations

- Status: `Backlog`
- Goal:
  - wire live weather data into the city pulse prompt so Gemini gives weather-aware recommendations ("rain coming — grab a window seat at X")
- Notes:
  - Home already has weather integration via OpenWeather API
  - generate-pulse edge function already deployed, just needs weather param

#### B17. "Right Now" mode on Explore

- Status: `Backlog`
- Goal:
  - toggle that filters Explore to only venues currently open (using `opening_hours_json` from Google), sorted by trending or distance
- Notes:
  - `opening_hours_json` now populated for most venues via Google Places enrichment

#### B18. Data quality pipeline automation

- Status: `Backlog`
- Goal:
  - automate the verify-categories + Google-enrichment + AI-description pipeline so new venues get the same treatment automatically
  - scripts exist: `verifyCategoriesVsGoogle.ts`, `enrichFromGoogle.ts`, `enrichDescriptions.ts`, `scrapeGooglePhotos.ts`

#### B19. Clickable AI plan stops → venue/POI modals

- Status: `Backlog`
- Goal:
  - make venue stops in Surprise Me and AI Planner results tappable, opening a custom modal with full venue details (photo, description, hours, reviews, map, actions)
- Notes:
  - Surprise Me and generate-plan already return `venue_name` matched to DB venue data via `venueMap`
  - enriched stops include `venue.id` which can be used to navigate or open a detail modal
  - could reuse `VenueCardFront`/`VenueCardBack` or a simplified venue preview sheet
  - high-value UX improvement: turns AI plans from read-only text into interactive discovery

#### B9. Public web and city pulse expansion

- Status: `Deferred`
- Goal:
  - build outward-facing web and richer city-intelligence surfaces after core app and data stability

#### B10. Translation and encoding cleanup

- Status: `Active`
- Goal:
  - repair mojibake and user-facing string corruption, with rebuilt shared surfaces cleaned first
- Progress:
  - Explore helper price display has already been cleaned at the helper layer
  - app-wide translation strings in `contexts/AppContext.tsx` are now cleaned
  - helper-owned Profile and Saved config in `utils/profileScreen.ts` and `utils/savedScreen.ts` now expose clean emoji and currency output
  - regression coverage now asserts clean helper output in `tests/profileScreen.test.ts` and `tests/savedScreen.test.ts`
  - Saved tab labels and empty-state copy now also live in `utils/savedScreen.ts`, with matching helper assertions and route rendering moved into `components/saved/SavedTabContent.tsx`
  - touched Explore test literals are now clean, and helper-owned menu-filter labels now have direct coverage in `tests/exploreHelpers.test.ts`
  - touched Tonight emoji and label assertions are now clean, and deterministic mock vote-link generation is covered in `tests/tonightVote.test.ts`
  - deterministic Tonight mock-plan generation is now covered directly in `tests/tonightMockPlans.test.ts`
  - touched Profile auth and sign-out modal copy now lives in `utils/profileSettings.ts`, with direct coverage in `tests/profileSettings.test.ts`
  - Home helper tests now assert the cleaned helper output directly instead of carrying damaged literals from earlier prototype passes
  - favorites legacy-key merge and mirrored-write behavior now has direct Node-side coverage in `tests/favoritesStorage.test.ts`
  - runtime logging mute and stack-shaping behavior now has direct Node-side coverage in `tests/errorLoggerUtils.test.ts`
  - Saved venue/event/badge view-model shaping now has direct Node-side coverage in `tests/savedContent.test.ts`
  - helper-owned Bosnian diacritic cleanup is now covered directly in the touched Profile, Tonight, Home, and Saved helper tests
  - Tonight action labels (planner/vote buttons, plan-saved alert) now live in `getTonightActionLabels()` in `tonightScreen.ts` with correct diacritics
  - mock plan activity labels in `tonightMockPlans.ts` now use correct diacritics (Večera, Piće, pozorište, Izložba)
  - Home weather hero messages in `homeHeroState.ts` now use correct diacritics (Savršen, baštu, Kišovito, kafić)
  - event free-entry badge label now lives in `getEventFreeEntryLabel()` in `eventDetailScreen.ts` instead of hardcoded in the component
  - `npm test` script now exists and runs 117 tests via Node test runner with tsx
  - `formatEventDateLabel` in `homeScreenContent.ts` now uses explicit Bosnian month names instead of broken `toLocaleDateString('bs-BA')` browser output
  - `HomeCardRail` web fallback removed — events rail now scrolls horizontally on web like Hidden Gems
  - `SavedTabContent` crash fixed (missing `SAVED_MOODS` import)
  - `SavedEmptyState` button text changed from invisible white to accent color

#### B13. Adapter and compatibility cleanup

- Status: `In Progress`
- Goal:
  - keep schema-normalization and compatibility logic in one canonical helper surface instead of mirrored workaround modules
- Progress:
  - Explore, Saved, and Venue detail now read normalization helpers from `utils/dataAdapters.ts`
  - the temporary adapter duplication inside `utils/errorLogger.ts` has been removed
  - direct regression coverage now exists in `tests/dataAdapters.test.ts`

#### B11. Platform duplication reduction

- Status: `In progress`
- Goal:
  - collapse near-identical `.tsx` and `.ios.tsx` files where behavior is effectively shared, starting with rebuilt tabs

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
- Home weather-state loop mitigation
- shared tab-shell foundation (`TabScreen`, `SectionHeader`, `ContentState`)
- shared Home rebuild under `components/home/HomeScreen.tsx`
- web-safe image rendering path that removed the remaining Home render loop
- shared Home/Profile/Saved route wrappers replacing duplicated iOS shells
- shared Tonight planner helpers under `utils/tonightScreen.ts`
- shared Tonight route plus extracted helper/data/render surfaces under `utils/tonightHelpers.ts`, `utils/tonightData.ts`, and `components/tonight/`
- Tonight support surfaces now also split planner setup/results, event-list framing, segment tabs, and action buttons into focused `components/tonight/` modules, with deterministic planner-map markers and targeted `tests/tonightScreen.test.ts` coverage
- shared Saved route plus extracted helper/data/render surfaces under `utils/savedData.ts`, `utils/savedScreen.ts`, `utils/savedEventsStorage.ts`, and `components/saved/`
- shared Profile route plus extracted auth/data/render surfaces under `utils/profileData.ts`, `utils/profileScreen.ts`, and `components/profile/`
- shared Explore route plus extracted helper surfaces under `utils/exploreScreen.ts`, `utils/exploreHelpers.ts`, and `utils/exploreData.ts`
- shared Explore render sections under `components/explore/` plus helper regression coverage in `tests/exploreHelpers.test.ts`
- shared FloatingTabBar chrome now uses extracted tab-button rendering plus helper-owned route matching and indicator/theme math under `components/tabbar/` and `utils/floatingTabBar.ts`
- shared Explore support chrome now uses extracted mood/category/filter sections under `components/explore/`, with cleaned lookup emoji data in `utils/exploreScreen.ts`
- Expo Router helper-route cleanup
- regression tests for Home weather, image sources, and accidental `app/` helper files
- regression tests for shared Home copy/date/countdown helpers
- mood chip vector icons: replaced AI-generated images (opaque black backgrounds) with 12 crisp vector icons from `@expo/vector-icons` (MaterialCommunityIcons + Ionicons), tinted per mood color
- unified mood feed on Home: selecting a mood now replaces independent sections (Trending, Kafu, Hidden Gems, Events) with a single vertical feed of interleaved venues + events matching that mood; default sections restored on deselect
- centralized category label translations: `getCategoryLabel()` in `utils/categoryLabels.ts` maps all ~20 DB categories to BS/EN display labels; wired into 4 leaking components
- "Look - Sarajevo" header now acts as a home button (navigates to `/` on tap)
- hero image prompt fix: holiday context now layers on top of time-of-day instead of replacing it; cache cleared to force regeneration
- Surprise Me + AI Planner now time-of-day and holiday aware: morning plans get morning times, Bajram context woven in naturally
- font family consistency sweep: added `fontFamily` to ~30 text styles across 20 files; fixed `DMSans_600SemiBold` (not loaded) → `DMSans_500Medium`

## Blockers and risks

### R1. Expo runtime package mismatch

- Status: `Blocked until fixed on home machine`
- Problem:
  - AsyncStorage native module mismatch is currently breaking saved/profile flows in Expo
- Action:
  - align dependency versions using Expo-compatible install flow on the home machine

### R4. Home-machine install conflict

- Status: `Resolved`
- Problem:
  - Hype previously depended on `react-leaflet@4.2.1`, whose React 18 peer range blocked fresh installs under React 19 / Expo 54
- Action:
  - keep the dependency removed unless a future map requirement truly needs a React DOM mapping library again

### R5. Web render-loop root cause still not fully isolated

- Status: `Resolved in rebuilt Home`
- Problem:
  - the original Home/web `Maximum update depth exceeded` loop came from unstable frontend composition and a web-hostile image/loading path
- Action:
  - keep new shared-shell work on the rebuilt path, and do not reintroduce web-only animation/state behavior into core image/card primitives without browser verification

### R2. Natively copy/paste workflow

- Status: `Active risk`
- Problem:
  - manual file syncing makes it easy for the runtime to lag behind the real repo
- Action:
  - continue the move off Natively now that home-machine Git is set up; next unlock is a stable Expo runtime on the home machine

### R3. Frontend/backend maturity gap

- Status: `Active risk`
- Problem:
  - live Supabase is ahead of the current app, so old prototype assumptions still cause friction
- Action:
  - keep aligning frontend code to canonical backend fields

## Next two implementation waves

### Wave 1

1. focus follow-on cleanup on broader encoding issues and any untouched long-tail support surfaces, not another all-frontends structural sweep
   the planned Home/Explore/Tonight/Saved/Profile/detail/shared-chrome cleanup wave is now complete, so next work should be narrower and evidence-driven
2. keep reducing duplicated screen variants and direct persistence logic in UI files
3. continue encoding cleanup by fixing shared translation and helper/config sources before leaf screens whenever mojibake is found
4. keep collapsing temporary workaround logic back into canonical helper modules, with `utils/errorLogger.ts` already cleaned and remaining route/controller cleanup still evidence-driven

### Wave 2

1. continue shared-shell rollout to the next largest screens
2. add more targeted regression coverage around auth refresh and rebuilt tab flows
3. keep simplifying large screens and removing ad hoc persistence from UI files

## Maintenance rule

Update this board when:
- a new workstream becomes real
- a backlog item changes status
- a milestone shifts
- a major architectural assumption changes

Do not use this board as a daily diary.

Use `project_ledger.md` for the day-by-day narrative.
