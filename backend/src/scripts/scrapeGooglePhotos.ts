/**
 * scrapeGooglePhotos.ts
 *
 * Downloads venue cover photos from Google Places and stores them on
 * Supabase Storage (`venue-photos` bucket), then writes the permanent
 * Storage URL into venues.cover_image_url.
 *
 * Why we don't store the Google URL directly: Google's photo_reference
 * tokens are time-limited. A URL like .../place/photo?photo_reference=X&key=Y
 * resolves to a 302 redirect when the reference is fresh, then starts
 * returning 400 Bad Request once Google retires the reference (hours-to-days).
 * Storing the image bytes ourselves makes the cover stable forever.
 *
 * Mode:
 *   default — process venues missing cover_image_url
 *   --refresh-broken — re-process venues whose cover_image_url points at
 *     Google Maps (the old broken-URL pattern). Use this once to migrate
 *     existing rows off the expired-reference URLs.
 *
 * Usage:
 *   tsx backend/src/scripts/scrapeGooglePhotos.ts [--refresh-broken]
 */

import { requireSupabaseAdminConfig, requestSupabaseAdminNoContent } from '../lib/supabaseAdmin.js';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PHOTO_MAX_WIDTH = 1200;
const BUCKET = 'venue-photos';
const BATCH_SIZE = 20;
const REFRESH_BROKEN = process.argv.includes('--refresh-broken');

interface Venue {
  id: string;
  name: string;
  google_place_id: string;
  cover_image_url: string | null;
}

interface PlaceDetailsResult {
  result?: {
    photos?: Array<{ photo_reference: string }>;
  };
}

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function fetchVenues(skipIds: Set<string>): Promise<Venue[]> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();
  const params = new URLSearchParams({
    select: 'id,name,google_place_id,cover_image_url',
    google_place_id: 'not.is.null',
    order: 'id.asc',
    limit: String(BATCH_SIZE),
  });
  if (REFRESH_BROKEN) {
    // Migrate rows whose URL points at the now-broken Google CDN endpoint
    params.set('cover_image_url', 'like.*maps.googleapis.com*');
  } else {
    params.set('cover_image_url', 'is.null');
  }
  if (skipIds.size > 0) {
    params.append('id', `not.in.(${[...skipIds].join(',')})`);
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/venues?${params}`, {
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch venues: ${response.status} ${await response.text()}`);
  return (await response.json()) as Venue[];
}

async function getPhotoReference(placeId: string): Promise<string | null> {
  if (!GOOGLE_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY not set');
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const details = (await res.json()) as PlaceDetailsResult;
  return details.result?.photos?.[0]?.photo_reference ?? null;
}

async function downloadPhoto(photoRef: string): Promise<Uint8Array | null> {
  // Google's photo endpoint returns 302 to a CDN URL. fetch follows redirects
  // by default, so we get the image bytes directly.
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${PHOTO_MAX_WIDTH}&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    log(`  photo fetch ${res.status} for ref ${photoRef.slice(0, 20)}...`);
    return null;
  }
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

async function uploadToStorage(venueId: string, bytes: Uint8Array): Promise<string> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();
  const objectPath = `${venueId}.jpg`;
  // Use POST with upsert=true via the x-upsert header so re-runs overwrite
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'image/jpeg',
      'cache-control': '3600',
      'x-upsert': 'true',
    },
    body: bytes,
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${res.status} ${await res.text()}`);
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

async function updateVenueCoverImage(venueId: string, publicUrl: string): Promise<void> {
  await requestSupabaseAdminNoContent(`/rest/v1/venues?id=eq.${venueId}`, {
    method: 'PATCH',
    body: JSON.stringify({ cover_image_url: publicUrl }),
  });
}

async function main() {
  log(`=== scrapeGooglePhotos starting (mode: ${REFRESH_BROKEN ? 'REFRESH-BROKEN' : 'fill-missing'}) ===`);
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const triedIds = new Set<string>();

  while (true) {
    const venues = await fetchVenues(triedIds);
    if (venues.length === 0) break;

    for (const venue of venues) {
      try {
        const photoRef = await getPhotoReference(venue.google_place_id);
        if (!photoRef) {
          log(`  [skip] ${venue.name} — no photo on Google`);
          triedIds.add(venue.id);
          skipped++;
          continue;
        }
        const bytes = await downloadPhoto(photoRef);
        if (!bytes) {
          log(`  [skip] ${venue.name} — photo download failed`);
          triedIds.add(venue.id);
          skipped++;
          continue;
        }
        const publicUrl = await uploadToStorage(venue.id, bytes);
        await updateVenueCoverImage(venue.id, publicUrl);
        log(`  [ok]   ${venue.name} (${(bytes.length / 1024).toFixed(0)}KB)`);
        updated++;
      } catch (err) {
        log(`  [err]  ${venue.name}: ${err instanceof Error ? err.message : err}`);
        triedIds.add(venue.id);
        errors++;
      }
    }
  }

  log('');
  log(`Done. Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
