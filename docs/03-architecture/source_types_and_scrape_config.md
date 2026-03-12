# Source Types And Scrape Config

## Purpose

Define the repo-native source taxonomy for ingestion work and the recommended `scrape_config` shape for each source type.

This keeps future scraper implementation consistent across backend routes, source seeding, and operator workflows.

## Canonical source types

### 1. `website`

Use for:

- venue websites
- theatre repertory pages
- city or tourism listings
- static event pages

Typical traits:

- direct HTML fetch often works
- selectors or parser hints usually matter
- medium maintenance cost

Recommended `scrape_config`:

```json
{
  "fetch_method": "direct_html",
  "list_url": "https://example.com/events",
  "list_urls": ["https://example.com/events/page-2"],
  "selectors": {
    "item": ".event-card",
    "title": ".event-title",
    "date": ".event-date",
    "link": "a"
  },
  "detail_fetch": true,
  "parser_hint": "website_event_listing"
}
```

### 2. `ticketing_platform`

Use for:

- KupiKartu
- Entrio
- FiestaLama
- similar ticketing/event-sale sources

Typical traits:

- high event quality
- often better date/venue reliability
- may require headless browsing or partnership/API access

Recommended `scrape_config`:

```json
{
  "fetch_method": "direct_html",
  "list_url": "https://example.com/events",
  "category_urls": ["/karte/kategorija/2", "/karte/kategorija/3"],
  "detail_fetch": true,
  "parser_hint": "ticketing_listing",
  "category_hint": "mixed"
}
```

If direct fetch fails:

```json
{
  "fetch_method": "headless_browser",
  "browser_vendor": "apify",
  "parser_hint": "ticketing_listing"
}
```

### 3. `instagram`

Use for:

- venue accounts
- event promoter accounts
- nightlife and daily-special accounts

Typical traits:

- strongest same-day pulse source
- weak structure without AI parsing
- image plus caption often both matter

Recommended `scrape_config`:

```json
{
  "instagram_username": "venue_handle",
  "fetch_method": "apify",
  "max_posts": 10,
  "parser_hint": "instagram_event_post",
  "content_focus": "events_and_specials",
  "account_tier": 1
}
```

### 4. `facebook_proxy`

Use for:

- AllEvents and similar aggregators that surface Facebook events indirectly

Typical traits:

- practical substitute for direct Facebook scraping
- often easier and safer operationally than scraping Facebook itself

Recommended `scrape_config`:

```json
{
  "fetch_method": "direct_html",
  "list_url": "https://example.com/city/all",
  "list_urls": ["https://example.com/city/concerts"],
  "detail_fetch": true,
  "parser_hint": "aggregator_event_listing",
  "proxy_for": "facebook_events"
}
```

### 5. `cinema`

Use for:

- CineStar
- Cineplexx
- Meeting Point

Typical traits:

- often specialized schedule layouts
- recurring program-like updates
- lower urgency than nightlife/event pulse

Recommended `scrape_config`:

```json
{
  "fetch_method": "direct_html",
  "list_url": "https://example.com/program",
  "parser_hint": "cinema_program",
  "detail_fetch": false,
  "cadence_note": "2x per day or less"
}
```

### 6. `aggregator`

Use for:

- citywide event listing pages
- tourism calendars
- broad discovery surfaces

Typical traits:

- wide coverage
- mixed quality
- useful for discovery and cross-reference

Recommended `scrape_config`:

```json
{
  "fetch_method": "direct_html",
  "list_url": "https://example.com/city/events",
  "detail_fetch": true,
  "parser_hint": "aggregator_event_listing",
  "coverage_role": "gap_fill"
}
```

## Fetch method vocabulary

Recommended values:

- `direct_html`
- `headless_browser`
- `api`
- `manual_import`

## Parser hint vocabulary

Recommended values:

- `website_event_listing`
- `ticketing_listing`
- `kupikartu_listing`
- `instagram_event_post`
- `aggregator_event_listing`
- `cinema_program`

## Venue linkage guidance

Some sources should link directly to a known venue.

Recommended rule:

- if one source clearly belongs to one venue, include that venue mapping in source metadata or downstream mapping logic
- if a source is citywide or multi-venue, do not fake venue ownership at the source level

## Current implementation note

The live schema today does not enforce all of these fields as explicit columns.

Do instead:

- keep richer source-type metadata inside `scrape_config`
- evolve schema only when repeated operational use proves it is worth promoting fields out of JSON
- use `list_url`, `list_urls`, or `category_urls` in `scrape_config` when the canonical source homepage is not the best direct-html fetch target
