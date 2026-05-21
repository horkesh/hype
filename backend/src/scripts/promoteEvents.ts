/**
 * promoteEvents.ts
 *
 * Promotes raw_events into the canonical events table:
 *   - Matches venue_name_raw → venues (exact, partial, fuzzy)
 *   - Parses date_raw → start_datetime
 *   - Infers category from title keywords
 *   - Skips events already promoted or lacking a date
 *   - Deduplicates on (source, ticket_url) AND (title, date, venue)
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/promoteEvents.ts
 *
 * The `promoteEvents()` function is also exported so wrappers like
 * scrapeAndPromote.ts can chain it without spawning a subprocess.
 */

import { pathToFileURL } from 'node:url';
import {
  fetchSupabaseAdminJson,
  requestSupabaseAdminNoContent,
  requestSupabaseAdminJson,
} from '../lib/supabaseAdmin.js';
import { canonicalEventKey, fuzzyCrossSourceKeys, dayDelta } from '../services/eventDedupe.js';
import { parseRawDate } from '../services/dateParse.js';
import { matchVenue, resolveInstagramHandle, type VenueRow } from '../services/venueMatch.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawEvent {
  id: string;
  source_name: string | null;
  source_url: string | null;
  title_raw: string | null;
  description_raw: string | null;
  date_raw: string | null;
  image_url: string | null;
  venue_name_raw: string | null;
  venue_match_status: string | null;
  matched_venue_id: string | null;
}

interface Venue {
  id: string;
  name: string;
  category: string | null;
  neighborhood: string | null;
}

interface EventInsert {
  title_bs: string;
  title_en: string;
  description_bs: string | null;
  description_en: null;
  type: 'venue_linked' | 'standalone';
  category: string;
  cover_image_url: string | null;
  ticket_url: string | null;
  source: string | null;
  status: 'approved';
  is_active: boolean;
  is_featured: boolean;
  attendance_count: number;
  start_datetime: string;
  venue_id: string | null;
  location_name: string | null;
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// ---------------------------------------------------------------------------
// Category inference
// ---------------------------------------------------------------------------

const CATEGORY_RULES: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /stand[-\s]?up|komedija|comedy/i, category: 'other' },
  { pattern: /koncert|concert|dj\b|live\s+music/i, category: 'music' },
  { pattern: /balet|ballet/i, category: 'other' },
  { pattern: /opera/i, category: 'other' },
  { pattern: /drama|predstava|teatar|theatre|theater/i, category: 'other' },
  { pattern: /izložba|exhibition|galerija/i, category: 'other' },
];

function inferCategory(title: string | null): string {
  if (!title) return 'other';
  for (const { pattern, category } of CATEGORY_RULES) {
    if (pattern.test(title)) return category;
  }
  return 'other';
}

// ---------------------------------------------------------------------------
// Date parsing
// ---------------------------------------------------------------------------

// Date parsing extracted to backend/src/services/dateParse.ts so it can be
// unit-tested independently. See parseRawDate for supported formats.

// Venue matching extracted to backend/src/services/venueMatch.ts. See matchVenue
// there — strategies are: exact → partial → partial_reverse → fuzzy_* variants.

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchRawEvents(): Promise<RawEvent[]> {
  // Fetch all rows where venue_match_status is not 'promoted' (includes null)
  const params = new URLSearchParams({
    venue_match_status: 'neq.promoted',
    order: 'created_at.asc',
    limit: '5000',
  });
  return fetchSupabaseAdminJson<RawEvent[]>(
    `/rest/v1/raw_events?${params}&select=id,source_name,source_url,title_raw,description_raw,date_raw,image_url,venue_name_raw,venue_match_status,matched_venue_id`,
  );
}

async function fetchVenues(): Promise<Venue[]> {
  return fetchSupabaseAdminJson<Venue[]>(
    '/rest/v1/venues?select=id,name,category,neighborhood,instagram_handle&limit=2000',
  );
}

interface ExistingEventRow {
  source: string | null;
  ticket_url: string | null;
  title_bs: string | null;
  start_datetime: string | null;
  venue_id: string | null;
  location_name: string | null;
}

interface FuzzyEntry {
  startDatetime: string;
  title: string;
}

