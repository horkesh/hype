export type EventDetailLanguage = 'bs' | 'en';

export interface EventDetailVenueRef {
  id: string;
  name: string;
}

export interface EventDetailEvent {
  id: string;
  title_bs: string;
  title_en: string | null;
  description_bs: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  end_datetime: string | null;
  price_bam: number | null;
  ticket_url: string | null;
  source: string | null;
  moods: string[];
  category: string;
  venue_id: string | null;
  venues?: EventDetailVenueRef | null;
  location_name: string | null;
}

export const EVENT_MOOD_EMOJIS: Record<string, string> = {
  Party: '\ud83c\udf89',
  Chill: '\ud83d\ude0e',
  'Girls Night': '\ud83d\udc83',
  'Date Night': '\ud83d\udc91',
  Muzika: '\ud83c\udfb5',
  Romantika: '\ud83c\udf77',
  Kultura: '\ud83c\udfad',
  Foodie: '\ud83c\udf7d\ufe0f',
  Brunch: '\ud83c\udf73',
  'After Work': '\ud83c\udf7b',
  Outdoor: '\ud83c\udf3f',
  Turista: '\ud83e\uddf3',
};

export const EVENT_CATEGORY_EMOJIS: Record<string, string> = {
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
  other: '\ud83d\udcc5',
};

export function getEventDetailTitle(
  event: Pick<EventDetailEvent, 'title_bs' | 'title_en'>,
  language: EventDetailLanguage
): string {
  return language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
}

export function getEventDetailDescription(
  event: Pick<EventDetailEvent, 'description_bs' | 'description_en'>,
  language: EventDetailLanguage
): string | null {
  return language === 'bs'
    ? (event.description_bs || event.description_en)
    : (event.description_en || event.description_bs);
}

export function getEventVenueName(
  event: Pick<EventDetailEvent, 'venues' | 'location_name'>
): string {
  return event.venues?.name || event.location_name || '';
}

export function isEventFree(priceBam: number | null): boolean {
  return priceBam === null || priceBam === 0;
}

export function getEventPriceDisplay(
  priceBam: number | null,
  language: EventDetailLanguage
): string {
  if (isEventFree(priceBam)) {
    return language === 'bs' ? 'Besplatan' : 'Free';
  }

  if (!priceBam) {
    return '';
  }

  let display = `${priceBam} KM`;
  if (language === 'en') {
    display += ` (~${(priceBam * 0.51).toFixed(2)} EUR)`;
  }

  return display;
}

export function formatEventDetailDateTime(dateString: string, atLabel: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}.${month}.${year} ${atLabel} ${hours}:${minutes}`;
}

export function getEventTicketButtonText(
  ticketUrl: string | null,
  language: EventDetailLanguage
): string {
  if (!ticketUrl) {
    return language === 'bs' ? 'Kupi kartu' : 'Buy ticket';
  }

  const urlLower = ticketUrl.toLowerCase();
  if (urlLower.includes('kupikartu.ba')) {
    return language === 'bs' ? 'Kupi na KupiKartu.ba' : 'Buy on KupiKartu.ba';
  }
  if (urlLower.includes('entrio.ba')) {
    return language === 'bs' ? 'Kupi na Entrio.ba' : 'Buy on Entrio.ba';
  }
  if (urlLower.includes('karter.ba')) {
    return language === 'bs' ? 'Kupi na Karter.ba' : 'Buy on Karter.ba';
  }
  if (urlLower.includes('fiestalama')) {
    return language === 'bs' ? 'Kupi na FiestaLama' : 'Buy on FiestaLama';
  }

  return language === 'bs' ? 'Kupi kartu' : 'Buy ticket';
}

export function getEventFreeEntryLabel(language: EventDetailLanguage): string {
  return language === 'bs' ? 'Besplatan ulaz' : 'Free entry';
}

export function getEventCategoryEmoji(category: string): string {
  return EVENT_CATEGORY_EMOJIS[category] || EVENT_CATEGORY_EMOJIS.other;
}

export function getEventMoodEmoji(mood: string): string {
  return EVENT_MOOD_EMOJIS[mood] || '\u2728';
}
