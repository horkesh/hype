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
