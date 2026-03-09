# Schema Alignment Workplan

This is the concrete workplan for the first schema alignment pass.

## Order of execution

### Step 1: Venues

Goal:

Align the app with canonical venue fields first because venue data is used across the most screens.

Tasks:

- replace `price_level` assumptions with `price_range` or define one canonical client mapping
- replace `instagram` assumptions with `instagram_handle` or a normalized URL builder
- replace single `insider_tip` assumptions with bilingual tip selection
- decide whether `category_emoji` is computed client-side instead of fetched from DB

Screens affected:

- Explore
- Saved
- Venue detail
- Home random cafe / venue cards

### Step 2: Daily specials

Goal:

Resolve the mismatch between the UI’s flattened field expectations and the canonical bilingual/time-structured schema.

Tasks:

- decide whether to:
  - adapt frontend queries and formatting directly
  - or introduce a temporary SQL view for display-ready fields
- standardize price and valid-time formatting
- standardize venue-name resolution

Screens affected:

- Explore
- Venue detail

### Step 3: Profile and persistence

Goal:

Move durable user preferences toward canonical profile storage after read surfaces are stable.

Tasks:

- confirm auth/profile contract
- decide which preferences stay local and which belong in `profiles`
- reconcile saved-state strategy over time

## Recommended implementation style

- prefer incremental screen-safe changes
- update docs as each entity contract is aligned
- avoid big-bang rewrites across all tables at once

## Deliverables

- updated entity contracts
- updated screen queries
- updated schema-to-UI contract notes
