# Frontend

## Mission

Build and refine the user-facing Hype app in the repo root using Expo Router and shared React Native components.

## Primary paths

- `index.ts`
- `app/`
- `components/`
- `contexts/`
- `hooks/`
- `styles/`
- `constants/`
- `integrations/`
- `public/`

## Owns

- route structure and navigation
- screens and screen-level state
- design system and theming
- localization behavior in the app
- map UX and platform-specific frontend behavior

## Check first

- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `contexts/AppContext.tsx`
- `docs/01-repo-map/frontend_map.md`
- `docs/02-entrypoints/app_entrypoints.md`
- `docs/04-product/screen_inventory.md`

## Current conventions

- Respect Expo Router file-based navigation.
- Check for `.ios.tsx` and `.web.tsx` variants before changing shared behavior.
- Put app-wide providers and startup UI concerns in `app/_layout.tsx`.
- Keep visual direction warm, intentional, and non-corporate.
- Preserve Bosnian and English support where user-facing strings are involved.

## Current watchlist

- Translation strings in `contexts/AppContext.tsx` appear to have encoding issues.
- Supabase frontend client configuration is duplicated and should not drift.
- The app uses Leaflet-related packages today, so do not assume `react-native-maps` without verifying.

## Task checklist: new screen

1. Identify the route location under `app/`.
2. Check whether the screen belongs in tabs, nested home routes, or a detail route.
3. Inspect the nearest `_layout.tsx` file before changing navigation behavior.
4. Check for platform-specific siblings such as `.ios.tsx`.
5. Reuse existing components from `components/` before creating new primitives.
6. Keep strings compatible with the existing language context.
7. Update `docs/04-product/screen_inventory.md` if the feature surface changed.
8. Add a ledger entry if the change was meaningful.

## Task checklist: navigation change

1. Trace the startup path from `index.ts` to the relevant `_layout.tsx`.
2. Confirm whether the change is app-wide, tab-level, or route-local.
3. Check route names and deep-link paths before renaming anything.
4. Verify whether there is a platform-specific tab or layout variant.
5. Update entrypoint or product docs if navigation behavior materially changed.

## Task checklist: integration cleanup

1. Search both `integrations/` and `app/integrations/` before changing a client or service.
2. Prefer consolidation into one canonical integration surface.
3. Move configuration toward environment-driven setup where possible.
4. Record the new canonical location in docs if the cleanup changes how future work should be done.
