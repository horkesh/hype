/**
 * backfillEventVenues.ts
 *
 * One-off backfill: re-runs matchVenue against every event where venue_id is
 * NULL but location_name has a usable signal. Updates events.venue_id and
 * flips type='venue_linked' on hits. Logs strategy counts.
 *
 * Useful after the matcher gains new strategies (reverse-substring,
 * first-comma-chunk, token-overlap) or after seeding new canonical venues —
 * events promoted under the old matcher won't auto-re-link otherwise.
 *
 * Usage: node --env-file=backend/.env --import tsx backend/src/scripts/backfillEventVenues.ts
 */

import { fetchSupabaseAdminJson, requestSupabaseAdminNoContent } from '../lib/supabaseAdmin.js';
import { matchVenue, type VenueRow } from '../services/venueMatch.js';

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

interface EventRow {
  id: string;
  title_bs: string | null;
  location_name: string | null;
  venue_id: string | null;
}

async function fetchUnmatchedEvents(): Promise<EventRow[]> {
  return fetchSupabaseAdminJson<EventRow[]>(
    '/rest/v1/events?select=id,title_bs,location_name,venue_id&venue_id=is.null&location_name=not.is.null&limit=2000',
  );
}

async function fetchVenues(): Promise<VenueRow[]> {
  return fetchSupabaseAdminJson<VenueRow[]>(
    '/rest/v1/venues?select=id,name,category,neighborhood&limit=2000',
  );
}

async function updateEventVenue(eventId: string, venueId: string): Promise<void> {
  await requestSupabaseAdminNoContent(`/rest/v1/events?id=eq.${eventId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ venue_id: venueId, type: 'venue_linked' }),
  });
}

async function main() {
  log('=== backfillEventVenues starting ===');

  const venues = await fetchVenues();
  log(`Loaded ${venues.length} venues`);

  const events = await fetchUnmatchedEvents();
  log(`Found ${events.length} events with venue_id=null and a location_name`);

  const stats: Record<string, number> = {
    exact: 0,
    partial: 0,
    partial_reverse: 0,
    fuzzy_exact: 0,
    fuzzy_partial: 0,
    fuzzy_partial_reverse: 0,
    token_overlap: 0,
    no_match: 0,
  };

  for (const e of events) {
    const match = matchVenue(e.location_name, venues);
    if (!match) {
      stats.no_match++;
      continue;
    }
    await updateEventVenue(e.id, match.venue.id);
    stats[match.strategy] = (stats[match.strategy] ?? 0) + 1;
    log(`  [${match.strategy}] "${e.title_bs}" — "${e.location_name}" → "${match.venue.name}"`);
  }

  log('');
  log('=== backfillEventVenues complete ===');
  for (const [k, v] of Object.entries(stats)) {
    log(`  ${k.padEnd(22)}: ${v}`);
  }
  const linked = events.length - stats.no_match;
  log(`  ${'TOTAL LINKED'.padEnd(22)}: ${linked} / ${events.length}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
