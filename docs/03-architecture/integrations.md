# Integrations

## Supabase

- Frontend has a Supabase client under `integrations/supabase/client.ts`.
- Another Supabase client exists under `app/integrations/supabase/client.ts`.
- This duplication should be resolved so there is one canonical client setup.

## Error logging

- `utils/errorLogger.ts` is loaded before the router boots, which makes it the right place for early runtime instrumentation.

## Recommendations

- Move Supabase configuration to environment-based loading instead of hardcoding values in source files.
- Decide whether frontend should talk directly to Supabase, to `backend/`, or to both with clearly separated responsibilities.
