import { fetchSupabaseAdminJson } from '../lib/supabaseAdmin.js';

export interface ScrapeSourceRow {
  id: string;
  name: string;
  source_url: string;
  tier: number | null;
  scrape_config: Record<string, unknown> | null;
  frequency_hours: number | null;
  is_active: boolean | null;
  last_scraped_at: string | null;
}

export interface IngestionSourceSummary {
  id: string;
  name: string;
  sourceUrl: string;
  tier: number;
  scrapeConfig: Record<string, unknown>;
  frequencyHours: number;
  isActive: boolean;
  lastScrapedAt: string | null;
  readyToRun: boolean;
}

export function isSourceReadyToRun(
  lastScrapedAt: string | null,
  frequencyHours: number,
  isActive: boolean,
  now = new Date(),
): boolean {
  if (!isActive) {
    return false;
  }

  if (!lastScrapedAt) {
    return true;
  }

  const lastRun = new Date(lastScrapedAt);
  if (Number.isNaN(lastRun.getTime())) {
    return true;
  }

  const elapsedMs = now.getTime() - lastRun.getTime();
  return elapsedMs >= frequencyHours * 60 * 60 * 1000;
}

export function mapScrapeSourceRow(row: ScrapeSourceRow, now = new Date()): IngestionSourceSummary {
  const frequencyHours = row.frequency_hours ?? 24;
  const isActive = row.is_active ?? false;

  return {
    id: row.id,
    name: row.name,
    sourceUrl: row.source_url,
    tier: row.tier ?? 2,
    scrapeConfig: row.scrape_config ?? {},
    frequencyHours,
    isActive,
    lastScrapedAt: row.last_scraped_at,
    readyToRun: isSourceReadyToRun(row.last_scraped_at, frequencyHours, isActive, now),
  };
}

export async function listIngestionSources(): Promise<IngestionSourceSummary[]> {
  const rows = await fetchSupabaseAdminJson<ScrapeSourceRow[]>(
    '/rest/v1/scrape_sources?select=id,name,source_url,tier,scrape_config,frequency_hours,is_active,last_scraped_at&order=name.asc',
  );

  return rows.map((row) => mapScrapeSourceRow(row));
}

export async function getIngestionSourceById(sourceId: string): Promise<IngestionSourceSummary | null> {
  const rows = await fetchSupabaseAdminJson<ScrapeSourceRow[]>(
    `/rest/v1/scrape_sources?select=id,name,source_url,tier,scrape_config,frequency_hours,is_active,last_scraped_at&id=eq.${sourceId}&limit=1`,
  );

  if (!rows[0]) {
    return null;
  }

  return mapScrapeSourceRow(rows[0]);
}
