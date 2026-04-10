# Production Launch Roadmap

Written 2026-04-10 after full code quality audit. Tracks everything needed to go from current prototype to live App Store + Play Store app.

## Phase 1 — Store-ready minimum (blocks submission)

### 1.1 Bundle IDs and app identity
- **Status:** Not started
- **Blocker:** Cannot submit without this
- **Actions:**
  - [ ] Choose final bundle ID (e.g. `ba.visitsarajevo.look` or `com.look.sarajevo`)
  - [ ] Update `app.config.ts` → `ios.bundleIdentifier` and `android.package`
  - [ ] Register Apple Developer account ($99/year) if not already done
  - [ ] Register Google Play Developer account ($25 one-time) if not already done
  - [ ] Generate iOS distribution certificate + provisioning profile in App Store Connect
  - [ ] Generate Android upload keystore via `eas credentials`
  - [ ] Update `eas.json` production profile with `channel: "production"` for OTA updates

### 1.2 App Store metadata
- **Status:** Not started
- **Blocker:** Cannot submit without this
- **Actions:**
  - [ ] Finalize app icon (currently placeholder `app-icon-kdx.png`) — need 1024x1024 for iOS, 512x512 for Android
  - [ ] Write app name + subtitle for both stores (BS + EN)
  - [ ] Write full description (4000 char max iOS, 4000 char max Android)
  - [ ] Generate screenshots for: iPhone 6.7" (required), iPhone 6.1", iPad (optional)
  - [ ] Select categories: Travel (primary), Lifestyle (secondary)
  - [ ] Complete age rating questionnaire (no mature content)
  - [ ] Set up App Store Connect app record
  - [ ] Set up Google Play Console app record
  - [ ] Prepare "What's New" text for v1.0

### 1.3 Privacy policy and terms of service
- **Status:** Not started
- **Blocker:** Both stores require a public privacy policy URL
- **Actions:**
  - [ ] Draft privacy policy covering: account data (email), taste preferences, saved venues/events, location (if added), AI-processed queries, analytics
  - [ ] Address GDPR: EU tourists will use this app — need consent mechanisms, data deletion capability, data export
  - [ ] Draft terms of service
  - [ ] Host both at a public URL (e.g. `look-sarajevo.vercel.app/privacy`, `look-sarajevo.vercel.app/terms`)
  - [ ] Add privacy policy URL to `app.config.ts` and both store listings
  - [ ] Add in-app link to privacy policy in Profile screen

### 1.4 Secure token storage
- **Status:** Not started — can be done now
- **Blocker:** Production security requirement
- **Actions:**
  - [ ] Replace `AsyncStorage` auth token storage with `expo-secure-store` in `contexts/AppContext.tsx`
  - [ ] `expo-secure-store` is already a dependency — just need to swap the `storage` adapter
  - [ ] Keep `localStorage` fallback for web
  - [ ] Test sign-in/sign-out cycle after migration

### 1.5 Environment variable hardening
- **Status:** Partially done — can be done now
- **Actions:**
  - [ ] Proxy OpenWeather API through an edge function instead of exposing key in client bundle
  - [ ] Set `ADMIN_FUNCTION_SECRET` in Supabase project settings
  - [ ] Remove `openWeatherApiKey` from `app.config.ts` `extra` once proxied
  - [ ] Document env var strategy: which vars go in `.env` (dev), which in EAS secrets (production), which in Supabase dashboard
  - [ ] Create `.env.example` at repo root listing all required vars

### 1.6 EAS Build + Submit pipeline
- **Status:** Partially configured — can be done now
- **Actions:**
  - [ ] Add `channel: "production"` to `eas.json` production profile
  - [ ] Add `channel: "preview"` to preview profile
  - [ ] Test `eas build --platform ios --profile production` (requires Apple account)
  - [ ] Test `eas build --platform android --profile production`
  - [ ] Configure `eas submit` for both stores
  - [ ] Document the build-submit flow in `docs/05-dev-ops/`

## Phase 2 — Credible launch (should have for v1.0)

### 2.1 Crash reporting
- **Status:** Not started — can be done now
- **Actions:**
  - [ ] Install `sentry-expo` or `@sentry/react-native`
  - [ ] Create Sentry project, get DSN
  - [ ] Wire into `app/_layout.tsx` ErrorBoundary `onError` callback
  - [ ] Add Sentry to the existing `utils/errorLogger.ts` as the production error sink
  - [ ] Configure source maps upload in EAS build

### 2.2 Analytics
- **Status:** Not started
- **Actions:**
  - [ ] Choose provider: Mixpanel, Amplitude, or PostHog (PostHog has a generous free tier + EU hosting)
  - [ ] Track: screen views, AI feature usage (planner, search, pulse, surprise-me), save/unsave, language toggle, category/mood selection
  - [ ] Wire into key user actions across Home, Explore, Tonight screens
  - [ ] Dashboard for DAU, retention, feature adoption

### 2.3 Push notifications
- **Status:** Not started
- **Actions:**
  - [ ] Configure `expo-notifications` (already in Expo SDK)
  - [ ] Set up Expo push notification credentials for iOS (APNs) and Android (FCM)
  - [ ] Create notification permission request flow in Profile or on first launch
  - [ ] Backend: Supabase function or cron to send notifications for:
    - Event starting soon (3h before, for saved events)
    - New events this week (weekly digest)
    - Venue special at a saved venue
  - [ ] Store push tokens in `profiles` table

