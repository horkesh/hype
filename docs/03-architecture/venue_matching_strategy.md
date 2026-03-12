# Venue Matching Strategy

## Purpose

Define how ingested event candidates should be matched against canonical `venues`.

This is the operational bridge between:

- raw venue hints from ingestion
- the existing canonical venue base
- safe event promotion

## Core principle

Event promotion quality depends heavily on venue-match quality.

So venue matching should be:

- explicit
- confidence-based
- conservative

Raw ingestion should not create new venues casually.

## Desired venue-match outcomes

Every candidate should end up in exactly one of these states:

- `matched`
- `ambiguous`
- `unmatched`
- `location_only`

Definitions:

- `matched`: one canonical venue is the clear best fit
- `ambiguous`: more than one plausible venue exists or confidence is too low
- `unmatched`: no believable canonical venue exists
- `location_only`: event has usable location text but no canonical venue relationship is appropriate yet

## Matching order

Use the strongest keys first.

### 1. Explicit trusted venue identifiers

Highest-confidence keys:

- `google_place_id`
- explicit seeded source-to-venue linkage in source config
- future source-specific canonical venue IDs

Recommended behavior:

- if one trusted identifier matches one venue, treat as `matched`

### 2. Strong canonical identity fields

Next-best keys:

- exact `slug`
- normalized exact `name`
- normalized exact `name + address`

Recommended behavior:

- exact strong identity matches can become `matched` when conflict-free

### 3. Source-linked venue hints

For venue-linked sources:

- if the source is already known to belong to a canonical venue, prefer that venue

Examples:

- a seeded venue website events page
- a seeded venue Instagram account

Recommended behavior:

- source-linked venue hints should outrank fuzzy text matching

### 4. Fuzzy text matching

Only after stronger keys fail, compare:

- normalized venue names
- neighborhood
- address fragments
- repeated source relationship patterns

Recommended behavior:

- use fuzzy matching to suggest candidates
- do not auto-link on weak fuzzy similarity alone

## Confidence bands

Recommended first confidence model:

- `high`
- `medium`
- `low`

Guidance:

- `high`: trusted identifier or unambiguous exact identity match
- `medium`: very plausible text match with supporting context
- `low`: partial name similarity or noisy source hint

Promotion behavior:

- `high` can become `matched`
- `medium` usually becomes `review` unless strengthened by source linkage
- `low` becomes `ambiguous` or `unmatched`

## Auto-link rules

Auto-link only when:

1. one venue is clearly best
2. confidence is effectively high
3. there is no close competing candidate
4. the source is not known to be noisy

If there is meaningful doubt:

- do not auto-link

## Ambiguous-match rules

Use `ambiguous` when:

- two or more venues plausibly match
- the source hint is too generic
- venue name is common or truncated
- fuzzy match is plausible but not decisive

Promotion consequence:

- ambiguous candidates should not auto-promote into venue-linked canonical events

## Unmatched rules

Use `unmatched` when:

- no believable canonical venue is found
- the text is too noisy
- the candidate looks like a citywide or roaming event without a stable venue

Promotion consequence:

- unmatched candidates should usually go to review
- they should not create new venue rows automatically in the first phase

## Location-only rules

Some events are real even without a canonical venue match.

Examples:

- outdoor gatherings
- citywide festivals
- temporary popups
- one-off location text that is meaningful but not venue-backed

Use `location_only` when:

- event has strong location text
- there is no trustworthy canonical venue match
- the event can still be meaningfully displayed without a `venue_id`

Promotion consequence:

- location-only promotion is allowed only for strong event candidates

## New venue creation policy

First-phase rule:

- no automatic new venue creation from ingestion

Allowed alternatives:

- `unmatched`
- `ambiguous`
- manual venue candidate review later

Why:

- we already have a large seeded venue base
- noisy auto-creation would create duplicate cleanup work immediately

## Recommended future venue-candidate workflow

If a raw candidate repeatedly fails venue matching but looks legitimate:

1. create a reviewable venue candidate record later
2. compare against the 1233-venue seed and live canonical venues
3. only then create or import a new venue

## Input signals to preserve

For venue matching to improve over time, preserve:

- raw venue text
- raw address text
- source URL
- source name
- source type
- linked source-to-venue config if present

## Suggested first implementation posture

The first matcher can be conservative:

1. check explicit source-linked or identifier-based matches
2. check exact/normalized identity matches
3. return fuzzy suggestions for review
4. avoid automatic new venue creation

This is enough to support safe event promotion without overbuilding fuzzy search logic too early.

## Relationship to other docs

This document works with:

- `venue_seed_reconciliation.md`
- `promotion_workflow.md`
- `dedupe_and_promotion_policy.md`
- `operator_review_workflow.md`

## Maintenance rule

When venue-matching logic changes materially:

1. update this doc
2. update `promotion_workflow.md`
3. update `venue_seed_reconciliation.md` if live venue posture changes
4. update `handover.md`
5. update `project_ledger.md`
