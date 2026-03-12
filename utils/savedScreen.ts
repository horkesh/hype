export interface SavedVenue {
  id: string;
  name: string;
  category: string;
  neighborhood: string | null;
  price_level: number;
  moods: string[];
  cover_image_url: string | null;
}

export interface SavedEvent {
  id: string;
  title_bs: string;
  title_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  price_bam: number | null;
  venues?: {
    name: string;
  } | null;
  location_name: string | null;
}

export interface SavedBadge {
  id: string;
  badge_key: string;
  name_bs: string;
  name_en: string;
  description_bs: string;
  description_en: string;
  icon: string;
  criteria: any;
  is_active: boolean;
}

export type SavedTabKey = 'venues' | 'events' | 'badges';

export const SAVED_MOODS: Record<string, string> = {
  party: '🎉',
  chill: '😌',
  girls_night: '👯',
  date_night: '💑',
  music: '🎵',
  romance: '💕',
  culture: '🎭',
  foodie: '🍽️',
  brunch: '🥐',
  after_work: '🍻',
  outdoor: '🌳',
  tourist: '📸',
};

export const DEMO_EARNED_BADGES = ['kafedzija', 'explorer', 'hype_og'];

export function getSavedPriceLevelDisplay(level: number): string {
  return '\u20ac'.repeat(level);
}

export function formatSavedEventDate(dateString: string, atLabel: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${day}.${month}. ${atLabel} ${hours}:${formattedMinutes}`;
}

export function getSavedBadgeProgress(
  badgeKey: string
): { current: number; total: number } {
  const mockProgress: Record<string, { current: number; total: number }> = {
    kafedzija: { current: 10, total: 10 },
    nocna_ptica: { current: 2, total: 5 },
    kulturnjak: { current: 1, total: 5 },
    gurman: { current: 4, total: 10 },
    explorer: { current: 3, total: 3 },
    svaki_mood: { current: 8, total: 12 },
    storyteller: { current: 3, total: 10 },
    mahala_local: { current: 15, total: 30 },
    hype_og: { current: 1, total: 1 },
    underground_vip: { current: 1, total: 5 },
  };

  return mockProgress[badgeKey] || { current: 0, total: 10 };
}

export function formatSavedBadgeDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}
