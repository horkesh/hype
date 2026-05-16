// Venue matching for promoted events.
//
// Tries exact → partial-forward → partial-reverse → fuzzy variants. The
// reverse-substring case (a raw venue name like "Skenderija" matching a longer
// canonical "Dom Mladih Skenderija") is the practical one for ticket sites
// that abbreviate venues to a single recognizable word.

export interface VenueRow {
  id: string;
  name: string;
  category: string | null;
  neighborhood?: string | null;
}

export interface VenueMatchResult {
  venue: VenueRow;
  strategy:
    | 'exact'
    | 'partial'
    | 'partial_reverse'
    | 'fuzzy_exact'
    | 'fuzzy_partial'
    | 'fuzzy_partial_reverse'
    | 'token_overlap'
    | 'alias';
}

// Canonical aliases for venue abbreviations / shorthands the matcher can't
// derive structurally. Each entry maps a normalized raw form to a canonical
// venue name substring; the matcher resolves via exact-or-partial match on
// that substring.
const CANONICAL_ALIASES: Array<{ rawForm: RegExp; canonicalSubstring: string }> = [
  // BKC abbreviation — full canonical is "BKC (Bosanski Kulturni Centar)"
  { rawForm: /^bkc(?:\s|-|$|\W)/i, canonicalSubstring: 'bkc' },
];

// Venue matching uses a deliberately narrower noise list than event dedupe.
// Tokens like "bkc", "centar", "kulturni" are part of canonical venue names
// (e.g. "BKC (Bosanski Kulturni Centar)") — stripping them on this side leaves
// nothing to match against. Only the city qualifier is safe to drop.
const NOISE_TOKENS = [
  /\bsarajevo\b/gi,
];

// Categories where it's reasonable to host a ticketed event. When a raw name
// is a substring of multiple venue names, the matcher prefers these over
// restaurants/bakeries/cafes/etc. — otherwise "Stadion Grbavica" might link to
// a bakery in Grbavica neighborhood.
const EVENT_CATEGORIES = new Set([
  'concert_hall', 'arena', 'stadium', 'theatre', 'theater', 'cinema',
  'cultural_center', 'club', 'nightclub', 'bar', 'pub', 'music_venue',
  'outdoor',
]);

