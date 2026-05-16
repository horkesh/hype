// Cross-source event dedupe.
//
// Two events count as the same if they share normalized title + start date
// (calendar day) + venue identity. Same concert listed on kupikartu, ulaznice
// and allevents.in will collapse to a single events row instead of three.

const NOISE_TOKENS = [
  /\bsarajevo\b/gi,
  /\bbkc\b/gi,
  /\bkc\b/gi,
  /\bcentar\b/gi,
  /\bcenter\b/gi,
  /\bkulturni\b/gi,
  /\bcultural\b/gi,
];

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function stripNoise(value: string): string {
  let out = value;
  for (const re of NOISE_TOKENS) {
    out = out.replace(re, ' ');
  }
  return out;
}

function normalizeForKey(value: string): string {
  return stripNoise(stripDiacritics(value).toLowerCase())
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function startDate(startDatetime: string | null): string | null {
  if (!startDatetime) {
    return null;
  }
  // ISO 8601: first 10 chars are YYYY-MM-DD. Anything else → null so the caller
  // falls back to the source+ticket_url key instead of grouping by garbage.
  if (!/^\d{4}-\d{2}-\d{2}/.test(startDatetime)) {
    return null;
  }
  return startDatetime.slice(0, 10);
}

export function canonicalEventKey(input: {
  title: string | null;
  startDatetime: string | null;
  venueId: string | null;
  locationName: string | null;
}): string | null {
  const date = startDate(input.startDatetime);
  if (!date) {
    return null;
  }

  const titleKey = input.title ? normalizeForKey(input.title) : '';
  if (titleKey.length < 3) {
    return null;
  }

  const venueKey = input.venueId
    ? `id:${input.venueId}`
    : input.locationName
      ? `loc:${normalizeForKey(input.locationName)}`
      : 'venue:none';

  return `${titleKey}|${date}|${venueKey}`;
}

// Looser cross-source key that ignores the day. Used to detect near-duplicates
// where sources disagree by ±1-2 days (PROLONGIRANO reschedules, timezone bugs,
// venue date confusion). The caller pairs this with a date-proximity check.
//
// Same shape as canonicalEventKey but with no date component, so a single
// "WHO SEE" concert on May 21 (KupiKartu) and May 22 (AllEvents) at the same
// venue gets the same fuzzy key.
export function fuzzyCrossSourceKey(input: {
  title: string | null;
  venueId: string | null;
  locationName: string | null;
}): string | null {
  const titleKey = input.title ? normalizeForKey(input.title) : '';
  if (titleKey.length < 3) return null;

  // First two title tokens are usually the artist/show name ("WHO SEE",
  // "Dino Merlin", "Nikola Rokvić"). Keeping that prefix lets variants like
  // "WHO SEE - PROLONGIRANO @Cinemas Sloga" match "WHO SEE @ CINEMAS SLOGA
  // SARAJEVO" because both reduce to "who see" + same venue. No length
  // filter — short artist names like "WHO" or "SEE" are real signal.
  const firstTokens = titleKey.split(/\s+/).filter(Boolean).slice(0, 2).join(' ');
  if (firstTokens.length < 3) return null;

  const venueKey = input.venueId
    ? `id:${input.venueId}`
    : input.locationName
      ? `loc:${normalizeForKey(input.locationName)}`
      : 'venue:none';

  return `${firstTokens}|${venueKey}`;
}

// Difference in calendar days between two ISO datetimes. Returns Infinity
// when either side is malformed.
export function dayDelta(aIso: string | null, bIso: string | null): number {
  if (!aIso || !bIso) return Infinity;
  const a = startDate(aIso);
  const b = startDate(bIso);
  if (!a || !b) return Infinity;
  const ms = new Date(a).getTime() - new Date(b).getTime();
  return Math.abs(Math.round(ms / 86_400_000));
}
