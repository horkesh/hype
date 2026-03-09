# Query Surface Map

This document maps which mobile screens query which tables and which fields they currently depend on.

It is intended to support the schema alignment pass.

## Home

File:

- `app/(tabs)/(home)/index.tsx`

Queries:

- `venues`
- `events`
- `event_series`

Current access patterns:

- random cafe query reads `venues` with `select('*')` filtered by `category = cafe`
- upcoming events query reads `events` plus joined `venues(name)` and `event_series(id, name_bs, name_en)`
- event series query reads `event_series` with `select('*')`

Notable fields in use:

- `venues`: `id`, `name`, `cover_image_url`, `neighborhood`, `description_bs`, `description_en`, category-related display data
- `events`: `id`, `title_bs`, `title_en`, `cover_image_url`, `start_datetime`, `moods`, `price_bam`, `ticket_url`, `series_id`, joined venue name
- `event_series`: `id`, `name_bs`, `name_en`, `cover_image_url`, `start_date`, `end_date`

## Explore

File:

- `app/(tabs)/explore.tsx`

Queries:

- `venues`
- `events`
- `daily_specials`

Current access patterns:

- search venues by `name`
- search events by `title_bs` and `title_en`
- venue list reads `venues` with `select('*')`
- daily menu reads `daily_specials` with `select('*')`

Notable fields in use:

- `venues`: `id`, `name`, `category`, `neighborhood`, `price_level`, `moods`, `opening_hours`, `cover_image_url`
- `events`: `id`, `title_bs`, `title_en`
- `daily_specials`: UI expects flattened fields such as `venue_name`, `menu_title`, `price`, `valid_times`, `is_active`

## Tonight

File:

- `app/(tabs)/tonight.tsx`

Queries:

- `venues`
- `events`

Current access patterns:

- venue map query reads `id, name, category, latitude, longitude`
- event query reads explicit event fields plus joined `venues(name)`

Notable fields in use:

- `venues`: `id`, `name`, `category`, `latitude`, `longitude`
- `events`: `id`, `title_bs`, `title_en`, `description_bs`, `description_en`, `cover_image_url`, `start_datetime`, `price_bam`, `ticket_url`, `source`, `moods`, `category`, `location_name`, joined venue name, plus `is_active` and `status` as filters

## Saved

File:

- `app/(tabs)/saved.tsx`

Queries:

- `venues`
- `events`
- `badges`

Current access patterns:

- saved venue ids loaded from AsyncStorage then resolved through `venues`
- saved event ids loaded from AsyncStorage then resolved through `events` plus joined `venues(name)`
- badges query reads `badges`

Notable fields in use:

- `venues`: `id`, `name`, `category`, `neighborhood`, `price_level`, `moods`, `cover_image_url`
- `events`: `id`, `title_bs`, `title_en`, `cover_image_url`, `start_datetime`, `price_bam`, joined venue name, `location_name`
- `badges`: current screen expects generic badge metadata fields consistent with canonical schema

## Profile

File:

- `app/(tabs)/profile.tsx`

Queries:

- `supabase.auth`

Current access patterns:

- `getUser`
- `signInWithPassword`
- `signUp`
- `signOut`

Notable gap:

- profile and taste mood persistence are still partly local rather than fully canonical through `profiles`

## Detail screens

### Event detail

File:

- `app/event/[id].tsx`

Queries:

- `events`

Current access patterns:

- explicit event field selection with joined `venues(id, name)`

Notable fields in use:

- `id`, `title_bs`, `title_en`, `description_bs`, `description_en`, `cover_image_url`, `start_datetime`, `end_datetime`, `price_bam`, `ticket_url`, `source`, `moods`, `category`, `venue_id`, `location_name`

### Venue detail

File:

- `app/venue/[id].tsx`

Queries:

- `venues`
- `events`
- `daily_specials`

Notable fields in use:

- `venues`: `id`, `name`, `cover_image_url`, `category`, `category_emoji`, `price_level`, `moods`, `opening_hours`, `is_hidden_gem`, `insider_tip`, `address`, `phone`, `website`, `instagram`, `delivery_korpa_url`, `delivery_glovo_url`, `description_bs`, `description_en`, `latitude`, `longitude`
- `events`: `id`, `title_bs`, `title_en`, `cover_image_url`, `start_datetime`, `price_bam`, `ticket_url`
- `daily_specials`: same flattened assumptions as Explore

### Series detail

File:

- `app/series/[id].tsx`

Queries:

- `event_series`
- `events`

Notable fields in use:

- `event_series`: `id`, `name_bs`, `name_en`, `description_bs`, `description_en`, `start_date`, `end_date`, `category`, `cover_image_url`, `website_url`, `ticket_url`, `is_active`
- `events`: `id`, `title_bs`, `title_en`, `start_datetime`, `price_bam`, `ticket_url`, `moods`, joined `venues(name)`, `location_name`, plus `series_id` and `is_active` as filters

## Highest-impact alignment zones

### Zone 1: Venues

Touches:

- Home
- Explore
- Tonight
- Saved
- Venue detail
- Event detail (indirectly)

### Zone 2: Daily specials

Touches:

- Explore
- Venue detail

### Zone 3: Profiles and saved state

Touches:

- Saved
- Profile

This should be aligned after the core read surfaces are stabilized.
