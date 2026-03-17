/**
 * enrichKupikartuDetails.ts
 *
 * Fetches detail pages for KupiKartu.ba raw_events that are missing description_raw,
 * then extracts and backfills:
 *   - description_raw  (full event text)
 *   - date_raw         (DD.MM.YYYY HH:MM)
 *   - image_url        (full-size cover, /img/sd2/700x300/ preferred)
 *   - venue_name_raw   (venue name if not already set)
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/enrichKupikartuDetails.ts
 */

import { fetchSupabaseAdminJson, requestSupabaseAdminNoContent } from '../lib/supabaseAdmin.js';

const BASE_URL = 'https://www.kupikartu.ba';
const RATE_LIMIT_MS = 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawEventRow {
  id: string;
  source_url: string;
  title_raw: string | null;
  description_raw: string | null;
  date_raw: string | null;
  image_url: string | null;
  venue_name_raw: string | null;
}

interface ExtractedDetail {
  description: string | null;
  dateRaw: string | null;
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
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveUrl(href: string | null | undefined): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return `${BASE_URL}${trimmed}`;
  return `${BASE_URL}/${trimmed}`;
}

// ─── Detail extraction ────────────────────────────────────────────────────────

function extractDetail(html: string): ExtractedDetail {
  // --- Description ---
  // Priority 1: <div class="text">…</div>
  let description: string | null = null;
  const textDivMatch = html.match(/<div[^>]*class=["'][^"']*\btext\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (textDivMatch) {
    description = stripHtml(textDivMatch[1]);
  }

  // Priority 2: <div class="description">…</div>
  if (!description || description.length < 20) {
    const descDivMatch = html.match(/<div[^>]*class=["'][^"']*\bdescription\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    if (descDivMatch) {
      const candidate = stripHtml(descDivMatch[1]);
      if (candidate.length > (description?.length ?? 0)) description = candidate;
    }
  }

  // Priority 3: og:description or meta description
  if (!description || description.length < 20) {
    const ogDesc =
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
      null;
    if (ogDesc && ogDesc.length > (description?.length ?? 0)) {
      description = stripHtml(ogDesc);
    }
  }

  if (description && description.length < 5) description = null;

  // --- Date/time ---
  // Look for DD.MM.YYYY optionally followed by HH:MM
  let dateRaw: string | null = null;
  const dateSections = [
    // Within class="date" or class="datetime" elements
    ...html.matchAll(/<(?:div|span|p|li)[^>]*class=["'][^"']*\bdate[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p|li)>/gi),
  ];
  for (const m of dateSections) {
    const text = stripHtml(m[1]);
    const match = text.match(/(\d{2}\.\d{2}\.\d{4})(?:[\s,;|/–-]*(?:u\s*)?(\d{2}:\d{2}))?/i);
    if (match) {
      dateRaw = match[2] ? `${match[1]} ${match[2]}` : match[1];
      break;
    }
  }
  // Fallback: first date pattern anywhere in the page
  if (!dateRaw) {
    const fallback = html.match(/(\d{2}\.\d{2}\.\d{4})(?:[\s,;|/–-]*(?:u\s*)?(\d{2}:\d{2}))?/i);
    if (fallback) {
      dateRaw = fallback[2] ? `${fallback[1]} ${fallback[2]}` : fallback[1];
    }
  }

  // --- Full-size image ---
  // Priority 1: /img/sd2/700x300/ path (KupiKartu full cover)
  let imageUrl: string | null = null;
  const bigImgMatch = html.match(/["']((?:https?:\/\/[^"']*)?\/img\/sd2\/700x300\/[^"']+)["']/i);
  if (bigImgMatch) {
    imageUrl = resolveUrl(bigImgMatch[1]);
  }

  // Priority 2: og:image (usually a decent size)
  if (!imageUrl) {
    const ogImg =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
      html.match(/og:image['"]\s*content=['"]([^'"]+)/i)?.[1] ??
      null;
    imageUrl = resolveUrl(ogImg);
  }

  // Priority 3: first <img> inside <div class="image">
  if (!imageUrl) {
    const imgDivMatch = html.match(/<div[^>]*class=["'][^"']*\bimage\b[^"']*["'][^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i);
    if (imgDivMatch) {
      imageUrl = resolveUrl(imgDivMatch[1]);
    }
  }

  // --- Venue name ---
  // KupiKartu often shows venue after " @ " or "Lokacija:" or in a "venue" element
  let venueName: string | null = null;

  // Look for "@ VenueName" pattern in the page
  const atVenueMatch = html.match(/@\s*<[^>]+>([^<]{2,60})</i) ??
    html.match(/@\s+([A-ZČŠŽĆĐ][^\n<,]{2,60})/);
  if (atVenueMatch) {
    venueName = stripHtml(atVenueMatch[1]).trim();
  }

  // Look for <span class="venue">, <div class="venue">, or <div class="location">
  if (!venueName) {
    const venueDivMatch =
      html.match(/<(?:span|div|p|li)[^>]*class=["'][^"']*\bvenue\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div|p|li)>/i) ??
      html.match(/<(?:span|div|p|li)[^>]*class=["'][^"']*\blocation\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div|p|li)>/i);
    if (venueDivMatch) {
      const candidate = stripHtml(venueDivMatch[1]);
      if (candidate.length >= 2 && candidate.length <= 100) venueName = candidate;
    }
  }

  // Look for "Lokacija:" label in Bosnian pages
  if (!venueName) {
    const lokacijaMatch = html.match(/Lokacija\s*:?\s*<[^>]*>([^<]{2,80})/i) ??
      html.match(/Lokacija\s*:?\s*([^\n<,]{2,80})/i);
    if (lokacijaMatch) {
      venueName = stripHtml(lokacijaMatch[1]).trim();
    }
  }

  if (venueName && venueName.length < 2) venueName = null;

  return { description, dateRaw, imageUrl, venueName };
}

// ─── Fetch detail page ────────────────────────────────────────────────────────

async function fetchDetailHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'HypeIngestionBot/0.1 (+https://hype.local)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.text();
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function fetchPendingEvents(): Promise<RawEventRow[]> {
  const params = new URLSearchParams({
    select: 'id,source_url,title_raw,description_raw,date_raw,image_url,venue_name_raw',
    source_name: 'eq.KupiKartu.ba',
    description_raw: 'is.null',
    limit: '200',
  });

  return fetchSupabaseAdminJson<RawEventRow[]>(`/rest/v1/raw_events?${params}`);
}

async function updateRawEvent(id: string, fields: Partial<Record<string, string | null>>): Promise<void> {
  await requestSupabaseAdminNoContent(`/rest/v1/raw_events?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(fields),
  });
}

// ─── Rate limit helper ────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function main() {
  log('Fetching KupiKartu.ba raw_events with missing description_raw...');
  const events = await fetchPendingEvents();
  log(`Found ${events.length} event(s) to enrich.`);

  if (events.length === 0) {
    log('Nothing to do. Exiting.');
    return;
  }

  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    log(`[${i + 1}/${events.length}] ${event.title_raw ?? event.id} — ${event.source_url}`);

    try {
      const html = await fetchDetailHtml(event.source_url);
      const detail = extractDetail(html);

      // Build update patch — only set fields where we got better data
      const patch: Partial<Record<string, string | null>> = {};

      if (detail.description && detail.description.length > 10) {
        patch.description_raw = detail.description;
      }

      // Only update date_raw if we found a more specific one (has time component) or current is null
      if (detail.dateRaw) {
        const currentHasTime = event.date_raw?.includes(':') ?? false;
        const newHasTime = detail.dateRaw.includes(':');
        if (!event.date_raw || newHasTime || !currentHasTime) {
          patch.date_raw = detail.dateRaw;
        }
      }

      // Only update image_url if current is null or new one looks bigger
      if (detail.imageUrl) {
        const newIsBig = detail.imageUrl.includes('700x300') || detail.imageUrl.includes('og:image');
        const currentIsSmall = event.image_url
          ? event.image_url.includes('100x') || event.image_url.includes('50x') || event.image_url.includes('thumbnail')
          : true;
        if (!event.image_url || (newIsBig && currentIsSmall)) {
          patch.image_url = detail.imageUrl;
        }
      }

      // Only update venue_name_raw if not already set
      if (detail.venueName && !event.venue_name_raw) {
        patch.venue_name_raw = detail.venueName;
      }

      if (Object.keys(patch).length > 0) {
        await updateRawEvent(event.id, patch);
        log(
          `  Updated: ${Object.keys(patch)
            .map((k) => {
              const v = patch[k];
              return `${k}=${v ? JSON.stringify(v.slice(0, 60)) : 'null'}`;
            })
            .join(', ')}`,
        );
        enriched++;
      } else {
        log('  No new data extracted — skipping update.');
      }
    } catch (err) {
      failed++;
      log(`  ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Rate limit between requests (skip delay after the last one)
    if (i < events.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  log(`\nDone. Enriched: ${enriched}, Failed: ${failed}, Total: ${events.length}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
