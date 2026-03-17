import { invokeEdgeFunction } from './edgeFunctionClient';

interface CityPulse {
  pulse_bs: string;
  pulse_en: string;
  time_of_day: string;
}

let cachedPulse: { data: CityPulse; fetchedAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000;

export async function fetchCityPulse(): Promise<CityPulse | null> {
  if (cachedPulse && Date.now() - cachedPulse.fetchedAt < CACHE_TTL) {
    return cachedPulse.data;
  }
  const { data, error } = await invokeEdgeFunction<CityPulse>('generate-pulse', {});
  if (error || !data) return null;
  cachedPulse = { data, fetchedAt: Date.now() };
  return data;
}
