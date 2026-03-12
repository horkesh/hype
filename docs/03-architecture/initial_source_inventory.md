# Initial Source Inventory

## Purpose

Define the first repo-native `scrape_sources` inventory that should power early Hype ingestion work.

This is the execution bridge between:

- source taxonomy
- source seeding strategy
- source cadence
- the current backend raw-intake implementation

Use this doc when:

- seeding the first real `scrape_sources`
- choosing which sources to activate first
- deciding which sources to test on the home machine

## Inventory policy

For the first reliable pipeline:

- prefer sources that already fit the current `direct_html` backend path
- prefer citywide high-signal sources before venue-specific sources
- seed some future sources early, but keep them inactive when fetch or parser confidence is still low
- do not let Instagram or JS-heavy sources distract from proving the first real raw-intake loop

## Current implementation fit

The backend currently supports:

- `GET /ingestion/sources`
- `POST /ingestion/run/:sourceId`
- `direct_html` fetch
- `list_url`, `list_urls`, and `category_urls`
- source-aware extraction for:
  - Pozorista
  - AllEvents
  - KupiKartu

The backend does not yet reliably support:

- Instagram fetching
- JS-heavy/headless-only sources
- official API ingestion
- full detail-page enrichment
- parse-stage promotion into canonical entities

## Recommended first active sources

These are the best first sources to operate with the current backend.

### 1. Pozorista

Role:

- theatre and culture backbone

Why it belongs in the first active set:

- strong Sarajevo relevance
- reliable WordPress structure
- existing source-aware extractor support
- fills a clear theatre/culture gap

Recommended seed:

```json
{
  "name": "Pozorista.ba (all theatres)",
  "source_key": "pozorista_ba",
  "source_url": "https://pozorista.ba/?post_type=event",
  "source_type": "website",
  "tier": 1,
  "frequency_hours": 12,
  "is_active": true,
  "category_hint": "theatre",
  "scrape_config": {
    "fetch_method": "direct_html",
    "list_url": "https://pozorista.ba/?post_type=event",
    "parser_hint": "pozorista_calendar",
    "seed_origin": "legacy_docs",
    "seed_confidence": "high",
    "discovered_via": "validated_architecture_docs"
  }
}
```

Home-machine verification value:

- best first single-listing verification source

### 2. AllEvents

Role:

- broad citywide aggregator
- practical Facebook proxy

Why it belongs in the first active set:

- best broad event coverage
- already validated as a high-value source
- existing source-aware extractor support
- useful for concerts, nightlife, festivals, and mixed city activity

Recommended seed:

```json
{
  "name": "AllEvents.in Sarajevo",
  "source_key": "allevents",
  "source_url": "https://allevents.in/sarajevo/all",
  "source_type": "facebook_proxy",
  "tier": 1,
  "frequency_hours": 6,
  "is_active": true,
  "category_hint": null,
  "scrape_config": {
    "fetch_method": "direct_html",
    "list_url": "https://allevents.in/sarajevo/all",
    "list_urls": [
      "https://allevents.in/sarajevo/music",
      "https://allevents.in/sarajevo/parties",
      "https://allevents.in/sarajevo/theatre"
    ],
    "parser_hint": "allevents_listing",
    "proxy_for": "facebook_events",
    "seed_origin": "legacy_docs",
    "seed_confidence": "high",
    "discovered_via": "validated_architecture_docs"
  }
}
```

Home-machine verification value:

- best first multi-page verification source

### 3. KupiKartu

Role:

- primary ticketing coverage for concerts, comedy, sport, and culture

Why it belongs in the first active set:

- stable event-link structure
- existing source-aware extractor support
- category-page config fits the current multi-page fetch path
- good complement to AllEvents and Pozorista

Recommended seed:

```json
{
  "name": "KupiKartu.ba",
  "source_key": "kupikartu",
  "source_url": "https://www.kupikartu.ba",
  "source_type": "ticketing_platform",
  "tier": 1,
  "frequency_hours": 6,
  "is_active": true,
  "category_hint": null,
  "scrape_config": {
    "fetch_method": "direct_html",
    "list_url": "https://www.kupikartu.ba",
    "category_urls": [
      "/karte/kategorija/2",
      "/karte/kategorija/1",
      "/karte/kategorija/3",
      "/karte/kategorija/4",
      "/karte/kategorija/25"
    ],
    "parser_hint": "kupikartu_listing",
    "event_url_pattern": "/karte/event/{id}/{slug}",
    "seed_origin": "legacy_docs",
    "seed_confidence": "high",
    "discovered_via": "validated_architecture_docs"
  }
}
```

Home-machine verification value:

- best ticketing-platform verification source

## Recommended seeded but inactive sources

These are good candidates to seed now, but not activate until the pipeline or fetch method is stronger.

### 4. Entrio

Why seed it:

- high product value for concerts, DJ nights, sports, and standup

Why keep it inactive:

- direct fetch is currently blocked by `403`
- likely needs Apify or another headless/API path

Recommended status:

- seeded
- `is_active = false`

### 5. FiestaLama

Why seed it:

- fills a nightlife and club-event gap

Why keep it inactive:

- current fetch confidence is weak
- likely needs Apify or API/partnership path

Recommended status:

- seeded
- `is_active = false`

### 6. CineStar

Why seed it:

- useful cinema gap-fill source

Why keep it inactive for now:

- lower urgency than core event sources
- parser needs rewrite for the actual page structure

Recommended status:

- seeded
- `is_active = false`

### 7. First Instagram accounts

Why seed later, not now:

- Instagram is strategically important
- current backend path does not yet support the intended fetch method

Recommended first Instagram accounts once Apify is configured:

- `cinestarcinemas_bih`
- `meetingpoint_sa`
- `kupikartu.ba`

Recommended status:

- do not activate yet
- seed only after the first non-Instagram raw-intake flow is working on the home machine

## Skip for now

Do not spend current-phase effort on these as active MVP sources:

- Songkick
- Eventbrite Sarajevo
- Cineplexx
- low-signal news/article sources
- uncertain long-tail Instagram accounts

Reason:

- they are lower leverage, noisier, or operationally harder than the current top sources

## Recommended first home-machine verification run

Use this order:

1. Pozorista
   - simplest first proof of live source listing + dry run + non-dry run
2. AllEvents
   - best proof of `list_url` plus `list_urls`
3. KupiKartu
   - best proof of `category_urls` and ticketing-platform extraction

Success looks like:

- `GET /ingestion/sources` returns these sources
- dry runs return sensible `fetchedUrl` / `fetchedUrls`
- non-dry runs create `scrape_log` rows
- non-dry runs write or skip `raw_events` cleanly
- the counters look plausible for each source type

## Activation rules

Activate now:

- Pozorista
- AllEvents
- KupiKartu

Seed but inactive:

- Entrio
- FiestaLama
- CineStar
- first Instagram accounts

Do not seed yet unless needed:

- low-value enrichment sources
- uncertain or noisy Instagram accounts

## Maintenance rule

When this inventory changes:

1. update this doc
2. update `source_seeding_strategy.md` only if the policy changed
3. update `execution_board.md` if the ingestion workstream status changed
4. update `handover.md` if the preferred verification sources changed
