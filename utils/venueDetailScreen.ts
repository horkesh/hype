export type VenueDetailLanguage = 'bs' | 'en';

export type VenueDetailTabKey = 'info' | 'events' | 'specials';

export interface VenueOpeningHoursPeriod {
  open: string;
  close: string;
}

export type VenueOpeningHours = Record<number, VenueOpeningHoursPeriod[] | undefined> | null | undefined;

export interface VenueDetailVenue {
  id: string;
  name: string;
  cover_image_url: string | null;
  category: string;
  category_emoji: string;
  price_level: number;
  moods: string[];
  opening_hours: VenueOpeningHours;
  is_hidden_gem: boolean;
  insider_tip: string | null;
  address: string;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  delivery_korpa_url: string | null;
  delivery_glovo_url: string | null;
  description_bs: string;
  description_en: string;
  latitude: number;
  longitude: number;
}

export interface VenueDetailEvent {
  id: string;
  title_bs: string;
  title_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  price_bam: number | null;
  ticket_url: string | null;
}

export interface VenueDetailSpecial {
  id: string;
  menu_title: string;
  price: number;
  valid_times: string;
  description: string | null;
}

export interface VenueMoodOption {
  id: string;
  emoji: string;
  labelKey: string;
}

export const VENUE_MOODS: VenueMoodOption[] = [
  { id: 'party', emoji: '\ud83c\udf89', labelKey: 'moodParty' },
  { id: 'chill', emoji: '\ud83d\ude0e', labelKey: 'moodChill' },
  { id: 'girls_night', emoji: '\ud83d\udc83', labelKey: 'moodGirlsNight' },
  { id: 'date_night', emoji: '\ud83d\udc91', labelKey: 'moodDateNight' },
  { id: 'music', emoji: '\ud83c\udfb5', labelKey: 'moodMusic' },
  { id: 'romance', emoji: '\ud83c\udf77', labelKey: 'moodRomance' },
  { id: 'culture', emoji: '\ud83c\udfad', labelKey: 'moodCulture' },
  { id: 'foodie', emoji: '\ud83c\udf7d\ufe0f', labelKey: 'moodFoodie' },
  { id: 'brunch', emoji: '\ud83c\udf73', labelKey: 'moodBrunch' },
  { id: 'after_work', emoji: '\ud83c\udf7b', labelKey: 'moodAfterWork' },
  { id: 'outdoor', emoji: '\ud83c\udf3f', labelKey: 'moodOutdoor' },
  { id: 'tourist', emoji: '\ud83e\uddf3', labelKey: 'moodTourist' },
];

const DAYS_OF_WEEK: Record<VenueDetailLanguage, string[]> = {
  bs: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', '\u010cetvrtak', 'Petak', 'Subota'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

export function getVenueDetailCopy(language: VenueDetailLanguage) {
  return {
    back: language === 'bs' ? 'Nazad' : 'Back',
    notFound: language === 'bs' ? 'Mjesto nije prona\u0111eno' : 'Venue not found',
    open: language === 'bs' ? 'Otvoreno' : 'Open',
    closed: language === 'bs' ? 'Zatvoreno' : 'Closed',
    unknown: language === 'bs' ? 'Nepoznato' : 'Unknown',
    hide: language === 'bs' ? 'Sakrij' : 'Hide',
    showAll: language === 'bs' ? 'Prika\u017ei sve' : 'Show all',
    navigate: language === 'bs' ? 'Navigacija' : 'Navigate',
    call: language === 'bs' ? 'Pozovi' : 'Call',
    save: language === 'bs' ? 'Sa\u010duvaj' : 'Save',
    hiddenGem: language === 'bs' ? 'Skriveni dragulj' : 'Hidden gem',
    info: language === 'bs' ? 'Info' : 'Info',
    events: language === 'bs' ? 'Doga\u0111aji' : 'Events',
    specials: language === 'bs' ? 'Ponude' : 'Specials',
    noEvents: language === 'bs' ? 'Nema nadolaze\u0107ih doga\u0111aja' : 'No upcoming events',
    noSpecials: language === 'bs' ? 'Nema aktivnih ponuda' : 'No active specials',
    valid: language === 'bs' ? 'Vrijedi' : 'Valid',
    free: language === 'bs' ? 'Besplatan' : 'Free',
    signInRequiredTitle: language === 'bs' ? 'Prijava je potrebna' : 'Sign in required',
    signInRequiredMessage:
      language === 'bs'
        ? 'Prijavite se iz Profil ekrana kako biste sa\u010duvali mjesta.'
        : 'Please sign in from Profile to save venues.',
    web: 'Web',
    instagram: 'Instagram',
    korpa: 'Korpa',
    glovo: 'Glovo',
    location: language === 'bs' ? 'Lokacija' : 'Location',
  };
}

export function getVenuePriceLevelDisplay(level: number): string {
  return '\u20ac'.repeat(Math.max(0, level));
}

export function formatVenueEventDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}.${month}. ${hours}:${minutes}`;
}

export function getVenueEventTitle(
  event: Pick<VenueDetailEvent, 'title_bs' | 'title_en'>,
  language: VenueDetailLanguage
): string {
  return language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
}

export function getVenueDescription(
  venue: Pick<VenueDetailVenue, 'description_bs' | 'description_en'>,
  language: VenueDetailLanguage
): string {
  return language === 'bs' ? venue.description_bs : venue.description_en;
}

export function isVenueOpenNow(
  openingHours: VenueOpeningHours,
  now: Date = new Date()
): boolean {
  if (!openingHours) {
    return false;
  }

  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todaySchedule = openingHours[currentDay];

  if (!todaySchedule || todaySchedule.length === 0) {
    return false;
  }

  return todaySchedule.some((period) => {
    const [openHour, openMinute] = period.open.split(':').map(Number);
    const [closeHour, closeMinute] = period.close.split(':').map(Number);

    if (!Number.isFinite(openHour) || !Number.isFinite(openMinute)) {
      return false;
    }

    if (!Number.isFinite(closeHour) || !Number.isFinite(closeMinute)) {
      return false;
    }

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  });
}

export function getVenueTodayHours(
  openingHours: VenueOpeningHours,
  language: VenueDetailLanguage,
  now: Date = new Date()
): string {
  const copy = getVenueDetailCopy(language);

  if (!openingHours) {
    return copy.unknown;
  }

  const currentDay = now.getDay();
  const todaySchedule = openingHours[currentDay];

  if (!todaySchedule || todaySchedule.length === 0) {
    return copy.closed;
  }

  return todaySchedule.map((period) => `${period.open} - ${period.close}`).join(', ');
}

export function getVenueHoursRows(
  openingHours: VenueOpeningHours,
  language: VenueDetailLanguage
): { day: number; dayName: string; hoursText: string }[] {
  const copy = getVenueDetailCopy(language);

  return DAYS_OF_WEEK[language].map((dayName, day) => {
    const schedule = openingHours?.[day];
    const hoursText =
      schedule && schedule.length > 0
        ? schedule.map((period) => `${period.open} - ${period.close}`).join(', ')
        : copy.closed;

    return {
      day,
      dayName,
      hoursText,
    };
  });
}
