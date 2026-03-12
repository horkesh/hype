import { fetchSupabaseAdminJson, requestSupabaseAdminNoContent } from '../lib/supabaseAdmin.js';
import type { RawEventCandidate } from './ingestionFetch.js';
import type { IngestionSourceSummary } from './ingestionSources.js';

interface ExistingRawEventRow {
  source_url: string;
}

interface RawEventInsertRow {
  id: string;
  source_url: string;
}

export interface RawEventInsertSummary {
  inserted: number;
  skipped: number;
}

function encodeInList(values: string[]): string {
  return values
    .map((value) => `"${value.replace(/"/g, '\\"')}"`)
    .join(',');
}

async function getExistingRawEventUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) {
    return new Set<string>();
  }

  const rows = await fetchSupabaseAdminJson<ExistingRawEventRow[]>(
    `/rest/v1/raw_events?select=source_url&source_url=in.(${encodeURIComponent(encodeInList(urls))})`,
  );

  return new Set(rows.map((row) => row.source_url));
}

export async function insertRawEventCandidates(
  source: IngestionSourceSummary,
  candidates: RawEventCandidate[],
): Promise<RawEventInsertSummary> {
  const urls = candidates.map((candidate) => candidate.sourceUrl);
  const existingUrls = await getExistingRawEventUrls(urls);
  const rowsToInsert = candidates
    .filter((candidate) => !existingUrls.has(candidate.sourceUrl))
    .map((candidate) => ({
      source_name: source.name,
      source_url: candidate.sourceUrl,
      title_raw: candidate.titleRaw,
      description_raw: candidate.descriptionRaw ?? null,
      date_raw: candidate.dateRaw ?? null,
      image_url: candidate.imageUrl ?? null,
      raw_html: candidate.rawHtml,
      parsed: false,
      venue_raw: candidate.venueRaw ?? null,
      raw_json: candidate.rawJson,
      parse_attempts: 0,
      parsed_at: null,
      venue_name_raw: candidate.venueNameRaw ?? null,
      venue_match_status: 'unmatched',
      matched_venue_id: null,
    }));

  if (rowsToInsert.length > 0) {
    await fetchSupabaseAdminJson<RawEventInsertRow[]>(
      '/rest/v1/raw_events?select=id,source_url',
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(rowsToInsert),
      },
    );
  }

  return {
    inserted: rowsToInsert.length,
    skipped: candidates.length - rowsToInsert.length,
  };
}

export async function updateSourceLastScrapedAt(
  sourceId: string,
  lastScrapedAt: string,
): Promise<void> {
  await requestSupabaseAdminNoContent(`/rest/v1/scrape_sources?id=eq.${sourceId}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      last_scraped_at: lastScrapedAt,
    }),
  });
}
