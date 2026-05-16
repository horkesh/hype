/**
 * promoteEvents.ts
 *
 * Promotes raw_events into the canonical events table:
 *   - Matches venue_name_raw → venues (exact, partial, fuzzy)
 *   - Parses date_raw → start_datetime
 *   - Infers category from title keywords
 *   - Skips events already promoted or lacking a date
 *   - Deduplicates on (source, ticket_url)
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/promoteEvents.ts
 */

import {
  fetchSupabaseAdminJson,
  requestSupabaseAdminNoContent,
  requestSupabaseAdminJson,
} from '../lib/supabaseAdmin.js';
import { canonicalEventKey } from '../services/eventDedupe.js';

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

/**
 * Attempts to parse date_raw into an ISO 8601 datetime string.
 * Returns null if parsing fails.
 *
 * Supported formats:
 *   "DD.MM.YYYY"          → midnight
 *   "DD.MM.YYYY HH:MM"    → exact time
 *   "DD/MM"               → current year, midnight
 *   "YYYY-MM-DD"          → midnight
 *   "YYYY-MM-DDTHH:MM…"   → ISO passthrough
 */
function parseDateRaw(dateRaw: string | null): string | null {
  if (!dateRaw) return null;

  const s = dateRaw.trim();

  // ISO passthrough (YYYY-MM-DDTHH:MM…)
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // YYYY-MM-DD
  const isoDate = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    const [, y, m, d] = isoDate;
    return buildDatetime(Number(y), Number(m), Number(d));
  }

  // DD.MM.YYYY HH:MM
  const dotDatetime = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (dotDatetime) {
    const [, d, m, y, hh, mm] = dotDatetime;
    return buildDatetime(Number(y), Number(m), Number(d), Number(hh), Number(mm));
  }

  // DD.MM.YYYY
  const dotDate = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotDate) {
    const [, d, m, y] = dotDate;
    return buildDatetime(Number(y), Number(m), Number(d));
  }

  // DD/MM (assume current year)
  const slashDate = s.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (slashDate) {
    const [, d, m] = slashDate;
    const year = new Date().getFullYear();
    return buildDatetime(year, Number(m), Number(d));
  }

  // Bosnian month names: "17 Mart 2026 20:00" or "23 Mart 2026"
  const bosnianMonths: Record<string, number> = {
    januar: 1, februar: 2, mart: 3, april: 4, maj: 5, juni: 6,
    juli: 7, august: 8, septembar: 9, oktobar: 10, novembar: 11, decembar: 12,
  };
  const bsMatch = s.match(/^(\d{1,2})\s+([a-zA-Zčćšžđ]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (bsMatch) {
    const [, d, monthName, y, hh, mm] = bsMatch;
    const month = bosnianMonths[monthName.toLowerCase()];
    if (month) {
      return buildDatetime(Number(y), month, Number(d), Number(hh ?? 0), Number(mm ?? 0));
    }
  }

  // English month abbrevs: "Sat Mar 22 2026" or "Mar 22, 2026"
  const enMonths: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  const enMatch = s.match(/(?:\w+\s+)?([A-Za-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?(?:\s+(\d{1,2}):(\d{2}))?/);
  if (enMatch) {
    const [, monthStr, d, y, hh, mm] = enMatch;
    const month = enMonths[monthStr.toLowerCase().slice(0, 3)];
    if (month) {
      const year = y ? Number(y) : new Date().getFullYear();
      return buildDatetime(year, month, Number(d), Number(hh ?? 0), Number(mm ?? 0));
    }
  }

  return null;
}

function buildDatetime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): string | null {
  // Month is 1-based coming in
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Venue matching
// ---------------------------------------------------------------------------

const NOISE_TOKENS = [
  /\bsarajevo\b/gi,
  /\bbkc\b/gi,
  /\bkc\b/gi,
  /\bcentar\b/gi,
  /\bcenter\b/gi,
  /\bkulturni\b/gi,
  /\bcultural\b/gi,
];

function stripNoise(s: string): string {
  let out = s;
  for (const re of NOISE_TOKENS) {
    out = out.replace(re, ' ');
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s{2,}/g, ' ').trim();
}

function matchVenue(
  venueNameRaw: string | null,
  venues: Venue[],
): { venue: Venue; strategy: string } | null {
  if (!venueNameRaw) return null;

  const raw = venueNameRaw.trim();
  const rawNorm = normalise(raw);

  // 1. Exact match (case-insensitive)
  for (const v of venues) {
    if (normalise(v.name) === rawNorm) {
      return { venue: v, strategy: 'exact' };
    }
  }

  // 2. Partial: venue name appears inside venue_name_raw
  for (const v of venues) {
    const vNorm = normalise(v.name);
    if (vNorm.length >= 4 && rawNorm.includes(vNorm)) {
      return { venue: v, strategy: 'partial' };
    }
  }

  // 3. Fuzzy: strip noise tokens and retry exact / partial
  const strippedNorm = normalise(stripNoise(raw));
  if (strippedNorm && strippedNorm !== rawNorm) {
    for (const v of venues) {
      const vStripped = normalise(stripNoise(v.name));
      if (vStripped && vStripped === strippedNorm) {
        return { venue: v, strategy: 'fuzzy_exact' };
      }
    }
    for (const v of venues) {
      const vStripped = normalise(stripNoise(v.name));
      if (vStripped.length >= 4 && strippedNorm.includes(vStripped)) {
        return { venue: v, strategy: 'fuzzy_partial' };
      }
    }
  }

  return null;
}

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
    '/rest/v1/venues?select=id,name,category,neighborhood&limit=2000',
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

async function fetchExistingEventKeys(): Promise<{
  sourceUrlKeys: Set<string>;
  canonicalKeys: Set<string>;
}> {
  const rows = await fetchSupabaseAdminJson<ExistingEventRow[]>(
    '/rest/v1/events?select=source,ticket_url,title_bs,start_datetime,venue_id,location_name&limit=10000',
  );
  const sourceUrlKeys = new Set<string>();
  const canonicalKeys = new Set<string>();
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
    if (canonical) {
      canonicalKeys.add(canonical);
    }
  }
  return { sourceUrlKeys, canonicalKeys };
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

async function main() {
  log('=== promoteEvents.ts starting ===');

  log('Loading venues...');
  const venues = await fetchVenues();
  log(`  ${venues.length} venues loaded`);

  log('Loading existing event keys for dedup...');
  const { sourceUrlKeys, canonicalKeys } = await fetchExistingEventKeys();
  log(`  ${sourceUrlKeys.size} source+ticket_url keys, ${canonicalKeys.size} canonical keys indexed`);

  log('Fetching raw_events to promote...');
  const rawEvents = await fetchRawEvents();
  log(`  ${rawEvents.length} raw events to process`);

  const stats = {
    total: rawEvents.length,
    promoted: 0,
    skippedNoDate: 0,
    skippedDuplicate: 0,
    skippedCrossSourceDuplicate: 0,
    skippedNoTitle: 0,
    venueExact: 0,
    venuePartial: 0,
    venueFuzzy: 0,
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
      const startDatetime = parseDateRaw(raw.date_raw);
      if (!startDatetime) {
        log(`  SKIP [no date] "${raw.title_raw}" (date_raw="${raw.date_raw}")`);
        stats.skippedNoDate++;
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

      // Venue matching
      const match = matchVenue(raw.venue_name_raw, venues);
      let venueId: string | null = null;
      let locationName: string | null = null;

      if (match) {
        venueId = match.venue.id;
        locationName = match.venue.name;
        if (match.strategy === 'exact') stats.venueExact++;
        else if (match.strategy === 'partial') stats.venuePartial++;
        else stats.venueFuzzy++;
        log(
          `  VENUE [${match.strategy}] "${raw.venue_name_raw}" → "${match.venue.name}" (${venueId})`,
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

      // Track both keys so subsequent iterations in this run also deduplicate
      if (ticketUrl) {
        sourceUrlKeys.add(sourceUrlKey);
      }
      if (canonical) {
        canonicalKeys.add(canonical);
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
  log(`  Skipped — same-source dup  : ${stats.skippedDuplicate}`);
  log(`  Skipped — cross-source dup : ${stats.skippedCrossSourceDuplicate}`);
  log(`  Skipped — no title         : ${stats.skippedNoTitle}`);
  log(`  Errors                     : ${stats.errors}`);
  log('');
  log('  Venue match breakdown:');
  log(`    Exact                    : ${stats.venueExact}`);
  log(`    Partial                  : ${stats.venuePartial}`);
  log(`    Fuzzy                    : ${stats.venueFuzzy}`);
  log(`    No match                 : ${stats.venueNone}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
