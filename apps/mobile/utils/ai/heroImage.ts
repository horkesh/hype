import { invokeEdgeFunction } from './edgeFunctionClient';

interface HeroImageResult {
  image_url: string;
  cached: boolean;
}

interface HeroImageOptions {
  weather?: { temp: number; condition: string } | null;
}

let cachedImage: { url: string; fetchedAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

export function clearHeroImageCache(): void {
  cachedImage = null;
}

export async function fetchHeroImage(options?: HeroImageOptions): Promise<string | null> {
  // Check client-side cache
  if (cachedImage && Date.now() - cachedImage.fetchedAt < CACHE_TTL) {
    return cachedImage.url;
  }

  const { data, error } = await invokeEdgeFunction<HeroImageResult>('generate-hero-image', {
    weather: options?.weather ?? null,
  });

  if (error || !data?.image_url) return null;

  cachedImage = { url: data.image_url, fetchedAt: Date.now() };
  return data.image_url;
}
