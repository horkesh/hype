# Home Machine Verification Checklist

This is the standard runtime-validation playbook for the home machine.

Use it when:

- resuming runtime work on the home machine
- verifying a migration or stabilization pass
- checking whether backend ingestion changes work against the real environment
- confirming whether a blocker is still real before making more code changes

Do not use this file as a setup guide.

For setup and environment transition, use:

- `home_work_transition_checklist.md`

## Purpose

Run the same high-signal verification sequence every time so Hype runtime checks are:

- repeatable
- evidence-based
- easy to hand over between sessions

This playbook currently focuses on:

- Home/web render-loop verification
- Supabase favorites verification
- `profiles.taste_moods` verification
- auth refresh verification
- backend ingestion verification for safe `direct_html` sources
- live canonical-content reconciliation for `venues`, `events`, `event_series`, and `daily_specials`

## Preconditions

Before starting:

1. Open PowerShell on the home machine.
2. Change into the repo root:

```powershell
cd "C:\Users\haris.daul\OneDrive - United Nations Development Programme\Documents\Personal\Hype\Hype app"
```

3. Confirm the machine marker exists:

```powershell
Get-Content "C:\Users\haris.daul\.codex-machine.toml"
```

Expected result:

- file exists
- `machine_name = "home"`

If the marker is missing:

- create it from `..\machine-home.example.toml` before continuing

4. Use explicit PowerShell-safe commands during this checklist:

- `npm.cmd`
- `npx.cmd`

5. If backend ingestion verification is part of this run, confirm backend-only env is available:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended source of truth:

- `backend/.env`

Example PowerShell check:

```powershell
cd "C:\Users\haris.daul\OneDrive - United Nations Development Programme\Documents\Personal\Hype\Hype app\backend"
Get-Content ".env"
echo $env:SUPABASE_URL
echo $env:SUPABASE_SERVICE_ROLE_KEY
```

Expected result:

- `.env` exists in `backend/`
- `SUPABASE_URL` is non-empty
- `SUPABASE_SERVICE_ROLE_KEY` is non-empty

## Verification Order

Run the checks in this order:

1. Expo/web runtime verification
2. Favorites verification
3. Taste-profile verification
4. Auth refresh verification
5. Backend ingestion verification
6. Live canonical-content reconciliation
7. Documentation updates

Do not skip earlier failures silently. Record them before continuing.

## 1. Expo/Web Runtime Verification

### Where to run it

- PowerShell on the home machine
- browser on the home machine

### Commands

Use the explicit PowerShell-safe forms:

```powershell
npm.cmd install
npx.cmd expo start --web --port 8081
```

If the repo-approved install workaround changes later, use that documented mode instead and record it in the ledger.

### Route to open

- open the web app in the browser
- navigate to the Home tab or default startup route

### Action

1. let the app finish startup
2. stay on Home long enough to confirm whether it stabilizes
3. watch browser console output

### Expected success state

- app loads without `Maximum update depth exceeded`
- Home renders and stays interactive
- no repeated loop or render-thrashing behavior appears during startup

### If it fails, capture this exact evidence

Capture all of:

1. exact browser error text
2. component stack from the browser console
3. the URL/route open when it failed
4. whether failure happened immediately on startup or after a specific interaction
5. screenshot of the broken state if the UI is visible

### Record it in

- `docs/project_ledger.md`
- `docs/00-overview/handover.md`
- `docs/00-overview/execution_board.md` only if blocker status changed
- `.claude/napkin.md` only if a reusable rule was learned

## 2. Favorites Verification

### Where to run it

- running Expo app on the home machine
- authenticated test account

### Screen to open

- any venue detail route
- Saved tab

### Action

1. sign in
2. open a venue detail screen
3. save the venue
4. switch to the Saved tab and confirm it appears
5. return to the same venue
6. unsave it
7. confirm it disappears from the Saved tab

### Expected success state

