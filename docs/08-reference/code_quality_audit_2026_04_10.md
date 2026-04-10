# Code Quality Audit — 2026-04-10

## Audit Scope
Full codebase audit across 6 dimensions: architecture, types/errors, performance, security/tests, UX/accessibility, backend/data layer.

---

## CRITICAL

### Security

| ID | Issue | Location |
|----|-------|----------|
| S1 | Hardcoded Supabase URL + anon JWT as fallbacks in admin source | `admin/src/supabase.ts:3-4` |
| S2 | Zero authentication on all 11 edge functions — anyone can trigger AI calls, write to raw_events, or exploit SSRF | All `supabase/functions/*/index.ts` |
| S3 | SSRF vector — `analyze-venue-photo` passes arbitrary untrusted URLs to `fetch()` with no domain allowlist | `supabase/functions/analyze-venue-photo/index.ts:12` |
| S4 | Google Maps API key baked into stored venue `cover_image_url` values — any client can extract it | `backend/src/scripts/scrapeGooglePhotos.ts:63` |
| S5 | Auth tokens stored in unencrypted AsyncStorage instead of expo-secure-store | `contexts/AppContext.tsx:178-212` |
| S6 | `seedCheckins.ts` deletes + rewrites production checkins with no env guard or dry-run | `backend/src/scripts/seedCheckins.ts` |

### Architecture & Correctness

| ID | Issue | Location |
|----|-------|----------|
| A1 | Rules of Hooks violation — `useSharedValue` called after conditional early return | `components/AnimatedCard.tsx:17-46` |
| A2 | AppContext value object recreated every render — `setLanguage`, `t`, and the value prop are new references each render, triggering full-tree re-render | `contexts/AppContext.tsx:245-255` |
| A3 | No Supabase generated types — `createClient(url, key)` is untyped; every `.from()` query returns `any`. 5 separate Venue types, 6 separate Event types, no canonical model | `integrations/supabase/client.ts` + all `*Screen.ts` |
| A4 | SkeletonLoader infinite Reanimated animation never cancelled on unmount — orphaned animation loops | `components/SkeletonLoader.tsx:28-30` |
| A5 | ErrorBoundary component exists but is imported nowhere — any component crash blanks the entire app | `components/ErrorBoundary.tsx` |

### Accessibility

| ID | Issue | Location |
|----|-------|----------|
| X1 | Zero `accessibilityLabel` / `accessibilityRole` on any interactive element across 69 files with TouchableOpacity/Pressable | Entire `components/` tree |
| X2 | WCAG AA contrast failures — `textTertiary: #6B6B6B` on `#121212` = 2.7:1 (needs 4.5:1); `textSecondary: #A0A0A0` = 4.1:1 (needs 4.5:1 for body text) | `styles/commonStyles.ts`, multiple components |

---

## MAJOR

### Type Safety & Error Handling