function stripNoise(value: string): string {
  let out = value;
  for (const re of NOISE_TOKENS) {
    out = out.replace(re, ' ');
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function pickByEventCategory(matches: VenueRow[]): VenueRow | null {
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  const eventMatches = matches.filter(
    (v) => v.category && EVENT_CATEGORIES.has(v.category.toLowerCase()),
  );
  if (eventMatches.length === 1) return eventMatches[0];
  if (eventMatches.length === 0) return null; // ambiguous and all non-event categories → punt

  // Multiple event-category matches: take the shortest name (closest to the
  // raw signal). If still tied, the first one wins.
  return [...eventMatches].sort((a, b) => a.name.length - b.name.length)[0];
}

export function matchVenue(
  venueNameRaw: string | null,
  venues: VenueRow[],
): VenueMatchResult | null {
  if (!venueNameRaw) return null;

  const raw = venueNameRaw.trim();
  if (!raw) return null;

  const rawNorm = normalise(raw);
  if (!rawNorm) return null;

  // 0. Canonical aliases — short abbreviations the matcher can't derive
  //    structurally (BKC, etc.). When a rawForm matches, look for any venue
  //    whose normalized name contains canonicalSubstring as a whole word.
  for (const alias of CANONICAL_ALIASES) {
    if (!alias.rawForm.test(raw)) continue;
    const needle = alias.canonicalSubstring.toLowerCase();
    const candidates = venues.filter((v) => {
      const tokens = normalise(v.name).split(/\s+/);
      return tokens.includes(needle);
    });
    const picked = pickByEventCategory(candidates);
    if (picked) {
      return { venue: picked, strategy: 'alias' };
    }
  }

  // 1. Exact (case-insensitive, punctuation-normalized)
  for (const v of venues) {
    if (normalise(v.name) === rawNorm) {
      return { venue: v, strategy: 'exact' };
    }
  }

  // 2. Partial forward: full venue name appears inside the raw signal
  //    (e.g. raw "Concert at Hacienda Sarajevo" matches venue "Hacienda")
  for (const v of venues) {
    const vNorm = normalise(v.name);
    if (vNorm.length >= 4 && rawNorm.includes(vNorm)) {
      return { venue: v, strategy: 'partial' };
    }
  }

  // 3. Partial reverse: raw signal appears inside the full venue name
  //    (e.g. raw "Skenderija" matches venue "Dom Mladih Skenderija")
  if (rawNorm.length >= 4) {
    const reverseMatches = venues.filter((v) => normalise(v.name).includes(rawNorm));
    const picked = pickByEventCategory(reverseMatches);
    if (picked) return { venue: picked, strategy: 'partial_reverse' };
  }

  // For address-shaped raws ("Skenderija, 71000 Sarajevo, Bosnia and..."),
  // try the first comma-separated chunk in addition to the full string. Lets
  // forward/reverse partial pick up the venue name buried inside the address.
  const firstChunk = raw.split(',')[0]?.trim();
  if (firstChunk && firstChunk !== raw) {
    const chunkNorm = normalise(firstChunk);
    if (chunkNorm && chunkNorm.length >= 4) {
      // Reverse partial against the first chunk
      const reverseMatches = venues.filter((v) => normalise(v.name).includes(chunkNorm));
      const picked = pickByEventCategory(reverseMatches);
      if (picked) return { venue: picked, strategy: 'partial_reverse' };
    }
  }

  // 4-6. Same three strategies with noise tokens stripped from both sides
  const rawStripped = normalise(stripNoise(raw));
  if (rawStripped && rawStripped !== rawNorm) {
    for (const v of venues) {
      const vStripped = normalise(stripNoise(v.name));
      if (vStripped && vStripped === rawStripped) {
        return { venue: v, strategy: 'fuzzy_exact' };
      }
    }
    for (const v of venues) {
      const vStripped = normalise(stripNoise(v.name));
      if (vStripped.length >= 4 && rawStripped.includes(vStripped)) {
        return { venue: v, strategy: 'fuzzy_partial' };
      }
    }
    if (rawStripped.length >= 4) {
      const reverseMatches = venues.filter((v) =>
        normalise(stripNoise(v.name)).includes(rawStripped),
      );
      const picked = pickByEventCategory(reverseMatches);
      if (picked) return { venue: picked, strategy: 'fuzzy_partial_reverse' };
    }
  }

  // 7. Token-overlap fallback. For raws that are neither exact nor a clean
  //    substring ("Bosnian Cultural Center" vs "BKC (Bosanski Kulturni Centar)",
  //    or "Asim Ferhatović Hase Olympic Stadium" vs "Stadion Asim Ferhatović
  //    Hase"), count overlapping 4+ char tokens against each event-category
  //    venue. Requires at least 2 shared tokens AND a clear leader.
  const rawTokens = new Set(
    rawNorm.split(/\s+/).filter((t) => t.length >= 4),
  );
  if (rawTokens.size >= 2) {
    let best: { venue: VenueRow; matches: number } | null = null;
    let tieAtBest = false;
    for (const v of venues) {
      if (!v.category || !EVENT_CATEGORIES.has(v.category.toLowerCase())) continue;
      const vTokens = new Set(
        normalise(v.name).split(/\s+/).filter((t) => t.length >= 4),
      );
      let overlap = 0;
      for (const t of rawTokens) {
        if (vTokens.has(t)) overlap++;
      }
      if (overlap < 2) continue;
      if (!best || overlap > best.matches) {
        best = { venue: v, matches: overlap };
        tieAtBest = false;
      } else if (overlap === best.matches) {
        tieAtBest = true;
      }
    }
    if (best && !tieAtBest) {
      return { venue: best.venue, strategy: 'token_overlap' };
    }
  }

  return null;
}
