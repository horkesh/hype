# Live Supabase Assessment

This document summarizes the current live Supabase architecture based on exported CSV snapshots from `docs/08-reference/`.

Reviewed files:
- `live_supabase_schema.csv`
- `live_supabase_policies.csv`
- `live_supabase_rls_status.csv`
- `live_supabase_indexes.csv`

## Executive summary

The live Supabase project is more mature than the current mobile prototype.

That is good news.

The backend already contains:
- a strong canonical content model for venues, events, event series, and daily specials
- user-facing social and progress tables
- submission and moderation workflows
- venue claim flow
- scraper and ingestion foundations
- RLS enabled across almost all user-facing tables
- useful indexes for core reads

The main architectural problem is no longer "does the schema exist?"

It is now:
- the mobile app is still partially coded against prototype field assumptions
- local device storage is still used where live Supabase tables already exist
- the app is not yet taking advantage of the richer backend model

## What the live backend already supports

### Core discovery model

The live database has the right canonical core:
- `venues`
- `events`
- `event_series`
- `daily_specials`

Important live fields confirm the direction we already suspected:
- `venues.price_range`
- `venues.instagram_handle`
- `venues.insider_tip_bs`
- `venues.insider_tip_en`
- `daily_specials.title_bs`
- `daily_specials.title_en`
- `daily_specials.price_bam`
- `daily_specials.valid_time_start`
- `daily_specials.valid_time_end`

This validates the schema-alignment work already underway in the app.

### User and engagement model

The live project also has:
- `profiles`
- `favorites`
- `checkins`
- `event_attendance`
- `badges`
- `user_badges`
- `tips`
- `tip_upvotes`
- `ai_plans`

This is important because the current prototype still stores some user state in AsyncStorage that should eventually move to the backend:
- saved venues and events
- taste profile
- possibly planner history

### Submission, ownership, and moderation model

The live schema includes:
- `event_submissions`
- `venue_submissions`
- `venue_claims`
- admin review queue structures

This means the architecture is already prepared for:
- community submissions
- venue owner onboarding
- curated moderation

### Scraper and ingestion foundation

The live schema already includes:
- `raw_events`
- `scrape_sources`
- `scrape_log`

This is a strong sign that scraper architecture should be built into this Supabase project rather than invented elsewhere first.

## RLS and policy assessment

The live project is using Row Level Security seriously.

RLS is enabled on key public/user tables, including:
- `venues`
- `events`
- `event_series`
- `daily_specials`
- `profiles`
- `favorites`
- `ai_plans`
- `tips`
- `user_badges`
- `venue_claims`
- `venue_submissions`

Public-read policies are in place for the main discovery surfaces:
- venues: public read when `is_active = true`
- events: public read when `is_active = true` and `status = 'approved'`
- event series: public read when `is_active = true`
- daily specials: public read when `is_active = true`
- badges and tips also have public-read policies

User-owned policies exist for:
- `favorites`
- `ai_plans`
- `venue_claims`
- `venue_submissions`
- `profiles`
- `tips`

This is a strong architecture base.

## Index assessment

The live backend also has sensible indexes:
- active upcoming events
- events by venue
- events by series
- event series by slug and active dates
- favorites by user
- checkins by user and venue
- raw events by source and parse state

This suggests the backend was designed with real product usage in mind, not only as a rough prototype.

## Main mismatch with the app

The current mobile app still behaves like an earlier prototype in a few major ways.

### 1. Field-shape mismatch

The app still expects prototype-shaped fields in some places:
- `price_level` instead of `price_range`
- `instagram` instead of `instagram_handle`
- single `insider_tip` instead of bilingual tip fields
- flattened daily-special display fields instead of canonical bilingual/time fields

This is already being addressed with temporary normalization helpers.

### 2. Local storage where backend tables already exist

The live backend has `favorites` and `profiles.taste_moods`, but the app still uses AsyncStorage for:
- saved venues
- saved events
- taste profile

This is acceptable during stabilization, but it should not remain the long-term architecture.

### 3. Submission and ownership features are not surfaced in the app yet

The backend already supports:
- venue claims
- venue submissions
- event submissions

The app does not yet fully expose those flows.

### 4. Scraper tables exist, but ingestion is not yet the main operational pipeline

The schema already has ingestion-oriented tables, but the app and backend repo have not yet converged on a single ingestion path.

## Architectural conclusion

The live Supabase project should now be treated as the canonical backend architecture.

That means:
- the app should align to the live schema, not the other way around
- current adapter layers are temporary stabilization tools
- local prototype storage should gradually move to backend-backed user state
- scraper work should be planned around the existing ingestion tables

## Recommended next steps

### Immediate

1. continue frontend schema alignment against the live canonical fields
2. stop adding new UI code against legacy field names
3. document the live Supabase model as the default backend source of truth

### Near term

1. replace AsyncStorage-based favorites with the `favorites` table
2. replace AsyncStorage taste-profile storage with `profiles.taste_moods`
3. align planner persistence with `ai_plans`

### After stabilization

1. define the real scraper ingestion workflow using `scrape_sources`, `raw_events`, and `scrape_log`
2. define moderation/admin flows around submission and claim tables
3. decide whether the separate `backend/` service remains necessary for orchestration, scraping, and privileged workflows

## Architectural recommendation

The current best path is:

1. keep stabilizing the app
2. align the app to the live Supabase schema
3. migrate prototype-local user state to Supabase tables
4. use the live backend as the platform foundation for scraping, moderation, and ownership flows
