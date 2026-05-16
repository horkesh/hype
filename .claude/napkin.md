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

## Pending Execution
1. **[2026-03-21] Apify Instagram — 189 venues with handles, ready to scrape**
   Do instead: once Apify credits are topped up, update `scrapeInstagram.ts` to pull from `instagram_handle` column (189 venues) instead of hardcoded lists, then run the full scrape.
2. **[2026-03-17] GlassMoodChip and GlassCategoryChip are near-duplicates**
   Do instead: in a follow-up cleanup pass, consider merging. Low urgency.
3. **[2026-05-16] Periodic event re-scrape runs automatically via GitHub Actions every 6 hours**
   Do instead: the cron lives at `.github/workflows/scrape-and-promote.yml`. It runs `scrapeAndPromote.ts → enrichAllSources.ts → enrichKupikartuDetails.ts → promoteEvents.ts → backfillEventVenues.ts` in sequence. Required repo secrets: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (set in Settings → Secrets → Actions). Manual trigger: Actions tab → "Scrape and promote events" → Run workflow. For one-off local runs (single source, debugging), still use `node --env-file=backend/.env --import tsx backend/src/scripts/scrapeAndPromote.ts [sourceId]`. Operator-only scripts (`findGooglePlaceIds`, `enrichFromGoogle`, `scrapeGooglePhotos`, `enrichDescriptions`) intentionally stay outside the cron — they hit Google APIs (cost) and need post-seed review. See `docs/05-dev-ops/cron_scraping.md`.
4. **[2026-03-21] Deactivate past events on schedule**
   Do instead: run a deactivation pass (`is_active = false` for `start_datetime < now()`) before each re-scrape or on a cron.

## Asset & Icon Conventions
1. **[2026-03-22] Use vector icons from @expo/vector-icons, not AI-generated images**
   Do instead: for small UI icons (mood chips, category chips, badges), use `MaterialCommunityIcons` or `Ionicons` from `@expo/vector-icons`. AI image generators produce opaque backgrounds, generic subjects, and can't match the app's glass/dark aesthetic. Vector icons are crisp at any size, perfectly transparent, and tint to any color.
2. **[2026-03-22] Mood chip icons are vector — `MOOD_ICONS` lives in `GlassMoodChip.tsx`**
   Do instead: when adding or changing a mood, update the `MOOD_ICONS` record in `components/glass/GlassMoodChip.tsx`. Each entry maps a `MoodId` to `{ library: 'mci' | 'ion', name: string }`. The icon tints to `glassTokens.moodColors[moodId].primary` when unselected, white when selected.

## Data Pipeline Lessons
1. **[2026-03-17] BS-first bilingual content generation**
   Do instead: always write Bosnian first from Bosnian source data, then translate to English. Never generate EN first and back-translate.
2. **[2026-03-17] Supabase REST default limit is 1000 rows**
   Do instead: always use `Prefer: count=exact` header and check `content-range` to verify you're seeing all rows. Our DB has 1,226 venues.
3. **[2026-03-17] PostgREST POST with ?select= returns existing rows instead of inserting**
   Do instead: use `requestSupabaseAdminNoContent` for bulk inserts, not `fetchSupabaseAdminJson` with `?select=` param.
