/**
 * findGooglePlaceIds.ts
 *
 * For venues that don't yet have a google_place_id, queries Google's
 * "Find Place from Text" API biased to Sarajevo to discover one, and stores
 * place_id + lat/lng so the existing enrichFromGoogle.ts pipeline can run
 * against them.
 *
 * Usage: node --env-file=backend/.env --import tsx backend/src/scripts/findGooglePlaceIds.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!;

// Sarajevo city center; ~10km radius covers Centar, Ilidža, Lukavica.
const SARAJEVO_LAT = 43.8563;
const SARAJEVO_LNG = 18.4131;
const RADIUS_M = 10_000;

interface VenueRow {
  id: string;
  name: string;
  neighborhood: string | null;
  address: string | null;
}

interface FindPlaceCandidate {
  place_id: string;
  name?: string;
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
}

interface FindPlaceResponse {
  status: string;
  candidates?: FindPlaceCandidate[];
  error_message?: string;
}

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function fetchVenuesNeedingPlaceId(): Promise<VenueRow[]> {
  const params = new URLSearchParams({
    select: 'id,name,neighborhood,address',
    google_place_id: 'is.null',
    is_active: 'eq.true',
    order: 'name.asc',
    limit: '50',
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/venues?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as VenueRow[];
}

function buildQuery(v: VenueRow): string {
  // Include neighborhood to disambiguate ("AQUA CLUB" alone is ambiguous globally,
  // but the locationbias keeps us in Sarajevo regardless).
  const parts = [v.name];
  if (v.neighborhood) parts.push(v.neighborhood);
  parts.push('Sarajevo');
  return parts.join(' ');
}

async function findPlace(query: string): Promise<FindPlaceCandidate | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', query);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'place_id,name,formatted_address,geometry');
  url.searchParams.set('locationbias', `circle:${RADIUS_M}@${SARAJEVO_LAT},${SARAJEVO_LNG}`);
  url.searchParams.set('key', GOOGLE_KEY);

  const res = await fetch(url);
  const data = (await res.json()) as FindPlaceResponse;

  if (data.status === 'ZERO_RESULTS' || !data.candidates?.length) {
    return null;
  }
  if (data.status !== 'OK') {
    throw new Error(`Google Find Place returned ${data.status}: ${data.error_message ?? ''}`);
  }
  return data.candidates[0];
}

async function updateVenue(venueId: string, candidate: FindPlaceCandidate): Promise<void> {
  const body: Record<string, unknown> = {
    google_place_id: candidate.place_id,
  };
  const loc = candidate.geometry?.location;
  if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
    body.latitude = loc.lat;
    body.longitude = loc.lng;
  }
  if (candidate.formatted_address) {
    body.address = candidate.formatted_address;
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/venues?id=eq.${venueId}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Supabase update failed: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  log('=== findGooglePlaceIds starting ===');
  const venues = await fetchVenuesNeedingPlaceId();
  log(`Found ${venues.length} active venues without a google_place_id`);

  const stats = { found: 0, none: 0, errors: 0 };

  for (const v of venues) {
    const query = buildQuery(v);
    try {
      const candidate = await findPlace(query);
      if (!candidate) {
        log(`  [none] "${v.name}" — Google returned no candidates for "${query}"`);
        stats.none++;
        continue;
      }
      await updateVenue(v.id, candidate);
      const loc = candidate.geometry?.location;
      log(
        `  [match] "${v.name}" → place_id=${candidate.place_id} ` +
          (loc ? `(${loc.lat.toFixed(4)},${loc.lng.toFixed(4)})` : '(no geometry)'),
      );
      stats.found++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`  [error] "${v.name}": ${msg}`);
      stats.errors++;
    }
  }

  log('');
  log('=== findGooglePlaceIds complete ===');
  log(`  Matched : ${stats.found}`);
  log(`  No match: ${stats.none}`);
  log(`  Errors  : ${stats.errors}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
