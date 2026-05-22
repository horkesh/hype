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
import {
  canonicalEventKey,
  fuzzyCrossSourceKeys,
  fuzzyEventsMatch,
  dayDelta,
} from '../services/eventDedupe.js';
import { parseRawDate } from '../services/dateParse.js';
import { matchVenue, resolveInstagramHandle } from '../services/venueMatch.js';

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
  slug: string;
}

// Build the SEO slug for an event row before insert. Mirrors the SQL backfill
// (diacritic fold → strip non-alnum → append YYYY-MM-DD). UUID suffix added
// when the title is empty so we never write an unusable slug.
function buildEventSlug(title: string, startDatetime: string, uuidHint?: string): string {
  const DIACRITICS_MAP: Record<string, string> = {
    'č': 'c', 'ć': 'c', 'š': 's', 'ž': 'z', 'đ': 'd',
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ý': 'y',
    'ü': 'u', 'ö': 'o', 'ä': 'a', 'ë': 'e', 'ï': 'i',
    'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
    'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u', 'ÿ': 'y',
  };
  const folded = title.toLowerCase().split('').map((c) => DIACRITICS_MAP[c] ?? c).join('');
  const cleaned = folded.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  // Sarajevo-anchored YYYY-MM-DD so the slug matches what the user expects.
  const sarajevoDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sarajevo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(startDatetime));
  const base = cleaned || (uuidHint ? uuidHint.slice(0, 8) : 'event');
  return `${base}-${sarajevoDate}`;
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// ---------------------------------------------------------------------------
// Category inference
//
// Maps free-text titles + descriptions to one of the event_category enum
// values: music, food, culture, sport, nightlife, art, film, theatre,
// festival, market, workshop, charity, other.
//
// Order matters — narrower rules first (festival before film before drama),
// stronger signals over weaker ones (koncert > matine). Patterns match both
// Bosnian and English forms. Caller passes title + description; we match
// against the concatenation so a generic title like "Sladjana Mandić" can
// still pick up "koncert" from the description.
// ---------------------------------------------------------------------------

const CATEGORY_RULES: Array<{ pattern: RegExp; category: string }> = [
  // Festival (specific multi-day events) — match early to win over "concert"
  // mentions inside a festival listing. Allow bare "Fest" with word boundary
  // ("Wine Fest", "Beer Fest") but not "Cinemas Sloga" or "Manifest".
  { pattern: /\bfestivala?\b|\bfest\b|\bSFF\b|jazz\s*fest|MESS\b/i, category: 'festival' },
  // Film / cinema — require an action word, not just venue mentions.
  // Sarajevo has "Cinemas Sloga" (a music venue in a former cinema), so bare
  // "kino" / "cinemas" matches venue history rather than the event.
  { pattern: /\bfilmska\s+projekcija|projekcija\s+filma|premijera\s+filma|kino\s+projekcija|movie\s+night|film\s+screening|\bSFF\b.*film|\bfilm\s+festival/i, category: 'film' },
  // Theatre — drama, opera, balet all live here per the enum
  { pattern: /\bdrama\b|predstava|premijera\s+predstave|teatar|theatre|theater|opera|balet|ballet/i, category: 'theatre' },
  // Art / exhibitions
  { pattern: /izložba|izlozba|exhibition|galerija|gallery|umjetnost|art\s+show|vernisaž/i, category: 'art' },
  // Workshop / educational
  { pattern: /radionica|workshop|kurs\b|trening|seminar|tečaj/i, category: 'workshop' },
  // Market / fair
  { pattern: /\bpijaca\b|sajam|market\b|bazaar|bazar/i, category: 'market' },
  // Charity
  { pattern: /humanitar|charity|donacij/i, category: 'charity' },
  // Sport
  { pattern: /utakmica|fudbal|košarka|kosarka|football|basketball|maraton|marathon|turnir|tournament|liga|league/i, category: 'sport' },
  // Food
  { pattern: /gastronom|food\s+(?:fest|tasting|night)|kulinar|degustacij|wine\s+tasting/i, category: 'food' },
  // Nightlife — clubs, DJ sets, late parties (and Bosnian/Latin transliterations)
  { pattern: /\bdj\s+|nightclub|noćni\s+klub|nocni\s+klub|after\s*party|\btechno\b|house\s+party|club\s+night/i, category: 'nightlife' },
  // Stand-up / comedy → culture (no dedicated 'comedy' enum value)
  { pattern: /stand[-\s]?up|komedija|comedy/i, category: 'culture' },
  // Music — broadest catch-all, runs last so festival/film/nightlife above
  // can claim more specific matches first.
  { pattern: /\bkoncert\b|\bconcert\b|live\s+music|akustič|akustic|recital|orkestar|orchestra|band\b/i, category: 'music' },
];