async function fetchExistingEventKeys(): Promise<{
  sourceUrlKeys: Set<string>;
  canonicalKeys: Set<string>;
  fuzzyEntries: Map<string, FuzzyEntry[]>;
}> {
  const rows = await fetchSupabaseAdminJson<ExistingEventRow[]>(
    '/rest/v1/events?select=source,ticket_url,title_bs,start_datetime,venue_id,location_name&limit=10000',
  );
  const sourceUrlKeys = new Set<string>();
  const canonicalKeys = new Set<string>();
  // Fuzzy index: same first-token + venue, multiple datetimes (so we can check
  // ±N-day proximity at insertion time).
  const fuzzyEntries = new Map<string, FuzzyEntry[]>();
  for (const r of rows) {
    if (r.source && r.ticket_url) {
      sourceUrlKeys.add(`${r.source}::${r.ticket_url}`);
    }
    const canonical = canonicalEventKey({
      title: r.title_bs,
      startDatetime: r.start_datetime,
      venueId: r.venue_id,
      locationName: r.location_name,
    });
    if (canonical) canonicalKeys.add(canonical);
    const fuzzyKeys = fuzzyCrossSourceKeys({
      title: r.title_bs,
      venueId: r.venue_id,
      locationName: r.location_name,
    });
    if (fuzzyKeys.length > 0 && r.start_datetime && r.title_bs) {
      for (const key of fuzzyKeys) {
        const arr = fuzzyEntries.get(key) ?? [];
        arr.push({ startDatetime: r.start_datetime, title: r.title_bs });
        fuzzyEntries.set(key, arr);
      }
    }
  }
  return { sourceUrlKeys, canonicalKeys, fuzzyEntries };
}

// ---------------------------------------------------------------------------
// DB writes
// ---------------------------------------------------------------------------

async function insertEvent(event: EventInsert): Promise<void> {
  await requestSupabaseAdminNoContent('/rest/v1/events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(event),
  });
}

