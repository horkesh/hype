import { supabase } from '@/integrations/supabase/client';

export interface VenueCrowdSignal {
  venue_id: string;
  checkin_count: number;
  trending: boolean; // true if count >= 10
}

/**
 * Fetch check-in counts for the last 2 hours, grouped by venue.
 * Tries an RPC first; falls back to a raw query + client-side aggregation.
 */
export async function fetchCrowdSignals(): Promise<Map<string, VenueCrowdSignal>> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  // Try RPC (if a venue_checkin_counts function exists)
  const { data, error } = await supabase.rpc('venue_checkin_counts', {
    since_time: twoHoursAgo,
  });

  // Fallback: raw query
  if (error || !data) {
    const { data: raw } = await supabase
      .from('checkins')
      .select('venue_id')
      .gte('created_at', twoHoursAgo);

    const counts = new Map<string, number>();
    for (const row of raw ?? []) {
      counts.set(row.venue_id, (counts.get(row.venue_id) ?? 0) + 1);
    }

    const result = new Map<string, VenueCrowdSignal>();
    for (const [venue_id, count] of counts) {
      result.set(venue_id, {
        venue_id,
        checkin_count: count,
        trending: count >= 10,
      });
    }
    return result;
  }

  const result = new Map<string, VenueCrowdSignal>();
  for (const row of data) {
    result.set(row.venue_id, {
      venue_id: row.venue_id,
      checkin_count: row.count,
      trending: row.count >= 10,
    });
  }
  return result;
}

/**
 * Fetch trending venues (top N by recent check-ins) with full venue data.
 */
export async function fetchTrendingVenues(limit = 6): Promise<any[]> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: checkins } = await supabase
    .from('checkins')
    .select('venue_id')
    .gte('created_at', twoHoursAgo);

  if (!checkins?.length) return [];

  // Count per venue
  const counts = new Map<string, number>();
  for (const row of checkins) {
    counts.set(row.venue_id, (counts.get(row.venue_id) ?? 0) + 1);
  }

  // Sort by count, take top N
  const topVenueIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topVenueIds.length === 0) return [];

  // Fetch venue details
  const { data: venues } = await supabase
    .from('venues')
    .select('*')
    .in('id', topVenueIds);

  // Attach counts and sort
  return (venues ?? [])
    .map((v) => ({ ...v, checkin_count: counts.get(v.id) ?? 0 }))
    .sort((a, b) => b.checkin_count - a.checkin_count);
}
