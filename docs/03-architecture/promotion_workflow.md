# Promotion Workflow

## Purpose

Define the first concrete path from ingested `raw_events` to canonical product content.

This document turns the current ingestion architecture into an operational publishing workflow.

It answers:

- when a raw row becomes a publishable candidate
- when a candidate becomes a canonical `event`
- when a candidate should be held for review
- when a candidate should be treated as enrichment instead of a new event

## Core principle

Do not collapse ingestion into one opaque "scrape and publish" action.

Keep these stages explicit:

1. raw intake
2. parse preview
3. venue match
4. duplicate check
5. promotion decision
6. canonical write or hold

## Canonical target model

The first promotion path targets:

- `events`

It may also:

- attach `series_id` when there is a confident series match

It should **not** casually create:

- new `venues`
- new `event_series`

Those are stricter downstream decisions.

## Stage model

### Stage 1. Raw intake

Input:

- `raw_events` rows from source fetch and enrichment

Required outcome:

- provenance preserved
- source URL preserved when available
- listing/detail metadata preserved in `raw_json`

This stage does not make publishability claims.

### Stage 2. Parse preview

Input:

- recent `raw_events`

Current outputs already include:

- normalized title/date/venue hints
- confidence level
- review reasons
- `candidate` or `review` suggestion

Promotion rule:

- parse preview is advisory, not final

### Stage 3. Venue matching

Input:

- parsed candidate plus venue hints

Required result:

- `matched`
- `ambiguous`
- `unmatched`
- `location_only`

Promotion consequence:

- `matched`: can continue toward auto-promotion
- `location_only`: can continue only if the event is still strong without a venue row
- `ambiguous`: hold for review
- `unmatched`: hold for review unless later policy explicitly allows otherwise

### Stage 4. Duplicate check

Compare against canonical `events` using:

- normalized title
- normalized start datetime
- matched venue or fallback location
- source URL where present

Possible outcomes:

- `new_event`
- `existing_event_duplicate`
- `existing_event_enrichment_candidate`
- `unclear_duplicate`

Promotion consequence:

- `new_event`: may promote if other thresholds pass
- `existing_event_duplicate`: do not create a new row
- `existing_event_enrichment_candidate`: route to update policy
- `unclear_duplicate`: hold for review

### Stage 5. Promotion decision

A candidate should be classified as one of:

- `auto_promote`
- `review`
- `skip`
- `enrich_existing`

### Stage 6. Canonical write

Only `auto_promote` or approved `review` outcomes write to canonical content.

Canonical write should be:

- idempotent
- provenance-aware
- conservative on updates

## Minimum required fields for event creation

The first event-creation threshold should require:

- usable title
- usable start datetime or date-time candidate
- one of:
  - confident `venue_id`
  - strong location-only metadata
- no high-confidence duplicate found

Strongly preferred but not strictly required:

- image
- description
- `ticket_url`
- `title_en`

If the required fields are missing:

- do not create a canonical event

## Auto-promotion threshold

Auto-promotion should be allowed only when all of these are true:

1. parse confidence is effectively high
2. title is usable and specific
3. date/time is usable
4. venue state is `matched` or acceptable `location_only`
5. duplicate check says `new_event`
6. source is not flagged as noisy or failing

Recommended first implementation posture:

- start with a narrow auto-promotion set
- treat auto-promotion as an earned trust level, not the default

## Review threshold

A candidate should be held for review when any of these apply:

- venue match is ambiguous
- title is usable but date is weak
- duplicate result is unclear
- series match is weak
- source confidence is mixed
- description and metadata imply this may be a special/promo rather than an event

Recommended review outcomes:

- promote
- enrich existing
- skip
- reclassify as special
- hold for later

## Skip threshold

Skip when:

- candidate is clearly not an event
- candidate is too incomplete to be useful
- candidate duplicates a canonical row without meaningful new value
- candidate is source noise or navigational junk

## Reclassification rule

Not every ingested item should compete for `events`.

Possible alternate outcomes:

- `daily_special_candidate`
- `venue_activity_signal`
- `skip`

This matters most for:

- Instagram
- venue websites mixing promos and events
- restaurant or bar pages with specials-heavy content

## Series handling rule

The first production workflow should be conservative about `event_series`.

Recommended rule:

- if a confident existing series match exists, attach `series_id`
- otherwise leave `series_id` empty
- do not auto-create new series in the first promotion pass

Series creation should remain review-driven until repeated evidence shows a stable recurring entity.

## Promotion status vocabulary

Recommended internal vocabulary:

- `candidate`
- `review`
- `skip`
- `promoted`
- `enriched`
- `reclassified`
- `rejected`

Recommended operator-facing outcomes:

- promoted new event
- enriched existing event
- held for review
- skipped
- reclassified as special

## Implementation recommendation

The first implementation should stay backend-driven and staged:

1. read recent parse-preview candidates
2. apply venue matching
3. apply duplicate checks
4. apply promotion thresholds
5. return a promotion preview before enabling automatic writes broadly

That means:

- promotion preview first
- limited automatic writes second
- broader automation only after live verification

## Relationship to other docs

This document works with:

- `dedupe_and_promotion_policy.md`
- `venue_matching_strategy.md`
- `canonical_event_update_policy.md`
- `operator_review_workflow.md`
- `parse_preview_workflow.md`

## Maintenance rule

When promotion rules change materially:

1. update this doc
2. update `dedupe_and_promotion_policy.md`
3. update `operator_review_workflow.md`
4. update `handover.md`
5. update `project_ledger.md`
