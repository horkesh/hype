# Events And Series Reconciliation

## Purpose

Document what we know about the live canonical `events` and `event_series` tables, how they fit the current app, and what still needs to be checked before we design promotion or import behavior around them.

This is the repo-native answer to:

- what already exists in live canonical event content
- how much of the current app contract already matches that content model
- what the home machine needs to verify before promotion and dedupe logic becomes real

## Current finding

The live schema for `events` and `event_series` is already mature and product-shaped.

Important implication:

- the next event-data problem is not schema invention
- it is live-content reconciliation and promotion discipline

The app already assumes these tables are central discovery surfaces:

- Home
- Explore
- Tonight
- Event detail
- Series detail
- Saved

## Live `events` shape summary

Observed live canonical fields include:

- identity and content:
  - `id`
  - `title_bs`
  - `title_en`
  - `description_bs`
  - `description_en`
  - `cover_image_url`
- schedule and pricing:
  - `start_datetime`
  - `end_datetime`
  - `price_bam`
  - `ticket_url`
  - `is_recurring`
  - `recurrence_rule`
- classification and provenance:
  - `category`
  - `type`
  - `source`
  - `moods`
  - `tags`
- relationships:
  - `venue_id`
  - `series_id`
  - `submitted_by`
- state and lifecycle:
  - `status`
  - `is_active`
  - `is_featured`
  - `attendance_count`
  - `created_at`
  - `updated_at`
- fallback location fields:
  - `location_name`
  - `location_address`
  - `latitude`
  - `longitude`

Important conclusion:

- canonical `events` is already richer than the current raw-ingestion or prototype UI assumptions

## Live `event_series` shape summary

Observed live canonical fields include:

- identity and naming:
  - `id`
  - `slug`
  - `name_bs`
  - `name_en`
- content and presentation:
  - `description_bs`
  - `description_en`
  - `cover_image_url`
  - `logo_url`
- classification:
  - `category`
- timing and links:
  - `start_date`
  - `end_date`
  - `website_url`
  - `ticket_url`
- state:
  - `is_active`
  - `is_featured`
  - `created_at`
  - `updated_at`

Important conclusion:

- the current app-series model is already reasonably aligned with live schema
- the next uncertainty is not shape, but live-content completeness and relationship quality

## Index posture

Live indexes suggest real production usage patterns:

- `events`
  - active approved upcoming events by `start_datetime`
  - category filtering
  - featured filtering
  - `series_id`
  - `venue_id`
  - status filtering
- `event_series`
  - unique `slug`
  - active date-range lookups
  - featured filtering

This means:

- live reads are already optimized around the same public discovery flows the app wants
- future ingestion and promotion should respect these canonical filters instead of inventing alternate public-state rules

## Fit against the current app contract

The current app already uses the core event and series fields in a compatible way:

- Home expects upcoming `events` plus joined `venues(name)` and `event_series(name_bs, name_en)`
- Series detail expects a straightforward `event_series` row plus child `events`
- Tonight and Event detail already read the core public event fields

Main watch items:

- current app work is still verification-light on what live content actually looks like in production
- Saved events are still partly prototype-local in persistence terms even though canonical `events` is already real
- parse and promotion design should not assume canonical `events` is sparse or empty

## What we still do not know from this work machine

The repo contains schema, RLS, policy, and index exports.

It does **not** contain a live row export for:

- `events`
- `event_series`

So from this machine, we do **not** yet know:

- how many live canonical events currently exist
- how many are active and approved
- how much event coverage already exists by category
- how much canonical content is venue-linked versus location-only
- how many events already belong to series
- how complete series assets are in practice
- whether existing live event data is already strong enough to constrain promotion rules more tightly

This means the next event-content step is not "design promotion in the abstract."

It is:

- inspect the real live event and series rows first

## Recommended event-and-series strategy now

### 1. Treat live canonical rows as the primary event truth

Do not design ingestion as if canonical `events` will be created from zero.

### 2. Reconcile live content before writing promotion rules

Use the live database to answer:

- counts
- quality
- coverage by category
- venue linkage
- series linkage
- existing duplication risk

### 3. Keep promotion conservative until overlap is known

Before auto-promotion is introduced:

- dedupe against existing canonical `events`
- review likely collisions by title, date, and venue
- avoid creating parallel public rows where live canonical coverage is already good

### 4. Keep `event_series` creation stricter than raw-event creation

Series are higher-order entities.

So the first real promotion path should prefer:

- matching to an existing series
- or leaving `series_id` empty

before creating new `event_series` rows casually.

## Recommended home-machine reconciliation pass

When you are on the home machine:

1. inspect live row counts for `events` and `event_series`
2. break out `events` by:
   - `status`
   - `is_active`
   - category
   - presence of `venue_id`
   - presence of `series_id`
3. check upcoming approved event density
4. inspect how complete series rows are for:
   - `slug`
   - dates
   - descriptions
   - images
5. inspect a sample of recent events to see:
   - title quality
   - bilingual coverage
   - ticket/source completeness
   - venue matching quality

## Recommended promotion posture

Do not jump straight from parse preview into automatic inserts into canonical `events`.

Recommended posture:

- reconcile first
- inspect existing live quality
- design duplicate checks around live canonical reality
- promote only when a raw candidate is clearly better than "no canonical row exists"

For `event_series`:

- prefer match or no-series
- create new series only after a stronger review threshold

## Supporting queries

Use:

- `backend/sql/events_series_reconciliation_queries.sql`

That query pack is the first operator toolset for:

- live event and series counts
- active approved coverage
- category and linkage distribution
- completeness checks for ticketing, imagery, bilingual fields, and relationships

## Maintenance rule

When event or series reconciliation advances:

1. update this doc
2. update `program_map.md` if event-promotion planning becomes an active near-term item
3. update `handover.md` if the home-machine event-reconciliation task becomes part of the next execution block
4. update `project_ledger.md`
