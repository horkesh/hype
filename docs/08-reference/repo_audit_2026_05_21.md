# Repo-wide audit — 2026-05-21

Cross-cutting bug + edge-case sweep across mobile (Expo), admin (Vite/React), Supabase DB + RLS + RPCs, and Deno edge functions. Excludes findings already shipped earlier this session (TZ pipeline, IG ingest hardening, dedupe merge, category inference, past-event cleanup, parse-instagram throwback rejection).

Severity scale:
- **P0** — exploitable today
- **P1** — defense-in-depth / privacy
- **P2** — user-visible bugs in admin app
- **P3** — user-visible bugs in mobile app
- **P4** — reliability gaps in edge functions
- **P5** — tech debt

---

## P0 — Exploitable today

### 1. Open `venues` UPDATE policy
RLS policy `"Authenticated users can update venue descriptions"` on `public.venues` has `qual=true, with_check=true` for `{authenticated}`. Any signed-in user can `UPDATE venues SET name=..., is_active=false, claimed_by=auth.uid() WHERE id=<any>`. The owner-update and admin-full-access policies become decorative because UPDATE policies are OR-combined.

**Fix:** DROP the policy. Route description-only edits through a SECURITY DEFINER RPC that restricts which columns may change.

---

## P1 — Security hardening

### 2. 25 SECURITY DEFINER functions missing `SET search_path`
None of the 25 plpgsql functions in `public` set `search_path`. A user with CREATE on any schema before `public` in the resolver path can shadow `profiles`/`events`/`venues` and escalate during any SD function call.

**Fix:** `ALTER FUNCTION ... SET search_path = public, pg_temp` on all 25.

### 3. 19 admin RPCs granted EXECUTE to `anon`
`approve_event_submission`, `approve_venue_submission`, `approve_venue_claim`, `reject_venue_submission`, `revert_audit_change`, `list_audit_log`, `list_editor_activity`, `list_notes`, `list_user_statistics`, `user_activity_timeline`, `get_admin_user_list`, `log_admin_changes`, `handle_new_user`, `is_admin_or_above`, `is_admin_or_curator`, `is_venue_owner`. Internal role check protects them today but defense-in-depth says `REVOKE EXECUTE ... FROM anon` on each.

### 4. `is_admin_or_curator` doesn't include the `curator` role
Definition lists `editor, admin, super_admin`. The `curator` enum value is currently unused in data. Either rename to `is_admin_or_editor` or add `'curator'` to the IN-list. Pure correctness.

### 5. `profiles` public-read exposes `role`, `is_banned`, `total_checkins`, `total_submissions`
`qual=true` for `{public}` role. Anyone (including unauthenticated) can scrape who's an admin / who's banned.

**Fix:** Restrict the public-read policy to `display_name, avatar_url, created_at`. For the broader column set, require an authenticated session or via a SECURITY DEFINER RPC.

### 6. Public storage buckets allow LIST API
`hero-images` and `venue-photos` have broad SELECT policies on `storage.objects`. Public URL fetch works without LIST permission for `public=true` buckets — remove the SELECT policies, keep `public=true`.

### 7. HIBP password-leak protection disabled
Supabase Auth setting toggle. Enable.

---

## P2 — Admin app bugs

### 8. Optimistic UI updates persist on RLS denial
`admin/src/pages/VenueCuration.tsx:384-398` and `UserManagement.tsx:62-90` update local state *before* checking the Supabase response error. RLS-denied saves show as success briefly then snap back inconsistently.

**Fix:** Check `error` first, then mutate state.

### 9. `formatDate` crashes on invalid ISO
`admin/src/pages/EventManagement.tsx:52-64` calls `.getHours()` without guarding `Number.isNaN(d.getTime())`. A garbage `start_datetime` breaks the entire events list view.

### 10. CommandPalette loads 2000+500 rows in one Promise.all
`admin/src/components/CommandPalette.tsx:30-56` has no pagination or error state. Slow connection on first open shows "Loading…" forever.

### 11. Search re-fetches per keystroke
`admin/src/pages/VenueCuration.tsx:210`. Typing "sarajevo" fires 8 queries. Need 250ms debounce.

---

## P3 — Mobile app bugs

### 12. TZ assumption in "tonight/today" badge
`utils/tonightHelpers.ts:82-87` and `utils/homeScreenContent.ts:120-126` use `today.toDateString()` (browser-local) against ISO strings. For a Sarajevo user this works; for travelers it doesn't. Anchor on Europe/Sarajevo.

### 13. `useTonightController` has no AbortController / mount guard
Unmounting mid-fetch triggers setState-after-unmount. `useProfileController` uses `mountedRef`; apply the same pattern here.

### 14. Module-level venue cache in `utils/ai/planGenerator.ts:29-32` never expires
1200 venues × cached structures live for the app's lifetime. Admin edits never reach this cache until force-quit. Add 5-10min TTL.

### 15. Local caches persist across sign-out
Favorites + taste moods stay after sign-out. Sign in as B → B sees A's favorites until they touch anything. Clear local caches on sign-out.

---

## P4 — Edge function reliability

### 16. `weather-proxy` has no fetch timeout
OpenWeather upstream hang blocks the edge function indefinitely. Add 10s AbortController.

### 17. `enrich-descriptions` accepts arbitrary `ai_model` string
Request-body field passed directly to `callClaude()`. Allowlist `claude-sonnet-4-5-20250929 | claude-haiku-4-5-20251001` or similar.

### 18. `translate-scene` accepts arbitrary `mime_type`
Passed to Gemini `inline_data`. Allowlist `image/jpeg | image/png | image/webp`.

### 19. Raw `err.message` returned to clients
ask-sarajevo, smart-search, surprise-me, several others. Log internally, return generic message externally.

### 20. `enrich-descriptions` mixes Google review text into AI system prompt
Untrusted text flows directly into instructions. A crafted review could break JSON output or hijack the model. Wrap user-controlled content in clear `<review>...</review>` delimiters and instruct the model to treat the contents as data.

---

## P5 — Tech debt

### 21. `backend/tsconfig.json` has `strict: false`
Plus `noUnusedLocals/Parameters/ImplicitReturns/FallthroughCasesInSwitch: false`. The most critical pipeline has the weakest type-check while mobile + admin are both `strict: true`.

### 22. `venues.category` is plain `text` while `events.category` is `event_category` enum
No DB-level constraint on venue categories. Either promote to `venue_category` enum or add a CHECK constraint with the known values.

### 23. 33 FKs missing covering indexes
Low impact while tables are tiny. Worth adding now: `audit_log.reverted_by`, `events.review_requested_by`, `events.submitted_by`. Re-evaluate the rest after launch with query stats.
