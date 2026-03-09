# ADR 0002: Schema Alignment Strategy

## Status

Accepted

## Date

2026-03-09

## Context

The current mobile app was generated and evolved as a prototype. It already reads live-style data from Supabase, but some field expectations do not line up cleanly with the canonical schema in `..\hype-supabase-schema.sql`.

The biggest mismatches are:

- `venues.price_level` in UI vs `venues.price_range` in canonical schema
- `instagram` in UI vs `instagram_handle` in canonical schema
- single-field venue insider tips in UI vs bilingual tip fields in canonical schema
- flattened `daily_specials` UI fields vs canonical bilingual structured fields

We need a strategy that improves maintainability without stalling the prototype.

## Decision

Use a hybrid alignment strategy:

1. Align the mobile app directly to the canonical schema for:
   - `venues`
   - `events`
   - `event_series`

2. Use a temporary compatibility layer for `daily_specials` if needed, because it has the largest display-shape mismatch and touches fewer screens.

3. Keep profile and saved-state cleanup as a later pass after the core read surfaces are stable.

## Rationale

- `venues`, `events`, and `event_series` are high-frequency entities across the app and should not stay behind compatibility aliases for long.
- `daily_specials` has a more presentation-oriented mismatch and can be smoothed with a database view or query adapter without blocking the broader cleanup.
- This approach avoids rewriting everything at once while still converging on the intended schema.

## Consequences

- The next schema-cleanup work should start with venue field normalization.
- `daily_specials` may temporarily use a compatibility mapping or SQL view during stabilization.
- We reduce long-term drift by treating the canonical schema as the destination, not the prototype field names.
