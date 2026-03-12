# Scraper Ingestion Workflow

## Goal

Define the repo-approved ingestion flow for scraped event data using the live Supabase ingestion tables:

- `scrape_sources`
- `raw_events`
- `scrape_log`

This document is intentionally focused on the first operational path, not on every future automation detail.

## Canonical position

- Supabase ingestion tables are the canonical persistence layer for scraper intake.
- The separate `backend/` service is the preferred orchestration layer for privileged scraping, parsing, deduplication, and promotion workflows.
- The mobile app should consume approved canonical content from `events`, `event_series`, `venues`, and `daily_specials`, not raw scraper rows.

## Desired flow

### Stage 1. Source registry

`scrape_sources` defines:

- source identity
- source type
- target URL or feed reference
- scrape cadence or enabled state
- parser strategy metadata
- operator notes and health status

This table is the source-of-truth list of what the system is allowed to scrape.

### Stage 2. Raw fetch intake

The scraper/orchestrator fetches a source and writes:

- run metadata to `scrape_log`
- raw payload rows to `raw_events`

At this stage, the system should preserve provenance:

- source id
- fetch time
- source URL
- raw title/body/date/location fields
- parse state
- dedupe hints

The goal is reversibility and auditability, not polished UX output yet.

### Stage 3. Parse and normalize

A backend normalization pass converts `raw_events` into a stable internal candidate shape.

This pass should:

- extract structured dates and times
- resolve language or text cleanup where possible
- identify likely venue matches
- mark confidence and parse status
- retain enough source provenance to debug parser failures

This stage still does not write directly to public discovery tables.

### Stage 4. Review and dedupe

Before promotion into canonical tables, the orchestrator should evaluate:

- duplicate event candidates
- duplicate venue candidates
- missing required fields
- suspicious date parsing
- low-confidence venue matching

The first implementation can keep this simple:

- automatic promotion only for high-confidence rows
- manual review for ambiguous rows

### Stage 5. Canonical promotion

Approved candidates are promoted into:

- `events`
- `event_series` when applicable
- possibly `venues` only when venue creation rules are explicitly defined

Promotion should be idempotent and traceable.

Recommended rule:

- keep a stable source reference from canonical rows back to ingestion provenance where possible

The current promotion-rule companions for this stage are:

- `promotion_workflow.md`
- `venue_matching_strategy.md`
- `canonical_event_update_policy.md`

### Stage 6. Operator visibility

The system should support operator review of:

- last scrape time per source
- last success/failure
- number of raw rows fetched
- number of parse failures
- number of promoted rows
- sources that repeatedly fail

The first operator surface can be backend-first or SQL/report-first rather than a polished frontend admin UI.

## First implementation slice

The next practical slice for this repo should be:

1. add backend route registration structure for ingestion/admin routes
2. define a minimal ingestion route group under `backend/src/routes/ingestion.ts`
3. expose lightweight endpoints for:
   - ingest health/status
   - source listing placeholder
   - manual source run placeholder
4. document the input/output contract before implementing real scraping

This keeps the backend aligned with the documented architecture without prematurely committing to one scraper vendor or parser format.

The current contract doc for that slice is:

- `docs/03-architecture/ingestion_endpoint_contract.md`

## Recommended backend responsibilities

The backend service should own:

- privileged source execution
- parser orchestration
- dedupe rules
- canonical promotion
- admin/operator status endpoints

The mobile client should not own scraping behavior.

## Instagram strategy

Instagram is a first-class event source because many Sarajevo venues announce:

- same-day DJ nights
- happy hours
- daily menus
- last-minute schedule changes
- current venue/event imagery

The repo should treat Instagram as an event-announcement source, not just a marketing channel.

### Documented preferred approach

Current intended approach:

1. scrape recent posts from selected venue/event accounts
2. send caption plus image to an AI parser
3. classify whether the post is an event announcement
4. extract structured event fields
5. dedupe and promote qualified items through the ingestion pipeline

### Tooling direction

Preferred execution path by phase:

- now: Apify-backed Instagram scraping
- fallback when Apify is unavailable or too costly: self-hosted Playwright or similar headless browser on a VPS
- long term: official Instagram/Facebook APIs for venues that explicitly connect their profiles, with headless scraping kept only for unclaimed sources

### Why this matters

Instagram captures event and venue signals that ticketing sites often miss:

- tonight-only nightlife
- venue-posted specials
- informal cultural programming
- cancellations or last-minute changes

### Source modeling recommendation

Instagram sources should live in `scrape_sources` with source-specific config such as:

```json
{
  "instagram_username": "venue_handle",
  "fetch_method": "apify",
  "max_posts": 10,
  "content_focus": "events_and_specials"
}
```

Recommended future source fields or config conventions:

- source type: `instagram`
- username or profile url
- account tier
- fetch method
- parser hints
- post limit per run

### Operational recommendation

Do not mix Instagram-specific scraping logic directly into mobile or generic query code.

Do instead:

- treat Instagram as one ingestion source type
- keep fetch strategy in backend orchestration
- preserve raw post provenance before canonical promotion

## Recommended data responsibilities

Supabase should own:

- durable storage of sources
- durable storage of raw fetched rows
- durable logs of scrape runs
- canonical content after approval/promotion

## Risks

### Risk 1. Duplicate orchestration logic

If scraping logic appears partly in scripts, partly in backend routes, and partly in ad hoc notebooks, the pipeline will drift quickly.

Do instead:

- route all future ingestion orchestration through the backend service once the first route scaffold exists

### Risk 2. Premature canonical writes

If raw scraped data is written straight into public discovery tables, cleanup and moderation become difficult.

Do instead:

- keep raw intake and canonical promotion as separate stages

### Risk 3. Unclear venue creation policy

Scraped events often reference imperfect venue names.

Do instead:

- treat venue creation and venue matching as an explicit promotion policy, not an implicit parser side effect

## Open decisions

- whether canonical promotion should be fully backend-driven or partly SQL-driven
- whether review queues should first live in SQL/admin queries or in product UI
- how aggressively to auto-create `event_series`
- when venue auto-creation is safe enough

## Immediate next files

- `backend/src/index.ts`
- `backend/src/routes/ingestion.ts`
- `docs/03-architecture/ingestion_endpoint_contract.md`
- `docs/03-architecture/source_types_and_scrape_config.md`
- `docs/03-architecture/source_priority_and_cadence.md`
- `docs/03-architecture/dedupe_and_promotion_policy.md`
- `docs/03-architecture/source_seeding_strategy.md`
- `docs/03-architecture/facebook_source_policy.md`
- `docs/03-architecture/media_enrichment_policy.md`
- `docs/03-architecture/operator_review_workflow.md`
- `docs/03-architecture/promotion_workflow.md`
- `docs/03-architecture/venue_matching_strategy.md`
- `docs/03-architecture/canonical_event_update_policy.md`
- future ingestion service files under `backend/src/services/`
- `docs/06-decisions/adr_0003_ingestion_orchestration.md`