4. **[2026-05-16] National sources need a *strict* Sarajevo filter — default-reject when ambiguous**
   Do instead: for BiH-wide sources (KupiKartu, Ulaznice, Pozorista), use `isStrictlySarajevo` in `backend/src/services/sourceExtractors.ts` — it returns true only on positive evidence (`sarajev` prefix, known Sarajevo venue/neighborhood, or an explicit `smallinfo` city of Sarajevo). The earlier lenient `isLikelySarajevo` defaulted to accept when no city signal was present, which leaked Tuzla/Mostar/Busovaca events. AllEvents stays URL-scoped (`/sarajevo/*`) and needs no filter. When adding a new national source, prefer an explicit per-card city signal (like Ulaznice's `smallinfo` span) and fall back to the strict heuristic only when missing.
5. **[2026-03-20] Browser `toLocaleDateString('bs-BA')` is unreliable**
   Do instead: use explicit Bosnian month/day name arrays for date formatting instead of relying on browser Intl support for `bs-BA` locale, which produces broken output like "M03" in many browsers.
6. **[2026-03-20] App is dark-mode-only — no light mode, no theme toggle**
   Do instead: use `colors` from `useTheme()` or `commonStyles.ts` for all color values. Never add `isDark` conditionals, `useColorScheme`, or light-mode color branches. The theme is always dark (`#121212` bg, `#D4A056` accent). Glass tokens are flat (no `.light`/`.dark` nesting).
7. **[2026-03-21] AI image generation uses multi-model fallback**
   Do instead: when calling Gemini for image generation, try Imagen `:predict` endpoint first (fastest), then fall back to Gemini `:generateContent` with `responseModalities: ['IMAGE']`. Model availability varies by API key tier.
8. **[2026-03-21] Tab bar is standard full-width bottom — not floating pill**
   Do instead: use Expo Router `Tabs` navigator with `tabBarStyle` for the main navigation. Do not reintroduce `FloatingTabBar` or absolute-positioned overlays.
9. **[2026-03-21] Headings use DM Serif Display, body uses DM Sans**
   Do instead: use `DMSerifDisplay_400Regular` for heroTitle, sectionHeader, and cardTitle in `designTokens.ts`. Keep `DMSans_*` for body, caption, labels, and badges. Never mix serif into small body text.
10. **[2026-03-21] Glass and overlays use warm amber tints, not cold white/black**
   Do instead: glass background is `rgba(212,160,86,0.04)`, glass border is `rgba(212,160,86,0.10)`, image overlays use `rgba(20,10,0,0.7)` not `rgba(0,0,0,0.7)`. This gives the warm cinematic feel matching the reference screenshots.
11. **[2026-03-22] Always verify Anthropic model IDs against the live API before deploying**
   Do instead: model IDs include a release date suffix — never guess it. Correct format: `claude-sonnet-4-5-20250929`, `claude-haiku-4-5-20251001`. A wrong date (e.g. `20241022`) returns a 404 that the edge function catches as `success: false`, and the client silently shows "Could not generate a plan." Always test with a direct `node` fetch to the edge function URL before assuming a model change works.
12. **[2026-03-22] All AI edge functions must be time-of-day, weather, and holiday aware**
   Do instead: every edge function that generates user-facing content (hero image, surprise-me, generate-plan, city pulse) must determine the current Sarajevo hour via `toLocaleString('en-US', { timeZone: 'Europe/Sarajevo' })`, check the holiday calendar, and layer these contexts into the prompt additively — never let holidays override the time-of-day scene.
12. **[2026-03-22] Every text style must declare fontFamily — no system font fallback**
   Do instead: when adding any `fontSize` in a `StyleSheet`, always include `fontFamily`. Use `DMSerifDisplay_400Regular` for headings (20px+), `DMSans_700Bold` for bold, `DMSans_500Medium` for semi-bold/600, `DMSans_400Regular` for regular. Never use `DMSans_600SemiBold` — it's not loaded.
13. **[2026-03-22] Venue categories must go through getCategoryLabel() before display**
   Do instead: never display `venue.category` raw in any component. Always call `getCategoryLabel(category, language)` from `utils/categoryLabels.ts`. When adding a new DB category, add it to the `CATEGORY_LABELS` record in that file.
13. **[2026-03-21] App is now "Look", not "Hype" — header shows "Look - Sarajevo"**
   Do instead: use "Look" in all user-facing text, share links, about text, and system prompts. Never reintroduce "Hype" as the brand name. The "- Sarajevo" suffix supports future multi-city expansion.
12. **[2026-03-21] Mood chip IDs differ from DB mood values — always use `moodToDbValue()`**
   Do instead: when querying venues or events by mood, always pass the chip ID through `moodToDbValue()` from `utils/homeScreenContent.ts`. The app uses Bosnian-flavored names (muzika, romantika, kultura, turista) while the DB uses English keys (live_music, romantic, culture, tourist).
13. **[2026-03-21] Website-scraped Instagram handles need spot-checking**
   Do instead: when `findInstagramHandles.ts` finds a handle from a venue website, the site may link to a parent company, platform (Wix, Glovo), or unrelated business. Always verify high-value handles (clubs, theatres) by navigating to the Instagram profile in the browser before trusting them.
14. **[2026-03-22] Category grouping logic lives in `utils/categoryLabels.ts` as `getCategoryGroup()`**
   Do instead: when mapping a display category (e.g. "bar") to the DB categories it covers (bar, pub, hookah), use `getCategoryGroup()` from `utils/categoryLabels.ts`. Don't duplicate this mapping in components.
15. **[2026-03-22] Separate fetch from client-side sort in data-loading components**
   Do instead: when a component fetches data from Supabase and also applies a client-side sort (e.g. mood boost), put the fetch in `useEffect` with only the fetch-triggering dependency (category), and the sort in `useMemo` with both the raw data and the sort key (mood). This prevents unnecessary network calls when only the sort changes.
16. **[2026-03-22] AI venue enrichment must match against ALL venues, not just the prompt subset**
   Do instead: when an edge function gives the AI a curated list of 50 venues for prompt context, the post-response venue enrichment (fuzzy name → ID matching) must search the full 1200-venue table, not just the prompt subset. The AI may return venue names that weren't in the curated list. Fetch all venues in parallel with the prompt subset to avoid an extra round-trip.
15. **[2026-03-22] Hero image prompt must explicitly ban faces**
   Do instead: AI image generators ignore subtle hints like "no people in focus". Use explicit negative instructions: "if people appear they must be distant silhouettes or shot from behind — NEVER show recognizable faces, close-up portraits, or people looking at camera."

## Data Quality
1. **[2026-03-22] AI mood enrichment over-tags — audit before trusting**
   Do instead: after running AI venue enrichment, audit mood tag distribution. If any mood covers >15% of venues, it's inflated and useless as a filter. Strip generic tags (e.g. every cafe is not "chill", every restaurant is not "foodie"). Keep tags only where genuinely distinctive (name contains "lounge", "jazz", tags contain "gourmet", etc.).
2. **[2026-03-22] Category + mood must be AND filter, not sort boost**
   Do instead: when both a category and mood are selected on Home, show ONLY venues matching both. Never show all category venues with mood-tagged ones sorted to top — users expect hard filtering. Use `.filter()` not sort-and-append.
3. **[2026-05-16] Same concert listed on multiple ticket sites must collapse to one canonical event**
   Do instead: in `promoteEvents.ts`, dedupe by both `(source_name, ticket_url)` (within-source fast path) AND `canonicalEventKey({title, startDatetime, venueId, locationName})` from `backend/src/services/eventDedupe.ts` (cross-source). The canonical key strips diacritics + noise tokens, truncates start to YYYY-MM-DD, and falls back to normalized `location_name` when `venue_id` is null. When a duplicate is found, mark the raw row promoted so it doesn't get retried on every run.
4. **[2026-05-16] Venue matching for events must handle abbreviated raw signals via reverse-substring + first-comma-chunk + token-overlap, all gated by event-category preference**
   Do instead: when a ticket/event source gives a short venue signal ("Skenderija", "ZETRA"), an address-shaped signal ("Skenderija, 71000 Sarajevo, Bosna i Hercegovina"), or a same-language paraphrase ("Bosanski kulturni centar KS" vs "BKC (Bosanski Kulturni Centar)"), use `matchVenue` in `backend/src/services/venueMatch.ts`. Strategy chain: exact → forward partial → reverse partial → reverse partial on first comma chunk → fuzzy variants (after stripping `sarajevo`) → token-overlap (≥2 shared 4+ char tokens). Every disambiguation step prefers `EVENT_CATEGORIES` (concert_hall, theatre, cinema, club, cultural_center, outdoor, etc.). When multiple candidates tie or only non-event categories match, returns null — leave it for curation. Critical: venueMatch's noise stripper is narrower than eventDedupe's — only strips `sarajevo`, NOT `bkc/kc/centar/kulturni/cultural/center` because those are venue identifiers, not noise.
5. **[2026-05-16] Venue seeding workflow: seed migration → findGooglePlaceIds → enrichFromGoogle → scrapeGooglePhotos**
   Do instead: when adding new venues that the scraper needs to link against, follow this order: (1) idempotent migration with name+slug+category+neighborhood+address (is_curated=false flags them for review), (2) run `findGooglePlaceIds.ts` to discover Place IDs + lat/lng via Google's "Find Place from Text" API biased to Sarajevo, (3) run `enrichFromGoogle.ts` for rating/ratings_count/website/phone/review_snippets, (4) run `scrapeGooglePhotos.ts` for cover_image_url. enrichFromGoogle is gated on google_place_id NOT NULL, so step 2 must come first. scrapeGooglePhotos has a pre-existing limitation: no ORDER BY + no "tried" marker, so venues where Google returns no photo are returned forever; the loop unsticks only when something updates — known issue, not blocking.

## Execution & Validation
1. **[2026-03-22] Never test on localhost — always push, deploy, and verify on production**
   Do instead: after making code changes, push to git, let Vercel deploy, then open `https://hype-alpha.vercel.app/` to verify. Do not use `expo start --web` or localhost for verification. The user wants to see the real deployed app, not a local dev server.
2. **[2026-03-09] Treat `docs/00-overview/execution_board.md` as the structured planning source**
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
2. **[2026-04-10] Detail routes live at root stack, not inside (home) tab**
   Do instead: venue/event/series/heritage `[id]` routes now live at `app/venue/[id].tsx` etc., not under `app/(tabs)/(home)/`. They render as root stack screens above the tab bar. Never nest detail routes inside a tab group — it breaks cross-tab back navigation.
3. **[2026-04-10] Edge functions require auth — JWT for user-facing, X-Admin-Secret for admin**
   Do instead: user-facing functions (ask-sarajevo, generate-plan, surprise-me, smart-search, translate-scene, generate-pulse, generate-hero-image) verify Supabase JWT via `verifyUserAuth`. Admin functions (enrich-descriptions, parse-instagram, generate-event-cover, analyze-venue-photo) require `X-Admin-Secret` header via `verifyAdminAuth`. Both helpers live in `_shared/auth.ts`. Set `ADMIN_FUNCTION_SECRET` env var in Supabase.

## Frontend Patterns
1. **[2026-03-22] Mood chips switch Home between default sections and a unified mood feed**
   Do instead: when `selectedMood` is set, `HomeContentSections` renders `HomeMoodFeed` (unified venue+event feed) instead of the independent Trending/Kafu/Hidden Gems/Events sections. Deselecting reverts to the default layout. The feed data layer lives in `utils/homeMoodFeed.ts` with pure interleaving logic in `utils/homeMoodFeedUtils.ts`.
2. **[2026-03-22] Pure helper logic that needs Node-side tests must live in a `*Utils.ts` file**
   Do instead: when a module imports Supabase or react-native but also contains pure functions you want to unit test, split the pure functions and types into `utils/<name>Utils.ts` and keep the runtime-dependent code in `utils/<name>.ts`. The Utils file re-exports through the main file so consumers don't need to change imports. Examples: `errorLoggerUtils.ts`, `homeMoodFeedUtils.ts`.
3. **[2026-03-09] App-wide providers belong in the root layout**
   Do instead: place cross-cutting UI setup such as theming, fonts, and global providers in `app/_layout.tsx` unless a narrower route scope is clearly better.
2. **[2026-03-09] Navigation changes should respect Expo Router structure**
   Do instead: make route and tab changes through the relevant `_layout.tsx` files and route folders instead of patching navigation behavior ad hoc inside leaf screens.
3. **[2026-03-12] Collapse platform wrappers once behavior is truly shared**
   Do instead: keep `.ios.tsx` and `.web.tsx` files only when they represent real platform differences; otherwise re-export the shared screen and keep the logic in one place.
17. **[2026-04-10] Every list must use FlatList, every list item must use React.memo**
   Do instead: never render an unbounded list with `.map()` inside ScrollView. Use `FlatList` with `keyExtractor`, `useCallback` renderItem, and `React.memo` on item components. For nested lists inside parent ScrollViews, use `scrollEnabled={false}`.
18. **[2026-04-10] Context values must be memoized — never create objects in Provider render**
   Do instead: wrap context value in `useMemo`, wrap callbacks in `useCallback`. A new object reference on every render triggers re-renders of every consumer in the tree.
19. **[2026-04-10] Every interactive element needs accessibilityRole + accessibilityLabel**
   Do instead: all TouchableOpacity/Pressable must have `accessibilityRole` ("button", "tab", "switch", "link") and `accessibilityLabel`. Chips/tabs with selection must include `accessibilityState={{ selected }}`. Toggles use `accessibilityState={{ checked }}`.
20. **[2026-04-10] Reanimated hooks must always be called unconditionally — never after early return**
   Do instead: `useSharedValue`, `useAnimatedStyle`, etc. must be called above any conditional return. For platform-specific rendering, compute the condition outside the component or use the hooks unconditionally and branch only in JSX. Always add `cancelAnimation` in effect cleanup.
21. **[2026-04-10] Shared edge function constants belong in `_shared/` — never duplicate across functions**
   Do instead: when multiple edge functions need the same data (HOLIDAYS, city config, model lists), put it in `supabase/functions/_shared/` and import. The Supabase admin client is a singleton in `_shared/supabase-admin.ts`.
4. **[2026-03-12] Large detail screens should extract loaders and localized display helpers before UI sections**
   Do instead: move Supabase reads, save-state mutations, hours/date/copy formatting, and similar display logic into `utils/<surface>Data.ts` and `utils/<surface>Screen.ts` before splitting hero, tabs, and cards into `components/<surface>/`.
5. **[2026-03-09] Effect dependencies should use stable inputs, not local callback identities**
   Do instead: base detail-screen effects on stable values like route params or selected ids unless the callbacks are intentionally memoized.
6. **[2026-03-09] Debounced handlers need a real debounced instance**
   Do instead: create a stable debounced function with `useMemo` or equivalent and call `.cancel()` on that debounced instance, not on a wrapper callback.
7. **[2026-03-12] Shared tab screens should use a common shell**
   Do instead: put tab-safe scrolling, empty/loading state framing, and section headers in shared primitives like `TabScreen`, `ContentState`, and `SectionHeader` before rebuilding another large screen.
8. **[2026-03-12] Web stability beats decorative animation in core primitives**
   Do instead: keep image, card, and loading primitives explicitly web-safe first, then add native motion only when browser verification stays clean.
9. **[2026-03-12] Large shared routes should end as orchestration files, not UI monoliths**
   Do instead: once a shared route holds search, filters, lists, modals, and navigation together, extract named render sections into `components/<surface>/` and leave the route responsible mainly for state, loading, and navigation.
10. **[2026-03-12] Large support components, tab modals, planner chrome, settings cards, action-button surfaces, app-wide navigation chrome, shared lookup-chip surfaces, and cross-platform embeds should follow the same orchestration pattern as routes**
   Do instead: for oversized support surfaces like `HomeScreen`, `Tonight` planner/content chrome, `FloatingTabBar`, settings cards, venue action buttons, reused filter/mood/category chip sets, or cross-platform map/embed surfaces, extract data, route heuristics, pure copy/selection/layout helpers, and shared markup builders into `utils/<surface>*.ts`, keep mock UI data deterministic instead of using `Math.random()` in render paths, clean shared lookup modules at the source, and split action bars, tabs, lists, modal sections, navigation buttons, chip groups, thin platform shells, and toggle rows into `components/<surface>/`.
11. **[2026-03-12] Modal cleanup should extract the repeatable shell pieces before chasing prop noise**
   Do instead: when planner or filter modals are still bulky, move shared header chrome, option grids, grouped action rows, and stop/result list markup into `components/<surface>/` plus tiny `utils/<surface>*.ts` view-model helpers so the modal file only chooses which section to show.
12. **[2026-03-12] Encoding cleanup should happen at the source-of-truth helper or context layer**
   Do instead: when mojibake shows up in rebuilt surfaces, fix the string tables, config helpers, or shared formatting modules first, then update tests to assert the cleaned output instead of patching leaf components one by one.
13. **[2026-03-12] Tab-route labels and empty states should live in helper modules, not the route file**
   Do instead: when a tab screen still hardcodes tab labels, empty-state copy, or route-target decisions inline, move that state copy into `utils/<surface>Screen.ts` and keep the route focused on loading, auth refresh, and navigation callbacks.
14. **[2026-03-12] Large tab routes should split controller state from screen markup**
   Do instead: when a shared tab route still mixes debounced search, filter state, loading effects, refresh behavior, and big JSX, move the state/effect layer into `hooks/use<Surface>Controller.ts` and the screen markup into `components/<surface>/<Surface>ScreenBody.tsx`.
15. **[2026-03-12] Mock user-facing flows should be deterministic too**
   Do instead: when a planner, vote, or other temporary mock flow needs generated URLs or result payloads, derive them from stable inputs in helper modules instead of using `Math.random()` in route handlers.
16. **[2026-03-12] Route-owned alert copy should move with the rest of the screen copy**
   Do instead: when a route still hardcodes auth, error, or confirmation alerts, move that copy into the same helper module that owns the screen's settings or display strings before splitting the route controller.
17. **[2026-03-12] Deterministic mock planners should live outside shared copy/type modules**
   Do instead: when a screen still uses temporary mock plan generation, keep the generated-plan catalog in a dedicated helper like `utils/<surface>Mock*.ts`, derive venue picks from stable inputs instead of `Math.random()`, and leave the main `utils/<surface>Screen.ts` module focused on types, labels, and share text.

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
9. **[2026-03-12] Keep route-level persistence out of large screens**
   Do instead: when a route still owns AsyncStorage or Supabase reads directly, move that loading and mutation path into `utils/<surface>Data.ts` or `utils/<surface>*Storage.ts`; if storage-key drift exists, make the storage helper read/write all legacy keys until the transition is fully retired.
10. **[2026-03-12] Keep route-level auth flows out of large settings screens**
   Do instead: when a screen mixes sign-in, sign-up, sign-out, and profile persistence, move those auth/data calls into `utils/<surface>Data.ts` before extracting the UI into `components/<surface>/`.
11. **[2026-03-12] Temporary adapter workarounds should collapse back into the canonical adapter module**
   Do instead: if normalization or compatibility logic gets copied into a runtime or logging module as a short-term workaround, move callers back to `utils/dataAdapters.ts` and add focused adapter tests as soon as the blocking tooling constraint is gone.
12. **[2026-03-12] Storage migration helpers should be testable without the full app runtime**
   Do instead: when a migration still has to read or mirror legacy AsyncStorage keys, keep the read/write/merge logic in a tiny helper module with an injected storage interface so Node-side tests can cover key drift and mirrored writes without importing the React Native runtime.
13. **[2026-03-12] Runtime logging modules should push pure stack and message shaping into helper modules**
   Do instead: when a runtime-only logger still carries muting rules, argument stringification, or stack parsing inline, move those pure pieces into `utils/<surface>Utils.ts` first so Node-side tests can cover them and the runtime module can stay focused on platform wiring.
14. **[2026-03-12] Large saved-state content shells should build card models before rendering lists**
   Do instead: when a Saved-style surface still branches across venues, events, and badges inline, move localized card text, price/date formatting, mood badges, and earned/progress state into `utils/<surface>Content.ts`, then keep the shell responsible only for empty/loading branching and delegating to list/grid components.
15. **[2026-03-12] Large screen-body shells should split search-or-controls from results-or-modals first**
   Do instead: when a shared screen body still owns both the top chrome and the result/modal branching, extract named `ResultsSection` and `ModalStack` components before chasing smaller prop cleanups so the body becomes an obvious composition shell.
16. **[2026-03-12] Source-layer Bosnian copy cleanup should fix diacritics, not just mojibake**
   Do instead: once mojibake is gone, continue the consistency sweep by correcting helper-owned Bosnian strings like `sacuvaj`, `dogadaji`, or `otkazi` to their proper diacritic forms in the source tables and update the adjacent Node-side tests in the same slice.

## Shell & Environment
1. **[2026-03-09] This Windows environment may not have working `git`, `rg`, or real `python` on PATH**
   Do instead: verify tool availability first and fall back to PowerShell commands or direct HTTP fetches when standard CLI tools are unavailable.
2. **[2026-03-10] PowerShell may block the `npm.ps1` shim on this machine**
   Do instead: use `npm.cmd` and `npx.cmd` from PowerShell when execution policy rejects `npm` or `npx`.
3. **[2026-03-11] Work and home machines should advertise their role explicitly**
   Do instead: install one machine marker file at `C:\Users\haris.daul\.codex-machine.toml` on each machine so future sessions can distinguish protected work flows from full-dev home flows without guesswork.
4. **[2026-03-12] Local runtime artifacts should never stay unignored**
   Do instead: ignore Expo log files and `test-results/` as soon as they appear so sync noise does not turn into fake repo work.
5. **[2026-03-12] Metro cache deserialization errors are not necessarily a build blocker**
   Do instead: if Expo web logs `Unable to deserialize cloned data` from Metro cache reads, note it, let Metro fall back to the full crawl once, and only treat it as a blocker if the export itself fails.

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
6. **[2026-03-12] Napkin updates are part of the slice, not an end-of-day extra**
   Do instead: read `.claude/napkin.md` at the start of each Hype session and update it during the same slice whenever a reusable repo rule becomes clearer.
