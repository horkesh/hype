# Festivals & Major Events — Design Spec

Status: **IMPLEMENTED (P0–P2, §6–§7)** · Created 2026-06-04 · Owner: Look team

> Build state (2026-06-04): P0 schema, P1 Street Food Market + Home surfaces (Spotlight/Major rail with cover photos + World Cup strip), P2 admin (Festivals hub + Program builder + Where-to-watch + Scrape sources, live at look-admin.vercel.app), §6 World Cup series + match attach, and §7 the two festival IG sources are all DONE. **P3 (SFF program fill)** is scaffolded (SFF + Žurke/Projekcije tracks exist, empty until the August scrape+curate). Note: matches are modeled as `events` tagged `bih-match` (NOT the `world_cup_matches` table in §2.4 — that table was never created); the where-to-watch toggle + match list live in the admin "Svjetsko prvenstvo" page.

## 1. Goal & scope

Make **major upcoming events and festivals prominent and dynamic on the Home screen** (today they sit in one rail at the very bottom, undifferentiated). Flagship outcome: Look becomes the place that **aggregates the entire program of a festival** — nobody in Sarajevo currently aggregates all events happening during SFF.

In scope (the four launch surfaces):

| # | Surface | Type | Priority (per owner) |
|---|---------|------|----------------------|
| 1 | **Sarajevo Street Food Market** | multi-day / recurring market | **Immediate build target** |
| 2 | **Sarajevo Film Festival (SFF)** with a dedicated **Parties** program | flagship festival aggregation (Aug 14–21) | Big bet |
| 3 | **World Cup "Where to watch"** + Bosnia match schedule (toggleable) | curated watch-party venues + fixtures | Time-sensitive (BiH first match Jun 12) |
| 4 | **Summertime Madness** (Aug 13–22) | independent concert series, cross-linked from SFF | With SFF |

> Decisions locked: (1) spec the full design first; Food Market built first. (2) World Cup = "where to watch", with a **backend toggle** per venue. (3) SFF Parties = a **dedicated program** (not just a mood tag). (4) Build the **full admin screen**.

Schema facts this spec is grounded in (live DB, 2026-06-04): `events` (153 rows) has `series_id`, `tags text[]`, `is_recurring`, `event_category` enum (`…|sport|nightlife|art|film|theatre|festival|market|…`). `event_series` exists but **0 rows** and lacks any festival-prominence/ordering/parent field. `venues` (1370 rows) has `tags text[]`, `is_featured`, `is_curated`.

---

## 2. Data model

Principle: **reuse `event_series` → `events.series_id`**; add a few columns; no new core tables except one small `world_cup_matches` helper.

### 2.1 `event_series` — festivals & programs

A festival is one `event_series` row. Sub-programs ("tracks" like **Parties**, **Screenings**, **CineLink/Industry**, **Concerts**) are **child series** via a self-FK. This gives SFF a real program with a flagship Parties track, while keeping the model uniform.

```sql
ALTER TABLE event_series
  ADD COLUMN IF NOT EXISTS parent_series_id   uuid REFERENCES event_series(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_major           boolean NOT NULL DEFAULT false,   -- show in Home "Major events" surface
  ADD COLUMN IF NOT EXISTS home_priority      integer,                           -- manual sort for the Home surface (lower = higher)
  ADD COLUMN IF NOT EXISTS series_kind        text NOT NULL DEFAULT 'festival',  -- 'festival' | 'program' | 'collection'
  ADD COLUMN IF NOT EXISTS track_label_bs     text,                              -- e.g. "Žurke" for the Parties child
  ADD COLUMN IF NOT EXISTS track_label_en     text,                              -- e.g. "Parties"
  ADD COLUMN IF NOT EXISTS venue_area_bs      text,                              -- e.g. "Vilsonovo šetalište"
  ADD COLUMN IF NOT EXISTS venue_area_en      text;
```

- `is_major` is **distinct** from the existing `is_featured` (which already drives smaller "featured" placements). `is_major` = "promote on the Home major-events surface."
- `series_kind`: `festival` (top-level, e.g. SFF, Street Food Market, World Cup), `program` (a child track, e.g. SFF Parties), `collection` (loose themed grouping, e.g. World Cup).

