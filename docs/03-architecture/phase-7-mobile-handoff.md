# Phase 7 — Mobile reunification handoff

Phases 0-6 of the web-first migration shipped through commits / branches. Phase 7
is the only remaining piece, and it can't be completed from a CI agent — it
requires Apple/Google developer-portal access and physical-device testing.

## What's already in place

- `apps/mobile` runs all Phase 1 primitives + the venue-detail + event-detail
  universal screens via the `_phase1_demo` / `_phase2_demo` routes.
- Tamagui provider is mounted in `_layout.tsx`.
- All the business logic (`@look/shared`) and UI primitives (`@look/ui`)
  used by the web app are also available on mobile — no forks.

## What you need to do

### 1. Port the rest of the mobile screens to the universal pattern (incremental)

Replace existing mobile-specific implementations one screen at a time with the
universal components from `@look/ui`:

- `apps/mobile/app/venue/[id].tsx` → use `<VenueDetailContent>`
  (currently uses bespoke VenueDetailHeader/VenueDetailTabs etc.)
- `apps/mobile/app/event/[id].tsx` → use `<EventDetailContent>`
- `apps/mobile/app/(tabs)/index.tsx` → use the home composition pattern
  (rails of `<VenueCard>` + `<EventCard>`)
- `apps/mobile/app/(tabs)/explore.tsx` → use `<VenueCard>` grids
- `apps/mobile/app/(tabs)/tonight.tsx` → use `<EventCard>` lists
- Specialty verticals (`/wellness`, `/heritage/[id]`, `/series/[id]`) can
  keep their existing bespoke layouts — they're not on the SEO path.

Each port = one PR. Keep the existing screen as a fallback until the
universal version is validated on iOS + Android.

### 2. Native-only integrations

These need platform-specific code behind shared interfaces in
`@look/shared`:

- **Push notifications** via `expo-notifications`. Token registration
  flow + a Supabase table to store device tokens + an Edge Function to
  emit pushes when a saved venue posts a new event.
- **Native share sheet** via `expo-sharing`. Wraps the Web Share API
  (already universal-available) into a platform-aware helper so the
  web app uses the browser sheet and mobile uses the native one.
- **Deep links** — `app.config.ts` already has Expo's universal-link
  scaffold. After domain switch to the real production URL, add
  `apple-app-site-association` + `assetlinks.json` files to
  `apps/web/public/.well-known/` so iOS and Android deep-link into
  the app when present.

### 3. Build + submit

- TestFlight build:
  ```
  cd apps/mobile && eas build --platform ios --profile preview
  ```
- Play Console internal track:
  ```
  cd apps/mobile && eas build --platform android --profile preview
  ```
- Smoke test the venue-detail and event-detail screens on real devices.
- Submit to App Store + Play Store for review.

## What's blocking Phase 7

| Item | Action |
|---|---|
| Apple Developer Program membership | $99/year — required for TestFlight + App Store |
| Google Play Console one-time fee | $25 — required for internal track |
| Real iPhone + Android device | For UX validation; simulator is enough for early dev |
| EAS subscription (optional) | Free tier OK for early builds; paid for parallel builds |

## What CAN be done before native submission

- Continue polishing the web app (the universal components keep mobile
  in sync automatically when you change anything in `@look/ui`).
- Validate the iOS web bundle via Safari on a real iPhone — the
  `apps/mobile/_layout.tsx` web target is what Expo serves at
  `hype-alpha.vercel.app` today; verify Tamagui renders correctly
  on iOS Safari.
- Wire Sentry into `apps/mobile` so the universal `@look/shared` error
  paths report to the same dashboard the web app uses.

## Recommended sequence once you have Apple/Google access

1. Internal TestFlight build with current code (no changes).
2. Validate venue + event detail on real iPhone + Android.
3. Port the remaining screens one at a time to universal.
4. Add push notifications + native share.
5. Public TestFlight beta.
6. App Store + Play Store submission.
