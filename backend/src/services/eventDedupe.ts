// Cross-source event dedupe.
//
// Two events count as the same when they share normalized title + start date
// (calendar day) + venue identity. Same concert listed on kupikartu, ulaznice
// and allevents.in collapses to a single events row instead of three.
//
// The fuzzy path additionally tolerates ±2-day drift and asymmetric venue
// metadata (one source matched the venue, another didn't yet) so the same
// event ingested in three states ((no venue), (locationName only),
// (venue_id matched)) still collapses into one cluster.

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
  if (!startDatetime) return null;
  // ISO 8601: first 10 chars are YYYY-MM-DD. Anything else → null so the caller
  // falls back to the source+ticket_url key instead of grouping by garbage.
  if (!/^\d{4}-\d{2}-\d{2}/.test(startDatetime)) return null;
  return startDatetime.slice(0, 10);
}

export function canonicalEventKey(input: {
  title: string | null;
  startDatetime: string | null;
  venueId: string | null;
  locationName: string | null;
}): string | null {
  const date = startDate(input.startDatetime);
  if (!date) return null;

  const titleKey = input.title ? normalizeForKey(input.title) : '';
  if (titleKey.length < 3) return null;

  const venueKey = input.venueId
    ? `id:${input.venueId}`
    : input.locationName
      ? `loc:${normalizeForKey(input.locationName)}`
      : 'venue:none';

  return `${titleKey}|${date}|${venueKey}`;
}

const FUZZY_STOPWORDS = new Set([
  // Bosnian theatrical/concert qualifiers
  'premijera', 'predstave', 'predstava', 'koncert', 'koncerta', 'koncertu',
  'koncerti', 'festival', 'festivala', 'dogadjaj', 'dogadjaji', 'jubilej',
  'drama', 'opera', 'balet', 'opere', 'baleta',
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

// Returns one key per distinctive title token. Two events fuzzy-match when
// their key sets intersect AND date is within ±2 days AND venues are
// compatible (see venuesCompatibleForMerge). Venue is NOT part of the key —
// putting it there partitioned the cluster so the same event ingested with
// (no venue) / (locationName) / (venue_id) couldn't collide.
//
// Distinctive = length ≥ 5 chars AND not in FUZZY_STOPWORDS. Fallback for
// short artist names (WHO SEE, U2, ABBA): when no distinctive token exists,
// key on the first 2 tokens.
export function fuzzyCrossSourceKeys(input: { title: string | null }): string[] {
  if (!input.title) return [];
  const titleKey = normalizeForKey(input.title);
  if (titleKey.length < 3) return [];

  const allTokens = titleKey.split(/\s+/).filter(Boolean);
  const distinctive = allTokens.filter(
    (t) => t.length >= 5 && !FUZZY_STOPWORDS.has(t),
  );

  if (distinctive.length > 0) return distinctive;

  const firstTwo = allTokens.slice(0, 2).join(' ');
  if (firstTwo.length < 3) return [];
  return [firstTwo];
}

// Are these two events at venues that are compatible for merging?
//
//   both venueId non-null  → require equality (different venue ids = different events)
//   both venueId null      → if both have locationName, normalize and compare;
//                            else (one or both lack locationName) → compatible
//   one venueId null       → compatible (the null side is the impoverished row)
export function venuesCompatibleForMerge(
  a: { venueId: string | null; locationName: string | null },
  b: { venueId: string | null; locationName: string | null },
): boolean {
  if (a.venueId && b.venueId) return a.venueId === b.venueId;
  if (!a.venueId && !b.venueId) {
    if (a.locationName && b.locationName) {
      return normalizeForKey(a.locationName) === normalizeForKey(b.locationName);
    }
    return true;
  }
  return true;
}

// Full fuzzy-match predicate. True iff two events share a distinctive title
// token, fall within ±2 calendar days, and have compatible venues.
export function fuzzyEventsMatch(
  a: { title: string | null; startDatetime: string | null; venueId: string | null; locationName: string | null },
  b: { title: string | null; startDatetime: string | null; venueId: string | null; locationName: string | null },
): boolean {
  const aKeys = fuzzyCrossSourceKeys({ title: a.title });
  if (aKeys.length === 0) return false;
  const bKeys = new Set(fuzzyCrossSourceKeys({ title: b.title }));
  if (!aKeys.some((k) => bKeys.has(k))) return false;
  if (dayDelta(a.startDatetime, b.startDatetime) > 2) return false;
  return venuesCompatibleForMerge(a, b);
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
