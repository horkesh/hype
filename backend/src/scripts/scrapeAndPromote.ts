/**
 * scrapeAndPromote.ts
 *
 * Convenience wrapper: scrape, then promote, in one invocation. Each step
 * still logs its own progress; if scraping has errors we continue to the
 * promotion phase so raw_events that landed successfully can still be promoted.
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/scrapeAndPromote.ts [sourceId]
 *
 * Why this isn't built into runScraper.ts:
 *   - scrape and promote have different failure modes
 *   - they may run on different cadences (scrape every 6h, promote nightly)
 *   - keeping them separately invokable lets us re-scrape without re-promoting,
 *     and re-promote without re-scraping
 */

import { runScraper } from './runScraper.js';
import { promoteEvents } from './promoteEvents.js';

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function main(): Promise<void> {
  const sourceIdArg = process.argv[2];

  log('=== Phase 1/2: Scrape ===');
  try {
    await runScraper(sourceIdArg);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`Scrape phase errored: ${msg}`);
    log('Continuing to promotion — raw_events from successful sources can still be promoted.');
  }

  console.log();
  log('=== Phase 2/2: Promote ===');
  await promoteEvents();

  console.log();
  log('=== scrapeAndPromote complete ===');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