export function inferCategory(title: string | null, description: string | null = null): string {
  const haystack = [title, description].filter(Boolean).join(' ');
  if (!haystack) return 'other';
  for (const { pattern, category } of CATEGORY_RULES) {
    if (pattern.test(haystack)) return category;
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
  id: string;
  source: string | null;
  ticket_url: string | null;
  title_bs: string | null;
  start_datetime: string | null;
  venue_id: string | null;
  location_name: string | null;
  cover_image_url: string | null;
  description_bs: string | null;
}

interface FuzzyEntry {
  id: string;
  title: string;
  startDatetime: string;
  venueId: string | null;
  locationName: string | null;
  ticketUrl: string | null;
  coverImageUrl: string | null;
  descriptionBs: string | null;
}

async function fetchExistingEventKeys(): Promise<{
  sourceUrlKeys: Set<string>;
  canonicalKeys: Set<string>;
  fuzzyEntries: Map<string, FuzzyEntry[]>;
}> {
  const rows = await fetchSupabaseAdminJson<ExistingEventRow[]>(
    '/rest/v1/events?select=id,source,ticket_url,title_bs,start_datetime,venue_id,location_name,cover_image_url,description_bs&limit=10000',
  );
  const sourceUrlKeys = new Set<string>();
  const canonicalKeys = new Set<string>();
  // Fuzzy index: bucket by distinctive title token (NO venue in the key, so
  // the same event ingested in different venue states still falls into the
  // same bucket). Per-row venue compatibility is enforced by fuzzyEventsMatch
  // at lookup time.
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
    const fuzzyKeys = fuzzyCrossSourceKeys({ title: r.title_bs });
    if (fuzzyKeys.length > 0 && r.start_datetime && r.title_bs) {
      const entry: FuzzyEntry = {
        id: r.id,
        title: r.title_bs,
        startDatetime: r.start_datetime,
        venueId: r.venue_id,
        locationName: r.location_name,
        ticketUrl: r.ticket_url,
        coverImageUrl: r.cover_image_url,
        descriptionBs: r.description_bs,
      };
      for (const key of fuzzyKeys) {
        const arr = fuzzyEntries.get(key) ?? [];
        arr.push(entry);
        fuzzyEntries.set(key, arr);
      }
    }
  }
  return { sourceUrlKeys, canonicalKeys, fuzzyEntries };
}

// ---------------------------------------------------------------------------
// DB writes
// ---------------------------------------------------------------------------

async function insertEvent(event: EventInsert): Promise<string> {
  const rows = await requestSupabaseAdminJson<Array<{ id: string }>>('/rest/v1/events', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(event),
  });
  if (!rows[0]?.id) throw new Error('insertEvent returned no id');
  return rows[0].id;
}

// Build a merge patch: fill null fields in `existing` from `incoming`, and
// upgrade midnight start_datetime to a real time when incoming has one.
// Returns the field set to PATCH; empty object means nothing to do.
function buildMergePatch(
  existing: FuzzyEntry,
  incoming: EventInsert,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (!existing.coverImageUrl && incoming.cover_image_url) {
    patch.cover_image_url = incoming.cover_image_url;
  }
  if (!existing.ticketUrl && incoming.ticket_url) {
    patch.ticket_url = incoming.ticket_url;
  }
  if (!existing.descriptionBs && incoming.description_bs) {
    patch.description_bs = incoming.description_bs;
  }
  if (!existing.venueId && incoming.venue_id) {
    patch.venue_id = incoming.venue_id;
    patch.type = 'venue_linked';
  }
  if (!existing.locationName && incoming.location_name) {
    patch.location_name = incoming.location_name;
  }
  // Time upgrade: existing at 00:00 (date-only ingest), incoming has a real
  // time on the same calendar day → adopt the real time.
  if (existing.startDatetime.endsWith('T00:00:00.000Z') || existing.startDatetime.endsWith('T00:00:00Z')) {
    if (!incoming.start_datetime.endsWith('T00:00:00.000Z') && !incoming.start_datetime.endsWith('T00:00:00Z')) {
      if (dayDelta(existing.startDatetime, incoming.start_datetime) === 0) {
        patch.start_datetime = incoming.start_datetime;
      }
    }
  }
  return patch;
}

