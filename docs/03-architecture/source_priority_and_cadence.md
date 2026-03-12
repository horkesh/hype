# Source Priority And Cadence

## Purpose

Define which source classes matter most for Hype and how aggressively they should run.

This is a planning and operations document, not an exact cron file.

## Tier model

### Tier 1: Core launch sources

These sources provide the highest value for Sarajevo event coverage and should be the first to operate reliably.

Characteristics:

- broad event coverage
- strong local relevance
- acceptable data quality
- meaningful contribution to discovery surfaces

Typical cadence:

- 2x to 4x per day depending on source volatility

Examples:

- AllEvents or similar Facebook-proxy aggregators
- Pozorista theatre/culture listings
- KupiKartu and other primary ticketing/event sources
- selected high-signal Instagram nightlife/event accounts

### Tier 2: Gap-fill and enrichment sources

These sources improve completeness but should not block the MVP ingestion pipeline.

Characteristics:

- narrower coverage
- useful category or niche fill
- moderate operational complexity

Typical cadence:

- 1x to 2x per day

Examples:

- CineStar and cinema program sources
- selected venue websites
- Karter
- tourism/event guide surfaces
- additional venue Instagram accounts with slower content cadence

### Tier 3: Optional enrichment sources

These sources add depth, trend visibility, or niche long-tail coverage after core reliability exists.

Characteristics:

- lower direct product leverage
- higher complexity or lower reliability
- better treated as enrichment after core sources stabilize

Typical cadence:

- daily or less

Examples:

- Bandsintown-like sources
- lower-volume culture/news sources
- image-heavy or low-structure Instagram accounts

## Instagram-specific cadence

Recommended account cadence by operational role:

### Tier 1 Instagram accounts

Use for:

- clubs
- bars with same-day events
- event venues
- promoters with frequent nightlife announcements

Recommended cadence:

- 2x daily

### Tier 2 Instagram accounts

Use for:

- restaurants with specials
- bars with periodic promos
- venues with weekly programming

Recommended cadence:

- 1x daily

### Tier 3 Instagram accounts

Use for:

- slower-moving culture accounts
- archival or branding-heavy accounts

Recommended cadence:

- 2 to 3 times per week

## Operational rule

Do not treat cadence as a static obsession.

Do instead:

- start conservative
- watch signal quality and source breakage
- increase frequency only for sources that actually add useful same-day value

## MVP recommendation

For the first reliable pipeline:

1. stabilize 3 to 5 Tier 1 sources
2. add selected Tier 1 Instagram accounts only after the raw-intake pipeline works
3. expand to Tier 2 once dedupe and promotion are reliable
