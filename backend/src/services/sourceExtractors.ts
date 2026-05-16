import type { RawEventCandidate } from './ingestionFetch.js';
import type { IngestionSourceSummary } from './ingestionSources.js';

// Non-Sarajevo cities to reject from national sources like KupiKartu
const NON_SARAJEVO_CITIES = [
  'zenica', 'tuzla', 'banja luka', 'banjaluka', 'mostar', 'kakanj',
  'bihać', 'bihac', 'travnik', 'brčko', 'brcko', 'prijedor', 'doboj',
  'cazin', 'živinice', 'zivinice', 'lukavac', 'goražde', 'gorazde',
  'visoko', 'konjic', 'bugojno', 'gradačac', 'gradacac', 'gračanica',
  'gracanica', 'srebrenik', 'ključ', 'kljuc', 'neum', 'stolac',
  'trebinje', 'bijeljina', 'dvorana borik', 'busovaca', 'busovača',
];

const SARAJEVO_VENUE_HINTS = [
  'cinemas sloga', 'dom mladih', 'skenderija', 'kamerni teatar',
  'narodno pozorište sarajevo', 'narodno pozoriste sarajevo',
  'bkc', 'vijećnica', 'vijecnica', 'zetra',
  'hotel europe', 'olympic hall', 'pozorište mladih', 'pozoriste mladih',
  'sartr', 'sarajevski ratni teatar', 'hacienda', 'underground',
  'baščaršija', 'bascarsija', 'ilidža', 'ilidza', 'grbavica',
];

type CityClass = 'sarajevo' | 'other_city' | 'unknown';

function classifyCity(titleRaw: string, venueOrCityRaw: string | null): CityClass {
  const text = `${titleRaw} ${venueOrCityRaw ?? ''}`.toLowerCase();
  for (const city of NON_SARAJEVO_CITIES) {
    if (text.includes(city)) {
      return 'other_city';
    }
  }
  // 'sarajev' catches sarajevo, sarajevski/sarajevska/sarajevsko (Bosnian inflections)
  if (text.includes('sarajev')) {
    return 'sarajevo';
  }
  for (const hint of SARAJEVO_VENUE_HINTS) {
    if (text.includes(hint)) {
      return 'sarajevo';
    }
  }
  return 'unknown';
}

// Strict: keep only when we have positive evidence the event is in Sarajevo.
// Use for national sources where ambiguous candidates would otherwise leak.
function isStrictlySarajevo(titleRaw: string, venueOrCityRaw: string | null): boolean {
  return classifyCity(titleRaw, venueOrCityRaw) === 'sarajevo';
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImageSrc(value: string, baseUrl: string): string | null {
  const match = value.match(/<img\b[^>]*src=["']([^"'#]+)["']/i);
  if (!match?.[1]) {
    return null;
  }

  return resolveUrl(match[1].trim(), baseUrl);
}

function extractKupikartuDate(value: string): string | null {
  const match = value.match(/(\d{2}\.\d{2}\.\d{4}|\d{2}\/\d{2})/);
  return match?.[1] ?? null;
}

function extractKupikartuVenue(value: string): string | null {
  const match = value.match(/@([^\n<]+)/);
  const cleaned = match?.[1] ? stripHtml(match[1]) : null;
  return cleaned && cleaned.length >= 2 ? cleaned : null;
}

function extractPozoristaMetadata(value: string): {
  dateRaw: string | null;
  venueNameRaw: string | null;
} {
  const dateMatch = value.match(
    /(\d{1,2}\s+(?:januar|februar|mart|april|maj|juni|juli|august|septembar|oktobar|novembar|decembar)\s+\d{4}(?:\s+\d{2}:\d{2})?)/i,
  );
  const venueMatch = value.match(/Pozori[šs]te:\s*([^<\n]+)/i);

  return {
    dateRaw: dateMatch ? stripHtml(dateMatch[1]) : null,
    venueNameRaw: venueMatch ? stripHtml(venueMatch[1]) : null,
  };
}

function extractAllEventsMetadata(value: string): {
  dateRaw: string | null;
  venueNameRaw: string | null;
  imageUrl: string | null;
} {
  const text = stripHtml(value);
  const dateMatch = text.match(
    /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)?\s*\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM)?)?/i,
  );
  const venueMatch =
    text.match(/(?:at|@)\s+([^|]+?)(?:\s+\d+\+?\s+Interested|$)/i) ??
    text.match(/([^|]+?)\s+\d+\+?\s+Interested/i);

  return {
    dateRaw: dateMatch ? dateMatch[0].trim() : null,
    venueNameRaw: venueMatch ? venueMatch[1].trim() : null,
    imageUrl: extractImageSrc(value, 'https://allevents.in'),
  };
}

