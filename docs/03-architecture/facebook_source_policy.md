# Facebook Source Policy

## Purpose

Define how Hype should treat Facebook-origin event data inside the ingestion architecture.

Facebook is strategically important for Sarajevo events, but it is also operationally difficult and policy-sensitive.

## Core position

Facebook matters because many Sarajevo venues and promoters still announce events there first or most clearly.

However, the repo should not assume direct Facebook scraping is the default path.

Do instead:

- prefer safer proxy or partnership paths first
- keep Facebook-origin ingestion behind backend/admin workflows
- avoid making the mobile app depend directly on Facebook-specific logic

## Preferred acquisition order

### 1. Facebook-proxy aggregators first

Preferred first path:

- use AllEvents or similar aggregators that already surface many Facebook events

Why:

- simpler operationally
- lower anti-bot complexity
- good enough to cover much of the launch need

This should be treated as the practical MVP path.

### 2. Official API when realistically available

Best long-term direct path:

- Facebook Graph API or connected account access where venues explicitly authorize access

Use when:

- a venue or organizer has a connected page/business account
- a legitimate permission path exists
- the operational overhead is worth it

### 3. Headless or paid scraping fallback

Use only when:

- a high-value source cannot be covered through proxy or official access
- there is a clear operational justification

Examples:

- paid scraping vendors
- self-hosted headless browser flows

This should be a fallback, not the architectural default.

## Policy stance

Recommended Hype posture:

- do not make direct Facebook scraping the only way the system works
- do not assume long-term stability from unofficial Facebook scraping methods
- do preserve Facebook-derived provenance where source items come through proxy or fallback paths

## Source modeling guidance

Facebook-related source classes may include:

- `facebook_proxy`
- `facebook_page`
- `facebook_event`

Recommended first practical use:

- seed proxy sources first
- keep direct Facebook sources inactive until a fetch method is proven

## Recommended `scrape_config` examples

### Proxy source

```json
{
  "fetch_method": "direct_html",
  "proxy_for": "facebook_events",
  "parser_hint": "aggregator_event_listing"
}
```

### Direct page source

```json
{
  "fetch_method": "api",
  "facebook_page_id": "12345",
  "access_mode": "authorized_page"
}
```

### Fallback headless source

```json
{
  "fetch_method": "headless_browser",
  "browser_vendor": "apify",
  "source_risk": "high"
}
```

## Promotion guidance

Facebook-derived items should follow the same dedupe and promotion policy as all other raw sources:

- preserve provenance first
- dedupe against canonical events
- enrich instead of duplicating where possible

## Recommended default for this repo

For the current phase:

1. rely on Facebook-proxy aggregators for broad coverage
2. document direct Facebook sources, but do not make them core to the first reliable pipeline
3. treat official API access as the clean long-term path if venue relationships mature