### 2.4 Deep linking / universal links
- **Status:** Scheme set, no intent filters — can be done now
- **Actions:**
  - [ ] Add `intentFilters` to `app.config.ts` for Android (handle `https://look-sarajevo.vercel.app/venue/*` etc.)
  - [ ] Add `associatedDomains` for iOS (requires Apple Developer Portal + AASA file on web domain)
  - [ ] Host `.well-known/apple-app-site-association` and `.well-known/assetlinks.json` on the Vercel domain
  - [ ] Test deep links: `look://venue/123`, `https://look-sarajevo.vercel.app/venue/123`

### 2.5 Offline resilience
- **Status:** Not started — can be done now
- **Actions:**
  - [ ] Cache last-fetched venue list in AsyncStorage with TTL
  - [ ] Show cached data with "offline" banner when `expo-network` reports no connectivity
  - [ ] AI features: show "requires internet" message instead of silent failure
  - [ ] Home: show cached weather, cached city pulse
  - [ ] Saved tab: always available (already uses local storage for events)

### 2.6 Generate Supabase types
- **Status:** Not started — can be done now
- **Actions:**
  - [ ] Run `npx supabase gen types typescript --project-id kyfoqltmkqwtnrdlacqv > integrations/supabase/database.types.ts`
  - [ ] Update `integrations/supabase/client.ts`: `createClient<Database>(url, key)`
  - [ ] Replace ad-hoc `Venue`, `Event`, `Series` interfaces in `*Screen.ts` files with `Pick<>` from generated types
  - [ ] Fix all resulting type errors (likely 20-30 spots where `any` was hiding mismatches)

### 2.7 Image caching
- **Status:** Not started — can be done now
- **Actions:**
  - [ ] Replace `react-native` `Image` with `expo-image` in `ImageWithPlaceholder.tsx`
  - [ ] `expo-image` provides disk + memory caching, blurhash, transition animations
  - [ ] Update all direct `Image` imports across the codebase to use `ImageWithPlaceholder` or `expo-image` directly
  - [ ] Consider generating blurhash values for venue cover images (batch script)

### 2.8 Splash screen / loading performance
- **Status:** Not started
- **Actions:**
  - [ ] Preload critical data (venue count, weather, featured event) before hiding splash
  - [ ] Use `SplashScreen.preventAutoHideAsync()` (already done) + hide after data is ready, not just fonts
  - [ ] Consider a branded loading screen between splash and content

## Phase 3 — Polish (nice-to-have for v1.0, important for v1.1)

### 3.1 Reduced motion support
- **Actions:**
  - [ ] Use `useReducedMotion()` from `react-native-reanimated`
  - [ ] Skip entrance animations in `AnimatedCard` when enabled
  - [ ] Disable skeleton shimmer (show static gray)
  - [ ] Disable flip card animation (show front only)

### 3.2 Color system consolidation
- **Actions:**
  - [ ] Delete `constants/Colors.ts` — move any unique values to `styles/commonStyles.ts` or `designTokens.ts`
  - [ ] Grep all hardcoded `#D4A056`, `#121212`, `#1E1E1E`, `#F5F5F5`, `#A0A0A0` and replace with token references
  - [ ] Grep all `fontWeight: 'bold'` (22 files) and replace with numeric weight + fontFamily pair

### 3.3 fontSize token adoption
- **Actions:**
  - [ ] Replace 265 raw `fontSize` literals with `designTokens.typography.*` spreads
  - [ ] Add missing token levels if needed (e.g. `bodyLarge`, `labelSmall`)

### 3.4 E2E testing
- **Actions:**
  - [ ] Set up Maestro or Detox
  - [ ] Critical flows: launch → home loads → tap venue → detail loads → save → check Saved tab
  - [ ] Auth flow: sign in → profile shows email → sign out
  - [ ] AI flow: tap Surprise Me → plan streams → tap stop → venue detail opens

### 3.5 Rate limiting on edge functions
- **Actions:**
  - [ ] Add per-user rate limit to AI endpoints (e.g. 20 requests/hour per user)
  - [ ] Use Supabase `checkins` or a simple Redis/KV counter
  - [ ] Return 429 with `Retry-After` header when exceeded

### 3.6 Content moderation pipeline
- **Actions:**
  - [ ] `promoteEvents.ts` currently auto-approves scraped events — add a review queue
  - [ ] Admin panel: show pending events for manual approve/reject
  - [ ] `seedCheckins.ts` needs `--env=development` guard to prevent production data corruption

## Running costs estimate

| Service | Monthly cost |
|---------|-------------|
| Supabase Pro | ~$25 |
| Apple Developer Program | $99/year (~$8/mo) |
| AI APIs (OpenAI + Anthropic + Google) | $20-50 depending on usage |
| Sentry (free tier) | $0 |
| PostHog (free tier, 1M events) | $0 |
| EAS Build (free tier, 30 builds/mo) | $0 |
| Vercel (free tier for web preview) | $0 |
| **Total** | **~$55-85/month** |

## Timeline

| Phase | Effort | Calendar time |
|-------|--------|---------------|
| Phase 1 (store-ready) | ~8-12 days of work | 1-2 weeks |
| Phase 2 (credible launch) | ~12-18 days of work | 2-3 weeks |
| Phase 3 (polish) | ~8-12 days of work | 1-2 weeks |
| **Total** | **~28-42 days** | **5-7 weeks** |

## What can be done right now (no accounts needed)

These items require only code changes, no Apple/Google accounts:
1. Secure token storage (swap AsyncStorage → SecureStore)
2. OpenWeather API proxy edge function
3. Generate Supabase types
4. Image caching (expo-image)
5. EAS config updates (channel, env strategy)
6. Deep link configuration in app.config.ts
7. Offline resilience basics
8. `.env.example` documentation
9. Splash screen data preloading
10. Reduced motion support
