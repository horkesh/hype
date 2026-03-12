# Daily Specials Reconciliation

## Purpose

Document what we know about the live canonical `daily_specials` table, how it conflicts with current UI assumptions, and what still needs to be checked before we treat specials as operationally trustworthy.

This is the repo-native answer to:

- what canonical daily specials actually look like
- whether live specials are likely usable as-is
- what must be verified before we decide between UI adaptation, views, or later ingestion support

## Current finding

`daily_specials` is structurally real in the live schema, but it remains the clearest shape mismatch between the prototype UI and the canonical backend.

Important implication:

- the next specials problem is not schema invention
- it is live-content quality reconciliation plus frontend-contract cleanup

## Live `daily_specials` shape summary

Observed live canonical fields include:

- identity and relationship:
  - `id`
  - `venue_id`
- content:
  - `type`
  - `title_bs`
  - `title_en`
  - `description_bs`
  - `description_en`
- commercial and validity fields:
  - `price_bam`
  - `valid_days`
  - `valid_time_start`
  - `valid_time_end`
- state:
  - `is_active`
  - `created_at`

Important conclusion:

- canonical specials are bilingual and time-structured
- current UI still expects a flatter display model

## Fit against the current app contract

The app currently assumes flattened display-friendly fields in Explore and Venue detail, such as:

- `menu_title`
- `price`
- `valid_times`
- `description`
- `venue_name`

Canonical schema instead expects the app to compose those displays from:

- `title_bs` / `title_en`
- `description_bs` / `description_en`
- `price_bam`
- `valid_days`
- `valid_time_start`
- `valid_time_end`
- joined venue data

Important implication:

- even if the live data is good, the app still needs contract cleanup
- but live-data quality should be checked before choosing whether to solve the mismatch in frontend code only or through a database view

## Index and access posture

The reference exports show:

- `daily_specials` has a primary-key index
- RLS is enabled at the table level in the live assessment
- the earlier live assessment indicates public reads for active specials

There are no table-specific policy rows for `daily_specials` in the reference policy export currently stored in the repo.

This is a useful reminder that:

- the repo export is enough to understand shape and some access posture
- it is not enough to prove the exact live read-policy details without a real runtime/database check

## What we still do not know from this work machine

The repo does **not** contain a live row export for `daily_specials`.

So from this machine, we do **not** yet know:

- how many active specials currently exist
- how well specials cover key venue categories
- whether `title_bs` and `description_bs` are populated consistently
- how often time windows are present
- whether `type` values are clean and usable
- whether the table is effectively populated or mostly an empty architectural shell

This means the next specials step is not "keep debating field names."

It is:

- inspect the real live specials rows and quality

## Recommended daily-specials strategy now

### 1. Treat live `daily_specials` as the canonical source

Do not add more prototype-only display assumptions around flattened specials fields.

### 2. Reconcile live content quality before committing to UI strategy

Use the live database to answer:

- volume
- active coverage
- venue coverage
- bilingual completeness
- price completeness
- time-window completeness
- type vocabulary quality

### 3. Keep the app-side solution flexible until live quality is known

The likely options remain:

1. adapt the UI to canonical fields and format client-side
2. create a stable view for display-friendly fields

But the right choice depends partly on:

- how consistent the live rows are
- how much transformation is needed repeatedly

### 4. Do not prioritize scraped-special promotion before this reconciliation

The ingestion architecture can eventually support specials, but the first question is still:

- is the canonical table already strong enough to consume directly

## Recommended home-machine reconciliation pass

When you are on the home machine:

1. inspect live row counts for `daily_specials`
2. break out rows by:
   - `is_active`
   - `type`
   - venue category through joined `venues`
3. measure completeness for:
   - `title_bs`
   - `title_en`
   - `description_bs`
   - `price_bam`
   - `valid_days`
   - `valid_time_start`
   - `valid_time_end`
4. inspect a sample of active rows with joined venue names
5. decide whether the current product issue is mostly:
   - field-shape mismatch
   - live data sparsity
   - or both

## Recommended product posture

Do not redesign specials around placeholder frontend fields.

Recommended posture:

- reconcile live content first
- then decide whether to:
  - adapt the app directly to canonical fields
  - or create one stable query/view for display formatting

If live content is sparse:

- keep specials as a lower-intensity surface until coverage improves

If live content is strong:

- prioritize the app contract cleanup because the backend is already ahead of the UI

## Supporting queries

Use:

- `backend/sql/daily_specials_reconciliation_queries.sql`

That query pack is the first operator toolset for:

- live specials counts
- active and type distribution
- venue-linked coverage
- bilingual, pricing, and time-window completeness
- joined review samples

## Maintenance rule

When daily-specials reconciliation advances:

1. update this doc
2. update `program_map.md` if specials alignment becomes an active near-term item
3. update `handover.md` if the home-machine specials reconciliation becomes part of the next execution block
4. update `project_ledger.md`
