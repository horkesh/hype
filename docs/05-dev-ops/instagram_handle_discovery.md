# Instagram Handle Discovery

## Purpose

The app uses `venues.instagram_handle` for two downstream things:
1. Displaying a venue's Instagram link on the venue detail screen.
2. Driving the `scrapeInstagram.ts` pipeline to pull recent posts (events, daily specials, signals) from venues whose handle is known.

If `instagram_handle` is wrong, both fail — broken link + no IG signal. So precision matters more than recall.

## Scripts in order

### 1. `discoverInstagramHandlesApify.ts` (preferred)

Searches Instagram via Apify's `apify/instagram-search-scraper` actor. For each venue without a handle, queries `"{venue name} Sarajevo"` and scores the top results.

```
node --env-file=backend/.env --import tsx \
  backend/src/scripts/discoverInstagramHandlesApify.ts \
  [--category=X] [--limit=N] [--dry-run] [--min-confidence=high|medium|low]
```

Cost: Apify's pricing is per dataset item (~$0.0027/result at the FREE tier × 5 results per venue × 1045 venues ≈ $14 worst case).

### 2. `findInstagramHandles.ts` (legacy)

Tries website-link extraction + Google scraping. Lower precision than the Apify approach (Google scraping is CAPTCHA-blocked, website scraping picks up sponsor/payment-processor IG links as false positives). Kept around as a fallback when Apify credits are unavailable.

```
node --env-file=backend/.env --import tsx \
  backend/src/scripts/findInstagramHandles.ts \
  [--category=X] [--limit=N] [--dry-run]
```

### 3. `scrapeInstagram.ts`

Once handles are known, scrapes posts from each via Apify's `apify/instagram-scraper` actor. Writes raw posts to `raw_events` or `daily_specials` depending on content classification.

```
node --env-file=backend/.env --import tsx backend/src/scripts/scrapeInstagram.ts
```

## Scoring (`discoverInstagramHandlesApify.ts`)

For each search result, the script computes a confidence:

- **High**: handle/fullName clearly contains the venue name AND there's an explicit Sarajevo signal (bio mentions Sarajevo/Bosnia, handle has `_sa`/`.ba` suffix, fullName mentions Sarajevo, bio mentions the venue's neighborhood, or account is verified).
- **Medium**: handle/fullName matches the venue name but no explicit Sarajevo signal. Safe enough for longer/specific names ("Sarajevski ratni teatar"), risky for generic ones ("Bar", "Pizza").
- **Low**: Sarajevo signal + decent followers but no name overlap. Rare; mostly catches venues that rebranded their handle entirely.

Generic-name guard: when the venue's normalized name is < 5 chars OR a single dictionary word ("Art", "Birtija", "Biblioteka"), the script REQUIRES an explicit Sarajevo signal even at medium confidence. This avoids false positives where unrelated global accounts ("Art of Living", a German gallery, etc.) share the name token.

Default `--min-confidence` is `medium`. Use `--min-confidence=high` to be even stricter.

## Known limitations

- **Bilingual EN/BS handle paraphrases** — "Bosnian Cultural Center" English raw won't auto-match "BKC (Bosanski Kulturni Centar)" Bosnian canonical via token overlap; we'd need a translation alias map.
- **Verb-form Apify results** — some queries return generic global accounts (`@pizza` with 1.1M followers came up for "Pekara Memović. Only sells pizza and flatbread"). False positives like these need a curator pass.
- **Venues with no Instagram presence** — small bakeries, kiosks, and family restaurants frequently don't have any IG account. The script correctly returns no match in those cases.

## Operator review

After a discovery run, expect 60–80% precision. Recommended review:

```sql
-- Random sample of newly-set handles
SELECT name, category, instagram_handle, neighborhood
FROM public.venues
WHERE instagram_handle IS NOT NULL AND is_curated = false
ORDER BY random()
LIMIT 30;
```

Wrong handles: clear them with
```sql
UPDATE public.venues SET instagram_handle = NULL WHERE id = '<uuid>';
```

The curation queue (`is_curated = false`) is the right place to surface these for a human pass.

## Why not Google search

`findInstagramHandles.ts`'s `directGoogleSearch` fallback scrapes google.com/search HTML. In testing on this session, 100 venues returned exactly 0 useful results — Google increasingly serves JS-rendered pages or interstitials to scrapers. The Custom Search API path requires a `GOOGLE_SEARCH_CX` (Programmable Search Engine ID), which isn't set up and has a 100-query/day free limit anyway.

## Why not CI cron

Discovery is a one-off after seeding new venues; it shouldn't run periodically. It also costs Apify credits per result. Operator-triggered keeps the cost visible.

The periodic `scrape-and-promote` cron (`.github/workflows/scrape-and-promote.yml`) does NOT include this script.
