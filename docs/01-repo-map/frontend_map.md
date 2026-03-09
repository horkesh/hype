# Frontend Map

## Runtime areas

- `index.ts`: initializes logging and hands off to Expo Router.
- `app/_layout.tsx`: root app shell, fonts, theming, providers, and stack setup.
- `app/(tabs)/_layout.tsx`: tab shell and floating tab bar.

## Route areas

- `app/(tabs)/(home)/index.tsx`: home route.
- `app/(tabs)/explore.tsx`: explore route.
- `app/(tabs)/tonight.tsx`: tonight route.
- `app/(tabs)/saved.tsx`: saved route.
- `app/(tabs)/profile.tsx`: profile route.
- `app/event/[id].tsx`: event details.
- `app/series/[id].tsx`: series details.
- `app/venue/[id].tsx`: venue details.

## Shared support areas

- `components/`: cards, headers, buttons, map abstraction, loading states.
- `contexts/AppContext.tsx`: language, theme mode, translations, and persistence.
- `hooks/useTheme.ts`: theme-related helper logic.
- `styles/commonStyles.ts`: shared styling helpers.
- `constants/Colors.ts`: color constants.

## Platform-specific files

- Several route files have `.ios.tsx` variants, which means iOS behavior can differ from default cross-platform behavior.
- `components/Map.web.tsx` indicates web-specific rendering for the map component.