async function patchEvent(id: string, patch: Record<string, unknown>): Promise<void> {
  await requestSupabaseAdminNoContent(
    `/rest/v1/events?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(patch),
    },
  );
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
    mergedIntoExisting: 0,
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

      const eventInsert: EventInsert = {
        title_bs: title,
        title_en: title,
        description_bs: raw.description_raw ?? null,
        description_en: null,
        type: venueId ? 'venue_linked' : 'standalone',
        category: inferCategory(title, raw.description_raw),
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
        slug: buildEventSlug(title, startDatetime, raw.id),
      };

      // Near-duplicate dedup: shared distinctive title token + venue compat +
      // within ±2 days. The lookup bucket is now venue-agnostic; per-row
      // venue compatibility is enforced by fuzzyEventsMatch. On collision we
      // MERGE — fill null fields in the existing row, upgrade midnight time
      // to a real time when available — instead of skipping (which would
      // permanently lock the first/poorest ingest).
      const fuzzyKeys = fuzzyCrossSourceKeys({ title });
      let fuzzyDup: FuzzyEntry | null = null;
      for (const key of fuzzyKeys) {
        const candidates = fuzzyEntries.get(key) ?? [];
        const match = candidates.find((e) =>
          fuzzyEventsMatch(
            { title: e.title, startDatetime: e.startDatetime, venueId: e.venueId, locationName: e.locationName },
            { title, startDatetime, venueId, locationName },
          ),
        );
        if (match) { fuzzyDup = match; break; }
      }
      if (fuzzyDup) {
        const patch = buildMergePatch(fuzzyDup, eventInsert);
        if (Object.keys(patch).length > 0) {
          await patchEvent(fuzzyDup.id, patch);
          // Reflect the merge in the in-memory index so subsequent rows in
          // this same run dedupe against the upgraded row.
          if ('start_datetime' in patch) fuzzyDup.startDatetime = String(patch.start_datetime);
          if ('venue_id' in patch) fuzzyDup.venueId = (patch.venue_id as string | null) ?? null;
          if ('location_name' in patch) fuzzyDup.locationName = (patch.location_name as string | null) ?? null;
          if ('ticket_url' in patch) fuzzyDup.ticketUrl = (patch.ticket_url as string | null) ?? null;
          if ('cover_image_url' in patch) fuzzyDup.coverImageUrl = (patch.cover_image_url as string | null) ?? null;
          if ('description_bs' in patch) fuzzyDup.descriptionBs = (patch.description_bs as string | null) ?? null;
          log(`  MERGE → "${fuzzyDup.title}" filled ${Object.keys(patch).join(', ')} from "${title}"`);
          stats.mergedIntoExisting++;
        } else {
          log(`  SKIP [near-day duplicate, nothing to merge] "${title}" ≈ "${fuzzyDup.title}"`);
          stats.skippedCrossSourceDuplicate++;
        }
        await markRawEventPromoted(raw.id, venueId);
        continue;
      }

      const insertedId = await insertEvent(eventInsert);

      // Track all three indexes so subsequent iterations in this run also
      // dedupe against what we just inserted.
      if (ticketUrl) {
        sourceUrlKeys.add(sourceUrlKey);
      }
      if (canonical) {
        canonicalKeys.add(canonical);
      }
      const newEntry: FuzzyEntry = {
        id: insertedId,
        title,
        startDatetime,
        venueId,
        locationName,
        ticketUrl,
        coverImageUrl: eventInsert.cover_image_url,
        descriptionBs: eventInsert.description_bs,
      };
      for (const key of fuzzyKeys) {
        const arr = fuzzyEntries.get(key) ?? [];
        arr.push(newEntry);
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

  // Post-event cleanup: flip is_active=false on rows whose start_datetime is
  // more than 4h in the past. The cron runs every 6h so 4h gives a small
  // buffer for late-night events that ended just before the previous tick.
  // Without this, past events stay visible in the user app and the admin
  // queues until someone notices them manually.
  log('');
  log('Deactivating past events...');
  try {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const deactivated = await requestSupabaseAdminJson<Array<{ id: string }>>(
      `/rest/v1/events?is_active=eq.true&start_datetime=lt.${encodeURIComponent(fourHoursAgo)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ is_active: false }),
      },
    );
    log(`  Deactivated ${deactivated.length} past event(s)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`  Cleanup phase errored (non-fatal): ${msg}`);
  }

  log('');
  log('=== Promotion complete ===');
  log(`  Total raw events processed : ${stats.total}`);
  log(`  Promoted                   : ${stats.promoted}`);
  log(`  Skipped — no date          : ${stats.skippedNoDate}`);
  log(`  Skipped — past date        : ${stats.skippedPastDate}`);
  log(`  Skipped — same-source dup  : ${stats.skippedDuplicate}`);
  log(`  Skipped — cross-source dup : ${stats.skippedCrossSourceDuplicate}`);
  log(`  Merged into existing       : ${stats.mergedIntoExisting}`);
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
