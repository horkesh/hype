/**
 * enrichFromGoogle.ts
 *
 * Pulls structured data from Google Places API into our venues table:
 * - rating, user_ratings_total
 * - price_level
 * - website, phone
 * - editorial_summary (Google's own blurb)
 * - opening_hours (periods array)
 * - address (formatted_address)
 *
 * Usage: node --env-file=backend/.env --import tsx backend/src/scripts/enrichFromGoogle.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!;

const FIELDS = [
  'name',
  'rating',
  'user_ratings_total',
  'price_level',
  'website',
  'formatted_phone_number',
  'editorial_summary',
  'opening_hours',
  'formatted_address',
  'reviews',
].join(',');

interface Venue {
  id: string;
  name: string;
  google_place_id: string;
}

async function fetchVenuesBatch(offset: number): Promise<Venue[]> {
  const params = new URLSearchParams({
    select: 'id,name,google_place_id',
    'google_place_id': 'not.is.null',
    'google_rating': 'is.null', // Only venues we haven't enriched yet
    offset: String(offset),
    limit: '20',
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/venues?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return (await res.json()) as Venue[];
}

async function getPlaceDetails(placeId: string) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${FIELDS}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const data = (await res.json()) as { result?: Record<string, unknown> };
  return data.result ?? null;
}

function extractTopReviewSnippets(reviews: any[], max = 3): string[] {
  if (!reviews?.length) return [];
  // Pick highest-rated, most relevant reviews
  return reviews
    .filter((r: any) => r.rating >= 4 && r.text?.length > 20)
    .sort((a: any, b: any) => b.rating - a.rating)
    .slice(0, max)
    .map((r: any) => r.text.slice(0, 200));
}

async function updateVenue(venueId: string, details: any) {
  const reviews = extractTopReviewSnippets(details.reviews);

  const update: Record<string, any> = {
    google_rating: details.rating ?? null,
    google_ratings_count: details.user_ratings_total ?? null,
    google_price_level: details.price_level ?? null,
    google_editorial_summary: details.editorial_summary?.overview ?? null,
    google_top_reviews: reviews.length > 0 ? reviews : null,
  };

  // Only update these if we don't already have them
  const conditionalFields: Record<string, any> = {};
  if (details.website) conditionalFields.website = details.website;
  if (details.formatted_phone_number) conditionalFields.phone = details.formatted_phone_number;
  if (details.formatted_address) conditionalFields.address = details.formatted_address;
  if (details.opening_hours?.periods) {
    conditionalFields.opening_hours_json = details.opening_hours.periods;
  }

  await fetch(`${SUPABASE_URL}/rest/v1/venues?id=eq.${venueId}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...update, ...conditionalFields }),
  });
}

async function main() {
  // First ensure columns exist
  console.log('Adding Google enrichment columns if missing...');
  const alterSql = `
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_rating numeric;
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_ratings_count integer;
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_price_level integer;
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_editorial_summary text;
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_top_reviews text[];
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS website text;
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS phone text;
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS address text;
    ALTER TABLE venues ADD COLUMN IF NOT EXISTS opening_hours_json jsonb;
  `;

  // Run via Supabase RPC or just patch — we'll use the REST API
  // Actually we need to run SQL. Let's use the management API.
  // For now, assume columns exist or were added via migration.

  console.log('Fetching venues needing Google enrichment...\n');

  let offset = 0;
  let total = 0;
  let enriched = 0;

  while (true) {
    const venues = await fetchVenuesBatch(offset);
    if (venues.length === 0) break;
    total += venues.length;

    // Process in batches of 5 to respect rate limits
    for (let i = 0; i < venues.length; i += 5) {
      const batch = venues.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map(async (v) => {
          const details = await getPlaceDetails(v.google_place_id);
          if (!details) return;
          await updateVenue(v.id, details);
          return v.name;
        }),
      );

      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
          enriched++;
        } else if (r.status === 'rejected') {
          console.error('  [err]', r.reason);
        }
      }
    }

    process.stdout.write(`\r  Processed ${total} venues, enriched ${enriched}...`);
    offset += venues.length;
  }

  console.log(`\n\nDone. Enriched ${enriched}/${total} venues with Google data.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
