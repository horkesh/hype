/**
 * findInstagramHandles.ts
 *
 * Finds Instagram handles for venues that don't have one yet.
 *
 * Strategy (combined):
 * 1. Extract from website field if it's an Instagram URL
 * 2. Scrape venue websites for Instagram links in the HTML
 * 3. Google search "{venue name} sarajevo instagram" and extract from results
 *
 * Usage: node --env-file=backend/.env --import tsx backend/src/scripts/findInstagramHandles.ts
 *
 * Flags:
 *   --dry-run     Find handles but don't write to DB
 *   --limit=N     Process only N venues (default: all)
 *   --category=X  Only process venues of this category
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX || ''; // Custom Search Engine ID (optional)

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_FLAG = process.argv.find(a => a.startsWith('--limit='));
const LIMIT = LIMIT_FLAG ? parseInt(LIMIT_FLAG.split('=')[1]) : Infinity;
const CAT_FLAG = process.argv.find(a => a.startsWith('--category='));
const CATEGORY = CAT_FLAG ? CAT_FLAG.split('=')[1] : null;

interface Venue {
  id: string;
  name: string;
  website: string | null;
  category: string;
  google_place_id: string | null;
}

interface FoundHandle {
  venueId: string;
  name: string;
  category: string;
  handle: string;
  source: 'website-is-ig' | 'website-scrape' | 'google-search';
  confidence: 'high' | 'medium' | 'low';
}

// ─── Instagram handle extraction ───────────────────────────────────────

function extractInstagramHandle(text: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]{1,30})\/?(?:\?[^\s"'<>]*)?/gi,
    /(?:https?:\/\/)?(?:www\.)?instagr\.am\/([a-zA-Z0-9._]{1,30})\/?/gi,
  ];

  const skipHandles = new Set([
    'p', 'explore', 'reel', 'reels', 'stories', 'accounts', 'about',
    'legal', 'developer', 'directory', 'tv', 'tags', 'locations',
    'nametag', 'direct', 'lite', 'web', 'api', 'static',
  ]);

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const handle = match[1].toLowerCase().replace(/\.$/, '');
      if (skipHandles.has(handle)) continue;
      if (handle.length < 2) continue;
      return handle;
    }
  }
  return null;
}

// Extract ALL instagram handles from text (for scoring)
function extractAllInstagramHandles(text: string): string[] {
  const handles = new Set<string>();
  const pattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]{1,30})\/?/gi;
  const skipHandles = new Set([
    'p', 'explore', 'reel', 'reels', 'stories', 'accounts', 'about',
    'legal', 'developer', 'directory', 'tv', 'tags', 'locations',
  ]);

  for (const match of text.matchAll(pattern)) {
    const h = match[1].toLowerCase().replace(/\.$/, '');
    if (!skipHandles.has(h) && h.length >= 2) handles.add(h);
  }
  return [...handles];
}

// ─── Supabase helpers ──────────────────────────────────────────────────

async function fetchVenuesWithoutIG(offset: number, limit: number): Promise<Venue[]> {
  const params = new URLSearchParams({
    select: 'id,name,website,category,google_place_id',
    instagram_handle: 'is.null',
    order: 'category,name',
    offset: String(offset),
    limit: String(limit),
  });
  if (CATEGORY) params.set('category', `eq.${CATEGORY}`);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/venues?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'count=exact',
    },
  });
  const range = res.headers.get('content-range');
  const data = await res.json();
  if (offset === 0) console.log(`Venues to process: ${range}`);
  return data;
}

async function updateVenueIG(venueId: string, handle: string): Promise<boolean> {
  if (DRY_RUN) return true;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/venues?id=eq.${venueId}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ instagram_handle: handle }),
  });
  return res.ok;
}

// ─── Strategy 1: Scrape venue website HTML ─────────────────────────────

async function scrapeWebsiteForIG(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();
    return extractInstagramHandle(html);
  } catch {
    return null;
  }
}

// ─── Strategy 2: Google Custom Search ──────────────────────────────────

async function googleSearchForIG(venueName: string): Promise<{ handle: string; confidence: 'high' | 'medium' | 'low' } | null> {
  // Use Google Custom Search JSON API
  const query = `"${venueName}" sarajevo instagram.com`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=5`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // If no CX or quota exceeded, fall back to scraping Google directly
      return await directGoogleSearch(venueName);
    }
    const data = await res.json();
    if (!data.items?.length) return null;

    // Look through results for instagram.com links
    for (const item of data.items) {
      const handle = extractInstagramHandle(item.link || '');
      if (handle) {
        // High confidence if the venue name appears in the result
        const nameWords = venueName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const titleLower = (item.title || '').toLowerCase();
        const matchCount = nameWords.filter(w => titleLower.includes(w)).length;
        const confidence = matchCount >= 2 ? 'high' : matchCount >= 1 ? 'medium' : 'low';
        return { handle, confidence };
      }
    }
    return null;
  } catch {
    return await directGoogleSearch(venueName);
  }
}

// Fallback: fetch Google search results page directly
async function directGoogleSearch(venueName: string): Promise<{ handle: string; confidence: 'medium' | 'low' } | null> {
  try {
    const query = `"${venueName}" sarajevo instagram.com`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    // Extract all instagram handles from results and pick the most likely
    const handles = extractAllInstagramHandles(html);
    if (handles.length === 0) return null;

    // Simple heuristic: if venue name words appear in the handle, higher confidence
    const nameSlug = venueName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const best = handles.find(h => {
      const hClean = h.replace(/[._]/g, '');
      return nameSlug.includes(hClean) || hClean.includes(nameSlug) ||
        nameSlug.split('').filter((_, i) => i < 5).join('') === hClean.slice(0, 5);
    });

    return { handle: best || handles[0], confidence: best ? 'medium' : 'low' };
  } catch {
    return null;
  }
}

// ─── Main pipeline ─────────────────────────────────────────────────────

async function main() {
  console.log('=== Instagram Handle Finder ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE (will update DB)'}`);
  if (CATEGORY) console.log(`Category filter: ${CATEGORY}`);
  if (LIMIT < Infinity) console.log(`Limit: ${LIMIT}`);
  console.log();

  let offset = 0;
  const batchSize = 50;
  let totalProcessed = 0;
  const results: FoundHandle[] = [];
  const notFound: { name: string; category: string; website: string | null }[] = [];

  while (totalProcessed < LIMIT) {
    const remaining = LIMIT - totalProcessed;
    const venues = await fetchVenuesWithoutIG(offset, Math.min(batchSize, remaining));
    if (venues.length === 0) break;

    for (const venue of venues) {
      if (totalProcessed >= LIMIT) break;
      totalProcessed++;

      let handle: string | null = null;
      let source: FoundHandle['source'] = 'website-scrape';
      let confidence: FoundHandle['confidence'] = 'high';

      // Strategy 0: Website IS an instagram URL
      if (venue.website?.includes('instagram.com')) {
        handle = extractInstagramHandle(venue.website);
        source = 'website-is-ig';
        confidence = 'high';
      }

      // Strategy 1: Scrape venue website for IG links
      if (!handle && venue.website && !venue.website.includes('facebook.com') && !venue.website.includes('fb.com')) {
        handle = await scrapeWebsiteForIG(venue.website);
        source = 'website-scrape';
        confidence = 'high';
        await new Promise(r => setTimeout(r, 300));
      }

      // Strategy 2: Google search
      if (!handle) {
        const googleResult = await googleSearchForIG(venue.name);
        if (googleResult) {
          handle = googleResult.handle;
          source = 'google-search';
          confidence = googleResult.confidence;
        }
        await new Promise(r => setTimeout(r, 1000)); // Heavier rate limit for Google
      }

      if (handle) {
        const saved = await updateVenueIG(venue.id, handle);
        results.push({
          venueId: venue.id,
          name: venue.name,
          category: venue.category,
          handle,
          source,
          confidence,
        });
        const mark = confidence === 'high' ? '✅' : confidence === 'medium' ? '🟡' : '🔴';
        console.log(`  ${mark} ${venue.name} → @${handle} [${source}, ${confidence}]${saved ? '' : ' ⚠️ DB update failed'}`);
      } else {
        notFound.push({ name: venue.name, category: venue.category, website: venue.website });
        process.stdout.write('.');
      }
    }

    offset += batchSize;
    console.log(`\n  Progress: ${totalProcessed} processed, ${results.length} found\n`);
  }

  // ─── Report ────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Handles found:   ${results.length}`);
  console.log(`Not found:       ${notFound.length}`);
  console.log();

  const bySource = { 'website-is-ig': 0, 'website-scrape': 0, 'google-search': 0 };
  const byConfidence = { high: 0, medium: 0, low: 0 };
  results.forEach(r => {
    bySource[r.source]++;
    byConfidence[r.confidence]++;
  });
  console.log('By source:', JSON.stringify(bySource));
  console.log('By confidence:', JSON.stringify(byConfidence));

  console.log('\n--- High confidence handles ---');
  results.filter(r => r.confidence === 'high').forEach(r =>
    console.log(`  @${r.handle} — ${r.name} (${r.category}) [${r.source}]`)
  );

  if (results.some(r => r.confidence !== 'high')) {
    console.log('\n--- Needs manual verification ---');
    results.filter(r => r.confidence !== 'high').forEach(r =>
      console.log(`  @${r.handle} — ${r.name} (${r.category}) [${r.source}, ${r.confidence}]`)
    );
  }

  // Save results
  const fs = await import('fs');
  fs.mkdirSync('backend/data', { recursive: true });
  fs.writeFileSync('backend/data/found_instagram_handles.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('backend/data/no_instagram_found.json', JSON.stringify(notFound, null, 2));
  console.log('\nSaved: backend/data/found_instagram_handles.json');
  console.log('Saved: backend/data/no_instagram_found.json');
}

main().catch(console.error);
