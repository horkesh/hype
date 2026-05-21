/**
 * seedCheckins.ts
 *
 * Generate realistic demo check-in data for crowd signals.
 * Inserts 0-25 check-ins per venue (last 3 hours) for the top 50 venues by google_rating.
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/seedCheckins.ts
 */

import {
  fetchSupabaseAdminJson,
  requestSupabaseAdminNoContent,
} from '../lib/supabaseAdmin.js';

interface Venue {
  id: string;
  name: string;
  google_rating: number | null;
}

interface CheckinRow {
  id?: string;
  user_id?: string | null;
  venue_id: string;
  created_at: string;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate a random timestamp within the last `hoursAgo` hours. */
function randomRecentTimestamp(hoursAgo: number): string {
  const now = Date.now();
  const offset = Math.random() * hoursAgo * 60 * 60 * 1000;
  return new Date(now - offset).toISOString();
}

/**
 * Assign a check-in count based on a realistic distribution:
 *   - Top 20% of venues (by index after sorting by rating): 15-25 (popular)
 *   - Middle 50%: 3-10 (average)
 *   - Bottom 30%: 0-2 (quiet, some get zero)
 */
function checkinCountForRank(rank: number, total: number): number {
  const pct = rank / total;
  if (pct < 0.2) return randomInt(15, 25);
  if (pct < 0.7) return randomInt(3, 10);
  return randomInt(0, 2);
}

async function main() {
  // 1. Clean stale demo check-ins (older than 6 hours)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  console.log('Clearing old demo check-ins (older than 6 h)...');
  await requestSupabaseAdminNoContent(
    `/rest/v1/checkins?created_at=lt.${sixHoursAgo}`,
    { method: 'DELETE' },
  );

  // 2. Fetch top 50 venues by google_rating
  console.log('Fetching top 50 venues by google_rating...');
  const venues = await fetchSupabaseAdminJson<Venue[]>(
    '/rest/v1/venues?select=id,name,google_rating&order=google_rating.desc.nullslast&limit=50',
  );

  if (!venues.length) {
    console.log('No venues found. Aborting.');
    return;
  }
  console.log(`Found ${venues.length} venues.`);

  // 3. Build check-in rows
  const rows: CheckinRow[] = [];

  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i];
    const count = checkinCountForRank(i, venues.length);

    for (let j = 0; j < count; j++) {
      rows.push({
        user_id: null, // Anonymous demo check-ins
        venue_id: venue.id,
        created_at: randomRecentTimestamp(3),
      });
    }

    if (count > 0) {
      console.log(`  ${venue.name}: ${count} check-ins`);
    }
  }

  if (rows.length === 0) {
    console.log('No check-ins to insert.');
    return;
  }

  // 4. Batch insert (Supabase REST accepts an array body)
  console.log(`\nInserting ${rows.length} check-ins...`);
  await requestSupabaseAdminNoContent(
    '/rest/v1/checkins',
    {
      method: 'POST',
      body: JSON.stringify(rows),
    },
  );

  console.log('Seed complete.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