| ID | Issue | Location |
|----|-------|----------|
| T1 | `opening_hours: any` on core Explore `Venue` interface; `VenueOpeningHours` exists in venueDetailScreen but is not shared | `utils/exploreScreen.ts:8` |
| T2 | `user: any | null` in profile data; `signInProfile` returns `Promise<any>` | `utils/profileData.ts:9,39` |
| T3 | `fetchTrendingVenues` returns `Promise<any[]>`, flows into `useState<any[]>` | `utils/crowdSignals.ts:58`, `components/home/HomeTrendingSection.tsx:20` |
| T4 | `SmartSearchResult.matchedVenues?: any[]` | `utils/ai/smartSearch.ts:15` |
| T5 | `style?: any` on 6+ components instead of `StyleProp<ViewStyle>` | `AnimatedCard`, `FlippableCard`, `GlassContainer`, `ImageWithPlaceholder`, `SkeletonLoader` |
| T6 | `SavedBadge.criteria: any` | `utils/savedScreen.ts:32` |
| T7 | `IconSymbol` — 6 event handler props typed `any` | `components/IconSymbol.tsx:38-43` |
| T8 | `plan_json as EveningPlan` — unvalidated JSONB cast, no runtime check | `utils/ai/planPersistence.ts:39` |
| T9 | `isVenueOpenNow` does `period.open.split(':')` with no null/format guard (the venueDetailScreen version does guard) | `utils/exploreHelpers.ts:79-84` |
| T10 | `toLocalCalendarDate` — `dateString.split('-')` with no null guard | `utils/seriesDetailScreen.ts:221` |
| T11 | `VenueDetailVenue.description_bs/en` and `address` typed non-nullable but DB may be null | `utils/venueDetailScreen.ts:26,29-30` |
| E1 | Three incompatible error-handling patterns — throw vs return `[]` vs return `null` | Across all data loaders |
| E2 | 8 of 11 edge functions return errors as HTTP 200 | All edge functions except `ask-sarajevo` |
| E3 | 6+ data loaders silently eat Supabase errors — destructure `{ data }` without checking `error` | `homeData.ts`, `heritageWalkData.ts`, `crowdSignals.ts`, `visitSarajevoInstagram.ts` |
| E4 | Empty `catch {}` in HomeKafuSection — errors fully swallowed | `components/home/HomeKafuSection.tsx:43` |
| E5 | `loadHomeWeather` — no `response.ok` check before `.json()` | `utils/homeData.ts:123-131` |
| E6 | `planPersistence.loadLatestPlan` — non-row-missing Supabase errors silently return `null` | `utils/ai/planPersistence.ts:38` |

### Performance

| ID | Issue | Location |
|----|-------|----------|
| P1 | No virtualization on 5+ list surfaces — `.map()` in ScrollView/View: TonightEventCards, HomeCategoryFeed (40 items), SavedEventList, SavedVenueList, ExploreVenueList | Various |
| P2 | No `React.memo` on any list-item component — only 9 files use memoization in entire app | Codebase-wide |
| P3 | FlatList `renderItem` as inline arrow in HomeTrendingSection and HomeHiddenGems — defeats PureComponent optimization | `components/home/HomeTrendingSection.tsx:49`, `HomeHiddenGems.tsx:48` |
| P4 | 3 components fetch Supabase directly instead of through data loaders | `HomeHiddenGems`, `HomeCategoryFeed`, `HomeKafuSection` |
| P5 | `useExploreController.applyFilters` fires manual `loadVenues()` while effect already triggers one — double fetch | `hooks/useExploreController.ts:244-247` |
| P6 | `settingsCopy` recreated every render in useProfileController — invalidates all downstream useCallback | `hooks/useProfileController.ts:22` |
| P7 | `useProfileController` dual auth sync — `checkUser` + `subscribeToAuthChanges` both fire on mount; `.then(setSelectedMoods)` has no unmount guard | `hooks/useProfileController.ts:33-65` |
| P8 | `HomeHeritageSection` — fire-and-forget `.then(setWalks)` without mounted guard | `components/home/HomeHeritageSection.tsx:26-28` |
| P9 | `HomeCityPulse` refetches AI when weather object reference changes (object may not be memoized) | `components/home/HomeCityPulse.tsx:17-27` |
| P10 | `errorLogger` — `window.addEventListener('unhandledrejection')` never removed; accumulates on hot reload | `utils/errorLogger.ts:258-263` |
| P11 | No `expo-image` — using RN core `Image` with no disk/memory cache | `components/ImageWithPlaceholder.tsx` |

### Design System

