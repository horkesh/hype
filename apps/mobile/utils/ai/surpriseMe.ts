import { invokeEdgeFunction } from './edgeFunctionClient';

export interface SurprisePlan {
  stops: Array<{
    venue_name: string;
    time: string;
    pitch_en?: string;
    pitch_bs?: string;
    venue?: { id: string; name: string; category?: string; neighborhood?: string } | null;
  }>;
  tagline_en?: string;
  tagline_bs?: string;
}

export async function fetchSurprise(
  moods: string[] = [],
  language: string = 'en',
): Promise<SurprisePlan | null> {
  const { data, error } = await invokeEdgeFunction<SurprisePlan>('surprise-me', { moods, language });
  if (error || !data) return null;
  return data;
}
