# Cron Scraping

## Purpose

The ingestion pipeline (`scrapeAndPromote.ts` + the two detail-enrichment scripts + `promoteEvents.ts` + `backfillEventVenues.ts`) is automated via GitHub Actions instead of needing a human to run it on the home machine.

## Workflow

`.github/workflows/scrape-and-promote.yml`

Runs on schedule (`cron: '0 */6 * * *'` — every 6 hours, UTC) and on manual `workflow_dispatch` from the Actions tab.

### Why GitHub Actions vs other options

- **GitHub Actions** (chosen): no infra to manage, free tier covers our usage, secrets live next to the code, can be triggered manually
- Vercel Cron: would need the backend deployed to Vercel; right now the backend is a separate Node service that lives in `backend/` and only runs locally
- Supabase pg_cron: would require porting the scraper logic to a Deno edge function or calling out to a remote backend that doesn't exist yet

### Why 6h

Matches the lowest `frequency_hours` on any active scrape_source (AllEvents.in, KupiKartu.ba, Ulaznice.org). Sources with longer `frequency_hours` (e.g. Pozorista.ba at 12h) get correctly skipped by `runScraper.ts`'s `readyToRun` check.

## Required repo secrets

Set these in GitHub → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Source |
|---|---|
| `SUPABASE_URL` | `https://kyfoqltmkqwtnrdlacqv.supabase.co` (the Hype project) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` key |

No Google Maps or Apify keys are needed for the periodic refresh — those are only used by the seed-time pipeline (`findGooglePlaceIds`, `enrichFromGoogle`, `scrapeGooglePhotos`) which is operator-triggered.

## Pipeline order

Each scheduled run executes these six steps in sequence:

1. **`scrapeAndPromote.ts`** — fetches each due source's listing pages, extracts candidates, inserts new `raw_events`, then promotes anything with usable date/title into `events` (with `canonicalEventKey` dedup).
2. **`enrichAllSources.ts`** — fetches detail pages for AllEvents.in and Pozorista.ba `raw_events` that are missing date/venue/description. Dismisses KupiKartu navigation false positives.
3. **`enrichKupikartuDetails.ts`** — fetches detail pages for KupiKartu.ba `raw_events` missing description/date.
4. **`promoteEvents.ts`** — re-runs promotion now that detail enrichment filled in dates. Pulls in everything that the first pass had to skip.
5. **`backfillEventVenues.ts`** — re-runs the venue matcher against any existing event with `venue_id IS NULL`. Catches events that should now link to recently-seeded venues.
6. **`scrapeGooglePhotos.ts --refresh-broken`** — self-heal venue covers. If any `venues.cover_image_url` has drifted back to a `maps.googleapis.com` URL (Google's photo_references are time-limited, so the raw URLs break after hours/days), re-downloads bytes to Supabase Storage. No-op when nothing's broken.

## Concurrency

`concurrency.group: scrape-and-promote` ensures only one run is in flight at a time. If a scheduled tick fires while a previous run is still going, the previous run finishes and the new one queues (we do not cancel mid-run — `cancel-in-progress: false`).

## Manual run

Actions tab → "Scrape and promote events" workflow → "Run workflow" button → pick `main`. The workflow_dispatch trigger fires immediately.

## Observing runs

Each run's logs show:
- Phase 1: scrape stats per source (Inserted / Skipped duplicates)
- Phase 2 & 3: per-event enrichment results
- Phase 4: promotion stats (Promoted / Skipped no-date / Skipped duplicate / cross-source dup)
- Phase 5: backfill match counts by strategy

Failures surface as red Action runs with the step-level error. Common failures:
- Supabase auth: `SUPABASE_SERVICE_ROLE_KEY` rotated → update the secret
- Source HTML changed: extractor regex no longer matches → audit the source extractor in `backend/src/services/sourceExtractors.ts`
- Source returns 429/blocks the user agent → check `ingestionFetch.ts` User-Agent header

## Operator scripts NOT in the cron

These are operator-triggered (one-off) and live outside the cron because they hit Google APIs (cost), seed data (need review), or are only run after manual venue additions:

- `findGooglePlaceIds.ts` — after seeding new venues
- `enrichFromGoogle.ts` — after Place IDs are discovered
- `scrapeGooglePhotos.ts` — after Place IDs are discovered
- `enrichDescriptions.ts` — after Google enrichment, to generate Bosnian/English AI descriptions
- Manual venue-seed migrations
