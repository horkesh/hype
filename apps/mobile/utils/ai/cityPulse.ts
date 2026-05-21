import { invokeEdgeFunction } from './edgeFunctionClient';

interface CityPulse {
  pulse_bs: string;
  pulse_en: string;
  time_of_day: string;
}

interface CityPulseOptions {
  weather?: { temp: number; condition: string } | null;
}

let cachedPulse: { data: CityPulse; fetchedAt: number } | null = null;
const CACHE_TTL = 2 * 60 * 60 * 1000;

export function clearCityPulseCache(): void {
  cachedPulse = null;
}

export async function fetchCityPulse(options?: CityPulseOptions): Promise<CityPulse | null> {
  if (cachedPulse && Date.now() - cachedPulse.fetchedAt < CACHE_TTL) {
    return cachedPulse.data;
  }
  const { data, error } = await invokeEdgeFunction<CityPulse>('generate-pulse', {
    weather: options?.weather ?? null,
  });
  if (error || !data) return null;
  cachedPulse = { data, fetchedAt: Date.now() };
  return data;
}
