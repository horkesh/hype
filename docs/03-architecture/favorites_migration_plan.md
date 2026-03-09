# Favorites Migration Plan

## Goal

Replace prototype-local AsyncStorage persistence for saved venues with the live Supabase `favorites` table.

## Why this matters

The live backend already has:
- `favorites`
- RLS policy: user owns their own rows

The current app still stores saved venues locally.

This causes:
- inconsistent behavior across devices
- runtime dependence on AsyncStorage
- duplication of concepts the backend already models properly

## Scope

This migration should cover saved venues first.

Do not migrate saved events in the same pass unless we explicitly choose a backend model for event favorites.

Current live schema only confirms `favorites(user_id, venue_id, created_at)` for venue favorites.

## Current state

Frontend currently uses AsyncStorage in:
- `app/venue/[id].tsx`
- `app/(tabs)/saved.tsx`
- `app/(tabs)/saved.ios.tsx`

There is also naming inconsistency between storage keys and route behavior.

## Target state

Saved venues should behave like this:
- authenticated user saves a venue
- app writes to `favorites`
- saved screen reads `favorites` for the current user, then joins to `venues`
- venue detail checks saved state from `favorites`
- anonymous users either:
  - see a sign-in prompt, or
  - temporarily keep a local fallback only if we intentionally support guest saving

## Architectural decision to make

Choose one:

1. Auth required for favorites
2. Hybrid guest fallback with later sync

Recommended:
- start with auth required for canonical favorites

Reason:
- live schema and RLS already support it cleanly
- it avoids adding guest-sync complexity during stabilization

## Implementation plan

### Phase 1. Read path

1. Add a favorites data helper
2. Read current authenticated user id from Supabase auth
3. In Saved screen:
   - query `favorites`
   - collect `venue_id`s
   - query `venues` by those ids
4. In Venue detail:
   - check whether a row exists in `favorites` for `(auth.uid, venue_id)`

### Phase 2. Write path

1. Replace AsyncStorage save/unsave logic in Venue detail
2. On save:
   - insert into `favorites`
3. On unsave:
   - delete from `favorites`
4. Handle duplicate save attempts safely

### Phase 3. UX fallback

1. If user is not authenticated:
   - decide whether to block save with friendly messaging
   - or temporarily keep guest fallback
2. Recommended first version:
   - show sign-in-required messaging

### Phase 4. Cleanup

1. Remove old venue-saving AsyncStorage dependence
2. Remove storage-key inconsistencies related to saved venues
3. Update docs and execution board

## Query model

### Read saved venue ids

Conceptually:

```sql
select venue_id
from favorites
where user_id = auth.uid();
```

### Resolve saved venues

Conceptually:

```sql
select *
from venues
where id in (...favorite venue ids...)
  and is_active = true;
```

### Check if a venue is saved

Conceptually:

```sql
select 1
from favorites
where user_id = auth.uid()
  and venue_id = :venue_id
limit 1;
```

## Risks

### Authentication dependency

If the app does not yet have a stable authenticated session model, favorites migration can feel premature.

Mitigation:
- keep the UI friendly
- degrade to “sign in to save” rather than failing noisily

### Event favorites mismatch

The current app has saved events in AsyncStorage too, but the live backend export only clearly shows venue favorites.

Mitigation:
- migrate venue favorites first
- decide event-saving architecture separately

## Success criteria

- saved venues are persisted in Supabase
- Saved screen venue tab reads from `favorites`
- venue detail save state reflects Supabase, not local storage
- no venue-saving dependence on AsyncStorage remains

## Files likely to change

- `app/venue/[id].tsx`
- `app/(tabs)/saved.tsx`
- `app/(tabs)/saved.ios.tsx`
- auth/session helpers if needed
- possibly a shared Supabase data helper

## Suggested priority

`High`

This should be one of the first migrations after runtime stabilization and Expo environment cleanup.
