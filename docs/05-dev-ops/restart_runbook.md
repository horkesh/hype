# Look — restart runbook

Look was retired on **2026-08-22**. It was **not deleted** — everything is recoverable and
the fast path back takes minutes.

> **Where it lives now:** the project was moved out of the Pro org (pausing is impossible
> there — `pause_project` fails with `Project is not free-tier`) and into a new **Free**
> organization named **Look**, where the project is also now named **Look**. It costs $0
> and auto-pauses itself after roughly a week of inactivity. The Codex org dropped to
> 3 projects, $55/mo → $45/mo.
>
> **The project ref did not change: `kyfoqltmkqwtnrdlacqv`.** The API URL, anon key and
> service-role key are all still valid, so the `.env` files, Vercel env vars and GitHub
> Actions secrets did not need touching.
>
> Verified after the transfer with `verify.mjs` (in this archive): all 33 tables at exact
> row counts, both buckets at 1,333 objects, 4 auth users, recovered columns present,
> Edge Functions responding. Re-run it any time with `node verify.mjs`.

## Identifiers

| | |
|---|---|
| Supabase project | **Hype** — `kyfoqltmkqwtnrdlacqv`, eu-central-1, Postgres 17.6 |
| Supabase org | The Codex — `emtejjulfscwgusfydej` (Pro) |
| Code | `github.com/horkesh/hype` — local `C:\dev\Look` |
| Vercel (scope `haris-projects-2de2fa69`) | `look-telemach-demo`, `look-admin`, `hype-app`, `hype` |
| GitHub Actions | `scrape-and-promote.yml`, `scrape-instagram.yml` — both disabled |
| This archive | `C:\dev\_archive\look-2026-08\` — 558 MB |

## Path A — the project still exists (minutes)

1. Supabase dashboard → project **Hype** → **Restore project** if it has auto-paused;
   if it's still awake, skip straight to step 2. Schema, data, storage, RLS policies, the
   13 Edge Functions and their secrets all come back exactly as they were.
   To put it back on Pro compute, transfer it into **The Codex** org again — that resumes
   the $10/mo charge, so only do it if Look is genuinely live again.
2. Re-enable the schedulers you want:
   ```bash
   cd C:\dev\Look
   gh workflow enable 280158089   # Scrape Instagram + promote events (weekly)
   gh workflow enable 277842784   # Scrape and promote events (every 6h)
   ```
   Note both were off at retirement: the Instagram one was disabled manually, the
   6-hourly one had already been auto-disabled by GitHub for repo inactivity.
3. Re-check the third-party keys. If they were rotated at retirement, set fresh values for
   `APIFY_API_TOKEN` (GitHub secret) and the Edge Function secrets `OPENAI_API_KEY`,
   `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`, plus `GOOGLE_MAPS_API_KEY` in `backend/.env`.
4. The Vercel projects were left deployed (Hobby scope, no cost). They start working again
   the moment Supabase is back. Redeploy only if you changed the code.

**Watch the Free-tier ceilings if Look ever runs again there.** Storage is at 511 MB of the
1 GB cap, so re-enabling the scrapers would push it over within weeks — the venue-photo
bucket is what grows. If you ever delete the project, the automated backups go with it and
this archive becomes the only copy.

## Path B — rebuild from scratch (project deleted or lost)

1. Create a new Supabase project, note the new ref.
2. Apply migrations from `C:\dev\Look\supabase\migrations` **in filename order** (35 files).
   Two of them were recovered from the live DB on 2026-08-22 and had never been committed —
   without them you get an `events` table with no `slug` and `event_series`/`venues` missing
   their festival and watch-party columns:
   - `20260522053650_events_slug_column.sql`
   - `20260604085602_festivals_major_events_columns.sql`
3. Create the three storage buckets, all **public**: `venue-photos`, `hero-images`,
   `event-covers`.
4. Load data from `db/*.json` (33 files, one per table). Insert **parents before children** —
   `venues` and `event_series` before `events`, `events` before `checkins`/`event_attendance`.
   The JSON preserves UUIDs, so foreign keys line up as long as ordering is respected.
5. Upload `storage/<bucket>/<path>` preserving paths exactly — `venues` and the event/hero
   image columns reference these by URL.
6. Recreate the 4 auth users from `auth/users.json`. **Password hashes are not in this
   archive** (the export went through the service-role API, not `pg_dump`), so users must
   reset their passwords. With 4 users this is a non-issue; if it ever matters, take a real
   `pg_dump -n auth` while the project is restorable.
7. Deploy the 14 Edge Functions from `C:\dev\Look\supabase\functions`. Two of these were
   also recovered from the live project on 2026-08-22 and had never been committed:
   `parse-events` and `scrape-kupikartu`. Set their secrets (see below).
8. Point `apps/mobile/.env`, `apps/admin/.env`, and `backend/.env` at the new project ref
   and keys. Templates of the originals are in `meta/env/`.

## What's in this archive

```
db/          33 JSON files, one per public table — 1,371 venues, 314 events,
             827 checkins, 1,379 scrape_log, 1,264 audit_log, 405 raw_events, …
storage/     1,333 files / 515 MB across venue-photos (1,235) and hero-images (98)
auth/        users.json — 4 users, no password hashes
meta/env/    the three gitignored .env files, verbatim  ← contains live secrets
meta/        manifest.json — row and object counts as exported
export.mjs   the export script; re-runnable if the project is restored
```

Verified at export time: every table row count and both bucket object counts matched the
live database exactly, and sampled images carry valid JPEG magic bytes.

**`meta/env/` holds real service-role keys and API tokens.** Keep this archive off any
public sync target.

## Secrets inventory (names only)

- Edge Function secrets: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`,
  `ADMIN_FUNCTION_SECRET` (optional — `parse-instagram` also accepts the service-role key
  as a Bearer token).
- GitHub Actions secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APIFY_API_TOKEN`.
- `backend/.env`: `GOOGLE_MAPS_API_KEY`, `APIFY_API_TOKEN`.
- `apps/mobile/.env`: `EXPO_PUBLIC_OPENWEATHER_API_KEY` — likely dead already, since
  `weather-proxy` was moved to keyless dual-source (MET Norway + Open-Meteo).

## Known drift found during retirement

The live project and the repo had diverged. All four gaps are now closed in git, but they
are worth remembering as a pattern — schema and functions were being changed through the
dashboard without a matching commit:

- 2 migrations applied to the DB with no file in the repo (recovered, listed above).
- 2 Edge Functions deployed with no source in the repo (recovered, listed above).
- 1 Edge Function in the repo that was never deployed: `generate-event-cover`.
- Migration timestamps in `supabase_migrations.schema_migrations` do not match the repo
  filenames for the pre-2026-05-21 entries. Cosmetic, but it means you cannot diff the two
  lists by name alone.
