/**
 * verifyCategoriesVsGoogle.ts
 *
 * Cross-checks our venue categories against Google Maps place types.
 * Flags mismatches so we can fix them before AI enrichment.
 *
 * Usage: node --env-file=backend/.env --import tsx backend/src/scripts/verifyCategoriesVsGoogle.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!;

// Map our categories to plausible Google types
const CATEGORY_TO_GOOGLE: Record<string, string[]> = {
  cafe: ['cafe', 'coffee_shop'],
  restaurant: ['restaurant', 'food', 'meal_delivery', 'meal_takeaway'],
  bar: ['bar', 'night_club'],
  club: ['night_club', 'bar'],
  pub: ['bar', 'night_club'],
  bakery: ['bakery', 'food'],
  fast_food: ['restaurant', 'food', 'meal_takeaway'],
  cinema: ['movie_theater'],
  theatre: ['performing_arts_theater'],
  concert_hall: ['performing_arts_theater', 'night_club'],
  museum: ['museum'],
  gallery: ['art_gallery', 'museum', 'store'],
  cultural_center: ['community_center', 'library', 'performing_arts_theater', 'museum'],
  park: ['park', 'amusement_park'],
  outdoor: ['park', 'tourist_attraction', 'campground', 'natural_feature'],
  landmark: ['tourist_attraction', 'point_of_interest', 'church', 'mosque'],
  spa: ['spa', 'health', 'gym'],
  hookah: ['bar', 'cafe', 'restaurant'],
  ice_cream: ['food', 'cafe', 'bakery', 'restaurant'],
  dessert: ['bakery', 'food', 'cafe', 'restaurant'],
};

// Google types we should ignore (too generic)
const IGNORE_TYPES = new Set([
  'establishment', 'point_of_interest', 'food', 'store',
]);

interface Venue {
  id: string;
  name: string;
  category: string;
  google_place_id: string;
}

interface Mismatch {
  id: string;
  name: string;
  ourCategory: string;
  googleTypes: string[];
  suggestedCategory: string | null;
}

// Reverse map: Google type -> our category
const GOOGLE_TO_CATEGORY: Record<string, string> = {
  cafe: 'cafe',
  coffee_shop: 'cafe',
  restaurant: 'restaurant',
  meal_takeaway: 'restaurant',
  bar: 'bar',
  night_club: 'club',
  bakery: 'bakery',
  movie_theater: 'cinema',
  performing_arts_theater: 'theatre',
  museum: 'museum',
  art_gallery: 'gallery',
  park: 'park',
  spa: 'spa',
};

function suggestCategory(googleTypes: string[]): string | null {
  for (const t of googleTypes) {
    if (GOOGLE_TO_CATEGORY[t]) return GOOGLE_TO_CATEGORY[t];
  }
  return null;
}

async function fetchVenues(offset: number, limit: number): Promise<Venue[]> {
  const params = new URLSearchParams({
    select: 'id,name,category,google_place_id',
    'google_place_id': 'not.is.null',
    offset: String(offset),
    limit: String(limit),
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/venues?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return (await res.json()) as Venue[];
}

async function getGoogleTypes(placeId: string): Promise<string[]> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=types&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const data = (await res.json()) as { result?: { types?: string[] } };
  return (data.result?.types ?? []).filter((t: string) => !IGNORE_TYPES.has(t));
}

async function main() {
  console.log('Fetching all venues with google_place_id...');

  let offset = 0;
  const limit = 100;
  const mismatches: Mismatch[] = [];
  let total = 0;

  while (true) {
    const venues = await fetchVenues(offset, limit);
    if (venues.length === 0) break;
    total += venues.length;

    // Check in batches of 5 to avoid rate limits
    for (let i = 0; i < venues.length; i += 5) {
      const batch = venues.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map(async (v) => {
          const googleTypes = await getGoogleTypes(v.google_place_id);
          const expected = CATEGORY_TO_GOOGLE[v.category] ?? [];

          // If we have no mapping for this category, skip
          if (expected.length === 0) return;

          const hasMatch = expected.some((t) => googleTypes.includes(t));
          if (!hasMatch && googleTypes.length > 0) {
            mismatches.push({
              id: v.id,
              name: v.name,
              ourCategory: v.category,
              googleTypes,
              suggestedCategory: suggestCategory(googleTypes),
            });
          }
        }),
      );
    }

    process.stdout.write(`\r  Checked ${total} venues, ${mismatches.length} mismatches so far...`);
    offset += limit;
  }

  console.log(`\n\nDone. Checked ${total} venues.`);
  console.log(`Found ${mismatches.length} category mismatches:\n`);

  // Group by mismatch type
  const fixable = mismatches.filter((m) => m.suggestedCategory);
  const unclear = mismatches.filter((m) => !m.suggestedCategory);

  if (fixable.length > 0) {
    console.log(`=== FIXABLE (${fixable.length}) — suggested category available ===`);
    for (const m of fixable) {
      console.log(`  ${m.name} | ours: ${m.ourCategory} → suggested: ${m.suggestedCategory} | google: ${m.googleTypes.join(', ')}`);
    }
  }

  if (unclear.length > 0) {
    console.log(`\n=== MANUAL REVIEW (${unclear.length}) — no clear suggestion ===`);
    for (const m of unclear) {
      console.log(`  ${m.name} | ours: ${m.ourCategory} | google: ${m.googleTypes.join(', ')}`);
    }
  }

  // Offer to auto-fix
  if (fixable.length > 0) {
    console.log(`\nTo auto-fix the ${fixable.length} fixable mismatches, re-run with --fix`);

    if (process.argv.includes('--fix')) {
      console.log('\nApplying fixes...');
      for (const m of fixable) {
        await fetch(`${SUPABASE_URL}/rest/v1/venues?id=eq.${m.id}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            category: m.suggestedCategory,
            description_en: null,  // Clear description so enrichment re-runs with correct category
            description_bs: null,
          }),
        });
        console.log(`  Fixed: ${m.name} → ${m.suggestedCategory}`);
      }
      console.log(`\nDone. Fixed ${fixable.length} venues.`);
    }
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