### 2.2 `events` — membership in a festival/program

- **Explicit link:** `events.series_id` points to a festival **or** a program (child series). An event in SFF's Parties track has `series_id = <SFF Parties child id>`.
- A festival's **full program** = events whose `series_id ∈ { festival.id } ∪ { children(festival) }`. A **track** = events whose `series_id = <that child>`.
- This is how we aggregate "all SFF events": curators (or scrapers) attach any event — including ones scraped from Summertime Madness or individual venues — to the right SFF track by setting `series_id`. Aggregation is **curated**, which is the moat.
- Keep `tags text[]` for cross-cutting labels (`'sff'`, `'open-air'`, `'free'`) used for filtering/badges without changing series membership.

No new columns required on `events` for v1.

### 2.3 `venues` — World Cup "Where to watch" toggle

```sql
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS is_watch_party_venue boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS watch_party_note_bs  text,
  ADD COLUMN IF NOT EXISTS watch_party_note_en  text;
```

- `is_watch_party_venue` is the **backend toggle** the owner asked for: flip it per venue in admin. The World Cup section lists these venues as "Where to watch." Generic on purpose (reusable for Euro, NBA finals, etc.).

### 2.3a Festivals with a physical home are ALSO a venue

A pop-up festival that lives at one place for weeks (Street Food Market at Vilsonovo šetalište, ~Jun 10–Jul 19) is modeled as **both** a `venues` row **and** an `event_series` — no new schema, because `events` already carry both `venue_id` and `series_id`:
- **Venue** = the browsable *place*: appears in Explore + on the map, is saveable, has directions, and its venue page lists all its events. Category `market`. A seasonal pop-up is controlled by the existing `is_active` (flip off after the run); the season is described in `description_*` / `opening_hours`.
- **Series** = the curated *program/timeline* + Home prominence (§2.1).
- **Each daily event** → `type='venue_linked'`, `venue_id` = the Market venue, `series_id` = the Market festival. One tap resolves to the same venue **and** program.
- If that venue is also a watch zone, set `is_watch_party_venue=true` (the Market = the WC fan zone, so it's the flagship "Where to watch").

This pattern applies to any **standing-location** festival/market. Festivals spread across **many** venues (e.g. SFF — cinemas, squares, clubs) stay series-only, with each child event carrying its own `venue_id`.

### 2.4 `world_cup_matches` — lightweight fixture schedule

Matches are reference data (kickoff times, opponents), not user events. A tiny table keeps the schedule + countdowns clean and avoids polluting `events`.

```sql
CREATE TABLE IF NOT EXISTS world_cup_matches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id     uuid REFERENCES event_series(id) ON DELETE CASCADE,  -- the WC 2026 series
  opponent_bs   text NOT NULL,
  opponent_en   text NOT NULL,
  kickoff       timestamptz NOT NULL,    -- Sarajevo local
  stage_bs      text,                    -- "Grupa B" etc.
  stage_en      text,
  is_bosnia     boolean NOT NULL DEFAULT true,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

> Alternative considered: model each match as an `events` row. Rejected for v1 — matches aren't venue events, we don't want one row per (match × venue), and the schedule is a known fixed list. Watch parties are expressed as **flagged venues**, not per-match event rows.

### 2.5 RLS / access

All four read-paths are public (anon) — consistent with the rest of Home. New columns inherit existing table RLS; `world_cup_matches` gets a public `select` policy + admin-only writes (mirror the `events` policy).

---

## 3. Home: the "Major Events" surface (kill the static feel)

Today `HomeContentSections.tsx` renders a fixed editorial sequence and only shows series in a bottom rail. We insert a **prominent, time-windowed, data-driven** surface high in the flow and add urgency cues. Reuse existing primitives (`HomeCardRail`, `FlippableCard`, `GlassBadge`, `useEventCountdown`, `useResponsiveColumns`).

### 3.1 Placement (in the default editorial branch)
```
Hero (greeting + City Pulse + Surprise me)
Category grid
Mood chips
► [NEW] Spotlight        — the single biggest "happening now / next" festival, full-bleed, countdown
► [NEW] Major Events rail — is_major series in window, ordered by home_priority
  Featured Venues
  Featured Event
  Trending
► [NEW] World Cup strip  — only while a WC series is active; Bosnia next-match countdown + "Where to watch"
  Heritage / Hidden Gems
  Upcoming Events + Series (existing bottom rail stays)
```

### 3.2 Selection logic (data-driven, not editorial)
A single query powers the spotlight + rail:
```
event_series
  where is_active = true
    and is_major = true
    and end_date >= today                      -- not over
    and start_date <= today + interval '21 days' -- now or soon
  order by (start_date <= today) desc,          -- active first
           home_priority asc nulls last,
           start_date asc
  limit 6
```
- **Spotlight** = item #1 (or auto-rotate top 2–3 every ~8s, respecting `useReducedMotion`).
- **Countdown / state badge** per card: "Traje sad 🔴 / Happening now", "Počinje za 3 dana / In 3 days", "Ovaj vikend / This weekend". Derived from `start_date`/`end_date`.
- Empty/!major → surface hides entirely (graceful, no editorial gap).

### 3.3 New components
- `HomeSpotlight.tsx` — full-bleed featured festival (image + gradient + name + countdown + CTA → program page).
- `HomeMajorEventsRail.tsx` — horizontal rail of festival cards (reuses `HomeCardRail`); each card → program page.
- `HomeWorldCupStrip.tsx` — Bosnia next-match countdown + "Where to watch (N)" link; hidden unless a WC series is active.
- `utils/homeMajorEvents.ts` — the query + windowing/sort + countdown-state helpers (pure parts in `…Utils.ts` for Node tests, per napkin rule).

---

## 4. Festival program pages (the flagship)

A festival program page is the differentiator. Route: extend the existing `app/series/[id].tsx`.

### 4.1 Layout
- **Header:** cover/logo, name, dates, venue area, website/tickets, live countdown, "N events" count.
- **Track tabs / sections:** one per child series (program). For SFF: **Parties**, **Screenings**, **Open-air**, **CineLink/Industry**, **Concerts**. "All" tab shows the merged chronological program (group by day).
- **Day grouping:** within a track, group events by Sarajevo-local date; sticky day headers.
- **Event rows:** time, title, venue, price/free, ticket link → event detail.
- **Cross-links:** SFF page features a "Parties" track prominently; Summertime Madness (independent series, same window) is surfaced as a related collection.

### 4.2 How events get into a program (three paths)
1. **Scraped + curated:** IG scrape → `raw_events` → promote → curator assigns `series_id` (festival or track) in admin.
2. **Manually created:** admin creates an event directly under a track.
3. **Windowed suggestions (admin assist):** admin sees "events in SFF's window not yet in the program" and one-click-attaches them. (This is what makes "aggregate *everything*" feasible without manual hunting.)

### 4.3 SFF parties specifically
- Create SFF (`series_kind='festival'`) + child `SFF Parties` (`series_kind='program'`, `parent_series_id=SFF`, track labels "Žurke"/"Parties").
- Party events (from `@summertimemadness.sa` scrape, venue posts, manual) get `series_id = <SFF Parties>`.
- The Parties track is also linkable as its own shareable page.

---

## 5. Street Food Market — immediate build target

Concrete v1 so this can be built first:
- One `event_series`: `series_kind='festival'`, `category='market'`, `is_major=true`, `name_*='Sarajevo Street Food Market'`, `venue_area_*='Vilsonovo šetalište'`, `start_date/end_date` = the 2026 edition (TBA — see §8; until then `is_active=false` or a "Coming soon" state).
- Child events: one per market day (or themed night) via `series_id`, or a single multi-day event with `is_recurring` if days are uniform.
- Home: appears in Spotlight/Major rail once `is_active && is_major && in window`.
- Program page: day list + (when available) vendor/live-music highlights pulled from scraped posts (`@streetfoodmarket.sa`).
- Ingestion: add `@streetfoodmarket.sa` as a Tier-1 scrape source (§7).

---

## 6. World Cup — "Where to watch" + fixtures

- One `event_series`: `series_kind='collection'`, `category='sport'`, `is_major` toggle, dates spanning BiH's run (group stage Jun 12–24; extend if they advance).
- `world_cup_matches`: seed BiH's 3 group games (Canada Jun 12, Switzerland Jun 18, Qatar Jun 24 — confirm before publish).
- **Where to watch** = `venues where is_watch_party_venue = true` (admin toggle). Section shows next match + countdown + the venue list.
- Entire section gated by the series' `is_active` (master on/off) — owner can flip the whole "World Cup mania" on/off, and toggle individual venues.

---

## 7. Ingestion plan

- **Add scrape sources** (Tier-1, `scrape_config` jsonb mirrors existing rows): `@streetfoodmarket.sa`, `@summertimemadness.sa`. `@sarajevofilmfestival` is already seeded.
- Pipeline unchanged: `scrapeInstagram.ts` → `parse-instagram` → `raw_events` → `promoteEvents.ts` → `events`.
- **Curation is the human step:** promoted events get `series_id` assigned (to festival/track) via admin. World Cup matches + watch-party venue flags are manual.
- Optional later: a `createSeriesFromEvents` heuristic for recurring patterns (out of scope for v1).

---

## 8. Admin screen (full — budgeted per decision #4)

New admin section **"Festivals & Major Events"** (in `apps/admin`):
1. **Festivals list** — create/edit `event_series`; toggle `is_major`, `is_active`, `is_featured`; set `home_priority`, dates, cover/logo, website/tickets, venue area.
2. **Program builder** — within a festival: create/reorder **tracks** (child series); see the **merged program**; **attach/detach events** to tracks; the **"in-window, unassigned" suggestions** queue (one-click attach) that powers full aggregation.
3. **Event quick-add** — create an event directly into a track (for non-scraped items).
4. **World Cup** — edit `world_cup_matches` (opponent, kickoff, stage); master on/off via the WC series.
5. **Where-to-watch venues** — searchable venue list with the `is_watch_party_venue` toggle + note.
6. **Scrape sources** — add/disable IG sources + see `last_scraped_at` (so curators add festival accounts without SQL).

Auth: gated to `admin`/`editor`/`super_admin` roles (the `profiles.role` enum already has these).

---

## 9. Phasing

| Phase | Deliverable | Notes |
|-------|-------------|-------|
| **P0 — schema** | Migrations §2 + RLS | Foundation for everything |
| **P1 — Street Food Market (immediate)** | Series + program page + Home Spotlight/Major rail + the `@streetfoodmarket.sa` source | First visible win; exercises the whole vertical end-to-end |
| **P2 — Admin** | Festivals list + program builder + scrape-source mgmt | Unblocks curators; needed before SFF scale |
| **P3 — SFF program** | SFF + tracks + Parties + Summertime Madness ingest/cross-link | The flagship; lands before mid-Aug |
| **P4 — World Cup** | WC series + matches + where-to-watch toggle + Home strip | **Time-sensitive (Jun 12)** — can be pulled earlier/parallel if the owner reprioritizes; small surface, mostly curation |

> Tension to flag: the owner set **Food Market as immediate**, but **World Cup has a hard Jun-12 deadline**. P4 is small (no scraping; a series + ~3 matches + venue toggles + one Home strip) and can run in parallel with P1 if desired.

---

## 10. Open questions / risks

1. **Street Food Market 2026 dates** are not yet announced (historically mid-Jun→Jul at Vilsonovo šetalište). Build with a "Coming soon" state and flip `is_active` when dates drop.
2. **SFF program data volume** (100s of screenings) — relying on scrape + curation; need the "in-window suggestions" admin tool to make full aggregation realistic. Consider whether SFF publishes a machine-readable schedule we can import.
3. **World Cup fixtures** — confirm BiH's exact kickoff times (Sarajevo local) before publishing; advancement past the group stage extends the window.
4. **Home performance** — the major-events query runs alongside existing Home loads; load it in the same `loadHomeStaticContent` pass (one round-trip), refresh on pull-to-refresh.
5. **Featuring conflicts** — `is_featured` (existing) vs `is_major` (new): keep them independent; document that `is_major` is strictly the Home major-events surface.
