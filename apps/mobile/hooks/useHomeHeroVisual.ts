import { useEffect, useState } from 'react';

import { fetchHeroImage } from '@/utils/ai/heroImage';
import { loadHomeWeather } from '@/utils/homeData';

interface HomeHeroWeather {
  temp: number;
  condition: string;
}

export function useHomeHeroVisual() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [weather, setWeather] = useState<HomeHeroWeather | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const weatherResult = await loadHomeWeather().catch(() => null);
      const mappedWeather = weatherResult
        ? { temp: weatherResult.temp, condition: weatherResult.weatherCondition }
        : null;

      if (mounted) {
        setWeather(mappedWeather);
      }

      const url = await fetchHeroImage({ weather: mappedWeather }).catch(() => null);
      if (mounted && url) {
        setHeroImageUrl(url);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { heroImageUrl, weather };
}