- venue save succeeds without app restart
- Saved venues tab reflects the change
- unsave removes the same venue cleanly
- no AsyncStorage-style drift or stale state is visible in the UI

### If it fails, capture this exact evidence

Capture all of:

1. whether the user was signed in
2. venue id or venue name used for the test
3. the exact screen where state failed to update
4. any visible error text or console error
5. whether save worked, Saved failed, unsave failed, or all three failed
6. screenshot of the failing UI state if visible

### Record it in

- `docs/project_ledger.md`
- `docs/00-overview/handover.md`
- `docs/00-overview/execution_board.md` only if E3 status or a blocker changed
- `.claude/napkin.md` only if a reusable rule was learned

## 3. Taste-Profile Verification

### Where to run it

- running Expo app on the home machine
- authenticated test account

### Screen to open

- Profile

### Action

1. sign in
2. open Profile
3. change selected moods
4. leave the screen and return, or reload the app
5. confirm the same selection persists

### Expected success state

- Profile accepts mood changes
- selected moods persist after reload
- state reflects `profiles.taste_moods`, not temporary local fallback behavior

### If it fails, capture this exact evidence

Capture all of:

1. whether the user was signed in
2. which moods were selected before reload
3. what state was shown after reload
4. any visible error text or console error
5. whether failure was write-time, reload-time, or both
6. screenshot of the Profile state before and after reload if possible

### Record it in

- `docs/project_ledger.md`
- `docs/00-overview/handover.md`
- `docs/00-overview/execution_board.md` only if E3 status or a blocker changed
- `.claude/napkin.md` only if a reusable rule was learned

## 4. Auth Refresh Verification

### Where to run it

- running Expo app on the home machine

### Screens to open

- Profile
- Saved

### Action

1. start signed out and open Saved/Profile
2. sign in from the current app flow
3. confirm Saved/Profile update without a full restart
4. sign out
5. confirm Saved/Profile update again without a full restart

### Expected success state

- sign-in updates Saved/Profile immediately
- sign-out updates Saved/Profile immediately
- no app restart or remount workaround is needed to see the right state

### If it fails, capture this exact evidence

Capture all of:

1. whether failure happened on sign-in, sign-out, or both
2. which screen stayed stale
3. whether manual navigation fixed it or only a restart fixed it
4. any visible error text or console error
5. screenshot of stale state if visible

### Record it in

- `docs/project_ledger.md`
- `docs/00-overview/handover.md`
- `docs/00-overview/execution_board.md` only if status/blocker changed
- `.claude/napkin.md` only if a reusable rule was learned

## 5. Backend Ingestion Verification

### Where to run it

- PowerShell on the home machine
- backend working directory

### Backend env requirement

These must be set before running ingestion:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Source selection rules

Use two safe `direct_html` sources:

1. one source using a single listing page
2. one source using `list_url`, `list_urls`, or `category_urls`

Recommended candidates if present in `scrape_sources`:

- Pozorista
- AllEvents
- KupiKartu

### Commands

Change into the backend package:

```powershell
cd "C:\Users\haris.daul\OneDrive - United Nations Development Programme\Documents\Personal\Hype\Hype app\backend"
```

Start the backend using the repo's normal runtime command.

If the current package script surface is not yet documented clearly enough, first inspect `package.json` and then use the backend start command recorded there.

