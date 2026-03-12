# Program Map

This is the shortest high-signal view of what remains across Hype.

Use it when the question is:

- what is left
- what order should it happen in
- what depends on the home machine
- what can still move forward from the work machine

Do not use this file as a session log.

For day-to-day status, use:

- `execution_board.md` for active planning
- `project_ledger.md` for chronological history
- `handover.md` for the next concrete resume point

## Mission

Turn Hype from a promising but unstable prototype into a reliable Sarajevo-first discovery app backed by the live Supabase architecture, with a working ingestion pipeline and a clear path toward admin, public web, and personalization.

## Current phase

`Stabilize + align`

Meaning:

- stop runtime instability
- align the frontend to the canonical backend
- migrate important user state out of local-only storage
- make ingestion real enough to test end to end

## Workstreams

### 1. Runtime stability

Goal:

- make the current Expo app reliably usable across the main route set

Current state:

- several route/effect bugs have been fixed
- Home web still needs a real browser verification pass
- install/runtime friction still exists on the home machine

### 2. Frontend/backend alignment

Goal:

- reduce prototype assumptions and match the live Supabase schema

Current state:

- adapters exist
- favorites and taste-profile migrations are implemented in code
- runtime verification is still pending

### 3. Ingestion pipeline

Goal:

- move from architecture-only scraping plans to a working raw-intake loop

Current state:

- source listing works in the backend
- manual run logging works
- direct-html raw intake works
- source-aware extractors exist for Pozorista, AllEvents, and KupiKartu
- home-machine verification is still pending

### 4. Quality and simplification

Goal:

- reduce duplication, encoding damage, and prototype drift

Current state:

- audit exists
- cleanup work is identified but not yet systematically executed

### 5. Future surfaces

Goal:

- prepare for admin, public web, city pulse, and venue tools after the core is trustworthy

Current state:

- architecture direction exists
- implementation should wait until the current stabilization phase exits

## Now

These are the highest-priority remaining items.

1. Verify Home web behavior on the home machine and capture the component stack if the render loop remains.
2. Resolve or document the repo-approved workaround for the React 19 versus `react-leaflet@4.2.1` install conflict.
3. Verify the new Supabase-backed favorites flow in a real authenticated session.
4. Verify the new `profiles.taste_moods` persistence flow in a real authenticated session.
5. Verify Saved/Profile auth refresh behavior after sign-in and sign-out.
6. Verify backend ingestion against at least one safe `direct_html` source.
7. Verify one source that uses `list_url`, `list_urls`, or `category_urls`.
8. Use the initial source inventory to seed and prioritize the first real `scrape_sources`.
9. Apply the repo-native `scrape_sources` SQL seed on the home machine when ready to test ingestion for real.
10. Reconcile the 1233-venue seed against live `venues` before planning any major venue import or refresh.
11. Reconcile live `events`, `event_series`, and `daily_specials` before treating promotion logic or specials cleanup as purely architectural work.

## Next

These should happen after the current verification pass succeeds.

1. Clean up the canonical frontend Supabase client/config surface.
2. Consolidate remaining saved-state naming and persistence drift.
3. Decide whether to migrate saved events next or leave them local until their backend model is clearer.
4. Improve ingestion quality with source-specific enrichment or detail-page fetches.
5. Begin source seeding from the initial source inventory for the first real `scrape_sources` set.
6. Apply the first source seed and validate live source rows against the checklist.
7. Define the first operator-facing review/report workflow on top of the existing ingestion architecture.
8. Start the translation/mojibake cleanup pass.
9. Expand raw-intake enrichment and only then move into detail-page enrichment for the first active sources.
10. Validate the new detail-enrichment pass for AllEvents and KupiKartu on the home machine.
11. Use the new parse-preview stage to review recent raw rows before designing promotion into canonical events.
12. Decide whether the 1233-venue seed should backfill, merge with, or mostly validate the current live `venues` table.
13. Use the new reconciliation query packs to decide whether canonical `events`, `event_series`, and `daily_specials` need cleanup, UI adaptation, or simply better alignment to already-good live data.
14. Turn the new promotion, venue-match, and update-policy docs into the first backend promotion-preview implementation after home-machine reconciliation confirms live data quality.

## Later

These are real program items, but not current-phase blockers.

1. Reduce `.tsx` and `.ios.tsx` duplication in the app.
2. Align planner persistence with `ai_plans`.
3. Surface submissions and venue claims in product flows.
4. Build first admin/moderation surfaces.
5. Define and implement the canonical entity evolution path beyond the current event model if ingestion proves the need.
6. Build city pulse v1 on top of reliable live signals.
7. Expand toward public web and SEO surfaces.
8. Enable venue self-service and claim tooling.

## Home-Machine Only

These require the runtime-capable environment.

1. `npm.cmd` / `npx.cmd` install and Expo verification.
2. Home/web render-loop reproduction and browser-stack capture.
3. Authenticated favorites verification.
4. Authenticated taste-profile verification.
5. Auth refresh verification after sign-in/sign-out.
6. Backend ingestion route execution against real sources with backend admin env configured.
7. Install-conflict decision validation.
8. EAS and Vercel follow-through once runtime stability improves.

## Work-Machine Only Or Best Fit

These are still productive from the protected environment.

1. Planning and architecture synthesis.
2. Docs transport from older root planning files into the app repo.
3. Safe code edits that do not depend on pretending runtime verification happened.
4. Ingestion route and parser implementation that can be validated later on home.
5. Quality cleanup in local files such as mojibake repair or duplication reduction planning.
6. Reconciliation planning and query-pack preparation for live Supabase tables when row-level exports are not present in the repo.

## Blocked Or Waiting

1. Full confidence in the new user-state migrations is blocked on home-machine verification.
2. Full confidence in the Home-screen stabilization is blocked on real browser/runtime verification.
3. Full confidence in ingestion runs is blocked on backend execution with real env and live sources.
4. EAS/Vercel flow should wait until install/runtime friction is better controlled.
5. Public web, admin, and city pulse should wait until the current app and data reliability baseline is stronger.

## Definition Of v0.1 Done

Hype should count as a reliable v0.1 when all of this is true:

1. Main app routes are usable without known render loops or obvious crash patterns.
2. Expo runtime and install flow are documented and repeatable on the home machine.
3. Core frontend reads match the live Supabase schema without widespread guesswork.
4. Venue favorites and taste profile persist against Supabase in real use.
5. Backend ingestion can read sources, log runs, and write raw rows from at least a few real sources.
6. The repo has a stable planning and handover system that future sessions can trust.
7. The codebase has started paying down the biggest prototype-quality issues instead of accumulating more.

## Reading guide

If you want detail behind any item here:

- sequence and rationale: `master_roadmap.md`
- active status and backlog: `execution_board.md`
- exact next resume point: `handover.md`
- chronological implementation history: `project_ledger.md`
