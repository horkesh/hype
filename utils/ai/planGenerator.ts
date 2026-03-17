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
  venue?: any;
}

export interface EveningPlan {
  stops: PlanStop[];
  total_cost: number;
  tagline_en?: string;
  tagline_bs?: string;
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

  const { error } = await streamEdgeFunction(
    'generate-plan',
    params,
    (chunk) => {
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              onProgress?.(accumulated);
            }
          } catch {
            // Non-JSON line, skip
          }
        }
      }
    },
  );

  if (error) {
    console.warn('Plan generation stream error:', error);
    return null;
  }

  try {
    const clean = accumulated.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    console.warn('Failed to parse plan JSON:', accumulated.slice(0, 100));
    return null;
  }
}
