export type SeriesDetailLanguage = 'bs' | 'en';

export interface SeriesDetailSeries {
  id: string;
  name_bs: string;
  name_en: string;
  description_bs: string | null;
  description_en: string | null;
  start_date: string;
  end_date: string;
  category: string;
  cover_image_url: string | null;
  website_url: string | null;
  ticket_url: string | null;
  is_active: boolean;
}

export interface SeriesDetailEvent {
  id: string;
  title_bs: string;
  title_en: string | null;
  start_datetime: string;
  price_bam: number | null;
  ticket_url: string | null;
  moods: string[];
  venues?: {
    name: string;
  } | null;
  location_name: string | null;
}

const MONTH_NAMES: Record<SeriesDetailLanguage, string[]> = {
  bs: [
    'januar',
    'februar',
    'mart',
    'april',
    'maj',
    'juni',
    'juli',
    'august',
    'septembar',
    'oktobar',
    'novembar',
    'decembar',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

const DAY_NAMES: Record<SeriesDetailLanguage, string[]> = {
  bs: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', '\u010cetvrtak', 'Petak', 'Subota'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

export const SERIES_CATEGORY_EMOJIS: Record<string, string> = {
  music: '\ud83c\udfb5',
  food: '\ud83c\udf7d\ufe0f',
  culture: '\ud83c\udfad',
  sport: '\u26bd',
  nightlife: '\ud83c\udf19',
  art: '\ud83c\udfa8',
  film: '\ud83c\udfac',
  theatre: '\ud83c\udfad',
  festival: '\ud83c\udfaa',
  market: '\ud83d\uded2',
  workshop: '\ud83d\udd28',
  charity: '\u2764\ufe0f',
  other: '\ud83c\udfaa',
};

export const SERIES_MOOD_EMOJIS: Record<string, string> = {
  party: '\ud83c\udf89',
  chill: '\ud83d\ude0e',
  girls_night: '\ud83d\udc83',
  date_night: '\ud83d\udc91',
  music: '\ud83c\udfb5',
  romance: '\ud83c\udf77',
  culture: '\ud83c\udfad',
  foodie: '\ud83c\udf7d\ufe0f',
  brunch: '\ud83c\udf73',
  after_work: '\ud83c\udf7b',
  outdoor: '\ud83c\udf3f',
  tourist: '\ud83e\uddf3',
};

export function getSeriesTitle(
  series: Pick<SeriesDetailSeries, 'name_bs' | 'name_en'>,
  language: SeriesDetailLanguage
): string {
  return language === 'bs' ? series.name_bs : (series.name_en || series.name_bs);
}

export function getSeriesDescription(
  series: Pick<SeriesDetailSeries, 'description_bs' | 'description_en'>,
  language: SeriesDetailLanguage
): string | null {
  return language === 'bs'
    ? (series.description_bs || series.description_en)
    : (series.description_en || series.description_bs);
}

export function getSeriesCategoryEmoji(category: string): string {
  return SERIES_CATEGORY_EMOJIS[category] || SERIES_CATEGORY_EMOJIS.other;
}

export function getSeriesCountdownStatus(
  series: Pick<SeriesDetailSeries, 'start_date' | 'end_date'>,
  language: SeriesDetailLanguage,
  now: Date = new Date()
): string {
  const start = toLocalCalendarDate(series.start_date);
  const end = toLocalCalendarDate(series.end_date);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (today < start) {
    const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return language === 'bs'
      ? `Po\u010dinje za ${diffDays} dana`
      : `Starts in ${diffDays} days`;
  }

  if (today <= end) {
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return language === 'bs'
      ? `U toku - jo\u0161 ${diffDays} dana`
      : `Ongoing - ${diffDays} days left`;
  }

  return language === 'bs' ? 'Zavr\u0161eno' : 'Ended';
}

export function formatSeriesDateRange(
  series: Pick<SeriesDetailSeries, 'start_date' | 'end_date'>,
  language: SeriesDetailLanguage
): string {
  const start = toLocalCalendarDate(series.start_date);
  const end = toLocalCalendarDate(series.end_date);
  const month = MONTH_NAMES[language][start.getMonth()];

  return `${start.getDate()}. - ${end.getDate()}. ${month} ${start.getFullYear()}`;
}

export function formatSeriesEventDate(
  dateString: string,
  language: SeriesDetailLanguage
): string {
  const date = new Date(dateString);
  const dayName = DAY_NAMES[language][date.getDay()];
  const month = MONTH_NAMES[language][date.getMonth()];

  return `${dayName}, ${date.getDate()}. ${month}`;
}

export function formatSeriesEventTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function groupSeriesEventsByDate(
  events: SeriesDetailEvent[],
  language: SeriesDetailLanguage
): Record<string, SeriesDetailEvent[]> {
  return events.reduce<Record<string, SeriesDetailEvent[]>>((groups, event) => {
    const dateKey = formatSeriesEventDate(event.start_datetime, language);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {});
}

export function getSeriesEventTitle(
  event: Pick<SeriesDetailEvent, 'title_bs' | 'title_en'>,
  language: SeriesDetailLanguage
): string {
  return language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
}

export function getSeriesEventVenueName(
  event: Pick<SeriesDetailEvent, 'venues' | 'location_name'>
): string {
  return event.venues?.name || event.location_name || '';
}

export function getSeriesMoodEmoji(mood: string): string {
  return SERIES_MOOD_EMOJIS[mood] || '\u2728';
}

export function getSeriesDetailCopy(language: SeriesDetailLanguage) {
  return {
    website: language === 'bs' ? 'Web' : 'Website',
    tickets: language === 'bs' ? 'Karte' : 'Tickets',
    save:
      language === 'bs' ? 'Sa\u010duvaj seriju' : 'Save series',
    saved:
      language === 'bs' ? 'Serija sa\u010duvana' : 'Series saved',
    events: language === 'bs' ? 'Doga\u0111aji' : 'Events',
    ticket: language === 'bs' ? 'Karta' : 'Ticket',
  };
}

function toLocalCalendarDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}
