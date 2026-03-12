import { requestSupabaseAdminJson } from '../lib/supabaseAdmin.js';
import type { IngestionSourceSummary } from './ingestionSources.js';

export interface StartIngestionRunInput {
  source: IngestionSourceSummary;
  mode: string;
  dryRun: boolean;
  notes: string | null;
}

interface ScrapeLogRow {
  id: string;
}

export async function updateScrapeRunLog(
  logId: string,
  input: {
    stage: string;
    mode: string;
    dryRun: boolean;
    notes: string | null;
    source: IngestionSourceSummary;
    fetchedAt?: string;
    fetchedUrl?: string;
    fetchedUrls?: string[];
    fetchMethod?: string;
    rawRowsSeen?: number;
    rawRowsInserted?: number;
    rawRowsSkipped?: number;
    eventsCreated?: number;
    error?: string | null;
    rawContent?: string | null;
  },
): Promise<void> {
  await requestSupabaseAdminJson<ScrapeLogRow[]>(
    `/rest/v1/scrape_log?id=eq.${logId}&select=id`,
    {
      method: 'PATCH',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        raw_content: input.rawContent ?? null,
        parsed_data: {
          stage: input.stage,
          mode: input.mode,
          dryRun: input.dryRun,
          notes: input.notes,
          sourceName: input.source.name,
          sourceUrl: input.source.sourceUrl,
          fetchedAt: input.fetchedAt ?? null,
          fetchedUrl: input.fetchedUrl ?? input.source.sourceUrl,
          fetchedUrls: input.fetchedUrls ?? [input.fetchedUrl ?? input.source.sourceUrl],
          fetchMethod: input.fetchMethod ?? null,
          rawRowsSeen: input.rawRowsSeen ?? 0,
          rawRowsInserted: input.rawRowsInserted ?? 0,
          rawRowsSkipped: input.rawRowsSkipped ?? 0,
          eventsCreated: input.eventsCreated ?? 0,
        },
        events_created: input.eventsCreated ?? 0,
        tokens_used: 0,
        error: input.error ?? null,
      }),
    },
  );
}

export async function createScrapeRunLog({
  source,
  mode,
  dryRun,
  notes,
}: StartIngestionRunInput): Promise<string> {
  const now = new Date().toISOString();

  const rows = await requestSupabaseAdminJson<ScrapeLogRow[]>(
    '/rest/v1/scrape_log?select=id',
    {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify([
        {
          source_id: source.id,
          raw_content: null,
          parsed_data: {
            stage: 'queued',
            mode,
            dryRun,
            notes,
            sourceName: source.name,
            sourceUrl: source.sourceUrl,
            queuedAt: now,
          },
          events_created: 0,
          tokens_used: 0,
          error: null,
        },
      ]),
    },
  );

  if (!rows[0]?.id) {
    throw new Error('Scrape log insert did not return a log id.');
  }

  return rows[0].id;
}
