# Source Seeding Strategy

## Purpose

Define how Hype should build and maintain its initial `scrape_sources` inventory.

This is the operational bridge between source taxonomy and actual ingestion runs.

## Core rule

Do not seed sources ad hoc.

Do instead:

- use repeatable source classes
- preserve provenance for how each source was discovered
- prioritize sources that map to real Sarajevo product value

## Seeding order

### 1. Seed high-signal citywide sources first

Start with sources that cover many events at once:

- theatre/culture listings
- ticketing platforms
- citywide aggregators
- Facebook-proxy aggregators

Why:

- they produce the fastest coverage gains
- they help validate dedupe and promotion logic before many low-signal venue feeds are added

### 2. Seed direct venue/event sources second

Add:

- venue websites
- venue Instagram accounts
- event promoter accounts
- cinema program sources

Why:

- these improve freshness and local pulse
- but they are noisier and benefit from an already-working intake pipeline

### 3. Seed enrichment-only sources last

Add:

- news/event articles
- lower-volume culture feeds
- image-heavy accounts with weak event signal

Why:

- these are useful later, but should not distract from reliable event coverage

## Instagram account seeding

Instagram deserves its own seeding strategy because it is important and noisy.

### Primary seed source: known venue data

Start from the venue inventory already curated by Hype.

Use:

- existing venue records
- existing `instagram_handle` values
- any source links already known from prior manual research

Recommended rule:

- if a venue already exists and has a confident Instagram handle, seed that account before discovering net-new accounts

### Secondary seed source: Google/business listings

Look for:

- Instagram links in known venue websites
- business listing links that point to Instagram

Use this to confirm or extend venue-linked accounts.

### Tertiary seed source: manual discovery

Manual discovery is still valuable for Sarajevo nightlife and pop-up culture.

Recommended manual process:

1. search known venue names on Instagram
2. inspect tagged location pages for Sarajevo venues
3. inspect suggested similar accounts from high-signal venues
4. review posts from promoters and event spaces
5. capture only accounts that plausibly announce events, specials, or real venue activity

### Seeding rule for Instagram

Do not seed every discovered account.

Do instead:

- seed accounts that are likely to announce events, specials, or meaningful venue activity
- assign a tier and cadence at creation time
- mark uncertain accounts as inactive until reviewed

## Source provenance fields

Even if the live schema does not yet expose explicit columns for all of this, keep it in `scrape_config` or adjacent notes.

Recommended provenance metadata:

```json
{
  "seed_origin": "venue_db",
  "seed_confidence": "high",
  "discovered_via": "existing_instagram_handle",
  "account_tier": 1
}
```

Other useful values:

- `seed_origin`: `venue_db`, `manual_research`, `google_listing`, `partner_feed`, `legacy_docs`
- `seed_confidence`: `high`, `medium`, `low`
- `discovered_via`: short explanation of how the source was found

## Venue-linked vs citywide sources

### Venue-linked

Use when:

- the source clearly belongs to one known venue

Examples:

- a venue website events page
- a venue Instagram account
- a venue Facebook page if used later

### Citywide or multi-venue

Use when:

- the source covers many venues or many unrelated events

Examples:

- AllEvents
- KupiKartu
- Entrio
- city portals

Recommended rule:

- do not force a venue linkage for citywide sources

## Activation rule

A source can be seeded before it is activated.

Recommended first-pass status policy:

- seed promising sources with `is_active = false` when parser/fetch confidence is still unknown
- activate only after one manual validation pass or equivalent confidence check

This is especially useful for:

- Instagram accounts
- difficult ticketing sites
- noisy culture/news sources

## Minimum seeding checklist

Before adding a new source, answer:

1. what source type is it
2. is it venue-linked or citywide
3. what value gap does it fill
4. what fetch method is expected
5. what parser hint should it use
6. what cadence tier should it start with
7. should it launch active or inactive

## Recommended first source inventory

The first reliable inventory should include:

- 3 to 5 Tier 1 citywide sources
- a small set of Tier 1 Instagram accounts
- selected venue-linked sources only where they clearly improve freshness

Avoid:

- seeding dozens of uncertain Instagram accounts before the parser and dedupe pipeline is stable

## Operational maintenance

Review the source inventory periodically for:

- broken sources
- low-signal sources
- duplicate sources covering the same role
- newly discovered high-signal venue accounts

Recommended rule:

- prune weak sources instead of only adding new ones
