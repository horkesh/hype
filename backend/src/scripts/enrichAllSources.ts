/**
 * enrichAllSources.ts
 *
 * Enriches unpromoted raw_events from AllEvents.in and Pozorista.ba
 * by scraping their detail pages for:
 *   - date_raw (ISO datetime from JSON-LD or HTML datetime attrs)
 *   - description_raw (from JSON-LD or og:description)
 *   - image_url (from JSON-LD or og:image)
 *   - venue_name_raw (from JSON-LD location or page extraction)
 *
 * Also marks KupiKartu navigation false positives as dismissed.
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/enrichAllSources.ts
 */

import { fetchSupabaseAdminJson, requestSupabaseAdminNoContent } from '../lib/supabaseAdmin.js';

const RATE_LIMIT_MS = 800;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawEventRow {
  id: string;
  source_name: string | null;
  source_url: string | null;
  title_raw: string | null;
  description_raw: string | null;
  date_raw: string | null;
  image_url: string | null;
  venue_name_raw: string | null;
}

interface ExtractedData {
  dateRaw: string | null;
  description: string | null;
  imageUrl: string | null;
  venueName: string | null;
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// ─── AllEvents.in extractor ───────────────────────────────────────────────────

function extractAllEvents(html: string): ExtractedData {
  let dateRaw: string | null = null;
  let description: string | null = null;
  let imageUrl: string | null = null;
  let venueName: string | null = null;

  // JSON-LD is the best source
  const jsonldMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (jsonldMatch) {
    try {
      const data = JSON.parse(jsonldMatch[1]);
      if (data.startDate) {
        dateRaw = data.startDate; // ISO format like "2026-04-15T19:30:00+02:00"
      }
      if (data.description) {
        description = stripHtml(data.description);
      }
      if (data.image) {
        imageUrl = data.image;
      }
      if (data.location?.name) {
        venueName = data.location.name;
      }
    } catch {
      // JSON parse error — fall through to HTML extraction
    }
  }

  // Fallback: og:image
  if (!imageUrl) {
    const ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    if (ogImg) imageUrl = ogImg[1];
  }

  // Fallback: og:description
  if (!description) {
    const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    if (ogDesc) description = stripHtml(ogDesc[1]);
  }

  // Fallback: dates from ISO patterns in page
  if (!dateRaw) {
    const isoMatch = html.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})/);
    if (isoMatch) dateRaw = isoMatch[1];
  }

  return { dateRaw, description, imageUrl, venueName };
}

// ─── Pozorista.ba extractor ───────────────────────────────────────────────────

