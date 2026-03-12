export interface Venue {
  id: string;
  name: string;
  category: string;
  neighborhood: string | null;
  price_level: number;
  moods: string[];
  opening_hours: any;
  cover_image_url: string | null;
}

export interface Event {
  id: string;
  title_bs: string;
  title_en: string | null;
}

export interface DailySpecial {
  id: string;
  venue_id?: string;
  venue_name: string;
  menu_title: string;
  price: number;
  valid_times: string;
  is_active: boolean;
  description?: string | null;
}

export interface SearchResult {
  id: string;
  name: string;
  type: 'venue' | 'event';
}

export interface ExploreLookupItem {
  id: string;
  emoji: string;
  labelKey: string;
}

export const EXPLORE_MOODS: ExploreLookupItem[] = [
  { id: 'party', emoji: '🎉', labelKey: 'moodParty' },
  { id: 'chill', emoji: '😎', labelKey: 'moodChill' },
  { id: 'girls_night', emoji: '💃', labelKey: 'moodGirlsNight' },
  { id: 'date_night', emoji: '💑', labelKey: 'moodDateNight' },
  { id: 'music', emoji: '🎵', labelKey: 'moodMusic' },
  { id: 'romance', emoji: '🍷', labelKey: 'moodRomance' },
  { id: 'culture', emoji: '🎭', labelKey: 'moodCulture' },
  { id: 'foodie', emoji: '🍽️', labelKey: 'moodFoodie' },
  { id: 'brunch', emoji: '🍳', labelKey: 'moodBrunch' },
  { id: 'after_work', emoji: '🍻', labelKey: 'moodAfterWork' },
  { id: 'outdoor', emoji: '🌿', labelKey: 'moodOutdoor' },
  { id: 'tourist', emoji: '🧳', labelKey: 'moodTourist' },
];

export const EXPLORE_CATEGORIES: ExploreLookupItem[] = [
  { id: 'restaurant', emoji: '🍽️', labelKey: 'categoryRestaurants' },
  { id: 'bar', emoji: '🍺', labelKey: 'categoryBars' },
  { id: 'club', emoji: '🎵', labelKey: 'categoryClubs' },
  { id: 'theater', emoji: '🎭', labelKey: 'categoryTheater' },
  { id: 'cinema', emoji: '🎬', labelKey: 'categoryCinema' },
  { id: 'exhibition', emoji: '🎨', labelKey: 'categoryExhibitions' },
  { id: 'concert', emoji: '🎤', labelKey: 'categoryConcerts' },
  { id: 'festival', emoji: '🎪', labelKey: 'categoryFestivals' },
];