| ID | Issue | Location |
|----|-------|----------|
| D1 | Two parallel color systems — `commonStyles.colors` vs `constants/Colors.ts`; `#D4A056` hardcoded in 20+ files | Codebase-wide |
| D2 | 265 raw `fontSize` literals across 98 files ignoring typography tokens | Codebase-wide |
| D3 | `SectionHeader` uses DMSans_700Bold at 22px instead of token's DMSerifDisplay_400Regular at 24px | `components/SectionHeader.tsx:39` |
| D4 | Three competing mood chip implementations — `GlassMoodChip`, `MoodChip`, `TonightPlannerMoodGrid` hand-rolled | Various |
| D5 | Two competing button components — `button.tsx` and `LoadingButton.tsx` with different APIs | `components/button.tsx`, `components/LoadingButton.tsx` |
| D6 | `GlassContainer` hex suffix concatenation — `glowColor + '4D'` breaks on rgba inputs | `components/glass/GlassContainer.tsx:29` |
| D7 | `GlassCategoryChip` does not use `glassTokens` — hardcodes `rgba(255,255,255,0.08)` | `components/glass/GlassCategoryChip.tsx:20` |
| D8 | `fontWeight: 'bold'` string used in 22 files instead of numeric + typed fontFamily | Various |

### Navigation & UX

| ID | Issue | Location |
|----|-------|----------|
| N1 | Detail routes trapped inside `(home)` tab — cross-tab navigation resets Home stack; back goes wrong | `app/(tabs)/(home)/_layout.tsx` |
| N2 | Notification bell is a `console.log` stub — visible on every screen, does nothing | `components/HypeHeader.tsx:73` |
| N3 | Heritage detail back button missing — regex in HypeHeader doesn't match `/heritage/` paths | `components/HypeHeader.tsx:28-29` |
| N4 | Hardcoded `paddingTop: 48` instead of `useSafeAreaInsets()` | `components/HypeHeader.tsx:94`, `app/(tabs)/explore.tsx:105` |
| N5 | No reduced-motion support anywhere — violates accessibility guidelines | Entire codebase |
| N6 | `unstable_native-tabs` API used in production path | `app/(tabs)/_layout.ios.tsx` |
| N7 | Venue 404 error state has no recovery action — bare text, no retry | `app/(tabs)/(home)/venue/[id].tsx:163-170` |
| N8 | Tonight loading uses spinner not skeleton — inconsistent with Home | `components/tonight/TonightEventListState.tsx` |
| N9 | HomeCityPulse and HomeHiddenGems return `null` silently on error/empty — layout shifts | Various |
| N10 | Touch targets below 44pt — HypeHeader back/bell buttons (32pt), FlippableCard flip icon (28pt) | Various |

### Backend & Data

| ID | Issue | Location |
|----|-------|----------|
| B1 | No auth on backend ingestion routes | `backend/src/routes/ingestion.ts` |
| B2 | `generate-pulse` uses UTC `.getHours()` instead of Sarajevo timezone for `time_of_day` | `supabase/functions/generate-pulse/index.ts:145-147` |
| B3 | `surprise-me` fetches all 1,200 venues per request with no server cache | `supabase/functions/surprise-me/index.ts:47-58` |
| B4 | `enrich-descriptions` writes to production venues with no dry-run mode | `supabase/functions/enrich-descriptions/index.ts:98` |
| B5 | `promoteEvents` auto-approves scraped events with no moderation queue | `backend/src/scripts/promoteEvents.ts:56` |
| B6 | HOLIDAYS constant duplicated across 3 edge functions, out of sync | `generate-plan`, `surprise-me`, `generate-pulse` |
| B7 | `getSupabaseAdmin()` creates new client per call instead of singleton | `supabase/functions/_shared/supabase-admin.ts:3-7` |
| B8 | Unbounded `select('*')` on large tables from client — no column projection | `exploreData.ts:122`, `venueDetailData.ts`, `savedData.ts`, `crowdSignals.ts` |
| B9 | N+1 in `crowdSignals.fetchTrendingVenues` — fetches all checkins then all venues separately | `utils/crowdSignals.ts:58-91` |
| B10 | `enrichFromGoogle.ts` and 2 other scripts use `!` non-null assertion on env vars | `backend/src/scripts/enrichFromGoogle.ts:15-17` |
| B11 | `ai_model` parameter unsanitized in `enrich-descriptions` — caller can select expensive models | `supabase/functions/enrich-descriptions/index.ts:8` |
| B12 | `ask-sarajevo` — no question length cap; full KB loaded per request | `supabase/functions/ask-sarajevo/index.ts:9-77` |
| B13 | No streaming timeout in `edgeFunctionClient` — hangs indefinitely if edge function stalls | `utils/ai/edgeFunctionClient.ts:31-71` |

