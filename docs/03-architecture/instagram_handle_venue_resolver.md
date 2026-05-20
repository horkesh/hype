# Instagram handle → venue resolver

Status: **Proposed** · Drafted 2026-05-20 · Owner: next ingestion session

## Why this exists

The first Instagram cron run (2026-05-20, 43 tier-1 sources, 97 raw events
detected) surfaced a structural gap: when a post comes from
`instagram:@bambusclubsarajevo`, the parse-instagram edge function fills
`raw_events.venue_name_raw` with whatever Claude Haiku extracts from the
caption ("Bambus Club Sarajevo", "Bambus", "at Bambus", etc.). The promoter
then runs the full structural matcher (`backend/src/services/venueMatch.ts`)
against that AI-extracted string and tries to link it to a `venues` row.

This is the wrong direction. We **already know** the venue: it's the venue
whose `instagram_handle = 'bambusclubsarajevo'`. Going through the matcher
introduces a chain of failure points:

- AI extracts venue name imperfectly ("Bambus Club" vs canonical "Bambuss
  Club" with the double-s typo in the DB)
- Token-overlap fails on single-character differences (`bambus` ≠ `bambuss`)
- Generic tokens like `club` and `sarajevo` aren't distinctive enough
  (fixed in 2026-05-20 — see `venueMatch.ts` `GENERIC_VENUE_TOKENS`)

Concrete impact from the first run: **9 raw events from @bambusclubsarajevo
existed; 2 mis-matched to "Club Mash Sarajevo" before the fix, 7 stayed
unmatched.** Both outcomes are wrong when the IG-handle → venue mapping is
sitting in the database, one column lookup away.

## Current state

```
raw_events.source_name = 'instagram:@bambusclubsarajevo'
raw_events.venue_name_raw = 'Bambus Club Sarajevo'    -- AI extracted from caption
                                                       -- (or null when caption doesn't name the venue)

venues.id = '...'
venues.name = 'Bambuss Club'                           -- canonical, double-s typo
venues.instagram_handle = 'bambusclubsarajevo'         -- set by 2026-05-19 IG curation migration

promoteEvents.ts: matchVenue(venue_name_raw, venues)  -- structural match, ignores source_name
```

The `source_name` field already encodes the answer, but `matchVenue` is
deliberately decoupled from source.

## Proposed solution

Resolve IG-sourced raw events by handle **before** falling through to the
structural matcher. Two-step chain:

1. **Handle resolver (new):** If `source_name` matches `instagram:@<handle>`,
   look up `venues WHERE instagram_handle = '<handle>' AND is_active = true`.
   If exactly one match exists, return it. Strategy: `'instagram_handle'`.
2. **Structural matcher (existing):** If the handle resolver returns no
   match (or returns ambiguous — see below), fall through to the existing
   `matchVenue` chain.

The handle resolver runs *first* because it's both more accurate and
faster than any structural strategy when applicable.

### Why not "instead of" rather than "before"?

Two edge cases where the structural matcher still adds value on IG posts:

- **Event partnership posts** — @bkc_sarajevo posts about a concert
  happening at Zetra. The IG handle points to BKC, but the actual venue
  mentioned in the caption is Zetra. If the AI extracts `venue_name_raw =
  'Zetra'`, the structural matcher correctly links to Zetra. The handle
  resolver would mis-attribute to BKC.

  → Resolution: when `venue_name_raw` is set AND the structural matcher
  returns a different venue, prefer the structural match. The handle is
  the fallback when the caption doesn't name a venue (most common case).

- **Festival accounts posting at multiple venues** — @jazzfestsarajevo
  posts events at SARTR, BKC, Cinemas Sloga across one week. Handle would
  resolve to a single "venue" (if one even exists for the festival), which
  is wrong.

  → Resolution: same. Caption-extracted `venue_name_raw` wins.

So the real precedence becomes:

1. Structural match on `venue_name_raw` (if it succeeds)
2. Handle resolver on `source_name` (fallback when `venue_name_raw` is null
   or unmatched)

## Implementation sketch

**File:** `backend/src/services/venueMatch.ts` (or new sibling
`venueHandleResolver.ts` to keep matchVenue narrow)

**Signature:**

```ts
export function resolveInstagramHandle(
  sourceName: string | null | undefined,
  venues: VenueRow[],
): VenueMatchResult | null;
```

**Logic:**

```ts
const handleMatch = sourceName?.match(/^instagram:@([a-z0-9._]+)$/i);
if (!handleMatch) return null;
const handle = handleMatch[1].toLowerCase();
const candidates = venues.filter(
  (v) => v.instagram_handle?.toLowerCase() === handle,
);
if (candidates.length !== 1) return null;     // 0 = no link, >1 = ambiguous chain
return { venue: candidates[0], strategy: 'instagram_handle' };
```

**Integration point in `promoteEvents.ts`:**

Replace this block (around line 274):

```ts
// Venue matching
const match = matchVenue(raw.venue_name_raw, venues);
```

with:

```ts
// Venue matching: try structural matcher first (caption-extracted name),
// fall back to instagram handle resolver when caption-based match fails.
let match = matchVenue(raw.venue_name_raw, venues);
if (!match) {
  match = resolveInstagramHandle(raw.source_name, venues);
}
```

**Required VenueRow change:** add `instagram_handle?: string | null` to the
`VenueRow` interface. The venue load in `promoteEvents.ts` already
`SELECT *`s so the field is present at runtime; this is just a type fix.

**Stat tracking:** add `venueByHandle` to `stats` and bump the appropriate
counter in the venue-match block.

## Test plan

Add to `backend/tests/venueMatch.test.ts`:

```ts
test('resolveInstagramHandle: maps source_name to the venue with matching handle', ...);
test('resolveInstagramHandle: returns null on multi-venue handles (e.g. chain duplicates)', ...);
test('resolveInstagramHandle: case-insensitive handle match', ...);
test('resolveInstagramHandle: ignores non-instagram source_names', ...);
test('matchVenue + resolveInstagramHandle: structural match wins when caption names a different venue', ...);
```

Test fixtures need at least:

- A `Bambuss Club` venue with `instagram_handle: 'bambusclubsarajevo'`
- A chain (Slatko i Slano with the same handle on multiple rows — should
  resolve to null until the chain handles get scrubbed)

## Expected recovery

Re-running promotion against the existing unmatched IG raw events:

| Source | Currently unmatched | Will recover |
|---|---|---|
| @bambusclubsarajevo | 7 | 7 (all to Bambuss Club) |
| @cltropics | 2 | 2 (Club Tropics) |
| @fiskultura_sarajevo | unknown count | likely all |
| @pivnicahs | unknown | likely all |
| ...44 sources total | ~50 (estimate) | ~40 (estimate) |

Conservative estimate: **~30-50 raw events recovered per cron run** that
would otherwise sit unmatched in `raw_events` forever.

## Open questions / risks

1. **`venue_name_raw = null` is the common IG case** — many captions are
   just "Tonight!" or "Sutra u 22h" with no venue mention. Today's matcher
   returns no match in those cases; the handle resolver would resolve.
   That's the main win.

2. **Chain handles** (`slatkoislano.ba` on 5 venue rows, `finefood.ba` on
   4) — the resolver returns null when >1 venue shares a handle. The chain
   scrub from the 2026-05-19 migration only handled `lounge_` and a few
   single-word generics; the chain handles are intact. Either scrub them
   in the same pass or accept the resolver returning null on chains.

3. **The structural match might lie convincingly** — if Claude Haiku
   hallucinates a venue name that matches a real but wrong venue, the
   structural match wins over the handle resolver. Mitigation: log
   `venue_name_raw` alongside the resolved venue so post-hoc audits can
   spot mismatches. Not blocking.

4. **EVENT_CATEGORIES filter** — `matchVenue` requires event categories
   for ambiguity tiebreaks. The handle resolver doesn't — it trusts the
   handle. That's intentional. If a "bakery" venue has its IG scraped and
   posts an event, we still want to attribute the event to that venue.

## Effort

~1 hour:
- 15 min — new function + types
- 15 min — integration into promoteEvents.ts + stats
- 15 min — 5 tests
- 15 min — manual re-run against existing IG raw_events to recover the
  ~50 unmatched, plus a one-off SQL pass to backfill `venue_id` on
  historically-unmatched IG canonical events

## Sequence

Best to land this *before* the next Sunday cron tick (2026-05-24 02:00 UTC).
That way the next 91-source run benefits from the resolver. After landing:

1. Apply code change + tests pass
2. Manually `tsx promoteEvents.ts` against current raw_events (re-promotes
   the ~50 unmatched IG rows)
3. Backfill SQL: `UPDATE events SET venue_id = ... WHERE source ILIKE
   'instagram%' AND venue_id IS NULL AND ...` (or just rely on
   `backfillEventVenues.ts` which already runs in Phase 3 of the cron)

## Related work

- 2026-05-19: IG handle curation migration (sets `venues.instagram_handle`
  for ~91 curated sources, scrubs polluted handles)
- 2026-05-20: `venueMatch.ts` token-overlap distinctiveness fix
- See also `docs/03-architecture/venue_matching_strategy.md` for the full
  matcher chain
