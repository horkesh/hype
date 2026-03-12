# Dedupe And Promotion Policy

## Purpose

Define how raw ingestion rows become canonical product content without flooding public tables with duplicates or low-confidence data.

## Core rule

Separate:

- raw intake
- parse and match
- canonical promotion

These should not collapse into one opaque step.

## Dedupe layers

### Layer 1: Raw-source dedupe

Preferred first-pass rule:

- if a raw item has a stable per-item `source_url`, use that as the first duplicate guard

This is already aligned with the current live unique index on `raw_events.source_url`.

Use when:

- Instagram posts have stable post URLs
- ticketing/event pages have stable detail URLs
- aggregator listings expose stable item URLs

### Layer 2: Candidate event dedupe

After parsing, compare event candidates using:

- normalized title
- start datetime
- venue match or venue name
- source type

Recommended rule:

- if title + start_datetime + venue confidently match an existing canonical event, treat as duplicate or enrichment rather than a new event

### Layer 3: Venue matching

Raw rows should not create venues casually.

Recommended first-pass venue statuses:

- `matched`
- `unmatched`
- `ambiguous`

Promotion behavior:

- matched venue: candidate may move toward auto-promotion
- unmatched venue: hold for review or delayed promotion
- ambiguous venue: do not auto-promote

## Promotion levels

### Auto-promote

Use only when:

- date/time parsing is high confidence
- title is usable
- venue is confidently matched or the source has explicit trusted venue linkage
- no canonical duplicate is found

### Needs review

Use when:

- venue is ambiguous
- date parsing is uncertain
- event category or structure is weak
- source is noisy or low-trust

### Skip

Use when:

- item is clearly not an event
- duplicate already exists
- source payload is too incomplete to be useful

## Instagram-specific promotion rule

Instagram posts need stricter promotion discipline.

Recommended rule:

- do not auto-promote every venue post
- first classify whether the post is an actual event announcement or a special/promo/update
- treat non-event promo content as either:
  - daily special candidate
  - venue activity signal
  - skip

## Enrichment vs creation

Sometimes a duplicate is still useful.

If a canonical event already exists, ingestion may still contribute:

- better image
- richer description
- stronger venue linkage
- confirmation from another source

Recommended policy:

- duplicates may enrich canonical rows, but should not create parallel public events

## Suggested first implementation posture

Start conservative:

- auto-promote only high-confidence rows
- queue ambiguous rows for review
- preserve provenance in `raw_events` and `scrape_log`

This is better than maximizing volume early and polluting public discovery data.
