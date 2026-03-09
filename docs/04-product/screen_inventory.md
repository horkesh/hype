# Screen Inventory

This file tracks what the current mobile app actually implements, what is partial, and what is still missing versus the intended product shape.

## Status legend

- `Implemented`: present in code and clearly part of the current surface
- `Partial`: present but incomplete, unstable, or divergent from the intended product
- `Missing`: planned in the master docs but not meaningfully implemented in this repo yet

## Primary tab surfaces

### Home

Route:

- `app/(tabs)/(home)/index.tsx`

Status:

- `Partial`

Implemented:

- home feed exists
- weather-based hero logic exists
- mood-driven discovery logic exists
- event and series-related content is present in some form

Needs confirmation or completion:

- full parity with the Natively prompt sections
- reliable behavior across all queried sections
- validation of weather fallback behavior

Missing or not yet confirmed:

- final “city pulse” interpretation from the architecture docs
- full hidden spots / insider / personalized sections as production-ready features

### Explore

Route:

- `app/(tabs)/explore.tsx`

Status:

- `Implemented`, with recent stabilization work

Implemented:

- search input
- venue and event autocomplete
- mood filter chips
- category grid
- list / daily menu switching
- filter modal with mood/category/price/open-now controls
- venue list cards
- daily specials listing

Partial:

- search lifecycle needed bug fixes and still needs validation
- map behavior needs verification against the intended product shape

Missing:

- fully confirmed dedicated map tab parity with the original prompt

### Tonight

Route:

- `app/(tabs)/tonight.tsx`

Status:

- `Partial`

Implemented:

- dedicated Tonight surface exists
- event-based evening discovery exists
- richer UI logic than a placeholder screen

Needs confirmation:

- time-segment behavior
- map or AI-plan behavior if present
- share and ticket workflows

Missing or not yet confirmed:

- final “city pulse” emphasis from later architecture direction

### Saved

Route:

- `app/(tabs)/saved.tsx`

Status:

- `Partial`

Implemented:

- saved content surface exists
- AsyncStorage-backed saved patterns exist
- badge-related UI/data assumptions exist

Needs confirmation:

- event/venue tab behavior
- swipe/remove interactions
- badge data integrity

Missing:

- polished user-history and loyalty flow

### Profile

Route:

- `app/(tabs)/profile.tsx`

Status:

- `Partial`

Implemented:

- profile/settings surface exists
- language and theme behavior exist
- auth/profile checks exist
- taste profile storage exists in early form

Needs confirmation:

- Supabase auth reliability
- profile persistence model
- sign-in / sign-up UX quality

Missing:

- productized account lifecycle
- richer stats / wrapped / notification preference surface

## Detail surfaces

### Event detail

Route:

- `app/event/[id].tsx`

Status:

- `Implemented`, recently stabilized

Implemented:

- event fetch by id
- title, description, datetime, venue, category, moods, price, ticket link
- save behavior
- navigation to linked venue

Recently fixed:

- effect initialization order bug
- effect dependency render loop risk

### Venue detail

Route:

- `app/venue/[id].tsx`

Status:

- `Implemented`, recently stabilized

Implemented:

- venue fetch by id
- open/closed status
- hours expansion
- action buttons for navigation/contact/web/instagram/save
- delivery links
- hidden gem callout
- info / events / specials tabs

Recently fixed:

- effect initialization order bug
- effect dependency render loop risk

### Series detail

Route:

- `app/series/[id].tsx`

Status:

- `Implemented`, recently stabilized

Implemented:

- series fetch by id
- child event listing
- countdown/date-range logic
- website/ticket links
- save behavior

Recently fixed:

- effect initialization order and dependency pattern

## Cross-screen product capabilities

### Bilingual behavior

Status:

- `Implemented`, but needs cleanup

Notes:

- app-wide BS/EN switching exists
- some strings show encoding artifacts and need a cleanup pass

### Theme behavior

Status:

- `Implemented`

Notes:

- app-level theme and mode state exist
- verify parity against the original adaptive-theme intent

### Saved/favorites behavior

Status:

- `Partial`

Notes:

- current implementation relies heavily on AsyncStorage
- long-term ownership between local and authenticated storage is still undecided

### Direct Supabase data reads

Status:

- `Implemented`

Notes:

- current mobile prototype reads directly from Supabase in multiple screens
- canonical client location and backend ownership still need alignment

## Product gaps that remain outside the current repo scope

- admin panel
- public SEO site
- venue dashboard
- mature city pulse experience
- scraper-fed live freshness loop
- robust moderation and operations tooling

## Recommended next updates to this file

- add one subsection per screen for exact queries and interactions
- mark which prompt features are absent versus deferred
- link each screen to the relevant schema contract fields
