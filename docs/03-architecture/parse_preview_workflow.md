# Parse Preview Workflow

## Purpose

Define the first backend-admin parse-preview stage that sits between raw intake and canonical promotion.

This stage does not write to `events`.

It exists to:

- read recent `raw_events`
- normalize obvious candidate fields
- estimate confidence
- surface likely review reasons

## Why this stage exists

Raw intake is now rich enough to support a first review layer, but it is still too early to auto-promote aggressively.

The parse-preview stage gives operators and future backend logic a safer middle step:

- more structure than raw rows
- less risk than direct promotion

## Current backend surfaces

The backend now exposes:

- `GET /ingestion/raw/recent`
- `GET /ingestion/parse-preview`

Both are backend-admin read surfaces that require:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Current parse-preview behavior

For recent `raw_events`, the preview currently derives:

- `normalizedTitle`
- `normalizedDateText`
- `normalizedVenueName`
- `hasDescription`
- `suggestedCategory`
- `parseConfidence`
- `suggestedOutcome`
- `reviewReasons`

Current confidence posture:

- `high` for rows with usable title/date and relatively few review problems
- `medium` for rows with several review issues but still usable structure
- `low` for rows missing core fields like title or date

Current suggested outcomes:

- `candidate`
- `review`

This stage is intentionally conservative.

## Current review reasons

The preview may currently flag:

- `missing_title`
- `missing_date`
- `missing_venue`
- `missing_image`
- `venue_unmatched`

These should be treated as operator cues, not final truth.

## Immediate operator use

Recommended flow after a manual source run:

1. inspect recent raw rows
2. call `GET /ingestion/parse-preview`
3. review which sources produce strong `candidate` rows
4. inspect which review reasons dominate
5. use that to choose the next enrichment or matching improvement

## Next evolution after home verification

After real runs are verified, the next parse-stage improvements should be:

1. date normalization from string into parseable datetime candidates
2. venue matching heuristics against known venues
3. duplicate checking against canonical events
4. explicit review queues for weak rows

The current architecture companions for those later steps are:

- `promotion_workflow.md`
- `venue_matching_strategy.md`
- `canonical_event_update_policy.md`

## Maintenance rule

When parse-preview logic changes materially:

1. update this doc
2. update `dedupe_and_promotion_policy.md`
3. update `ingestion_endpoint_contract.md`
4. update `handover.md`
5. update `project_ledger.md`
