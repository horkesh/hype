import { getTimeOfDayHeroMessage } from '@/utils/homeScreenContent';

export type HomeLanguage = 'bs' | 'en';

const WEATHER_MESSAGES = {
  clear: {
    bs: 'Savr\u0161en dan za ba\u0161tu! \u2600\ufe0f',
    en: 'Perfect day for outdoor plans! \u2600\ufe0f',
  },
  rain: {
    bs: 'Ki\u0161ovito vrijeme, idealno za kafi\u0107 \ud83c\udf27\ufe0f',
    en: 'Rainy weather, perfect for a cafe \ud83c\udf27\ufe0f',
  },
  cold: {
    bs: 'Hladno je, vrijeme za topli napitak \u2615',
    en: 'Cold outside, time for a warm drink \u2615',
  },
} as const;

export function getHomeHeroState(
  language: HomeLanguage,
  weather: { temp: number; weatherCondition: string } | null,
  hour: number
): {
  heroMessage: string;
  suggestedMood: string | null;
} {
  const baseMessage = getTimeOfDayHeroMessage(language, hour);

  if (!weather) {
    return { heroMessage: baseMessage, suggestedMood: null };
  }

  if (weather.weatherCondition.includes('clear') && weather.temp > 20) {
    return {
      heroMessage: WEATHER_MESSAGES.clear[language],
      suggestedMood: 'outdoor',
    };
  }

  if (weather.weatherCondition.includes('rain')) {
    return {
      heroMessage: WEATHER_MESSAGES.rain[language],
      suggestedMood: 'chill',
    };
  }

  if (weather.temp < 10) {
    return {
      heroMessage: WEATHER_MESSAGES.cold[language],
      suggestedMood: 'chill',
    };
  }

  return { heroMessage: baseMessage, suggestedMood: null };
}
