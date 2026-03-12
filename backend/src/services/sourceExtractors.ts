import type { RawEventCandidate } from './ingestionFetch.js';
import type { IngestionSourceSummary } from './ingestionSources.js';

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

    const titleRaw = normalizeKupikartuTitle(stripHtml(match[2] ?? ''));
    if (!titleRaw) {
      continue;
    }

    const dateRaw = extractKupikartuDate(match[2] ?? '');
    const venueNameRaw = extractKupikartuVenue(match[2] ?? '');
    const imageUrl = extractImageSrc(match[2] ?? '', source.sourceUrl);

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

  return null;
}
