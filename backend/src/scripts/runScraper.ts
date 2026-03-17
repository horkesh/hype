/**
 * runScraper.ts
 *
 * Standalone scrape runner that executes the existing ingestion pipeline
 * for all active sources (or a single specified source).
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/runScraper.ts [sourceId]
 */

import { listIngestionSources, getIngestionSourceById } from '../services/ingestionSources.js';
import type { IngestionSourceSummary } from '../services/ingestionSources.js';
import { fetchSourceContent } from '../services/ingestionFetch.js';
import { insertRawEventCandidates, updateSourceLastScrapedAt } from '../services/rawEvents.js';
import { createScrapeRunLog, updateScrapeRunLog } from '../services/ingestionRuns.js';

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function scrapeSource(source: IngestionSourceSummary): Promise<void> {
  log(`--- Scraping: ${source.name} (${source.id}) ---`);
  log(`  URL: ${source.sourceUrl}`);
  log(`  Fetch method: ${source.scrapeConfig.fetch_method ?? 'direct_html'}`);

  // Skip non-direct_html sources (e.g. apify_instagram handled by scrapeInstagram.ts)
  const fetchMethod = String(source.scrapeConfig.fetch_method ?? 'direct_html');
  if (fetchMethod !== 'direct_html') {
    log(`  Skipping — fetch method "${fetchMethod}" not handled by this runner.`);
    return;
  }

  // Create scrape run log
  const logId = await createScrapeRunLog({
    source,
    mode: 'auto',
    dryRun: false,
    notes: 'runScraper.ts CLI',
  });
  log(`  Scrape log: ${logId}`);

  try {
    // Fetch and extract candidates
    log('  Fetching source content...');
    const result = await fetchSourceContent(source);
    log(`  Fetched ${result.fetchedUrls.length} URL(s), found ${result.candidates.length} candidates`);

    // Insert into raw_events
    const insertResult = await insertRawEventCandidates(source, result.candidates);
    log(`  Inserted: ${insertResult.inserted}, Skipped (duplicates): ${insertResult.skipped}`);

    // Update source last_scraped_at
    await updateSourceLastScrapedAt(source.id, result.fetchedAt);

    // Update scrape log
    await updateScrapeRunLog(logId, {
      stage: 'complete',
      mode: 'auto',
      dryRun: false,
      notes: 'runScraper.ts CLI',
      source,
      fetchedAt: result.fetchedAt,
      fetchedUrl: result.fetchedUrl,
      fetchedUrls: result.fetchedUrls,
      fetchMethod: result.fetchMethod,
      rawRowsSeen: result.candidates.length,
      rawRowsInserted: insertResult.inserted,
      rawRowsSkipped: insertResult.skipped,
      rawContent: result.rawContent.slice(0, 50_000),
    });

    log(`  Done.`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log(`  ERROR: ${errorMsg}`);

    await updateScrapeRunLog(logId, {
      stage: 'error',
      mode: 'auto',
      dryRun: false,
      notes: 'runScraper.ts CLI',
      source,
      error: errorMsg,
    }).catch(() => {});
  }
}

async function main() {
  const sourceIdArg = process.argv[2];

  if (sourceIdArg) {
    // Scrape a single source
    log(`Running scraper for source: ${sourceIdArg}`);
    const source = await getIngestionSourceById(sourceIdArg);
    if (!source) {
      console.error(`Source not found: ${sourceIdArg}`);
      process.exit(1);
    }
    await scrapeSource(source);
  } else {
    // Scrape all active sources that are ready
    log('Fetching all ingestion sources...');
    const sources = await listIngestionSources();
    const activeSources = sources.filter((s) => s.isActive);
    const readySources = activeSources.filter((s) => s.readyToRun);

    log(`Found ${sources.length} sources total, ${activeSources.length} active, ${readySources.length} ready to run`);

    if (readySources.length === 0) {
      log('No sources ready to run. Use a sourceId argument to force-run a specific source.');
      return;
    }

    for (const source of readySources) {
      try {
        await scrapeSource(source);
      } catch (err) {
        log(`Unhandled error for ${source.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.log();
    }
  }

  log('Scraper run complete.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
