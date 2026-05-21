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

// Stopwords for the fuzzy dedup key. These are common event-title words that
// don't identify a specific event — they're prefixes ("premijera predstave",
// "live music"), status markers ("rasprodano", "prolongirano"), or generic
// descriptors ("godisnjica", "nights"). Removing them lets us key on the
// actual distinctive token (artist/play name) regardless of where it sits
// in the title.
const FUZZY_STOPWORDS = new Set([
  // Bosnian theatrical/concert qualifiers
  'premijera', 'predstave', 'predstava', 'koncert', 'koncerta', 'koncertu',
  'koncerti', 'festival', 'festivala', 'dogadjaj', 'dogadjaji', 'jubilej',
  // Venue / scene qualifiers
  'dvorana', 'dvorane', 'dvorani', 'scena', 'scene', 'klub', 'kluba',
  'klubu', 'pozoriste', 'pozorista', 'pozoristu',
  // Status / state markers
  'rasprodano', 'rasprodana', 'otkazano', 'otkazana', 'prolongirano',
  'prebaceno', 'preneseno', 'posebno', 'special', 'specijal',
  // Date/anniversary fillers
  'godisnjica', 'godisnjicu', 'godisnjice', 'premiere', 'anniversary',
  // English generics
  'nights', 'evening', 'party', 'concert', 'tonight', 'stage', 'tribute',
  'matinee', 'comedy',
]);

// Looser cross-source key set that ignores the day. Used to detect
// near-duplicates where sources disagree by ±1-2 days (PROLONGIRANO
// reschedules, timezone bugs) or where titles have different framings
// ("PREMIJERA PREDSTAVE ŽENOMRZAC" vs "ŽENOMRZAC - RASPRODANO @venue").
// Returns one key per distinctive title token. Two events match fuzzily
// when their key sets intersect; caller pairs that with a ±2-day date
// proximity check.
//
// Distinctive = length ≥ 5 chars AND not in FUZZY_STOPWORDS. Fallback for
// short artist names like "WHO SEE": when no distinctive token exists, key
// on the first 2 tokens (preserves prior behavior on real concert titles).
export function fuzzyCrossSourceKeys(input: {
  title: string | null;
  venueId: string | null;
  locationName: string | null;
}): string[] {
  if (!input.title) return [];
  const titleKey = normalizeForKey(input.title);
  if (titleKey.length < 3) return [];

  const venueKey = input.venueId
    ? `id:${input.venueId}`
    : input.locationName
      ? `loc:${normalizeForKey(input.locationName)}`
      : 'venue:none';

  const allTokens = titleKey.split(/\s+/).filter(Boolean);
  const distinctive = allTokens.filter(
    (t) => t.length >= 5 && !FUZZY_STOPWORDS.has(t),
  );

  if (distinctive.length > 0) {
    return distinctive.map((t) => `${t}|${venueKey}`);
  }

  // Fallback: short artist names (WHO SEE, U2, ABBA, etc.) — use first
  // 2 tokens as a single key so the WHO SEE / Dino Merlin / etc. cases
  // still dedupe across sources.
  const firstTwo = allTokens.slice(0, 2).join(' ');
  if (firstTwo.length < 3) return [];
  return [`${firstTwo}|${venueKey}`];
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
