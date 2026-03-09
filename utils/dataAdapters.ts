type Language = 'bs' | 'en';

type RawRecord = Record<string, any>;

function normalizePriceLevel(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.min(4, value));
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.min(4, parsed));
    }
  }

  return 1;
}

function toInstagramUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@/, '');
  return `https://instagram.com/${handle}`;
}

function pickLocalizedValue(
  record: RawRecord,
  language: Language,
  baseField: string
): string | null {
  const localized =
    language === 'bs'
      ? record[`${baseField}_bs`] ?? record[`${baseField}_en`]
      : record[`${baseField}_en`] ?? record[`${baseField}_bs`];

  if (typeof localized === 'string' && localized.trim()) {
    return localized;
  }

  const fallback = record[baseField];
  return typeof fallback === 'string' && fallback.trim() ? fallback : null;
}

function formatTimeRange(start: unknown, end: unknown): string {
  if (typeof start === 'string' && typeof end === 'string' && start && end) {
    return `${start} - ${end}`;
  }

  if (typeof start === 'string' && start) {
    return start;
  }

  if (typeof end === 'string' && end) {
    return end;
  }

  return '';
}

export function normalizeVenue<T extends RawRecord>(venue: T, language: Language) {
  const priceLevel = normalizePriceLevel(venue.price_level ?? venue.price_range);
  const insiderTip = pickLocalizedValue(venue, language, 'insider_tip');
  const instagramUrl = toInstagramUrl(venue.instagram ?? venue.instagram_handle);

  return {
    ...venue,
    price_level: priceLevel,
    price_range: venue.price_range ?? priceLevel,
    insider_tip: insiderTip,
    insider_tip_bs: venue.insider_tip_bs ?? insiderTip,
    insider_tip_en: venue.insider_tip_en ?? insiderTip,
    instagram: instagramUrl,
    instagram_handle: venue.instagram_handle ?? venue.instagram ?? null,
  };
}

export function normalizeVenueRows<T extends RawRecord>(venues: T[] | null | undefined, language: Language) {
  return (venues ?? []).map((venue) => normalizeVenue(venue, language));
}

export function normalizeDailySpecial<T extends RawRecord>(special: T, language: Language) {
  const title = pickLocalizedValue(special, language, 'title') ?? special.menu_title ?? '';
  const description = pickLocalizedValue(special, language, 'description') ?? special.description ?? null;
  const price =
    typeof special.price === 'number'
      ? special.price
      : typeof special.price_bam === 'number'
        ? special.price_bam
        : 0;

  const validTimes = typeof special.valid_times === 'string' && special.valid_times
    ? special.valid_times
    : formatTimeRange(special.valid_time_start, special.valid_time_end);

  const venueName =
    special.venue_name ??
    special.venues?.name ??
    special.venue?.name ??
    '';

  return {
    ...special,
    menu_title: title,
    title_bs: special.title_bs ?? title,
    title_en: special.title_en ?? title,
    description,
    price,
    price_bam: special.price_bam ?? price,
    valid_times: validTimes,
    venue_name: venueName,
  };
}

export function normalizeDailySpecialRows<T extends RawRecord>(specials: T[] | null | undefined, language: Language) {
  return (specials ?? []).map((special) => normalizeDailySpecial(special, language));
}
