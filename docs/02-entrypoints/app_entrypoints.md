# App Entrypoints

## Startup chain

1. `index.ts` loads `utils/errorLogger`.
2. `index.ts` imports `expo-router/entry`.
3. Expo Router resolves the app shell in `app/_layout.tsx`.
4. `app/_layout.tsx` loads fonts, applies themes, mounts `AppProvider`, and sets up the root stack.
5. Initial route is `(tabs)`.
6. `app/(tabs)/_layout.tsx` mounts the primary tab shell and floating tab bar.

## Why this matters

- App-wide providers should usually live in `app/_layout.tsx`.
- Navigation-level behavior belongs in the relevant `_layout.tsx` file.
- Work that must happen before the router boots belongs in `index.ts`.
