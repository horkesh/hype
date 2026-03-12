import type { RawEventCandidate } from './ingestionFetch.js';
import type { IngestionSourceSummary } from './ingestionSources.js';

type FetchLike = typeof fetch;

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

function pickString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function normalizeVenue(value: unknown): string | null {
  const picked = pickString(value);
  return picked && picked.length >= 2 ? picked : null;
}

function extractJsonLdBlocks(html: string): unknown[] {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const results: unknown[] = [];

  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }

    try {
      results.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return results;
}

function flattenJsonLdNodes(value: unknown): Record<string, unknown>[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenJsonLdNodes(item));
  }

  const record = value as Record<string, unknown>;
  const graph = Array.isArray(record['@graph']) ? (record['@graph'] as unknown[]) : null;
  if (graph) {
    return graph.flatMap((item) => flattenJsonLdNodes(item));
  }

  return [record];
}

function findEventJsonLd(html: string): Record<string, unknown> | null {
  const nodes = extractJsonLdBlocks(html).flatMap((block) => flattenJsonLdNodes(block));

  for (const node of nodes) {
    const type = node['@type'];
    if (
      type === 'Event' ||
      type === 'SocialEvent' ||
      (Array.isArray(type) && type.some((entry) => entry === 'Event' || entry === 'SocialEvent'))
    ) {
      return node;
    }
  }

  return null;
}

export function enrichAllEventsCandidateFromDetail(
  candidate: RawEventCandidate,
  detailHtml: string,
): RawEventCandidate {
  const eventLd = findEventJsonLd(detailHtml);
  if (!eventLd) {
    return candidate;
  }

  const location = eventLd.location as Record<string, unknown> | undefined;
  const image = eventLd.image;
  const imageUrl =
    pickString(image) ??
    (Array.isArray(image) ? pickString(image[0]) : null);

  return {
    ...candidate,
    titleRaw: pickString(eventLd.name) ?? candidate.titleRaw,
    descriptionRaw: pickString(eventLd.description) ?? candidate.descriptionRaw ?? null,
    dateRaw: pickString(eventLd.startDate) ?? candidate.dateRaw ?? null,
    imageUrl: imageUrl ?? candidate.imageUrl ?? null,
    venueRaw:
      normalizeVenue(location?.name) ??
      normalizeVenue((location?.address as Record<string, unknown> | undefined)?.name) ??
      candidate.venueRaw ??
      null,
    venueNameRaw:
      normalizeVenue(location?.name) ??
      normalizeVenue((location?.address as Record<string, unknown> | undefined)?.name) ??
      candidate.venueNameRaw ??
      null,
    rawJson: {
      ...candidate.rawJson,
      detailEnrichment: 'allevents_jsonld',
      detailTitleFound: Boolean(pickString(eventLd.name)),
      detailDateFound: Boolean(pickString(eventLd.startDate)),
      detailVenueFound: Boolean(
        normalizeVenue(location?.name) ??
          normalizeVenue((location?.address as Record<string, unknown> | undefined)?.name),
      ),
    },
  };
}

export function enrichKupikartuCandidateFromDetail(
  candidate: RawEventCandidate,
  detailHtml: string,
): RawEventCandidate {
  const title =
    detailHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1] ??
    detailHtml.match(/<title>([^<]+)<\/title>/i)?.[1] ??
    null;
  const dateMatch = detailHtml.match(/(\d{2}\.\d{2}\.\d{4})(?:\s*(?:u\s*)?(\d{2}:\d{2}))?/i);
  const venueMatch = detailHtml.match(/@\s*([^<\n]+)/);
  const ogImageMatch =
    detailHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
    detailHtml.match(/og:image['"]\s*content=['"]([^'"]+)/i)?.[1] ??
    null;
  const descriptionMatch =
    detailHtml.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
    detailHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
    null;

  const dateRaw = dateMatch
    ? `${dateMatch[1]}${dateMatch[2] ? ` ${dateMatch[2]}` : ''}`
    : candidate.dateRaw ?? null;
  const venueNameRaw = venueMatch ? stripHtml(venueMatch[1]) : candidate.venueNameRaw ?? null;

  return {
    ...candidate,
    titleRaw: title ? stripHtml(title) : candidate.titleRaw,
    descriptionRaw: descriptionMatch ? stripHtml(descriptionMatch) : candidate.descriptionRaw ?? null,
    dateRaw,
    imageUrl: pickString(ogImageMatch) ?? candidate.imageUrl ?? null,
    venueRaw: venueNameRaw,
    venueNameRaw,
    rawJson: {
      ...candidate.rawJson,
      detailEnrichment: 'kupikartu_detail_page',
      detailTitleFound: Boolean(title),
      detailDateFound: Boolean(dateMatch),
      detailVenueFound: Boolean(venueMatch),
    },
  };
}

async function fetchDetailHtml(url: string, fetchImpl: FetchLike): Promise<string> {
  const response = await fetchImpl(url, {
    headers: {
      'User-Agent': 'HypeIngestionBot/0.1 (+https://hype.local)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Detail fetch failed for ${url} (${response.status}): ${errorText.slice(0, 500)}`);
  }

  return response.text();
}

export async function enrichCandidatesForSource(
  candidates: RawEventCandidate[],
  source: IngestionSourceSummary,
  fetchImpl: FetchLike = fetch,
): Promise<RawEventCandidate[]> {
  const parserHint = String(source.scrapeConfig.parser_hint ?? '');
  const fetchMethod = String(source.scrapeConfig.fetch_method ?? 'direct_html');
  const detailFetchEnabled = source.scrapeConfig.detail_fetch !== false;
  const detailFetchLimit = Number(source.scrapeConfig.detail_fetch_limit ?? 5);

  if (!detailFetchEnabled || fetchMethod !== 'direct_html' || detailFetchLimit <= 0) {
    return candidates;
  }

  const limitedCandidates = candidates.slice(0, detailFetchLimit);
  const remainingCandidates = candidates.slice(detailFetchLimit);
  const enriched: RawEventCandidate[] = [];

  for (const candidate of limitedCandidates) {
    try {
      const detailHtml = await fetchDetailHtml(candidate.sourceUrl, fetchImpl);

      if (parserHint === 'allevents_listing' || candidate.sourceUrl.includes('allevents.in')) {
        enriched.push(enrichAllEventsCandidateFromDetail(candidate, detailHtml));
        continue;
      }

      if (parserHint === 'kupikartu_listing' || candidate.sourceUrl.includes('kupikartu.ba')) {
        enriched.push(enrichKupikartuCandidateFromDetail(candidate, detailHtml));
        continue;
      }

      enriched.push(candidate);
    } catch (error) {
      enriched.push({
        ...candidate,
        rawJson: {
          ...candidate.rawJson,
          detailEnrichment: 'failed',
          detailEnrichmentError: error instanceof Error ? error.message : 'Unknown detail enrichment error.',
        },
      });
    }
  }

  return [...enriched, ...remainingCandidates];
}
