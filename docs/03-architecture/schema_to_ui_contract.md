# Schema To UI Contract

This document maps the current mobile UI to the intended Supabase schema in `..\hype-supabase-schema.sql`.

The goal is to make field expectations explicit and reveal where the prototype and schema do not yet line up cleanly.

## Canonical tables reviewed

- `venues`
- `events`
- `event_series`
- `daily_specials`
- supporting tables currently referenced by product plans: `profiles`, `badges`, `user_badges`, `ai_plans`

## Important note

The current mobile app is prototype-driven. Some screens assume field names or relationships that may differ from the canonical schema. Those mismatches should be treated as cleanup work, not as proof the schema is wrong.

---

## Venues

### Core schema fields expected by UI

- `id`
- `name`
- `category`
- `neighborhood`
- `address`
- `latitude`
- `longitude`
- `phone`
- `website`
- `description_bs`
- `description_en`
- `cover_image_url`
- `opening_hours`
- `moods`
- `is_hidden_gem`
- `delivery_korpa_url`
- `delivery_glovo_url`

### UI routes using venue data

- Home
- Explore
- Venue detail
- Event detail via linked venue display
- Tonight in venue references
- Saved

### Known mismatches or watch items

- Current UI uses `price_level` in several places, but canonical schema uses `price_range`.
- Current UI expects `instagram` in some places, while canonical schema defines `instagram_handle`.
- Current UI expects `category_emoji` in venue detail, but canonical schema does not define a dedicated `category_emoji` field.
- Current UI references `insider_tip`, while canonical schema splits this into `insider_tip_bs` and `insider_tip_en`.

### Recommendation

- Standardize venue pricing around one field name.
- Decide whether emoji/category presentation is computed in UI or stored in DB.
- Align insider tip handling with bilingual fields instead of a single combined field.

---

## Events

### Core schema fields expected by UI

- `id`
- `title_bs`
- `title_en`
- `description_bs`
- `description_en`
- `cover_image_url`
- `start_datetime`
- `end_datetime`
- `price_bam`
- `ticket_url`
- `moods`
- `category`
- `venue_id`
- `location_name`
- `source`
- `series_id`

### UI routes using event data

- Home event feed
- Explore search
- Tonight
- Event detail
- Venue detail event tab
- Series detail child-event list
- Saved

### Known mismatches or watch items

- Canonical schema uses `cover_image_url` in the v4 schema, which matches current UI better than earlier prompt wording like `image_url`.
- Event moderation/status fields exist in schema but are not surfaced in the current app logic.
- Event attendance and richer source-tracking fields exist in schema but are not meaningfully used yet.

### Recommendation

- Keep the mobile v0.1 focused on the event fields already visible in UI.
- Defer advanced source/moderation/attendance usage until after stabilization.

---

## Event series

### Core schema fields expected by UI

- `id`
- `name_bs`
- `name_en`
- `description_bs`
- `description_en`
- `category`
- `cover_image_url`
- `start_date`
- `end_date`
- `website_url`
- `ticket_url`
- `is_active`

### UI routes using series data

- Home active series section
- Series detail
- Event cards where series context is shown

### Known mismatches or watch items

- Current UI uses a straightforward series model that fits the canonical schema reasonably well.
- The stronger future architecture may eventually move toward event instances and more normalized recurring structures, but that should not block current usage.

### Recommendation

- Keep `event_series` as the current UI contract for v0.1.
- Revisit only after scraping and deduplication mature.

---

## Daily specials

### Core schema fields expected by UI

- `id`
- `venue_id`
- `is_active`
- descriptive title
- price field
- valid-time display fields

### Current UI assumptions

Current Explore and Venue screens assume fields like:

- `menu_title`
- `price`
- `valid_times`
- `description`
- `venue_name`

### Canonical schema fields

Canonical schema uses:

- `title_bs`
- `title_en`
- `description_bs`
- `description_en`
- `price_bam`
- `valid_days`
- `valid_time_start`
- `valid_time_end`

### Major mismatch

This is currently the clearest schema-to-UI mismatch in the app.

The prototype UI is shaped around flattened display-friendly fields, while the schema is shaped around bilingual structured fields.

### Recommendation

Choose one of these approaches:

1. adapt the UI to canonical fields and format display values client-side
2. expose a view or query transform that returns display-friendly fields for the prototype

For maintainability, I recommend option 1 for the app code or option 2 through a stable database view if we want simpler frontend reads.

---

## Profiles

### Current UI usage

Profile screen assumes:

- user session exists or not
- taste profile can be stored
- language/theme preferences exist

### Canonical schema fit

`profiles` supports:

- `preferred_language`
- `taste_moods`
- role and metadata fields

### Current gap

Some current profile behavior still uses AsyncStorage-style prototype patterns rather than fully leaning on canonical profile storage.

### Recommendation

- keep local fallbacks during prototype hardening
- migrate the durable user preference source to `profiles` once auth flows are confirmed stable

---

## Badges and user badges

### Current UI usage

Saved/Profile surfaces imply badge-related functionality.

### Schema support

- `badges`
- `user_badges`

### Current gap

The app appears to have early badge assumptions, but not a mature end-to-end badge system yet.

### Recommendation

- treat badges as a later-stage feature, not a stabilization blocker

---

## AI plans and city pulse

### Planned support

Canonical schema includes `ai_plans`.

### Current UI state

Tonight/product plans hint toward AI planning and richer pulse features, but this is not yet a core stabilized flow in the app.

### Recommendation

- keep AI plans out of the critical path until the app baseline is stable

---

## Priority mismatch list

### Highest priority

- `venues.price_level` vs canonical `venues.price_range`
- `venues.instagram` vs canonical `venues.instagram_handle`
- `venues.insider_tip` vs canonical bilingual insider tip fields
- `daily_specials` flattened UI fields vs canonical bilingual/time-structured schema

### Medium priority

- confirm category/mood vocab consistency between UI and schema
- verify event-series naming and joins across screens

### Lower priority

- badges
- ai plans
- advanced moderation fields

## Recommended next actions

1. Decide whether the mobile app adapts to the canonical schema directly or whether DB views will smooth prototype-friendly reads.
2. Standardize the `venues` contract first, since it touches Explore, Home, Venue detail, Saved, and event-linked navigation.
3. Resolve `daily_specials` next, since it has the largest field-shape mismatch.
4. Move profile persistence gradually from local-only patterns toward canonical profile fields once auth is stable.