async function markRawEventPromoted(
  id: string,
  matchedVenueId: string | null,
): Promise<void> {
  const body: Record<string, unknown> = { venue_match_status: 'promoted' };
  if (matchedVenueId) body.matched_venue_id = matchedVenueId;

  await requestSupabaseAdminNoContent(
    `/rest/v1/raw_events?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(body),
    },
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function promoteEvents(): Promise<void> {
  log('=== promoteEvents starting ===');

  log('Loading venues...');
  const venues = await fetchVenues();
  log(`  ${venues.length} venues loaded`);

  log('Loading existing event keys for dedup...');
  const { sourceUrlKeys, canonicalKeys, fuzzyEntries } = await fetchExistingEventKeys();
  log(`  ${sourceUrlKeys.size} source+ticket_url keys, ${canonicalKeys.size} canonical keys, ${fuzzyEntries.size} fuzzy clusters`);

  log('Fetching raw_events to promote...');
  const rawEvents = await fetchRawEvents();
  log(`  ${rawEvents.length} raw events to process`);

  const stats = {
    total: rawEvents.length,
    promoted: 0,
    skippedNoDate: 0,
    skippedPastDate: 0,
    skippedDuplicate: 0,
    skippedCrossSourceDuplicate: 0,
    skippedNoTitle: 0,
    venueExact: 0,
    venuePartial: 0,
    venueFuzzy: 0,
    venueByHandle: 0,
    venueNone: 0,
    errors: 0,
  };

  for (const raw of rawEvents) {
    try {
      // Must have a title
      if (!raw.title_raw?.trim()) {
        log(`  SKIP [no title] id=${raw.id}`);
        stats.skippedNoTitle++;
        continue;
      }

      // Must have a parseable date
      const startDatetime = parseRawDate(raw.date_raw);
      if (!startDatetime) {
        log(`  SKIP [no date] "${raw.title_raw}" (date_raw="${raw.date_raw}")`);
        stats.skippedNoDate++;
        continue;
      }

      // Must not be in the past. Allow a 24h grace window so events that
      // started earlier today still surface (and so timezone drift doesn't
      // silently drop today's evening events when the cron runs in UTC).
      // Mark the raw row promoted so we don't keep re-evaluating it on
      // every cron tick.
      const gracePast = Date.now() - 24 * 60 * 60 * 1000;
      if (new Date(startDatetime).getTime() < gracePast) {
        log(`  SKIP [past date] "${raw.title_raw}" (start=${startDatetime})`);
        stats.skippedPastDate++;
        await markRawEventPromoted(raw.id, null);
        continue;
      }

      // Same-source dedup: source_name + ticket_url
      const ticketUrl = raw.source_url ?? null;
      const sourceUrlKey = `${raw.source_name ?? ''}::${ticketUrl ?? ''}`;
      if (ticketUrl && sourceUrlKeys.has(sourceUrlKey)) {
        log(`  SKIP [duplicate] "${raw.title_raw}"`);
        stats.skippedDuplicate++;
        await markRawEventPromoted(raw.id, null);
        continue;
      }

      // Venue matching: structural match on caption-extracted venue_name_raw
      // first (lets a festival account's post correctly attribute to the
      // *named* venue rather than the festival account's home venue). Falls
      // back to instagram-handle lookup when there's no structural match,
      // which recovers IG posts that don't name a venue in the caption.
      let match = matchVenue(raw.venue_name_raw, venues);
      if (!match) {
        match = resolveInstagramHandle(raw.source_name, venues);
      }
      let venueId: string | null = null;
      let locationName: string | null = null;

      if (match) {
        venueId = match.venue.id;
        locationName = match.venue.name;
        if (match.strategy === 'exact') stats.venueExact++;
        else if (match.strategy === 'partial' || match.strategy === 'partial_reverse') stats.venuePartial++;
        else if (match.strategy === 'instagram_handle') stats.venueByHandle++;
        else stats.venueFuzzy++;
        log(
          `  VENUE [${match.strategy}] "${raw.venue_name_raw ?? raw.source_name}" → "${match.venue.name}" (${venueId})`,
        );
      } else {
        locationName = raw.venue_name_raw ?? null;
        if (raw.venue_name_raw) {
          log(`  VENUE [none] "${raw.venue_name_raw}" — no match`);
        }
        stats.venueNone++;
      }

      const title = raw.title_raw.trim();

      // Cross-source dedup: same canonical key (title+date+venue) already promoted
      // from a different ticket site. Mark this raw row promoted so we don't keep
      // retrying it on every run.
      const canonical = canonicalEventKey({
        title,
        startDatetime,
        venueId,
        locationName,
      });
      if (canonical && canonicalKeys.has(canonical)) {
        log(`  SKIP [cross-source duplicate] "${title}" (${canonical})`);
        stats.skippedCrossSourceDuplicate++;
        await markRawEventPromoted(raw.id, venueId);
        continue;
      }

      // Near-duplicate dedup: shared distinctive title token + same venue,
      // existing event within ±2 days. Catches sources disagreeing on the
      // date (PROLONGIRANO reschedules, timezone bugs) AND on title framing
      // ("PREMIJERA PREDSTAVE X" vs "X - RASPRODANO" both produce a key
      // containing "x" so they collide).
      const fuzzyKeys = fuzzyCrossSourceKeys({ title, venueId, locationName });
      let fuzzyDup: { title: string; startDatetime: string; key: string } | null = null;
      for (const key of fuzzyKeys) {
        const existing = fuzzyEntries.get(key) ?? [];
        const near = existing.find((e) => dayDelta(e.startDatetime, startDatetime) <= 2);
        if (near) {
          fuzzyDup = { title: near.title, startDatetime: near.startDatetime, key };
          break;
        }
      }
      if (fuzzyDup) {
        log(`  SKIP [near-day duplicate] "${title}" ≈ "${fuzzyDup.title}" (${dayDelta(fuzzyDup.startDatetime, startDatetime)}d apart) via "${fuzzyDup.key}"`);
        stats.skippedCrossSourceDuplicate++;
        await markRawEventPromoted(raw.id, venueId);
        continue;
      }

      const eventInsert: EventInsert = {
        title_bs: title,
        title_en: title,
        description_bs: raw.description_raw ?? null,
        description_en: null,
        type: venueId ? 'venue_linked' : 'standalone',
        category: inferCategory(title),
        cover_image_url: raw.image_url ?? null,
        ticket_url: ticketUrl,
        source: raw.source_name ?? null,
        status: 'approved',
        is_active: true,
        is_featured: false,
        attendance_count: 0,
        start_datetime: startDatetime,
        venue_id: venueId,
        location_name: locationName,
      };

      await insertEvent(eventInsert);

      // Track all three indexes so subsequent iterations in this run also
      // dedupe against what we just inserted.
      if (ticketUrl) {
        sourceUrlKeys.add(sourceUrlKey);
      }
      if (canonical) {
        canonicalKeys.add(canonical);
      }
      for (const key of fuzzyKeys) {
        const arr = fuzzyEntries.get(key) ?? [];
        arr.push({ startDatetime, title });
        fuzzyEntries.set(key, arr);
      }

      await markRawEventPromoted(raw.id, venueId);

      log(`  PROMOTED "${title}" [${eventInsert.category}] start=${startDatetime}`);
      stats.promoted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`  ERROR id=${raw.id}: ${msg}`);
      stats.errors++;
    }
  }

  log('');
  log('=== Promotion complete ===');
  log(`  Total raw events processed : ${stats.total}`);
  log(`  Promoted                   : ${stats.promoted}`);
  log(`  Skipped — no date          : ${stats.skippedNoDate}`);
  log(`  Skipped — past date        : ${stats.skippedPastDate}`);
  log(`  Skipped — same-source dup  : ${stats.skippedDuplicate}`);
  log(`  Skipped — cross-source dup : ${stats.skippedCrossSourceDuplicate}`);
  log(`  Skipped — no title         : ${stats.skippedNoTitle}`);
  log(`  Errors                     : ${stats.errors}`);
  log('');
  log('  Venue match breakdown:');
  log(`    Exact                    : ${stats.venueExact}`);
  log(`    Partial                  : ${stats.venuePartial}`);
  log(`    Fuzzy                    : ${stats.venueFuzzy}`);
  log(`    By IG handle             : ${stats.venueByHandle}`);
  log(`    No match                 : ${stats.venueNone}`);
}

// Auto-run only when invoked directly via the CLI. When imported (e.g. by
// scrapeAndPromote.ts) callers are responsible for invoking promoteEvents().
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  promoteEvents().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
