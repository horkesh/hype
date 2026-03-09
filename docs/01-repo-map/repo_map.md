# Repo Map

## Root structure

- `app/`: Expo Router screens and route groups.
- `assets/`: fonts and images used by the app.
- `backend/`: separate TypeScript backend service.
- `components/`: reusable UI building blocks.
- `constants/`: app-wide constants.
- `contexts/`: React providers and global state.
- `hooks/`: shared React hooks.
- `integrations/`: shared service integrations.
- `public/`: web static assets.
- `styles/`: shared styling helpers.
- `supabase/`: Supabase local config.
- `utils/`: utility modules such as logging.
- `docs/`: working documentation and ledger.

## Important root config files

- `package.json`: root app scripts and dependencies.
- `index.ts`: frontend runtime entrypoint.
- `app.json`: Expo app configuration.
- `babel.config.js`: Babel setup.
- `metro.config.js`: Metro bundler setup.
- `tsconfig.json`: TypeScript config and `@/*` alias.
- `workbox-config.js`: web service worker generation config.
- `eas.json`: Expo Application Services build config.

## Repo split

- Root app is the user-facing client.
- `backend/` is operationally separate and has its own `package.json`, scripts, and build pipeline.
