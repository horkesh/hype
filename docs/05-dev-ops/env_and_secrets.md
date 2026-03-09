# Env And Secrets

## Current state

- Frontend Supabase client values are hardcoded in source.
- No dedicated root env document is present yet.

## Recommended direction

- Introduce environment variables for public client configuration.
- Keep a short record here of which variables are required by:
  - root Expo app
  - backend service
  - local Supabase tooling

## To fill in

- Required frontend env vars
- Required backend env vars
- Local development defaults
- Deployment-specific overrides
