# Look — retirement plan (data-preserving shutdown)

Prepared 2026-08-21. Goal: stop recurring spend on Look while keeping every byte
of data recoverable. Nothing in Phase 0–2 destroys anything.

## What Look actually is

| Piece | Identifier |
|---|---|
| Supabase project | **Hype** — `kyfoqltmkqwtnrdlacqv`, eu-central-1 |
| Supabase org | The Codex — `emtejjulfscwgusfydej`, **Pro** plan |
| Code | `github.com/horkesh/hype` (local `C:\dev\Look`, branch `main`, clean + pushed) |
| Frontends (Vercel, team `team_SpPoZYOLWh3JTJjuvfZG10Xn`) | `look-telemach-demo` (`prj_xwdQUmJQFsq1GGjI2VWnjvZ9iHWO`), `look-admin` (`prj_EVB2qnk4V0NELVfiHQtPaH7cQ8Bf`) |
| Schedulers | GitHub Actions: `scrape-and-promote.yml` (every 6h), `scrape-instagram.yml` (Sun 02:00 UTC) |
| Edge Functions | 13, all ACTIVE (source in `supabase/functions/`) |

### What has to survive

Postgres is **44 MB**; Storage is **511 MB / 1,333 objects**.

- Tables with data: `scrape_log` 1379, `venues` 1371, `audit_log` 1264, `checkins` 827,
  `raw_events` 405, `events` 314, `scrape_sources` 97, `city_pulse` 40,
  `visit_sarajevo_kb` 16, `heritage_walk_stops` 15, `badges` 10, `event_series` 6,
  `profiles` 4, `heritage_walks` 3, `notes` 1. All other public tables are empty.
- Storage buckets (all public): `venue-photos` 1,235 objects / 405 MB,
  `hero-images` 98 objects / 106 MB, `event-covers` empty.
- `auth.users`: 4.
- 33 migrations in `supabase/migrations/` + edge function source — already in git.

The expensive-to-recreate assets are `venues` (Google Places enrichment) and the two
image buckets (scraped/generated). Everything else could be re-derived from code.

## Where the ~$60/month actually goes

Audited all four projects. **Every one is an identical Micro instance** (`shared_buffers`
256 MB, `max_connections` 60), and `get_cost` confirms the marginal price on this org is
**$10/project/month**.

| Project | Compute | DB | Storage |
|---|---|---|---|
| Hype (**Look**) | Micro $10 | 44 MB | 511 MB / 1,333 obj |
| the-codex | Micro $10 | 19 MB | 2,350 MB / 1,933 obj |
| bespoke | Micro $10 | 31 MB | 52 MB / 157 obj |
| Defter | Micro $10 | 14 MB | 0 |

```
Pro base                     $25
4 × Micro compute            $40
included compute credit     -$10
                            ————
                             $55/mo
```

The observed ~$60 is that plus VAT or a small overage — confirm on the invoice, I can't
read billing from here. What matters is the shape: **the bill is 100% base plan plus
per-project compute.** Total DB across all four projects is 108 MB against 8 GB of included
disk each; total storage is 2.9 GB against 100 GB included. Data volume is costing you
nothing. You are paying $10/month per *project slot*, four times over.

### What that means for this plan

Retiring Look saves exactly **$10/month** ($55 → $45). Real, but it is one quarter of the
problem, and no amount of data cleanup improves it — only removing project slots does.

The larger lever, if you want it: **Defter and the-codex are trivially mergeable into
`bespoke`**, which is already an explicit multi-app database using table prefixes
(`sjaj_*`, `couple_*`, `pbsa_*`, `pn_*`, `korcula_*`, `rubato_*`). Defter is 8 real tables
/ ~3.9k rows and zero storage objects. the-codex is 32 tables / ~1.5k rows, but carries
2.35 GB of storage that would have to move with it. One project total = **$25/month**.

Two things to know before considering that:

- Merging is real work, not a toggle: auth users (with password hashes), RLS policies,
  storage paths, and every client URL/anon key have to move. Defter is maybe half a day;
  the-codex is closer to a full day because of the 1,933 storage objects.
- Dropping to the **Free** plan is not an option even after consolidating — Free caps file
  storage at 1 GB and the-codex alone holds 2.35 GB, and Free projects auto-pause on
  inactivity, which would break personal apps you actually use.

**Side finding:** Defter contains `sage_events` (29 rows) and `rubato_snaps` (0 rows) —
both of which also exist in `bespoke` with more data (205 and 19 rows). Those look like
stragglers from an app pointed at the wrong project. Worth reconciling before any merge.

### Non-Supabase spend this retirement also stops

- The 6-hourly scrape job burns **Apify** credits and **Google Places/Maps** quota.
- Edge functions hold `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_AI_API_KEY` —
  those bill to their own vendors, not Supabase.

---

## Phase 0 — Stop the bleeding (today, ~10 min, fully reversible)

Nothing here touches data.

1. **Disable both cron workflows.** GitHub → Actions → each workflow → `⋯` → *Disable workflow*.
   This immediately stops the 6-hourly DB writes, Apify spend, and Google API calls.
   (If you prefer it in git: comment out the `schedule:` blocks, keep `workflow_dispatch`.)
2. **Pause the Vercel projects** `look-telemach-demo` and `look-admin` (Project → Settings →
   pause). They start returning 503 but keep their config and deployment history.
   Skip `look-telemach-demo` if the Telemach pitch is still live — see the note at the end.
