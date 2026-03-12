import { fetchSupabaseAdminJson } from '../lib/supabaseAdmin.js';

export interface RawEventRow {
  id: string;
  source_name: string | null;
  source_url: string | null;
  title_raw: string | null;
  description_raw: string | null;
  date_raw: string | null;
  image_url: string | null;
  created_at: string | null;
  venue_raw: string | null;
  venue_name_raw: string | null;
  parsed: boolean | null;
  parse_attempts: number | null;
  venue_match_status: string | null;
}

export interface ParsePreviewCandidate {
  rawEventId: string;
  sourceName: string | null;
  sourceUrl: string | null;
  titleRaw: string | null;
  normalizedTitle: string | null;
  dateRaw: string | null;
  normalizedDateText: string | null;
  venueNameRaw: string | null;
  normalizedVenueName: string | null;
  imageUrl: string | null;
  hasDescription: boolean;
  parseConfidence: 'high' | 'medium' | 'low';
  suggestedCategory:
    | 'theatre'
    | 'music'
    | 'nightlife'
    | 'sport'
    | 'film'
    | 'culture'
    | 'other';
  suggestedOutcome: 'candidate' | 'review' | 'skip';
  reviewReasons: string[];
}

function encodeEquals(value: string): string {
  return encodeURIComponent(value);
}

export async function listRecentRawEvents(limit = 25, sourceName?: string): Promise<RawEventRow[]> {
  const filters = [
    'select=id,source_name,source_url,title_raw,description_raw,date_raw,image_url,created_at,venue_raw,venue_name_raw,parsed,parse_attempts,venue_match_status',
    'order=created_at.desc',
    `limit=${Math.max(1, Math.min(limit, 100))}`,
  ];

  if (sourceName) {
    filters.push(`source_name=eq.${encodeEquals(sourceName)}`);
  }

  return fetchSupabaseAdminJson<RawEventRow[]>(`/rest/v1/raw_events?${filters.join('&')}`);
}

function normalizeWhitespace(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : null;
}

function normalizeTitle(value: string | null): string | null {
  const cleaned = normalizeWhitespace(value);
  return cleaned ? cleaned.replace(/[|\-]\s*(kupi kartu|tickets?|ulaznice?)$/i, '').trim() : null;
}

function normalizeVenue(value: string | null): string | null {
  const cleaned = normalizeWhitespace(value);
  return cleaned ? cleaned.replace(/^@/, '').trim() : null;
}

function normalizeDateText(value: string | null): string | null {
  return normalizeWhitespace(value);
}

function inferCategory(raw: RawEventRow): ParsePreviewCandidate['suggestedCategory'] {
  const haystack = `${raw.source_name ?? ''} ${raw.title_raw ?? ''}`.toLowerCase();

  if (haystack.includes('pozor')) {
    return 'theatre';
  }

  if (haystack.includes('kino') || haystack.includes('cinestar') || haystack.includes('film')) {
    return 'film';
  }

  if (haystack.includes('sport') || haystack.includes('fk ') || haystack.includes('kk ')) {
    return 'sport';
  }

  if (
    haystack.includes('concert') ||
    haystack.includes('opera') ||
    haystack.includes('jazz') ||
    haystack.includes('music')
  ) {
    return 'music';
  }

  if (haystack.includes('party') || haystack.includes('club') || haystack.includes('night')) {
    return 'nightlife';
  }

  if (haystack.includes('festival') || haystack.includes('izlo') || haystack.includes('theatre')) {
    return 'culture';
  }

  return 'other';
}

export function buildParsePreviewCandidate(raw: RawEventRow): ParsePreviewCandidate {
  const normalizedTitle = normalizeTitle(raw.title_raw);
  const normalizedDateText = normalizeDateText(raw.date_raw);
  const normalizedVenueName = normalizeVenue(raw.venue_name_raw ?? raw.venue_raw);
  const hasDescription = Boolean(normalizeWhitespace(raw.description_raw));
  const reviewReasons: string[] = [];

  if (!normalizedTitle) {
    reviewReasons.push('missing_title');
  }

  if (!normalizedDateText) {
    reviewReasons.push('missing_date');
  }

  if (!normalizedVenueName) {
    reviewReasons.push('missing_venue');
  }

  if (!raw.image_url) {
    reviewReasons.push('missing_image');
  }

  if ((raw.venue_match_status ?? 'unmatched') !== 'matched') {
    reviewReasons.push('venue_unmatched');
  }

  let parseConfidence: ParsePreviewCandidate['parseConfidence'] = 'high';
  if (reviewReasons.includes('missing_title') || reviewReasons.includes('missing_date')) {
    parseConfidence = 'low';
  } else if (reviewReasons.length >= 2) {
    parseConfidence = 'medium';
  }

  const suggestedOutcome: ParsePreviewCandidate['suggestedOutcome'] =
    parseConfidence === 'low' ? 'review' : reviewReasons.length > 2 ? 'review' : 'candidate';

  return {
    rawEventId: raw.id,
    sourceName: raw.source_name,
    sourceUrl: raw.source_url,
    titleRaw: raw.title_raw,
    normalizedTitle,
    dateRaw: raw.date_raw,
    normalizedDateText,
    venueNameRaw: raw.venue_name_raw ?? raw.venue_raw,
    normalizedVenueName,
    imageUrl: raw.image_url,
    hasDescription,
    parseConfidence,
    suggestedCategory: inferCategory(raw),
    suggestedOutcome,
    reviewReasons,
  };
}

export async function buildRecentParsePreview(limit = 25, sourceName?: string) {
  const rows = await listRecentRawEvents(limit, sourceName);
  return rows.map((row) => buildParsePreviewCandidate(row));
}