Once the backend is running, call:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/ingestion/sources"
```

Then run one dry run and one non-dry run with a real source id:

```powershell
$body = @{ mode = "manual"; dryRun = $true; notes = "home-machine verification" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/ingestion/run/<source-id>" -ContentType "application/json" -Body $body
```

```powershell
$body = @{ mode = "manual"; dryRun = $false; notes = "home-machine verification" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/ingestion/run/<source-id>" -ContentType "application/json" -Body $body
```

Repeat for the source that uses configured list/category pages.

### Expected success state

For `GET /ingestion/sources`:

- returns `status = "ok"`
- returns live sources

For `POST /ingestion/run/:sourceId`:

- returns `status = "ok"`
- includes `logId`
- includes `fetchedAt`
- includes `fetchedUrl`
- includes `fetchedUrls`
- includes expected `rawRowsSeen`
- includes sensible `rawRowsInserted` / `rawRowsSkipped`

For configured multi-page sources:

- `fetchedUrls` should show the listing/category pages actually used

### If it fails, capture this exact evidence

Capture all of:

1. source id used
2. request body used
3. full response payload
4. backend console error
5. whether failure happened on source listing, dry run, or non-dry run
6. whether the source was single-page or multi-page configured

If available, also capture:

7. relevant `scrape_log` row id
8. whether `raw_events` inserts were partially successful

### Record it in

- `docs/project_ledger.md`
- `docs/00-overview/handover.md`
- `docs/00-overview/execution_board.md` only if ingestion status/blockers changed
- `.claude/napkin.md` only if a reusable rule was learned

## 6. Live Canonical-Content Reconciliation

### Where to run it

- PowerShell or SQL editor on the home machine
- live Supabase project

### Query packs to use

Run these query packs:

- `backend/sql/venue_reconciliation_queries.sql`
- `backend/sql/events_series_reconciliation_queries.sql`
- `backend/sql/daily_specials_reconciliation_queries.sql`

Read these docs while reviewing the outputs:

- `docs/03-architecture/venue_seed_reconciliation.md`
- `docs/03-architecture/events_series_reconciliation.md`
- `docs/03-architecture/daily_specials_reconciliation.md`

### Action

1. run the venue reconciliation queries
2. run the events-and-series reconciliation queries
3. run the daily-specials reconciliation queries
4. compare the outputs against the expectations and unknowns documented in the reconciliation docs
5. classify each area as one of:
   - mostly healthy live content
   - usable but incomplete
   - weak data that needs cleanup before product reliance

### Expected success state

You should leave this pass with concrete answers for:

- whether the 1233-venue seed should backfill, merge with, or mainly validate live `venues`
- whether canonical `events` and `event_series` already contain enough good live content to constrain promotion design
- whether `daily_specials` is mostly a UI-shape mismatch, a sparse-data problem, or both

### If it fails, capture this exact evidence

Capture all of:

1. which query pack was run
2. any SQL error or permission error
3. the key count/completeness outputs that changed the conclusion
4. whether the blocker is:
   - access
   - missing data
   - unexpected schema drift
   - unclear product interpretation

Also record:

5. the provisional conclusion for each area:
   - venues
   - events and event series
   - daily specials

### Record it in

- `docs/project_ledger.md`
- `docs/00-overview/handover.md`
- `docs/00-overview/execution_board.md` only if near-term sequencing or blocker state changed
- `.claude/napkin.md` only if a reusable rule was learned

## 7. Post-Run Documentation Update Rule

After the verification session:

1. update `docs/project_ledger.md` with what was checked and what happened
2. update `docs/00-overview/handover.md` with the next concrete resume point
3. update `docs/00-overview/execution_board.md` only if status, blocker state, or sequencing changed
4. update `.claude/napkin.md` only if the session taught a reusable rule

## Pass/Fail Summary Template

Use this shape in the ledger when closing the verification pass:

```md
- Home/web:
  - pass/fail
  - evidence:
- Favorites:
  - pass/fail
  - evidence:
- Taste profile:
  - pass/fail
  - evidence:
- Auth refresh:
  - pass/fail
  - evidence:
- Ingestion:
  - pass/fail
  - evidence:
- Live canonical-content reconciliation:
  - pass/fail
  - evidence:
- Next step:
```

## Separation Of Responsibilities

Keep these docs separate:

- `home_work_transition_checklist.md`
  - machine setup and workflow split
- `home_machine_verification_checklist.md`
  - runtime and backend verification sequence
- `handover.md`
  - immediate next resume point
- `execution_board.md`
  - active planning and blocker state