3. Leave Supabase running. It stays the source of truth until the export is verified.

## Phase 1 — Export everything (~1 hour, mostly download time)

No `psql`, `pg_dump`, or Supabase CLI on this machine, but Docker 29.6 and Node 24 are
installed, so the dump runs in a container.

Pick an export root outside the repo, e.g. `C:\dev\_archive\look-2026-08\`.

**1a. Database.** Get the connection string from Supabase → Project → *Connect* (direct
connection, or the session pooler if IPv4 is a problem). Then:

```bash
DB_URL='postgresql://postgres:[PASSWORD]@db.kyfoqltmkqwtnrdlacqv.supabase.co:5432/postgres'

# schema + data, one restorable file per concern
docker run --rm postgres:17 pg_dump "$DB_URL" -n public -n auth -n storage --schema-only > schema.sql
docker run --rm postgres:17 pg_dump "$DB_URL" -n public -n auth -n storage --data-only --column-inserts > data.sql

# plus a compressed custom-format dump as the belt-and-braces copy
docker run --rm postgres:17 pg_dump "$DB_URL" -Fc > look.dump
```

`spatial_ref_sys` (PostGIS, 8,500 rows) comes along for the ride and is not your data —
harmless either way.

**1b. Human-readable copies.** The dumps are for restoring; CSV is for reading in five
years. Export at least `venues`, `events`, `raw_events`, `checkins`, `scrape_sources`,
`event_series`, `city_pulse`, `visit_sarajevo_kb`, `heritage_walks`, `heritage_walk_stops`,
`badges`, `profiles`, `notes` as CSV — `\copy … to … csv header`, or a short `supabase-js`
script using the service-role key.

**1c. Storage — the part the DB dump does *not* cover.** `storage.objects` holds metadata
only; the 511 MB of files must be pulled separately. All three buckets are public, so a
Node script that lists each bucket and downloads every object into
`storage/<bucket>/<path>` works with no CLI login. Preserve the paths exactly — they are
referenced by URL from `venues` and the event/hero image columns.

**1d. Auth.** 4 users; `pg_dump -n auth` above captures them, password hashes included.

**1e. Config that isn't in git.** Copy into the archive as a plain-text inventory:

- Edge Function secret *names* (not values) and which vendor each belongs to.
- The three `.env` files (`apps/mobile`, `apps/admin`, `backend`) — they are gitignored.
- Project ref, region, Postgres version (17.6), and the migration list.

## Phase 2 — Verify the export (~20 min). Do not skip.

1. Restore into a throwaway local Postgres and prove it works:

   ```bash
   docker run -d --name look-verify -e POSTGRES_PASSWORD=x -p 5433:5432 postgis/postgis:17-3.4
   docker exec -i look-verify psql -U postgres < schema.sql
   docker exec -i look-verify psql -U postgres < data.sql
   ```

2. Compare row counts against the table above — `venues` 1371, `events` 314, `checkins` 827,
   `scrape_log` 1379, `raw_events` 405, `audit_log` 1264. They must match.
3. Confirm the storage download has **1,333 files / ~511 MB**, and spot-open a dozen images.
4. Store the archive in **two** places (local + cloud or external drive), then record the
   location in `docs/project_ledger.md`.

Only once all four checks pass does anything get switched off.

## Phase 3 — Switch off Supabase (reversible)

**Correction, found while executing this on 2026-08-22: you cannot pause a Pro project.**
`pause_project` returns `Project is not free-tier. Please downgrade it to free-tier first`.
Supabase bills per organization, so pausing is a Free-tier-only feature and is unavailable
to every project in The Codex org. The route that achieves the same thing:

1. **Transfer the project into a new Free organization.** Supabase → new Organization (Free
   plan) → project **Hype** → Settings → General → *Transfer project*. Look fits Free
   limits with room to spare (44 MB database vs 500 MB; 511 MB storage vs 1 GB), so it
   costs $0 there and auto-pauses itself after ~1 week of inactivity. Restoring is a click.
   Both halves are dashboard-only — no MCP tool covers either.
2. The Codex org drops to 3 projects: **$55/mo → $45/mo**.
3. Revoke the keys only if this becomes a permanent teardown — the anon key and URLs are
   baked into public web bundles anyway: the Apify token, Google Maps key, OpenWeather key,
   and the AI keys held as Edge Function secrets. Note this is the step that actually stops
   third-party spend; taking Supabase offline does not.

## Phase 4 — Permanent teardown (after the cooling period, optional)

1. Delete the Supabase project. **Irreversible, and it takes the automated backups with it.**
2. Delete the two Vercel projects or leave them paused; release any custom domain you do not
   want to renew.
3. Archive `github.com/horkesh/hype` (Settings → Archive) rather than deleting it — free,
   read-only, and it keeps the migrations and function source next to the data archive.
4. Re-check Supabase billing. If the org is down to projects that fit the free tier,
   reconsider whether Pro is still worth $25/mo.

## The one decision I can't make for you

`look-shot/` holds `Look-Telemach-Partnerstvo.pptx`, a partnership deck. If that pitch is
still open, keep `look-telemach-demo` deployed and the Supabase project **paused but
undeleted** — a paused project restores in minutes, a deleted one is a rebuild. Phases 0–3
are safe either way; only Phase 4 forecloses that option.
