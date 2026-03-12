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
  { id: 'party', emoji: '\u{1F389}', labelKey: 'moodParty' },
  { id: 'chill', emoji: '\u{1F60E}', labelKey: 'moodChill' },
  { id: 'girls_night', emoji: '\u{1F483}', labelKey: 'moodGirlsNight' },
  { id: 'date_night', emoji: '\u{1F491}', labelKey: 'moodDateNight' },
  { id: 'music', emoji: '\u{1F3B5}', labelKey: 'moodMusic' },
  { id: 'romance', emoji: '\u{1F377}', labelKey: 'moodRomance' },
  { id: 'culture', emoji: '\u{1F3AD}', labelKey: 'moodCulture' },
  { id: 'foodie', emoji: '\u{1F37D}', labelKey: 'moodFoodie' },
  { id: 'brunch', emoji: '\u{1F373}', labelKey: 'moodBrunch' },
  { id: 'after_work', emoji: '\u{1F37B}', labelKey: 'moodAfterWork' },
  { id: 'outdoor', emoji: '\u{1F33F}', labelKey: 'moodOutdoor' },
  { id: 'tourist', emoji: '\u{1F9F3}', labelKey: 'moodTourist' },
];

export const EXPLORE_CATEGORIES: ExploreLookupItem[] = [
  { id: 'restaurant', emoji: '\u{1F37D}', labelKey: 'categoryRestaurants' },
  { id: 'bar', emoji: '\u{1F37A}', labelKey: 'categoryBars' },
  { id: 'club', emoji: '\u{1F3B5}', labelKey: 'categoryClubs' },
  { id: 'theater', emoji: '\u{1F3AD}', labelKey: 'categoryTheater' },
  { id: 'cinema', emoji: '\u{1F3AC}', labelKey: 'categoryCinema' },
  { id: 'exhibition', emoji: '\u{1F3A8}', labelKey: 'categoryExhibitions' },
  { id: 'concert', emoji: '\u{1F3A4}', labelKey: 'categoryConcerts' },
  { id: 'festival', emoji: '\u{1F3AA}', labelKey: 'categoryFestivals' },
];
