# Raw Intake Enrichment Plan

## Purpose

Define the next quality bar for raw ingestion after first-pass link harvesting.

The immediate goal is not full canonical parsing.

It is:

- capture more useful raw metadata at intake time
- reduce avoidable parse-stage work later
- give operators better visibility into what landed

## Current implemented posture

The backend now captures more than just link and title for the first source-aware extractors.

Current enriched fields at raw-intake time:

- `title_raw`
- `date_raw` when listing context makes it available
- `image_url` when the source exposes a usable listing image
- `venue_raw`
- `venue_name_raw`
- provenance in `raw_json`

This enrichment currently applies best to:

- KupiKartu listing cards
- AllEvents listing context
- Pozorista listing context when venue/date text is present near the event link

The backend also now performs limited detail-page enrichment for the first active sources:

- AllEvents event pages via JSON-LD
- KupiKartu detail pages via title/date/venue/meta extraction

## Why this matters

Better raw rows make the next stages easier:

- parse-stage heuristics have more context
- venue matching has earlier signals
- operator review is faster
- source-quality problems are easier to spot without refetching pages

## Source-specific expectations

### Pozorista

Expected raw-intake strengths:

- strong title quality
- useful venue text when present
- useful date text when present

Known limitations:

- image quality is weak at listing stage
- some date/venue details may still require detail-page enrichment later

### AllEvents

Expected raw-intake strengths:

- strong title quality
- usable event URL
- listing-level date and venue hints
- image URL in many cards

Known limitations:

- venue/date extraction is still heuristic and should be treated as provisional
- event-page JSON-LD remains the richer later-stage source

### KupiKartu

Expected raw-intake strengths:

- strong title quality after trimming listing-card noise
- usable date text from listing cards
- usable `@Venue` text
- usable listing image URLs

Known limitations:

- detail pages are still the better source for richer description or price enrichment

## Next enrichment slice

After the home-machine verification pass, the next source-quality improvements should happen in this order:

1. stabilize the new raw metadata capture against real runs
2. add detail-page enrichment only for the first active sources
3. keep detail-page enrichment source-specific, not generic

Recommended first detail enrichments:

- AllEvents event-page JSON-LD
- KupiKartu detail-page description/price/image
- Pozorista detail-page description/date normalization only if listing context proves insufficient

Current implementation note:

- AllEvents detail enrichment is now live for the first candidates in a run
- KupiKartu detail enrichment is now live for the first candidates in a run
- Pozorista still relies on listing-context enrichment only

## Operator review support

Use:

- `backend/sql/ingestion_operator_queries.sql`

That file is the first operator inspection pack for:

- seeded sources
- recent scrape runs
- recent raw rows
- raw rows missing key metadata
- unmatched venue rows

## Maintenance rule

When raw-intake enrichment gets materially better:

1. update this doc
2. update `ingestion_endpoint_contract.md`
3. update `handover.md`
4. update `project_ledger.md`
