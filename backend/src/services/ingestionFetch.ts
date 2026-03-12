import type { IngestionSourceSummary } from './ingestionSources.js';
import { enrichCandidatesForSource } from './sourceDetailEnrichment.js';
import { extractCandidatesForSource } from './sourceExtractors.js';

export interface RawEventCandidate {
  sourceUrl: string;
  titleRaw: string | null;
  descriptionRaw?: string | null;
  dateRaw?: string | null;
  imageUrl?: string | null;
  venueRaw?: string | null;
  venueNameRaw?: string | null;
  rawHtml: string | null;
  rawJson: Record<string, unknown>;
}

export interface SourceFetchResult {
  fetchedAt: string;
  fetchedUrl: string;
  fetchedUrls: string[];
  fetchMethod: string;
  rawContent: string;
  candidates: RawEventCandidate[];
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

function resolveSourceFetchUrls(source: IngestionSourceSummary): string[] {
  const primaryUrl = String(source.scrapeConfig.list_url ?? source.sourceUrl);
  const configuredListUrls = Array.isArray(source.scrapeConfig.list_urls)
    ? source.scrapeConfig.list_urls
    : [];
  const categoryUrls = Array.isArray(source.scrapeConfig.category_urls)
    ? source.scrapeConfig.category_urls
    : [];
  const seen = new Set<string>();
  const resolved: string[] = [];

  for (const rawUrl of [primaryUrl, ...configuredListUrls, ...categoryUrls]) {
    if (typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
      continue;
    }

    try {
      const absoluteUrl = new URL(rawUrl, primaryUrl).toString();
      if (seen.has(absoluteUrl)) {
        continue;
      }

      seen.add(absoluteUrl);
      resolved.push(absoluteUrl);
    } catch {
      continue;
    }
  }

  return resolved.length > 0 ? resolved : [source.sourceUrl];
}

export function extractRawEventCandidates(
  html: string,
  source: IngestionSourceSummary,
  maxCandidates = 25,
  sourcePageUrl = source.sourceUrl,
): RawEventCandidate[] {
  const sourceSpecificCandidates = extractCandidatesForSource(html, source, sourcePageUrl);
  if (sourceSpecificCandidates && sourceSpecificCandidates.length > 0) {
    return sourceSpecificCandidates.slice(0, maxCandidates);
  }

  const anchorRegex = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const candidates: RawEventCandidate[] = [];
  const seenUrls = new Set<string>();

  for (const match of html.matchAll(anchorRegex)) {
    if (candidates.length >= maxCandidates) {
      break;
    }

    const rawHref = match[1]?.trim();
    if (!rawHref || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      continue;
    }

    let resolvedUrl: string;
    try {
      resolvedUrl = new URL(rawHref, sourcePageUrl).toString();
    } catch {
      continue;
    }

    if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
      continue;
    }

    if (seenUrls.has(resolvedUrl)) {
      continue;
    }

    const titleRaw = stripHtml(match[2] ?? '') || null;
    if (!titleRaw || titleRaw.length < 4) {
      continue;
    }

    seenUrls.add(resolvedUrl);
    candidates.push({
      sourceUrl: resolvedUrl,
      titleRaw,
      descriptionRaw: null,
      dateRaw: null,
      imageUrl: null,
      venueRaw: null,
      venueNameRaw: null,
      rawHtml: match[0].slice(0, 4000),
      rawJson: {
        sourcePageUrl,
        extractedFrom: 'anchor',
        fetchMethod: 'direct_html',
      },
    });
  }

  return candidates;
}

export async function fetchSourceContent(source: IngestionSourceSummary): Promise<SourceFetchResult> {
  const fetchMethod = String(source.scrapeConfig.fetch_method ?? 'direct_html');
  const fetchedUrls = resolveSourceFetchUrls(source);
  const fetchedUrl = fetchedUrls[0] ?? source.sourceUrl;

  if (fetchMethod !== 'direct_html') {
    throw new Error(
      `Fetch method "${fetchMethod}" is not implemented yet. The current raw-intake path supports direct_html only.`,
    );
  }

  const rawContentParts: string[] = [];
  const candidates: RawEventCandidate[] = [];
  const seenCandidateUrls = new Set<string>();

  for (const pageUrl of fetchedUrls) {
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'HypeIngestionBot/0.1 (+https://hype.local)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Source fetch failed for ${pageUrl} (${response.status}): ${errorText.slice(0, 500)}`);
    }

    const pageContent = await response.text();
    rawContentParts.push(`<!-- sourcePageUrl: ${pageUrl} -->\n${pageContent}`);

    const pageCandidates = extractRawEventCandidates(pageContent, source, 25, pageUrl);
    for (const candidate of pageCandidates) {
      if (seenCandidateUrls.has(candidate.sourceUrl)) {
        continue;
      }

      seenCandidateUrls.add(candidate.sourceUrl);
      candidates.push(candidate);
    }
  }

  const fetchedAt = new Date().toISOString();
  const rawContent = rawContentParts.join('\n\n');
  const enrichedCandidates = await enrichCandidatesForSource(candidates, source);

  return {
    fetchedAt,
    fetchedUrl,
    fetchedUrls,
    fetchMethod,
    rawContent,
    candidates: enrichedCandidates,
  };
}
