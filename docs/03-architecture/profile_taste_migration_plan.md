# Profile Taste Migration Plan

## Goal

Replace AsyncStorage-based taste-profile persistence with `profiles.taste_moods`.

## Why this matters

The live backend already supports taste storage in the canonical user profile:
- `profiles.taste_moods text[]`
- `profiles.preferred_language`

The current app still stores taste profile locally.

This causes:
- settings not following the user across devices
- unnecessary AsyncStorage dependency
- duplicated state model between frontend and backend

## Current state

Frontend currently uses AsyncStorage for taste profile in:
- `app/(tabs)/profile.tsx`
- `app/(tabs)/profile.ios.tsx`

The profile screen also appears to manage auth and user settings.

## Target state

Taste profile should behave like this:
- authenticated user opens profile
- app reads `profiles.taste_moods`
- user updates selected moods
- app writes changes back to `profiles`
- mood preferences become portable across devices and sessions

## Architectural approach

Recommended model:
- authenticated users use `profiles.taste_moods`
- unauthenticated users may either:
  - see a limited local-only experience, or
  - be encouraged to sign in before personalization is persistent

Recommended first version:
- keep the canonical path authenticated
- avoid overbuilding guest sync

## Implementation plan

### Phase 1. Read path

1. Load current authenticated user
2. Query `profiles` by `id = auth.uid()`
3. Read `taste_moods`
4. Populate UI selection from backend instead of AsyncStorage

### Phase 2. Write path

1. Replace local save function
2. Update `profiles.taste_moods` on user changes
3. Keep optimistic UI if desired, but backend should be source of truth

### Phase 3. Profile bootstrap

If a profile row may not exist yet:

1. confirm whether profile creation is automatic in the backend
2. if not, add safe profile bootstrap logic on first authenticated load

This should be verified before implementation.

## Query model

### Read taste profile

Conceptually:

```sql
select taste_moods
from profiles
where id = auth.uid();
```

### Update taste profile

Conceptually:

```sql
update profiles
set taste_moods = :selected_moods,
    updated_at = now()
where id = auth.uid();
```

## Related improvements

This migration pairs naturally with:
- language preference cleanup using `profiles.preferred_language`
- future personalization work for recommendations
- better planner suggestions and saved content targeting

## Risks

### Profile row existence

If some authenticated users do not yet have a `profiles` row, reads and writes may fail.

Mitigation:
- verify profile bootstrap path before migration

### Current auth maturity

If auth is still unstable in the app, taste migration may feel inconsistent until authentication is more reliable.

Mitigation:
- implement after or alongside auth/profile stabilization

## Success criteria

- profile taste selection reads from `profiles.taste_moods`
- updates persist to Supabase
- taste profile is portable across devices
- profile screen no longer depends on AsyncStorage for taste moods

## Files likely to change

- `app/(tabs)/profile.tsx`
- `app/(tabs)/profile.ios.tsx`
- auth/profile bootstrap helpers
- possibly shared profile data helpers

## Suggested priority

`High`

This should follow soon after favorites migration, or be implemented alongside it if auth/profile work is already being touched.
