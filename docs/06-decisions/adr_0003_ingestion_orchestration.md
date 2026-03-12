# ADR 0003: Ingestion Orchestration Uses Supabase Tables Plus Backend Service

## Status

Accepted

## Date

2026-03-11

## Context

The live Supabase project already contains ingestion-oriented tables:

- `scrape_sources`
- `raw_events`
- `scrape_log`

The repository also contains a separate `backend/` service, but that service is still mostly scaffolded and does not yet expose scraper or admin route registration.

We need one clear architectural direction before scraper implementation starts.

## Decision

Use the live Supabase ingestion tables as the canonical persistence layer for scraper intake, and use the separate `backend/` service as the orchestration layer for privileged ingestion workflows.

This means:

- source definitions live in Supabase
- raw fetched rows live in Supabase
- scrape-run logs live in Supabase
- parsing, dedupe, and canonical promotion are orchestrated through backend-owned route/service modules
- mobile app surfaces consume canonical approved content, not raw ingestion rows

## Why

- the database schema already supports this direction
- it avoids inventing a second ingestion persistence system
- it gives the backend service a clear high-value role
- it keeps scraping and admin behavior out of the mobile client
- it preserves auditability between raw intake and public content

## Consequences

### Positive

- one canonical ingestion pipeline
- clearer separation between raw data and public discovery data
- easier moderation and troubleshooting
- backend service has an explicit reason to exist beyond speculative future APIs

### Negative

- backend service now needs route and service structure before scraper work can mature
- there is an extra orchestration layer instead of writing scraper output directly into canonical tables

## Implementation notes

The first implementation slice should not attempt full scraping automation.

Start with:

- backend route registration for ingestion/admin surfaces
- ingestion status endpoint(s)
- manual source-run placeholder endpoint(s)
- documented promotion stages

## Related docs

- `docs/03-architecture/live_supabase_assessment.md`
- `docs/03-architecture/scraper_ingestion_workflow.md`