### Tests

| ID | Issue | Location |
|----|-------|----------|
| Q1 | ~60% of tests are file-existence / source-grep checks, not behavioral tests | `tests/aiHelpers.test.ts`, `cardComponents.test.ts`, `edgeFunctionClient.test.ts` |
| Q2 | Zero auth tests, zero navigation tests, zero E2E tests | `tests/` |
| Q3 | 1 failing test — asserts a model ID that doesn't exist in the source | `tests/aiHelpersExtra.test.ts:57` |
| Q4 | Backend integration test file is 100% TODO | `backend/tests/integration.test.ts:9` |

---

## MINOR

| ID | Issue | Location |
|----|-------|----------|
| m1 | 5 iOS `.ios.tsx` re-exports that add no behavior | `app/(tabs)/explore.ios.tsx` etc. |
| m2 | SpaceMono font loaded but never used | `app/_layout.tsx:46-48` |
| m3 | `commonStyles.ts` mostly dead code — `.container`, `.centered`, `.title` never imported | `styles/commonStyles.ts` |
| m4 | Dead exports: `visitSarajevoInstagram.ts`, `crowdSignals.fetchCrowdSignals`, `ai/eventCover.ts`, `publicConfig.backendUrl` | Various |
| m5 | Placeholder bundle IDs: `com.placeholder.app` in iOS and Android | `app.config.ts:19,30` |
| m6 | `hype-crew.zip` and Expo log files at repo root | Root |
| m7 | No security headers in `vercel.json` | `vercel.json` |
| m8 | `package-lock.json` gitignored — non-reproducible installs | `.gitignore` |
| m9 | `HERO_IMAGES` in HomeHeroPhoto always null — dead code | `components/home/HomeHeroPhoto.tsx:10-14` |
| m10 | `Map.web.tsx` loading spinner never dismissed | `components/Map.web.tsx:37-39` |
| m11 | `window.addEventListener` in errorLogger never removed | `utils/errorLogger.ts:258-263` |
| m12 | `GlassBadge` imports `useTheme` but never uses it | `components/glass/GlassBadge.tsx:3` |
| m13 | `generate-plan` duplicates Claude HTTP client instead of using `_shared/ai-clients.ts` | `supabase/functions/generate-plan/index.ts:129-155` |
| m14 | Dual-layer caching for cityPulse with mismatched TTLs — content can display for up to 4 hours | `utils/ai/cityPulse.ts` vs `generate-pulse` |
| m15 | Module-level venue cache in `planGenerator.ts` never invalidated | `utils/ai/planGenerator.ts:29-31` |
| m16 | `HomeSurpriseMe` hardcodes "1,226 local venues" — will become stale | `components/home/HomeSurpriseMe.tsx:118-119` |
| m17 | `errorLogger.ts` sends `source: 'expo-template'` — leftover from scaffolding | `utils/errorLogger.ts:172` |
| m18 | `ContentState` — `if (!children)` check unreliable for `0`, `false`, `null` ReactNode values | `components/ContentState.tsx:39` |
| m19 | `SectionHeader` actionButton missing `accessibilityRole="button"` | `components/SectionHeader.tsx:19` |
| m20 | `TonightVoteModal` / `TonightPlannerModal` hardcode `backgroundColor: '#121212'` instead of using theme | Various |

---

## Fix Priority Order

1. Generate Supabase types + wire `createClient<Database>()`
2. Fix AppContext memoization
3. Add auth to edge functions (JWT verify on user-facing, service-role on admin)
4. Remove hardcoded credentials from admin/src/supabase.ts
5. Wire ErrorBoundary into app/_layout.tsx
6. Add accessibilityLabel to all interactive elements
7. Fix AnimatedCard hooks violation
8. Virtualize lists (Tonight, Saved, HomeCategoryFeed)
9. Consolidate color tokens — one source of truth
10. Move detail routes out of (home) group
