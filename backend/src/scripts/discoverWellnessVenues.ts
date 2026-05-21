/**
 * discoverWellnessVenues.ts
 *
 * Operator-only. Runs ~15 Google Places Text Search queries across Sarajevo
 * to surface every beauty salon, spa, gym, yoga studio, and aesthetic clinic
 * Google knows about. Dedupes by google_place_id, skips anything already in
 * our venues table, and inserts new rows with category='wellness' plus
 * subtype tags ('hair_salon', 'massage', 'fitness', 'yoga', 'aesthetic').
 *
 * After this finishes, run the existing pipeline to enrich the new rows:
 *   tsx backend/src/scripts/enrichFromGoogle.ts
 *   tsx backend/src/scripts/scrapeGooglePhotos.ts
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/discoverWellnessVenues.ts
 *   node --env-file=backend/.env --import tsx backend/src/scripts/discoverWellnessVenues.ts --dry-run
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!;

// Sarajevo center; 12km radius covers Centar, Ilidža, Vogošća, Hadžići.
const SARAJEVO_LAT = 43.8563;
const SARAJEVO_LNG = 18.4131;
const RADIUS_M = 12_000;

const DRY_RUN = process.argv.includes('--dry-run');

// Each query carries its expected tag so we can distinguish subtypes in the
// venues.tags column even though category is just 'wellness'.
const QUERIES: Array<{ q: string; tag: string }> = [
  { q: 'beauty salon Sarajevo',          tag: 'beauty_salon' },
  { q: 'hair salon Sarajevo',            tag: 'hair_salon' },
  { q: 'frizerski salon Sarajevo',       tag: 'hair_salon' },
  { q: 'nail salon Sarajevo',            tag: 'nails' },
  { q: 'salon ljepote Sarajevo',         tag: 'beauty_salon' },
  { q: 'kozmeticki salon Sarajevo',      tag: 'beauty_salon' },
  { q: 'spa Sarajevo',                   tag: 'spa' },
  { q: 'wellness Sarajevo',              tag: 'spa' },
  { q: 'massage Sarajevo',               tag: 'massage' },
  { q: 'masaža Sarajevo',                tag: 'massage' },
  { q: 'gym Sarajevo',                   tag: 'fitness' },
  { q: 'fitness Sarajevo',               tag: 'fitness' },
  { q: 'yoga Sarajevo',                  tag: 'yoga' },
  { q: 'pilates Sarajevo',               tag: 'pilates' },
  { q: 'aesthetic clinic Sarajevo',      tag: 'aesthetic' },
  { q: 'estetska klinika Sarajevo',      tag: 'aesthetic' },
  { q: 'medical spa Sarajevo',           tag: 'aesthetic' },
];

// Google Places types that indicate "this is plausibly a wellness venue".
// Used as a sanity filter so a restaurant named "Spa" doesn't slip in.
const ALLOWED_TYPES = new Set([
  'beauty_salon', 'hair_care', 'spa', 'gym', 'health',
  'physiotherapist', 'doctor', 'dentist', 'massage',
  // Permissive fallbacks — many Sarajevo salons don't have a specific
  // Google type and just get 'point_of_interest' / 'establishment'.
  // We accept these only when the name has a wellness signal (below).
  'point_of_interest', 'establishment',
]);

const NAME_SIGNAL_RE = /\b(salon|spa|massage|masaž|fitness|gym|yoga|pilates|kozmet|frizer|estetsk|wellness|beauty|hair|nail|relax|sauna|hammam)/i;

// Hard rejections — venue is obviously something else.
const REJECTED_TYPES = new Set([
  'restaurant', 'cafe', 'bar', 'food', 'bakery', 'meal_delivery',
  'meal_takeaway', 'night_club', 'lodging', 'tourist_attraction',
  'shopping_mall', 'pharmacy',
]);

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
}

interface TextSearchResponse {
  status: string;
  results?: PlaceResult[];
  next_page_token?: string;
  error_message?: string;
}

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function textSearch(query: string): Promise<PlaceResult[]> {
  const all: PlaceResult[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 3; page++) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    if (pageToken) {
      url.searchParams.set('pagetoken', pageToken);
      // Google requires a short delay before next_page_token works.
      await sleep(2000);
    } else {
      url.searchParams.set('query', query);
      url.searchParams.set('location', `${SARAJEVO_LAT},${SARAJEVO_LNG}`);
      url.searchParams.set('radius', String(RADIUS_M));
    }
    url.searchParams.set('key', GOOGLE_KEY);
    const res = await fetch(url);
    const data = (await res.json()) as TextSearchResponse;
    if (data.status === 'ZERO_RESULTS') return all;
    if (data.status !== 'OK') {
      log(`  [textsearch warn] status=${data.status} msg=${data.error_message ?? '-'}`);
      return all;
    }
    all.push(...(data.results ?? []));
    if (!data.next_page_token) break;
    pageToken = data.next_page_token;
  }
  return all;
}

function shouldKeep(p: PlaceResult): boolean {
  if (p.business_status === 'CLOSED_PERMANENTLY') return false;
  const types = p.types ?? [];
  if (types.some((t) => REJECTED_TYPES.has(t))) return false;
  const hasAllowedType = types.some((t) => ALLOWED_TYPES.has(t));
  if (!hasAllowedType) return false;
  // For the permissive fallback types, also require a name signal.
  const hasSpecificType = types.some(
    (t) => ALLOWED_TYPES.has(t) && t !== 'point_of_interest' && t !== 'establishment',
  );
  if (!hasSpecificType && !NAME_SIGNAL_RE.test(p.name)) return false;
  return true;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function extractNeighborhood(addr: string | undefined): string | null {
  if (!addr) return null;
  // Sarajevo addresses often look like "<street>, <neighborhood>, Sarajevo".
  // Take the second-to-last meaningful segment as a heuristic.
  const parts = addr.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  const candidate = parts[parts.length - 2];
  if (/sarajevo|bosnia/i.test(candidate)) return null;
  return candidate;
}

async function listExistingPlaceIds(): Promise<Set<string>> {
  const all = new Set<string>();
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/venues?select=google_place_id&google_place_id=not.is.null`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Range: `${from}-${from + pageSize - 1}`,
          Prefer: 'count=exact',
        },
      },
    );
    if (!res.ok) throw new Error(`venues read failed: ${res.status}`);
    const rows = (await res.json()) as Array<{ google_place_id: string | null }>;
    rows.forEach((r) => r.google_place_id && all.add(r.google_place_id));
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

interface VenueInsert {
  name: string;
  slug: string;
  category: string;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string;
  google_rating: number | null;
  google_ratings_count: number | null;
  tags: string[];
  is_active: boolean;
  is_curated: boolean;
  curator_notes: string;
}

async function insertVenue(v: VenueInsert): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/venues`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(v),
  });
  if (!res.ok) {
    const body = await res.text();
    log(`  [insert fail] ${v.name}: ${res.status} ${body.slice(0, 200)}`);
    return false;
  }
  return true;
}

async function main() {
  if (!GOOGLE_KEY) {
    console.error('GOOGLE_MAPS_API_KEY not set.');
    process.exit(1);
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Supabase env vars missing.');
    process.exit(1);
  }

  log(`Mode: ${DRY_RUN ? 'DRY RUN (no inserts)' : 'LIVE'}`);
  log('Loading existing Google place_ids from venues...');
  const existing = await listExistingPlaceIds();
  log(`  ${existing.size} venues already have a Google place_id.`);

  // place_id → { result + accumulated tags }
  const discovered = new Map<string, { p: PlaceResult; tags: Set<string> }>();

  for (const { q, tag } of QUERIES) {
    log(`Searching "${q}"...`);
    const results = await textSearch(q);
    let added = 0;
    for (const p of results) {
      if (!shouldKeep(p)) continue;
      const entry = discovered.get(p.place_id);
      if (entry) {
        entry.tags.add(tag);
      } else {
        const tags = new Set<string>([tag]);
        // Pull subtype tags from Google types too.
        (p.types ?? []).forEach((t) => {
          if (t === 'beauty_salon' || t === 'hair_care' || t === 'spa' || t === 'gym') {
            tags.add(t);
          }
        });
        discovered.set(p.place_id, { p, tags });
        added++;
      }
    }
    log(`  → ${results.length} raw results, ${added} new unique kept.`);
    await sleep(500);
  }

  log(`\nDiscovered ${discovered.size} unique wellness candidates.`);
  const fresh = [...discovered.values()].filter(({ p }) => !existing.has(p.place_id));
  log(`  ${fresh.length} are NOT already in venues.`);

  if (DRY_RUN) {
    log('Dry run — sample of first 20:');
    for (const { p, tags } of fresh.slice(0, 20)) {
      log(`  · ${p.name} [${[...tags].join(',')}] ${p.formatted_address ?? ''} ${p.rating ? `(${p.rating}★ ${p.user_ratings_total})` : ''}`);
    }
    log('\nRe-run without --dry-run to insert.');
    return;
  }

  log(`\nInserting ${fresh.length} new wellness venues...`);
  let inserted = 0;
  let failed = 0;
  for (const { p, tags } of fresh) {
    const slug = slugify(p.name) + '-' + p.place_id.slice(-6);
    const lat = p.geometry?.location?.lat ?? null;
    const lng = p.geometry?.location?.lng ?? null;
    const ok = await insertVenue({
      name: p.name,
      slug,
      category: 'wellness',
      neighborhood: extractNeighborhood(p.formatted_address),
      address: p.formatted_address ?? null,
      latitude: lat,
      longitude: lng,
      google_place_id: p.place_id,
      google_rating: p.rating ?? null,
      google_ratings_count: p.user_ratings_total ?? null,
      tags: [...tags],
      is_active: true,
      is_curated: false,
      curator_notes: `auto-discovered ${new Date().toISOString().slice(0, 10)} via discoverWellnessVenues.ts`,
    });
    if (ok) inserted++; else failed++;
    if ((inserted + failed) % 25 === 0) {
      log(`  progress: ${inserted} inserted, ${failed} failed`);
    }
  }

  log(`\n✓ Done. Inserted: ${inserted}, failed: ${failed}.`);
  log('Next: run enrichFromGoogle.ts + scrapeGooglePhotos.ts for ratings, photos, opening hours.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
