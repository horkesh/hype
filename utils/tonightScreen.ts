export interface Event {
  id: string;
  title_bs: string;
  title_en: string | null;
  description_bs: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  price_bam: number | null;
  ticket_url: string | null;
  source: string | null;
  moods: string[];
  category: string;
  venues?: {
    name: string;
  } | null;
  location_name: string | null;
}

export interface Venue {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

export interface PlanStop {
  time: string;
  venueName: string;
  activity: string;
  price: number;
}

export interface AIPlan {
  stops: PlanStop[];
  total: number;
}

export type TimeSegment = 'morning' | 'lunch' | 'evening' | 'night';

export interface TimeSegmentConfig {
  key: TimeSegment;
  emoji: string;
  label: string;
  startHour: number;
  endHour: number;
}

export type MoodId =
  | 'date_night'
  | 'party'
  | 'chill'
  | 'culture'
  | 'girlsnight'
  | 'outdoor'
  | 'foodie'
  | 'live_music'
  | 'sports'
  | 'art'
  | 'coffee'
  | 'drinks';

export const TONIGHT_MOODS: { id: MoodId; emoji: string; label_bs: string; label_en: string }[] = [
  { id: 'date_night', emoji: '\u{1F496}', label_bs: 'Romantika', label_en: 'Date Night' },
  { id: 'party', emoji: '\u{1F389}', label_bs: 'Zurka', label_en: 'Party' },
  { id: 'chill', emoji: '\u{1F60C}', label_bs: 'Opusteno', label_en: 'Chill' },
  { id: 'culture', emoji: '\u{1F3AD}', label_bs: 'Kultura', label_en: 'Culture' },
  { id: 'girlsnight', emoji: '\u{1F46F}', label_bs: 'Girls night', label_en: 'Girls Night' },
  { id: 'outdoor', emoji: '\u{1F333}', label_bs: 'Napolju', label_en: 'Outdoor' },
  { id: 'foodie', emoji: '\u{1F37D}', label_bs: 'Gurmani', label_en: 'Foodie' },
  { id: 'live_music', emoji: '\u{1F3B8}', label_bs: 'Live muzika', label_en: 'Live Music' },
  { id: 'sports', emoji: '\u26BD', label_bs: 'Sport', label_en: 'Sports' },
  { id: 'art', emoji: '\u{1F3A8}', label_bs: 'Umjetnost', label_en: 'Art' },
  { id: 'coffee', emoji: '\u2615', label_bs: 'Kafa', label_en: 'Coffee' },
  { id: 'drinks', emoji: '\u{1F379}', label_bs: 'Pice', label_en: 'Drinks' },
];

export function isFreeEvent(price: number | null): boolean {
  return price === null || price === 0;
}

export function buildTonightSegments(t: (key: string) => string): TimeSegmentConfig[] {
  return [
    { key: 'morning', emoji: '\u2615', label: t('morning'), startHour: 6, endHour: 12 },
    { key: 'lunch', emoji: '\u{1F37D}', label: t('lunch'), startHour: 12, endHour: 17 },
    { key: 'evening', emoji: '\u{1F306}', label: t('evening'), startHour: 17, endHour: 22 },
    { key: 'night', emoji: '\u{1F319}', label: t('night'), startHour: 22, endHour: 6 },
  ];
}

function pickVenueName(list: Venue[], fallback: string): string {
  if (list.length === 0) {
    return fallback;
  }

  return list[Math.floor(Math.random() * list.length)]?.name || fallback;
}

export function generateMockTonightPlan(mood: MoodId, index: number, venues: Venue[]): AIPlan {
  const restaurantVenues = venues.filter((venue) => venue.category === 'restaurant');
  const barVenues = venues.filter((venue) => venue.category === 'bar');
  const clubVenues = venues.filter((venue) => venue.category === 'club');

  const plans: Record<MoodId, AIPlan[]> = {
    date_night: [
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Dveri'), activity: 'Vecera', price: 45 },
          { time: '21:30', venueName: pickVenueName(barVenues, 'Zlatna Ribica'), activity: 'Kokteli', price: 30 },
        ],
        total: 75,
      },
      {
        stops: [
          { time: '19:30', venueName: pickVenueName(restaurantVenues, 'Park Princeva'), activity: 'Vecera', price: 50 },
          { time: '22:00', venueName: pickVenueName(barVenues, 'Kino Bosna'), activity: 'Pice', price: 25 },
        ],
        total: 75,
      },
    ],
    party: [
      {
        stops: [
          { time: '20:00', venueName: pickVenueName(restaurantVenues, 'Burger Inc'), activity: 'Vecera', price: 30 },
          { time: '22:00', venueName: pickVenueName(barVenues, 'Hacienda'), activity: 'Kokteli', price: 35 },
          { time: '00:00', venueName: pickVenueName(clubVenues, 'Club Trezor'), activity: 'Party', price: 15 },
        ],
        total: 80,
      },
      {
        stops: [
          { time: '21:00', venueName: pickVenueName(barVenues, 'Blind Tiger'), activity: 'Drinks', price: 40 },
          { time: '23:30', venueName: pickVenueName(clubVenues, 'Kino Bosna'), activity: 'Party', price: 20 },
        ],
        total: 60,
      },
    ],
    chill: [
      {
        stops: [
          { time: '18:00', venueName: pickVenueName(restaurantVenues, 'Karuzo'), activity: 'Vecera', price: 35 },
          { time: '20:30', venueName: pickVenueName(barVenues, 'Cafe Tito'), activity: 'Pice', price: 20 },
        ],
        total: 55,
      },
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Mala Kuhinja'), activity: 'Vecera', price: 40 },
          { time: '21:00', venueName: pickVenueName(barVenues, 'Pivnica HS'), activity: 'Pivo', price: 15 },
        ],
        total: 55,
      },
    ],
    culture: [
      {
        stops: [
          { time: '18:00', venueName: 'Narodno pozoriste', activity: 'Predstava', price: 20 },
          { time: '21:00', venueName: pickVenueName(restaurantVenues, 'Dveri'), activity: 'Vecera', price: 45 },
        ],
        total: 65,
      },
      {
        stops: [
          { time: '19:00', venueName: 'Kino Meeting Point', activity: 'Film', price: 10 },
          { time: '21:30', venueName: pickVenueName(barVenues, 'Zlatna Ribica'), activity: 'Pice', price: 25 },
        ],
        total: 35,
      },
    ],
    girlsnight: [
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Mash'), activity: 'Vecera', price: 40 },
          { time: '21:30', venueName: pickVenueName(barVenues, 'Hacienda'), activity: 'Kokteli', price: 35 },
          { time: '23:30', venueName: pickVenueName(clubVenues, 'Club Trezor'), activity: 'Party', price: 15 },
        ],
        total: 90,
      },
      {
        stops: [
          { time: '20:00', venueName: pickVenueName(restaurantVenues, 'Karuzo'), activity: 'Vecera', price: 35 },
          { time: '22:00', venueName: pickVenueName(barVenues, 'Blind Tiger'), activity: 'Drinks', price: 30 },
        ],
        total: 65,
      },
    ],
    outdoor: [
      {
        stops: [
          { time: '18:00', venueName: pickVenueName(restaurantVenues, 'Park Princeva'), activity: 'Vecera', price: 45 },
          { time: '20:30', venueName: pickVenueName(barVenues, 'Cafe Tito'), activity: 'Pice', price: 25 },
        ],
        total: 70,
      },
    ],
    foodie: [
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Dveri'), activity: 'Vecera', price: 50 },
          { time: '21:30', venueName: pickVenueName(barVenues, 'Zlatna Ribica'), activity: 'Digestiv', price: 20 },
        ],
        total: 70,
      },
    ],
    live_music: [
      {
        stops: [
          { time: '20:00', venueName: pickVenueName(restaurantVenues, 'Karuzo'), activity: 'Vecera', price: 35 },
          { time: '22:00', venueName: pickVenueName(barVenues, 'Kino Bosna'), activity: 'Live muzika', price: 25 },
        ],
        total: 60,
      },
    ],
    sports: [
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(barVenues, 'Pivnica HS'), activity: 'Utakmica', price: 20 },
          { time: '21:30', venueName: pickVenueName(restaurantVenues, 'Burger Inc'), activity: 'Vecera', price: 30 },
        ],
        total: 50,
      },
    ],
    art: [
      {
        stops: [
          { time: '18:00', venueName: 'Galerija 11/07/95', activity: 'Izlozba', price: 10 },
          { time: '20:00', venueName: pickVenueName(restaurantVenues, 'Dveri'), activity: 'Vecera', price: 45 },
        ],
        total: 55,
      },
    ],
    coffee: [
      {
        stops: [
          { time: '17:00', venueName: pickVenueName(barVenues, 'Cafe Tito'), activity: 'Kafa', price: 10 },
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Mala Kuhinja'), activity: 'Vecera', price: 40 },
        ],
        total: 50,
      },
    ],
    drinks: [
      {
        stops: [
          { time: '20:00', venueName: pickVenueName(barVenues, 'Hacienda'), activity: 'Kokteli', price: 35 },
          { time: '22:30', venueName: pickVenueName(barVenues, 'Blind Tiger'), activity: 'Drinks', price: 30 },
        ],
        total: 65,
      },
    ],
  };

  const moodPlans = plans[mood] || plans.chill;
  return moodPlans[index % moodPlans.length];
}

export function buildTonightPlanShareText(language: string, currentPlan: AIPlan): string {
  const planText = currentPlan.stops
    .map((stop, index) => `${index + 1}. ${stop.time} - ${stop.venueName} - ${stop.activity} - ~${stop.price} KM`)
    .join('\n');

  return `${language === 'bs' ? 'Moj plan za veceras' : 'My plan for tonight'}:\n\n${planText}\n\n${
    language === 'bs' ? 'Ukupno' : 'Total'
  }: ~${currentPlan.total} KM\n\n${language === 'bs' ? 'Kreirano sa Hype app' : 'Created with Hype app'}`;
}

export function buildTonightVoteShareText(language: string, voteLink: string): string {
  return `${language === 'bs' ? 'Glasaj za veceras!' : 'Vote for tonight!'}\n\n${voteLink}\n\n${
    language === 'bs' ? 'Kreirano sa Hype app' : 'Created with Hype app'
  }`;
}