function normalizeKupikartuTitle(value: string): string | null {
  const cleaned = value
    .replace(/^\s*\d{2}(?:\.\d{2}\.\d{4}|\/\d{2})\s*/i, '')
    .replace(/\s*@[^@]+$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length >= 4 ? cleaned : null;
}

function resolveUrl(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractPozoristaCandidates(
  html: string,
  source: IngestionSourceSummary,
): RawEventCandidate[] {
  const eventLinkRegex =
    /<a\b[^>]*href=["']([^"'#]*\?event=[^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const candidates: RawEventCandidate[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(eventLinkRegex)) {
    const rawHref = match[1]?.trim();
    if (!rawHref) {
      continue;
    }

    const resolvedUrl = resolveUrl(rawHref, source.sourceUrl);
    if (!resolvedUrl || seen.has(resolvedUrl)) {
      continue;
    }

    const titleRaw = stripHtml(match[2] ?? '') || null;
    if (!titleRaw || titleRaw.length < 4) {
      continue;
    }

    const metadataContext = html.slice(match.index + match[0].length, match.index + match[0].length + 500);
    const metadata = extractPozoristaMetadata(metadataContext);

    // pozorista.ba aggregates theatres across BiH. Require a Sarajevo signal
    // (in title or captured venue) — otherwise we'd promote Mostar/Tuzla shows.
    if (!isStrictlySarajevo(titleRaw, metadata.venueNameRaw)) {
      continue;
    }

    seen.add(resolvedUrl);
    candidates.push({
      sourceUrl: resolvedUrl,
      titleRaw,
      descriptionRaw: null,
      dateRaw: metadata.dateRaw,
      imageUrl: null,
      venueRaw: metadata.venueNameRaw,
      venueNameRaw: metadata.venueNameRaw,
      rawHtml: match[0].slice(0, 4000),
      rawJson: {
        sourcePageUrl: source.sourceUrl,
        extractedFrom: 'pozorista_event_link',
        fetchMethod: 'direct_html',
        parsedDateFrom: metadata.dateRaw ? 'listing_context' : null,
        parsedVenueFrom: metadata.venueNameRaw ? 'listing_context' : null,
      },
    });
  }

  return candidates;
}

function extractAllEventsCandidates(
  html: string,
  source: IngestionSourceSummary,
): RawEventCandidate[] {
  const eventLinkRegex =
    /<a\b[^>]*href=["']([^"'#]*\/sarajevo\/[^"'#]+\/\d{6,})["'][^>]*>([\s\S]*?)<\/a>/gi;
  const candidates: RawEventCandidate[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(eventLinkRegex)) {
    const rawHref = match[1]?.trim();
    if (!rawHref) {
      continue;
    }

    const resolvedUrl = resolveUrl(rawHref, source.sourceUrl);
    if (!resolvedUrl || seen.has(resolvedUrl)) {
      continue;
    }

    const titleRaw = stripHtml(match[2] ?? '') || null;
    if (!titleRaw || titleRaw.length < 4) {
      continue;
    }

    const metadataContext = html.slice(match.index + match[0].length, match.index + match[0].length + 500);
    const metadata = extractAllEventsMetadata(`${match[2] ?? ''} ${metadataContext}`);

    seen.add(resolvedUrl);
    candidates.push({
      sourceUrl: resolvedUrl,
      titleRaw,
      descriptionRaw: null,
      dateRaw: metadata.dateRaw,
      imageUrl: metadata.imageUrl,
      venueRaw: metadata.venueNameRaw,
      venueNameRaw: metadata.venueNameRaw,
      rawHtml: match[0].slice(0, 4000),
      rawJson: {
        sourcePageUrl: source.sourceUrl,
        extractedFrom: 'allevents_event_link',
        fetchMethod: 'direct_html',
        parsedDateFrom: metadata.dateRaw ? 'listing_context' : null,
        parsedVenueFrom: metadata.venueNameRaw ? 'listing_context' : null,
      },
    });
  }

  return candidates;
}

function extractUlazniceCardMetadata(
  beforeWindow: string,
  afterWindow: string,
  baseUrl: string,
): {
  dateRaw: string | null;
  venueNameRaw: string | null;
  cityRaw: string | null;
  imageUrl: string | null;
} {
  const imageMatch = beforeWindow.match(/data-bkgimg=["']([^"']+)["']/i);
  const imageUrl = imageMatch?.[1] ? resolveUrl(imageMatch[1], baseUrl) : null;

  const dateMatch = afterWindow.match(
    /<i\b[^>]*la-calendar[^>]*><\/i>\s*([^<]+?)\s*<\/span>/i,
  );
  const dateRaw = dateMatch?.[1] ? dateMatch[1].replace(/\s+/g, ' ').trim() : null;

  const venueMatch = afterWindow.match(
    /<b>\s*([^<]+?)\s*<\/b>\s*<span\s+class=["']smallinfo["']>\s*[,\s]*([^<]*?)\s*<\/span>/i,
  );
  const venueNameRaw = venueMatch?.[1] ? stripHtml(venueMatch[1]) : null;
  const cityRaw = venueMatch?.[2] ? stripHtml(venueMatch[2]) : null;

  return { dateRaw, venueNameRaw, cityRaw, imageUrl };
}

function extractUlazniceCandidates(
  html: string,
  source: IngestionSourceSummary,
): RawEventCandidate[] {
  const titleLinkRegex =
    /<h5\b[^>]*event-title-front[^>]*>\s*<a\b[^>]*href=["'](\/(?:[a-z0-9_-]+\/)?tickets\/\d+\/[a-z0-9-]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const candidates: RawEventCandidate[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(titleLinkRegex)) {
    const rawHref = match[1]?.trim();
    if (!rawHref) {
      continue;
    }

    const resolvedUrl = resolveUrl(rawHref, source.sourceUrl);
    if (!resolvedUrl || seen.has(resolvedUrl)) {
      continue;
    }

    const titleRaw = stripHtml(match[2] ?? '') || null;
    if (!titleRaw || titleRaw.length < 4) {
      continue;
    }

    const matchEnd = match.index + match[0].length;
    const beforeWindow = html.slice(Math.max(0, match.index - 600), match.index);
    const afterWindow = html.slice(matchEnd, matchEnd + 800);
    const metadata = extractUlazniceCardMetadata(beforeWindow, afterWindow, source.sourceUrl);

    // ulaznice.org lists nationwide events. Trust the explicit smallinfo city
    // when present; otherwise require a positive Sarajevo signal in title/venue.
    const cityLower = metadata.cityRaw?.toLowerCase() ?? null;
    if (cityLower !== null && !cityLower.includes('sarajevo')) {
      continue;
    }
    if (cityLower === null && !isStrictlySarajevo(titleRaw, metadata.venueNameRaw)) {
      continue;
    }

    seen.add(resolvedUrl);
    candidates.push({
      sourceUrl: resolvedUrl,
      titleRaw,
      descriptionRaw: null,
      dateRaw: metadata.dateRaw,
      imageUrl: metadata.imageUrl,
      venueRaw: metadata.venueNameRaw,
      venueNameRaw: metadata.venueNameRaw,
      rawHtml: match[0].slice(0, 4000),
      rawJson: {
        sourcePageUrl: source.sourceUrl,
        extractedFrom: 'ulaznice_event_card',
        fetchMethod: 'direct_html',
        parsedDateFrom: metadata.dateRaw ? 'listing_card' : null,
        parsedVenueFrom: metadata.venueNameRaw ? 'listing_card' : null,
        parsedCityFrom: metadata.cityRaw ? 'listing_card_smallinfo' : null,
      },
    });
  }

  return candidates;
}

function extractKupikartuCandidates(
  html: string,
  source: IngestionSourceSummary,
): RawEventCandidate[] {
  const eventLinkRegex =
    /<a\b[^>]*href=["']([^"'#]*\/karte\/event\/\d+\/[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const candidates: RawEventCandidate[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(eventLinkRegex)) {
    const rawHref = match[1]?.trim();
    if (!rawHref) {
      continue;
    }

    const resolvedUrl = resolveUrl(rawHref, source.sourceUrl);
    if (!resolvedUrl || seen.has(resolvedUrl)) {
      continue;
    }

    // Extract from stripped text for title/date/venue (raw HTML has nested tags that break regex)
    const rawInnerHtml = match[2] ?? '';
    const strippedContent = stripHtml(rawInnerHtml);
    const titleRaw = normalizeKupikartuTitle(strippedContent);
    if (!titleRaw) {
      continue;
    }

    // Date and venue from stripped text, image from raw HTML (needs <img> tag)
    const dateRaw = extractKupikartuDate(strippedContent);
    const venueNameRaw = extractKupikartuVenue(strippedContent);
    const imageUrl = extractImageSrc(rawInnerHtml, source.sourceUrl);

    // Filter: only Sarajevo events from national sources. Strict — drop when
    // there's no positive Sarajevo signal in title/venue.
    if (!isStrictlySarajevo(titleRaw, venueNameRaw)) {
      continue;
    }

    seen.add(resolvedUrl);
    candidates.push({
      sourceUrl: resolvedUrl,
      titleRaw,
      descriptionRaw: null,
      dateRaw,
      imageUrl,
      venueRaw: venueNameRaw,
      venueNameRaw,
      rawHtml: match[0].slice(0, 4000),
      rawJson: {
        sourcePageUrl: source.sourceUrl,
        extractedFrom: 'kupikartu_event_link',
        fetchMethod: 'direct_html',
        parsedDateFrom: dateRaw ? 'listing_card' : null,
        parsedVenueFrom: venueNameRaw ? 'listing_card' : null,
      },
    });
  }

  return candidates;
}

export function extractCandidatesForSource(
  html: string,
  source: IngestionSourceSummary,
  sourcePageUrl = source.sourceUrl,
): RawEventCandidate[] | null {
  const parserHint = String(source.scrapeConfig.parser_hint ?? '');
  const sourceUrl = sourcePageUrl.toLowerCase();

  if (parserHint === 'pozorista_calendar' || sourceUrl.includes('pozorista.ba')) {
    return extractPozoristaCandidates(html, {
      ...source,
      sourceUrl: sourcePageUrl,
    });
  }

  if (parserHint === 'allevents_listing' || sourceUrl.includes('allevents.in')) {
    return extractAllEventsCandidates(html, {
      ...source,
      sourceUrl: sourcePageUrl,
    });
  }

  if (parserHint === 'kupikartu_listing' || sourceUrl.includes('kupikartu.ba')) {
    return extractKupikartuCandidates(html, {
      ...source,
      sourceUrl: sourcePageUrl,
    });
  }

  if (parserHint === 'ulaznice_listing' || sourceUrl.includes('ulaznice.org')) {
    return extractUlazniceCandidates(html, {
      ...source,
      sourceUrl: sourcePageUrl,
    });
  }

  return null;
}
