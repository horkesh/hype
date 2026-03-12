# Venue Seed Reconciliation

## Purpose

Document what we already know about the large venue seed, how it fits the live `venues` schema, and what still needs to happen before we treat venue population as finished.

This is the repo-native answer to:

- do we already have venues
- is the seed still relevant
- what should happen next for venues

## Current finding

The external venue seed is real and substantial:

- source file: `../hype-venues-seed.json`
- current count: `1233` venues

This means venue population is not a zero-to-one sourcing problem.

It is now a reconciliation and import-discipline problem.

## Seed shape summary

The seed already carries a strong venue model.

Observed fields include:

- `name`
- `slug`
- `category`
- `subcategory`
- `address`
- `neighborhood`
- `latitude`
- `longitude`
- `phone`
- `website`
- `instagram_handle`
- `description_bs`
- `description_en`
- `opening_hours`
- `price_range`
- `moods`
- `is_hidden_gem`
- `insider_tip_bs`
- `insider_tip_en`
- `delivery_korpa_url`
- `delivery_glovo_url`
- `tags`
- `is_verified`
- `is_new`
- `cover_image_url`
- `logo_url`
- `facebook_url`
- `google_place_id`
- `google_rating`
- `google_rating_count`
- `source`

This is already very close to the live canonical `venues` schema.

## Category distribution in the current seed

Current category counts from the seed:

- `restaurant`: 456
- `cafe`: 416
- `bar`: 175
- `gallery`: 95
- `outdoor`: 40
- `club`: 22
- `cultural_center`: 14
- `theatre`: 9
- `cinema`: 5
- `concert_hall`: 1

Implication:

- the seed is broad enough to support initial venue discovery surfaces
- nightlife and culture are present, but hospitality categories dominate

## Fit against live `venues` schema

The live `venues` schema expects:

- strong overlap with the seed on identity, contact, location, content, and quality fields

Important conclusion:

- the seed is already close enough to the canonical schema that it should be treated as a primary import candidate, not just a historical note

Main mismatches or watch items:

- seed includes `source`, but live schema does not have a dedicated `source` column
- live schema includes `location`, `claimed_by`, `claimed_at`, `created_at`, and `updated_at`, which should be handled by the database or later workflows
- category and subcategory vocabulary should still be checked for consistency against product expectations

## What we still do not know from this work machine

The repo contains live schema, policy, and index exports, but not an export of the current live `venues` rows.

So from this machine, we do **not** yet know:

- how many venues already exist in live Supabase
- how much overlap there is between live rows and the 1233-seed file
- whether the live `venues` table is already mostly populated from this same seed
- how many duplicates or conflicts exist by `slug`, `name`, or `google_place_id`

This means the next venue step is not “invent a new seed.”

It is:

- compare the live `venues` table against the existing seed

## Recommended venue strategy now

### 1. Treat the 1233-seed file as the canonical import candidate

Do not rebuild the venue dataset from scratch.

### 2. Reconcile before importing blindly

Use the live database to answer:

- already present
- missing from live
- likely duplicates
- low-quality rows needing cleanup

### 3. Prefer conservative upsert keys

Best likely matching keys:

1. `google_place_id`
2. `slug`
3. normalized `name + address`

### 4. Keep event ingestion from creating venues casually

Even with a large seed, raw event ingestion should still:

- prefer matching to existing venues
- hold unmatched venues for review
- avoid noisy auto-creation

## Recommended home-machine reconciliation pass

When you are on the home machine:

1. inspect the current live `venues` table
2. compare counts by category
3. compare overlap by:
   - `google_place_id`
   - `slug`
   - `name`
4. decide whether the seed should:
   - backfill missing venues
   - refresh weak existing rows
   - or mostly remain as historical source data

## Recommended import posture

Do not treat the next venue import as one giant destructive reload.

Recommended posture:

- reconcile first
- import or upsert conservatively
- preserve live IDs and existing product references
- prefer filling gaps and improving weak rows over replacing everything

## Supporting queries

Use:

- `backend/sql/venue_reconciliation_queries.sql`

That query pack is the first operator toolset for:

- live venue counts
- category distribution
- coverage of `google_place_id`
- coverage of `instagram_handle`
- coverage of coordinates and descriptions

## Maintenance rule

When venue reconciliation advances:

1. update this doc
2. update `program_map.md` if venue import becomes an active near-term item
3. update `handover.md` if the home-machine venue task becomes a concrete next step
4. update `project_ledger.md`
