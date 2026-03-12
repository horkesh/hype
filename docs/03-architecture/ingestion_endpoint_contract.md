# Ingestion Endpoint Contract

## Purpose

This document defines the first backend-ready contract for the ingestion route scaffold:

- `GET /ingestion/sources`
- `GET /ingestion/raw/recent`
- `GET /ingestion/parse-preview`
- `POST /ingestion/run/:sourceId`

It is based on the live Supabase ingestion tables exported in `docs/08-reference/live_supabase_schema.csv`.

## Live table contract

### `scrape_sources`

Current live columns:

- `id uuid`
- `name text`
- `source_url text`
- `tier integer`
- `scrape_config jsonb`
- `frequency_hours integer`
- `is_active boolean`
- `last_scraped_at timestamptz`
- `created_at timestamptz`

Operational meaning:

- `name`: operator-facing source name
- `source_url`: canonical fetch target or source homepage/feed
- `tier`: priority or cost tier for scheduling decisions
- `scrape_config`: parser and fetch strategy metadata
- `frequency_hours`: desired scrape cadence
- `is_active`: source is eligible for runs
- `last_scraped_at`: last successful or attempted scrape time, depending on final policy

### `raw_events`

Current live columns:

- `id uuid`
- `source_name text`
- `source_url text`
- `title_raw text`
- `description_raw text`
- `date_raw text`
- `image_url text`
- `raw_html text`
- `parsed boolean`
- `created_at timestamptz`
- `venue_raw text`
- `raw_json jsonb`
- `parse_attempts integer`
- `parsed_at timestamptz`
- `venue_name_raw text`
- `venue_match_status text`
- `matched_venue_id uuid`

Important current constraints:

- unique index on `source_url`
- index on `parsed`
- index on `source_name`
- index on `created_at`

Implication:

- the first ingestion implementation should treat `source_url` as the simplest duplicate guard for raw rows

### `scrape_log`

Current live columns:

- `id uuid`
- `source_id uuid`
- `raw_content text`
- `parsed_data jsonb`
- `events_created integer`
- `tokens_used integer`
- `error text`
- `created_at timestamptz`

Operational meaning:

- one row per scrape run attempt
- `raw_content`: optional raw fetch summary or payload excerpt
- `parsed_data`: structured run summary
- `events_created`: number of canonical event rows produced
- `tokens_used`: parser or enrichment cost tracking
- `error`: terminal run failure summary

## RLS and access assumptions

Current live policies:

- `scrape_sources`: admin only
- `scrape_log`: admin only
- `raw_events`: RLS is currently disabled

Recommended backend behavior:

- all ingestion endpoints should be treated as privileged backend/admin surfaces
- do not expose ingestion routes to the mobile client directly
- when backend database access is implemented, use a privileged server-side credential path

## Endpoint 1: `GET /ingestion/sources`

### Purpose

Return a lightweight operator-facing list of scrape sources and their run readiness.

### Backend config requirement

This endpoint should use backend-only credentials:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Minimum response shape

```json
{
  "status": "ok",
  "sources": [
    {
      "id": "uuid",
      "name": "Instagram: Venue Name",
      "sourceUrl": "https://example.com/feed",
      "tier": 2,
      "frequencyHours": 24,
      "isActive": true,
      "lastScrapedAt": "2026-03-11T08:00:00Z",
      "scrapeConfig": {},
      "readyToRun": true
    }
  ]
}
```

### Query contract

Read from `scrape_sources` and return:

- `id`
- `name`
- `source_url`
- `tier`
- `frequency_hours`
- `is_active`
- `last_scraped_at`
- `scrape_config`

### Derived fields

`readyToRun` can be computed as:

- `true` when `is_active = true` and either `last_scraped_at` is null or older than `frequency_hours`

This is a backend-derived convenience field, not a database column.

## Endpoint 2: `POST /ingestion/run/:sourceId`

### Purpose

Trigger one manual scrape run for a single source and write the first-pass ingestion audit trail.

### Route params

- `sourceId uuid`

### Recommended request body

```json
{
  "mode": "manual",
  "dryRun": false,
  "notes": "Operator-triggered test run"
}
```

### Recommended request fields

- `mode`: optional string for run origin, default `manual`
- `dryRun`: optional boolean; when `true`, do not persist raw rows
- `notes`: optional freeform operator note

### First implementation behavior

1. read `scrape_sources` by `sourceId`
2. reject missing or inactive sources with a clear response
3. create one `scrape_log` row for the run
4. return a queued/dry-run summary even before real fetch logic exists
5. add fetch, raw row inserts, and `last_scraped_at` updates in the next slice

### Current implemented response shape

