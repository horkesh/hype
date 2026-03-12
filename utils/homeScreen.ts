import {
  HomeEventSeries,
  HomeVenue,
  loadHomeEventSeries,
  loadHomeRandomCafe,
  loadHomeUpcomingEvents,
  loadHomeWeather,
} from '@/utils/homeData';
import { getHomeHeroState, HomeLanguage } from '@/utils/homeHeroState';
import { mergeSuggestedMood } from '@/utils/homeWeather';

export interface HomeStaticContent {
  eventSeries: HomeEventSeries[];
  heroMessage: string;
  randomCafe: HomeVenue | null;
  suggestedMood: string | null;
}

export async function loadHomeStaticContent(
  language: HomeLanguage
): Promise<HomeStaticContent> {
  const [randomCafe, eventSeries, weather] = await Promise.all([
    loadHomeRandomCafe(),
    loadHomeEventSeries(),
    loadHomeWeather().catch((error) => {
      console.error('Home weather fetch failed, using fallback message', error);
      return null;
    }),
  ]);

  const { heroMessage, suggestedMood } = getHomeHeroState(language, weather, new Date().getHours());

  return {
    eventSeries,
    heroMessage,
    randomCafe,
    suggestedMood,
  };
}

export async function loadHomeEventsForMood(selectedMood: string | null) {
  return loadHomeUpcomingEvents(selectedMood);
}

export function mergeHomeSuggestedMood(
  currentMood: string | null,
  suggestedMood: string | null
) {
  return mergeSuggestedMood(currentMood, suggestedMood);
}
