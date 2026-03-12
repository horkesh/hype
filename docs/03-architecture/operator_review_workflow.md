# Operator Review Workflow

## Purpose

Define the first practical operator workflow for ingestion oversight before a polished admin product exists.

This ties together:

- source health
- manual source runs
- raw item review
- dedupe decisions
- venue matching
- media promotion decisions

## Core principle

The first operator workflow does not need a full custom dashboard.

It only needs a clear sequence of decisions and enough backend/reporting surfaces to support those decisions.

## Workflow stages

### 1. Source health review

Operator questions:

- which sources are active
- which sources are overdue
- which sources are repeatedly failing
- which sources are noisy or low-signal

Useful surfaces:

- `GET /ingestion/sources`
- `scrape_sources`
- `scrape_log`

Primary decisions:

- keep active
- lower cadence
- deactivate
- investigate fetch/parsing failure

## 2. Manual run and intake review

Operator questions:

- did the source run successfully
- was a `scrape_log` row created
- did the fetch path produce usable raw material

Useful surfaces:

- `POST /ingestion/run/:sourceId`
- `scrape_log`

Primary decisions:

- source ready for real fetch implementation
- source needs parser tuning
- source should stay inactive until improved

## 3. Raw event review

Operator questions:

- is this raw item actually an event
- is the date/time usable
- is the title meaningful
- is the source item duplicated

Useful surfaces:

- `raw_events`
- `GET /ingestion/raw/recent`
- `GET /ingestion/parse-preview`
- provenance fields like `source_url`, `source_name`, `raw_json`

Primary decisions:

- keep as event candidate
- treat as special/promo instead
- skip as non-event
- flag for review

Helpful current signals:

- parse-preview confidence
- parse-preview review reasons
- missing date/venue/image patterns by source

## 4. Venue match review

Operator questions:

- is the venue confidently matched
- is the venue unmatched
- is the venue ambiguous

Primary decisions:

- confirm match
- leave unmatched for later
- route to manual venue resolution

Important rule:

- ambiguous venue matches should not auto-promote into canonical events

## 5. Dedupe and canonical promotion review

Operator questions:

- does this candidate already exist in canonical events
- should it create a new event
- should it enrich an existing event instead

Primary decisions:

- create canonical event
- enrich existing event
- skip duplicate
- hold for review

Use these rule docs when making that call:

- `promotion_workflow.md`
- `venue_matching_strategy.md`
- `canonical_event_update_policy.md`

## 6. Media review

Operator questions:

- is the proposed image event-specific and trustworthy
- is it better than the current canonical image
- does it belong to a venue or only to one event occurrence

Primary decisions:

- promote as event image
- keep only as provenance
- review before venue-image replacement

## First operator toolset

The first workable operator stack can be lightweight:

- ingestion backend endpoints
- direct SQL or Supabase table views
- a short review runbook
- later, a dedicated admin UI if needed

This is enough to validate the ingestion architecture without overbuilding administration early.

## Suggested review order during early rollout

1. source health
2. manual runs
3. raw item quality
4. venue matches
5. dedupe/promotion
6. media decisions

Why this order:

- bad sources should be fixed before reviewing lots of raw rows
- good provenance and source trust make later promotion decisions much easier

## Status vocabulary recommendation

Recommended operator-facing source statuses:

- active
- inactive
- failing
- noisy
- review-needed

Recommended raw-item outcomes:

- candidate
- duplicate
- special
- skip
- review

Recommended promotion outcomes:

- promoted
- enriched
- held
- rejected

## Current repo recommendation

For the current phase:

- keep operator workflow documented before building a real admin interface
- use backend routes plus SQL/reporting to validate the ingestion process
- only build richer admin surfaces after source intake and raw review are proven useful