```json
{
  "status": "ok",
  "source": {
    "id": "uuid",
    "name": "Instagram: Venue Name"
  },
  "run": {
    "mode": "manual",
    "dryRun": true,
    "notes": "Operator-triggered test run",
    "logId": "uuid",
    "fetchedAt": "2026-03-11T08:15:00Z",
    "fetchMethod": "direct_html",
    "rawRowsSeen": 0,
    "rawRowsInserted": 0,
    "rawRowsSkipped": 0,
    "eventsCreated": 0
  }
}
```

The route currently:

- creates a real `scrape_log` row
- fetches source HTML for `direct_html` sources, preferring `scrape_config.list_url` and also honoring `scrape_config.list_urls` or `scrape_config.category_urls` when present
- extracts first-pass raw candidates from source-aware patterns first, then generic anchor links
- inserts or skips `raw_events` when `dryRun = false`
- updates `scrape_sources.last_scraped_at` when a non-dry run succeeds

It does not yet perform source-specific parsing or canonical event promotion.

### Minimum failure response shape

```json
{
  "status": "error",
  "sourceId": "uuid",
  "message": "Fetch failed",
  "logId": "uuid-or-null"
}
```

## First write-path contract

### `scrape_log`

Create one row per run attempt with:

- `source_id`
- `raw_content`: optional payload excerpt or normalized fetch summary
- `parsed_data`: structured run summary JSON
- `events_created`: `0` for the first raw-intake-only slice
- `tokens_used`: `0` unless an LLM/parser cost is actually incurred
- `error`: populated only on failure

### `raw_events`

For each extracted raw event candidate, write:

- `source_name`: from `scrape_sources.name`
- `source_url`: canonical unique source item URL if available
- `title_raw`
- `description_raw` when listing or detail context makes it available
- `date_raw` when listing or detail context makes it available
- `image_url` when listing or detail context makes it available
- `raw_html`
- `venue_raw`
- `venue_name_raw`
- `raw_json`: original normalized payload fragment
- `parsed`: `false`
- `parse_attempts`: `0`
- `venue_match_status`: default to `unmatched`

### Duplicate handling

Because `raw_events.source_url` is unique:

- skip insert when `source_url` already exists
- count that row under `rawRowsSkipped`

If a source cannot provide stable per-item URLs:

- do not fake uniqueness yet
- document that source as requiring a stronger dedupe strategy before full automation

## Status vocabulary

Recommended route-level statuses:

- `ok`
- `error`
- `not_implemented`

Recommended run summary counters:

- `rawRowsSeen`
- `rawRowsInserted`
- `rawRowsSkipped`
- `eventsCreated`

Recommended raw-event lifecycle values from the current schema:

- `parsed = false` for new intake rows
- `venue_match_status = unmatched` for first-pass intake rows

## Endpoint 3: `GET /ingestion/raw/recent`

### Purpose

Return recent `raw_events` rows for operator inspection.

### Recommended query params

- `limit`
- `sourceName`

### Current response posture

- backend-admin read only
- returns raw rows without canonical promotion

## Endpoint 4: `GET /ingestion/parse-preview`

### Purpose

Return normalized parse-preview candidates from recent `raw_events`.

### Recommended query params

- `limit`
- `sourceName`

### Current response posture

The route currently derives:

- normalized title/date/venue text
- suggested category
- parse confidence
- suggested outcome
- review reasons

This is a preview/review surface, not a promotion path.

## Next backend slice after this contract

1. improve raw-intake extraction from generic anchor harvesting into source-aware extraction
2. add parse and promotion stages after raw intake is stable

## Current extractor coverage

The first source-aware extractor layer currently recognizes:

- Pozorista event links using `?event=...`
- AllEvents Sarajevo event links with stable event-id tails
- KupiKartu event links using `/karte/event/{id}/{slug}`

Generic anchor harvesting remains the fallback for other `direct_html` sources.

The current first enrichment layer also tries to carry listing-level metadata into `raw_events`:

- KupiKartu: date, venue, image
- AllEvents: date, venue, image when visible in listing context
- Pozorista: nearby listing date/venue text when present

The current detail-enrichment layer then improves the first candidates per run for:

- AllEvents via event-page JSON-LD
- KupiKartu via detail-page metadata extraction

This remains source-specific and conservative rather than generic.

## Instagram-specific note

For Instagram sources, the documented preferred path is:

- fetch recent posts from a venue or event account
- preserve caption/image provenance in raw intake
- use AI parsing to decide whether a post is an actual event announcement
- only then promote qualified items toward canonical events or specials

Current tooling preference:

- first choice: Apify-backed Instagram scraping
- fallback: self-hosted headless browser on a VPS
- long term: official APIs for venues that explicitly connect their profiles
