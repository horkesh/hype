import { supabase } from '@/integrations/supabase/client';
import { streamEdgeFunction } from './edgeFunctionClient';

export interface PlanStop {
  time: string;
  venue_name: string;
  activity_en?: string;
  activity_bs?: string;
  pitch_en?: string;
  pitch_bs?: string;
  walk_minutes?: number;
  estimated_cost?: number;
  venue?: { id: string; name: string; category?: string; neighborhood?: string } | null;
}

export interface EveningPlan {
  stops: PlanStop[];
  total_cost: number;
  tagline_en?: string;
  tagline_bs?: string;
}

/**
 * Client-side venue enrichment: match AI-generated venue names to DB venue IDs.
 * Venue list is cached for the session to avoid re-fetching 1200 rows per plan.
 */
type VenueRef = { id: string; name: string; category?: string; neighborhood?: string };

// 10-minute TTL on the venue lookup cache. Long enough that repeated plan
// generations within a session reuse the same fetch, short enough that admin
// edits to venues propagate without requiring an app restart.
const VENUE_CACHE_TTL_MS = 10 * 60 * 1000;

let cachedVenueMap: Map<string, VenueRef> | null = null;
let cachedVenueLower: Array<{ lower: string; venue: VenueRef }> | null = null;
let cachedAt = 0;

async function getVenueLookup(): Promise<{
  map: Map<string, VenueRef>;
  lowerList: Array<{ lower: string; venue: VenueRef }>;
}> {
  const stale = Date.now() - cachedAt > VENUE_CACHE_TTL_MS;
  if (cachedVenueMap && cachedVenueLower && !stale) {
    return { map: cachedVenueMap, lowerList: cachedVenueLower };
  }

  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, category, neighborhood')
    .limit(1200);

  if (!venues?.length) return { map: new Map(), lowerList: [] };

  const venueRefs = venues as VenueRef[];
  cachedVenueMap = new Map(venueRefs.map((v) => [v.name.toLowerCase(), v]));
  cachedVenueLower = venueRefs.map((v) => ({ lower: v.name.toLowerCase(), venue: v }));
  cachedAt = Date.now();

  return { map: cachedVenueMap, lowerList: cachedVenueLower };
}

// Allow callers to force-invalidate (e.g. from sign-out / cache-bust hooks).
export function clearVenueLookupCache(): void {
  cachedVenueMap = null;
  cachedVenueLower = null;
  cachedAt = 0;
}

async function enrichStopsWithVenueIds(stops: PlanStop[]): Promise<PlanStop[]> {
  try {
    const { map, lowerList } = await getVenueLookup();
    if (map.size === 0) return stops;

    function findVenue(name: string | undefined): VenueRef | null {
      if (!name) return null;
      const lower = name.toLowerCase();
      // Exact match first
      const exact = map.get(lower);
      if (exact) return exact;
      // Partial match with pre-computed lowercase names
      return lowerList.find(
        (entry) => entry.lower.includes(lower) || lower.includes(entry.lower),
      )?.venue ?? null;
    }

    return stops.map((stop) => ({
      ...stop,
      venue: findVenue(stop.venue_name),
    }));
  } catch {
    return stops;
  }
}

export async function generatePlan(
  params: {
    moods: string[];
    groupSize: number;
    budget: 'casual' | 'mid' | 'premium';
    language: string;
  },
  onProgress?: (text: string) => void,
): Promise<EveningPlan | null> {
  let accumulated = '';
  let buffer = ''; // Handle partial SSE lines split across chunks

  const { error } = await streamEdgeFunction(
    'generate-plan',
    params,
    (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      // Keep the last line in buffer (it may be incomplete)
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              onProgress?.(accumulated);
            }
          } catch {
            // Incomplete JSON fragment, skip
          }
        }
      }
    },
  );

  // Process any remaining buffer
  if (buffer.trim().startsWith('data: ')) {
    const data = buffer.trim().slice(6);
    if (data !== '[DONE]') {
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) accumulated += content;
      } catch { /* skip */ }
    }
  }

  if (error) {
    console.warn('Plan generation stream error:', error);
    return null;
  }

  try {
    const clean = accumulated.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const plan: EveningPlan = JSON.parse(clean);

    // Enrich stops with venue IDs for navigation
    plan.stops = await enrichStopsWithVenueIds(plan.stops);

    return plan;
  } catch {
    console.warn('Failed to parse plan JSON:', accumulated.slice(0, 100));
    return null;
  }
}
