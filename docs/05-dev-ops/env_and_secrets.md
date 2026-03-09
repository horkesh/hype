# Env And Secrets

## Current state

- Public frontend config now reads from environment variables first.
- The shared config surface lives in `utils/publicConfig.ts`.
- The canonical frontend Supabase client lives in `integrations/supabase/client.ts`.
- `app/integrations/supabase/client.ts` is now a compatibility re-export.

## Frontend variables

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_BACKEND_URL`
- `EXPO_PUBLIC_OPENWEATHER_API_KEY`

These can be set in a local `.env` file copied from `.env.example`.

## Loading order

Frontend public config is resolved in this order:
1. `process.env.EXPO_PUBLIC_*`
2. Expo `extra` values in `app.json`

This keeps local development environment-driven while preserving an explicit fallback surface for Expo config.

## Current direction

- Keep public client configuration out of source literals.
- Use `integrations/supabase/client.ts` as the only real frontend Supabase client module.
- Move future public config additions through `utils/publicConfig.ts` instead of reading env vars ad hoc inside screens.

## Still to do

- Decide the real backend base URL to use across local dev and deployment.
- Document backend-only environment variables once the service grows beyond scaffolding.
- Reduce placeholder config in `app.json` further if the project moves fully to dynamic app config later.
