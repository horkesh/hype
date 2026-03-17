/**
 * scrapeGooglePhotos.ts
 *
 * Fetches venues with google_place_id but no cover_image_url,
 * calls the Google Maps Places API for photos, and updates the venues table.
 *
 * Usage: tsx backend/src/scripts/scrapeGooglePhotos.ts
 */

import { requireSupabaseAdminConfig, requestSupabaseAdminJson, requestSupabaseAdminNoContent } from '../lib/supabaseAdmin.js';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PHOTO_MAX_WIDTH = 800;

interface Venue {
  id: string;
  name: string;
  google_place_id: string;
}

interface PlaceDetailsResult {
  result?: {
    photos?: Array<{ photo_reference: string }>;
  };
}

async function fetchVenuesNeedingPhotos(): Promise<Venue[]> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();
  const params = new URLSearchParams({
    select: 'id,name,google_place_id',
    google_place_id: 'not.is.null',
    cover_image_url: 'is.null',
    limit: '20',
  });
  const response = await fetch(`${supabaseUrl}/rest/v1/venues?${params}`, {
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch venues: ${response.status} ${await response.text()}`);
  }
  return response.json() as Promise<Venue[]>;
}

async function fetchPlacePhoto(placeId: string): Promise<string | null> {
  if (!GOOGLE_API_KEY) {
    console.warn('GOOGLE_MAPS_API_KEY not set — skipping photo fetch');
    return null;
  }

  // Step 1: Get place details to retrieve photo_reference
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  if (!detailsRes.ok) return null;

  const details: PlaceDetailsResult = await detailsRes.json();
  const photoRef = details.result?.photos?.[0]?.photo_reference;
  if (!photoRef) return null;

  // Step 2: Build the photo URL (direct URL, not binary)
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${PHOTO_MAX_WIDTH}&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`;
}

async function updateVenueCoverImage(venueId: string, imageUrl: string): Promise<void> {
  await requestSupabaseAdminNoContent(`/rest/v1/venues?id=eq.${venueId}`, {
    method: 'PATCH',
    body: JSON.stringify({ cover_image_url: imageUrl }),
  });
}

async function main() {
  console.log('Fetching venues with google_place_id but no cover_image_url...');
  const venues = await fetchVenuesNeedingPhotos();
  console.log(`Found ${venues.length} venues to process`);

  if (venues.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const venue of venues) {
    try {
      const photoUrl = await fetchPlacePhoto(venue.google_place_id);
      if (!photoUrl) {
        console.log(`  [skip] ${venue.name} — no photo found`);
        skipped++;
        continue;
      }
      await updateVenueCoverImage(venue.id, photoUrl);
      console.log(`  [ok]   ${venue.name}`);
      updated++;
    } catch (err) {
      console.error(`  [err]  ${venue.name}:`, err);
      skipped++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