function extractPozorista(html: string): ExtractedData {
  let dateRaw: string | null = null;
  let description: string | null = null;
  let imageUrl: string | null = null;
  let venueName: string | null = null;

  // datetime attributes (from The Events Calendar / WordPress)
  const dtMatch = html.match(/datetime="(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})"/i);
  if (dtMatch) {
    dateRaw = dtMatch[1];
  }

  // og:image
  const ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
  if (ogImg) imageUrl = ogImg[1];

  // og:description
  const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
  if (ogDesc) description = stripHtml(ogDesc[1]);

  // Venue — for Pozorista it's typically "Narodno pozorište Sarajevo" etc.
  // Try The Events Calendar venue markup
  const venueMatch = html.match(/class="tribe-venue"[^>]*>([^<]+)</i) ??
    html.match(/class="tribe-events-venue"[^>]*>([^<]+)</i) ??
    html.match(/<h2[^>]*class="[^"]*venue[^"]*"[^>]*>([^<]+)</i);
  if (venueMatch) {
    venueName = stripHtml(venueMatch[1]);
  }

  // Fallback: JSON-LD for venue
  const jsonldMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (jsonldMatch && !venueName) {
    try {
      const data = JSON.parse(jsonldMatch[1]);
      // Pozorista uses @graph format
      const graph = data['@graph'] ?? [data];
      for (const item of graph) {
        if (item.location?.name) {
          venueName = item.location.name;
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  return { dateRaw, description, imageUrl, venueName };
}

// ─── KupiKartu false positive detection ───────────────────────────────────────

const KUPIKARTU_NAVIGATION_TITLES = new Set([
  'Ostalo',
  'Promotim',
  'Kino',
  'Prodajna mjesta',
  'Uslovi korištenja',
  'Opšti uslovi poslovanja',
  'Upute za korištenje',
  'O nama',
  'Često postavljena pitanja',
  'Prijava korisnika',
  'Registracija korisnika',
  'Muzika',
  'Sport',
  'Kultura',
]);

function isKupikartuFalsePositive(event: RawEventRow): boolean {
  if (event.source_name !== 'KupiKartu.ba') return false;
  const title = event.title_raw?.trim() ?? '';
  return KUPIKARTU_NAVIGATION_TITLES.has(title);
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function fetchUnpromotedEvents(): Promise<RawEventRow[]> {
  const params = new URLSearchParams({
    select: 'id,source_name,source_url,title_raw,description_raw,date_raw,image_url,venue_name_raw',
    venue_match_status: 'neq.promoted',
    order: 'source_name,created_at.asc',
    limit: '200',
  });
  return fetchSupabaseAdminJson<RawEventRow[]>(`/rest/v1/raw_events?${params}`);
}

async function updateRawEvent(id: string, fields: Record<string, string | null>): Promise<void> {
  await requestSupabaseAdminNoContent(`/rest/v1/raw_events?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(fields),
  });
}

async function dismissRawEvent(id: string): Promise<void> {
  await requestSupabaseAdminNoContent(`/rest/v1/raw_events?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ venue_match_status: 'dismissed' }),
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('=== enrichAllSources.ts starting ===');
  log('Fetching unpromoted raw_events...');
  const events = await fetchUnpromotedEvents();
  log(`Found ${events.length} unpromoted event(s).`);

  const stats = {
    dismissed: 0,
    enriched: 0,
    alreadyHasDate: 0,
    noSourceUrl: 0,
    fetchFailed: 0,
    noDateExtracted: 0,
    cancelled: 0,
  };

  // --- Phase 1: Dismiss KupiKartu false positives ---
  log('\n--- Phase 1: Dismissing KupiKartu navigation false positives ---');
  const realEvents: RawEventRow[] = [];

  for (const event of events) {
    if (isKupikartuFalsePositive(event)) {
      log(`  DISMISS "${event.title_raw}" (navigation page)`);
      await dismissRawEvent(event.id);
      stats.dismissed++;
    } else if (event.source_name === 'KupiKartu.ba' && event.title_raw?.includes('OTKAZANO')) {
      log(`  DISMISS "${event.title_raw}" (cancelled event)`);
      await dismissRawEvent(event.id);
      stats.dismissed++;
      stats.cancelled++;
    } else {
      realEvents.push(event);
    }
  }
  log(`Dismissed ${stats.dismissed} false positives/cancelled.`);

  // --- Phase 2: Enrich AllEvents + Pozorista with detail page scraping ---
  log('\n--- Phase 2: Enriching from detail pages ---');

  for (let i = 0; i < realEvents.length; i++) {
    const event = realEvents[i];

    // Skip if already has a date
    if (event.date_raw) {
      log(`  SKIP [already has date] "${event.title_raw}" date_raw="${event.date_raw}"`);
      stats.alreadyHasDate++;
      continue;
    }

    if (!event.source_url) {
      log(`  SKIP [no source_url] "${event.title_raw}"`);
      stats.noSourceUrl++;
      continue;
    }

    log(`[${i + 1}/${realEvents.length}] Fetching "${event.title_raw?.slice(0, 50)}" — ${event.source_url}`);

    try {
      const response = await fetch(event.source_url, {
        headers: {
          'User-Agent': 'HypeIngestionBot/0.1 (+https://hype.local)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // Choose extractor based on source
      let extracted: ExtractedData;
      if (event.source_name === 'AllEvents.in Sarajevo') {
        extracted = extractAllEvents(html);
      } else if (event.source_name === 'Pozorista.ba') {
        extracted = extractPozorista(html);
      } else {
        log(`  SKIP [unknown source] "${event.source_name}"`);
        continue;
      }

      // Build update patch
      const patch: Record<string, string | null> = {};

      if (extracted.dateRaw && !event.date_raw) {
        patch.date_raw = extracted.dateRaw;
      }

      if (extracted.description && (!event.description_raw || extracted.description.length > (event.description_raw?.length ?? 0))) {
        patch.description_raw = extracted.description;
      }

      if (extracted.imageUrl && !event.image_url) {
        patch.image_url = extracted.imageUrl;
      }

      if (extracted.venueName && !event.venue_name_raw) {
        patch.venue_name_raw = extracted.venueName;
      }

      if (Object.keys(patch).length > 0) {
        await updateRawEvent(event.id, patch);
        const summary = Object.entries(patch)
          .map(([k, v]) => `${k}=${v ? JSON.stringify(String(v).slice(0, 60)) : 'null'}`)
          .join(', ');
        log(`  ENRICHED: ${summary}`);
        stats.enriched++;
      } else {
        log(`  No new data extracted.`);
        stats.noDateExtracted++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`  ERROR: ${msg}`);
      stats.fetchFailed++;
    }

    // Rate limit
    if (i < realEvents.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  log('\n=== enrichAllSources.ts complete ===');
  log(`  Dismissed (false positives) : ${stats.dismissed}`);
  log(`  Enriched (new data)         : ${stats.enriched}`);
  log(`  Already had date            : ${stats.alreadyHasDate}`);
  log(`  No source URL               : ${stats.noSourceUrl}`);
  log(`  Fetch failed                : ${stats.fetchFailed}`);
  log(`  No date extracted           : ${stats.noDateExtracted}`);
  log(`  Cancelled events            : ${stats.cancelled}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
