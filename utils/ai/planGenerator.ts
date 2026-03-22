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
 */
async function enrichStopsWithVenueIds(stops: PlanStop[]): Promise<PlanStop[]> {
  try {
    const { data: venues } = await supabase
      .from('venues')
      .select('id, name, category, neighborhood')
      .limit(1200);

    if (!venues?.length) return stops;

    const venueMap = new Map(venues.map((v) => [v.name.toLowerCase(), v]));

    function findVenue(name: string | undefined) {
      if (!name) return null;
      const lower = name.toLowerCase();
      // Exact match first
      const exact = venueMap.get(lower);
      if (exact) return exact;
      // Partial match
      return venues.find(
        (v) => v.name.toLowerCase().includes(lower) || lower.includes(v.name.toLowerCase()),
      ) ?? null;
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
