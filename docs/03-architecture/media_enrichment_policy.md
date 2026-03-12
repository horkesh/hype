# Media Enrichment Policy

## Purpose

Define how venue photos, event images, and other scraped media should move through the ingestion pipeline.

Media is valuable, but it can also create clutter, duplicates, and low-trust canonical data if handled too aggressively.

## Core rule

Treat scraped media as enrichment input first, not automatic canonical truth.

Do instead:

- preserve provenance
- evaluate quality and relevance
- promote only when confidence is strong enough

## Media sources

Likely sources include:

- venue Instagram posts
- event flyers
- ticketing-platform event covers
- venue websites
- proxy aggregator images

These sources are not equally trustworthy.

## First-pass handling

When media is discovered during ingestion:

1. keep provenance in raw intake
2. associate media with the raw source item
3. avoid immediately overwriting canonical `cover_image_url` or venue imagery

Recommended first-pass storage approach:

- keep source image URL in raw payload metadata
- only promote into canonical row fields after confidence checks or review

## Canonical promotion guidance

### Event images

Auto-promotion is acceptable when:

- the image clearly belongs to the event
- the source is high-confidence
- no better canonical image already exists

Use caution when:

- the image is generic venue branding
- the image is a collage or low-resolution repost
- the same event already has a stronger image from another source

### Venue images

Venue imagery should be stricter than event imagery.

Recommended rule:

- do not auto-replace venue cover images from noisy scraped sources

Use promotion when:

- the source is clearly venue-owned
- the image is representative and current
- the quality is strong enough for a product surface

## Instagram-specific media policy

Instagram is valuable for fresh venue and event imagery, but it is also noisy.

Recommended rule:

- treat Instagram media as candidate enrichment
- promote event flyers more readily than general venue photos
- require stronger confidence before turning Instagram venue imagery into canonical venue covers

## Duplicate and overwrite policy

If a canonical row already has imagery:

- prefer enrich-or-review over blind replacement

Good reasons to replace:

- clearly better resolution
- clearly more current event-specific image
- current canonical image is missing, broken, or irrelevant

Bad reasons to replace:

- the new image is merely different
- the new image has weaker provenance
- the new image is lower quality

## Operator review recommendation

The first operator/admin workflow should be able to inspect:

- source image URL
- source name
- source item URL
- current canonical image
- proposed replacement image

This can start as a backend/reporting workflow before a full admin UI exists.

## Current repo recommendation

For the current phase:

- preserve media provenance in raw ingestion
- prioritize event-image promotion over venue-image replacement
- do not build a fully automated venue-photo refresh system until the ingestion pipeline and moderation posture are more mature
