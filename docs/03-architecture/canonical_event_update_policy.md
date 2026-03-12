# Canonical Event Update Policy

## Purpose

Define how new ingestion results may update an existing canonical `events` row.

This is the trust hierarchy for Hype event data.

It answers:

- when new scraped data can enrich an existing event
- which fields are safer to update automatically
- which fields should require review
- how curated data should be protected

## Core principle

Do not treat every new scrape as better truth.

Canonical `events` should be updated by confidence and provenance, not by "last write wins."

## Update outcomes

When a candidate matches an existing canonical event, the system should choose one of:

- `no_change`
- `safe_enrichment`
- `review_required`
- `reject_update`

Definitions:

- `no_change`: candidate adds no meaningful value
- `safe_enrichment`: candidate improves low-risk fields
- `review_required`: candidate touches high-impact or conflicting fields
- `reject_update`: candidate is weaker, noisy, or contradictory

## Field trust tiers

### Tier 1. Safe auto-enrichment fields

These are usually safe to fill when canonical data is missing and the new candidate is plausible:

- `ticket_url`
- `source`
- `cover_image_url`
- `end_datetime`
- `location_address`
- `latitude`
- `longitude`

Recommended rule:

- fill blanks conservatively
- replace only when the new value is clearly better and from a trusted source

### Tier 2. Moderate-risk fields

These may be updated automatically only under narrow conditions:

- `description_bs`
- `description_en`
- `location_name`
- `moods`
- `tags`

Recommended rule:

- append or replace only when canonical content is empty or clearly machine-generated and the new value is materially better
- otherwise route to review

### Tier 3. Review-first fields

These should not auto-overwrite in the first phase:

- `title_bs`
- `title_en`
- `start_datetime`
- `venue_id`
- `category`
- `series_id`
- `price_bam`

Recommended rule:

- conflicting changes in these fields require review

### Tier 4. Protected state fields

These should not be changed by scraper promotion logic:

- `id`
- `created_at`
- `submitted_by`
- moderation/status fields except through explicit workflow

## Editorial-protection rule

If a canonical row already appears curated, do not overwrite it casually.

Signs of likely curated data:

- strong bilingual descriptions
- intentional image choice
- known venue linkage
- existing featured/editorial use

Recommended behavior:

- treat curated-looking rows as review-first for anything beyond Tier 1 enrichment

## Source-trust hierarchy

Recommended first trust ordering:

1. direct trusted source tied to the venue or organizer
2. ticketing/detail page with stable event URL
3. aggregator with strong detail metadata
4. social post interpreted by AI
5. noisy or weak listing context

Implication:

- higher-trust sources may enrich missing fields more confidently
- lower-trust sources should mostly confirm, not override

## Missing-value rule

The safest first update behavior is:

- fill blanks before replacing existing values

That means:

- if canonical field is empty and candidate is plausible, prefer enrichment
- if canonical field already has content, require stronger evidence to replace it

## Conflict rule

A candidate conflicts with canonical truth when it changes core identity or schedule meaningfully.

Examples:

- title differs materially
- date/time differs materially
- venue differs
- category implies a different event type

Recommended behavior:

- conflict means `review_required`, not silent overwrite

## Duplicate-confirmation rule

Sometimes a duplicate source is still useful even if it changes nothing.

Useful confirmations include:

- second source for same event
- stronger ticket URL
- stronger image
- richer source provenance

Recommended behavior:

- allow provenance accumulation without rewriting core fields unnecessarily

## Image replacement rule

Images are valuable but risky.

Recommended first rule:

- if canonical row has no image and candidate has a plausible event image, allow safe enrichment
- if canonical row already has an image, replace only when:
  - source trust is higher
  - image is clearly more event-specific
  - no editorial choice seems to be in place

Otherwise:

- route to review

## Series update rule

Do not auto-attach or reattach `series_id` casually.

Recommended first rule:

- attach only when there is a strong match to an existing series
- if an existing canonical row already has `series_id`, conflicting series proposals require review

## Practical first implementation posture

The first live implementation should be conservative:

1. detect candidate-to-event match
2. compare only Tier 1 and Tier 2 fields for possible enrichment
3. fill missing low-risk fields automatically when confidence is high
4. route Tier 3 conflicts to review
5. never use scraper writes as a blanket overwrite

This gives Hype the benefits of multi-source enrichment without immediately degrading curated quality.

## Relationship to other docs

This document works with:

- `promotion_workflow.md`
- `dedupe_and_promotion_policy.md`
- `operator_review_workflow.md`
- `events_series_reconciliation.md`

## Maintenance rule

When canonical update behavior changes materially:

1. update this doc
2. update `promotion_workflow.md`
3. update `operator_review_workflow.md`
4. update `handover.md`
5. update `project_ledger.md`
