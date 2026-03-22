import type { HeritageWalk, HeritageWalkStop } from './heritageWalkData';

type Lang = 'bs' | 'en';

export function getWalkTitle(walk: HeritageWalk, language: Lang): string {
  return language === 'bs' ? walk.title_bs : walk.title_en;
}

export function getWalkDescription(walk: HeritageWalk, language: Lang): string | null {
  return language === 'bs' ? walk.description_bs : walk.description_en;
}

export function getStopTitle(stop: HeritageWalkStop, language: Lang): string {
  return language === 'bs' ? stop.title_bs : stop.title_en;
}

export function getStopDescription(stop: HeritageWalkStop, language: Lang): string | null {
  return language === 'bs' ? stop.description_bs : stop.description_en;
}

export function getWhatToLookFor(stop: HeritageWalkStop, language: Lang): string | null {
  return language === 'bs' ? stop.what_to_look_for_bs : stop.what_to_look_for_en;
}

export function getWalkSummary(walk: HeritageWalk, language: Lang): string {
  const mins = walk.estimated_minutes;
  const km = walk.distance_km;
  if (language === 'bs') {
    return `${mins} min · ${km} km · ${walk.difficulty === 'easy' ? 'Lagano' : 'Umjereno'}`;
  }
  return `${mins} min · ${km} km · ${walk.difficulty.charAt(0).toUpperCase() + walk.difficulty.slice(1)}`;
}

export function getHeritageWalksLabel(language: Lang) {
  return {
    title: language === 'bs' ? 'Šetnje kroz historiju' : 'Heritage Walks',
    subtitle: language === 'bs' ? 'Sadržaj: Visit Sarajevo' : 'Content by Visit Sarajevo',
  };
}
