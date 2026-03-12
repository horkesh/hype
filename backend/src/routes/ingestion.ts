import type { App } from '../index.js';
import { buildIngestionRunErrorResult, parseIngestionLimitParam } from './ingestionRouteUtils.js';
import { hasSupabaseAdminConfig } from '../lib/supabaseAdmin.js';
import { fetchSourceContent } from '../services/ingestionFetch.js';
import { createScrapeRunLog, updateScrapeRunLog } from '../services/ingestionRuns.js';
import { getIngestionSourceById, listIngestionSources } from '../services/ingestionSources.js';
import { buildRecentParsePreview, listRecentRawEvents } from '../services/parsePreview.js';
import { insertRawEventCandidates, updateSourceLastScrapedAt } from '../services/rawEvents.js';

export function registerIngestionRoutes(app: App) {
  app.get('/ingestion/health', async () => {
    return {
      status: 'ok',
      area: 'ingestion',
      message: 'Ingestion route surface is registered.',
    };
  });

  app.get('/ingestion/sources', async () => {
    if (!hasSupabaseAdminConfig()) {
      return {
        status: 'not_configured',
        message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for backend ingestion reads.',
        sources: [],
      };
    }

    try {
      const sources = await listIngestionSources();

      return {
        status: 'ok',
        sources,
      };
    } catch (error) {
      app.logger.error({ error }, 'Failed to load ingestion sources');

      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to load ingestion sources.',
        sources: [],
      };
    }

    /*
    return {
      status: 'not_implemented',
      message: 'Source listing is not implemented yet.',
      next_step: 'Connect this route to scrape_sources in Supabase.',
    };
    */
  });

  app.get('/ingestion/raw/recent', async (request) => {
    const query = request.query as { limit?: string; sourceName?: string };

    if (!hasSupabaseAdminConfig()) {
      return {
        status: 'not_configured',
        message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for backend ingestion reads.',
        rows: [],
      };
    }

    try {
      const limit = parseIngestionLimitParam(query.limit);
      const rows = await listRecentRawEvents(limit, query.sourceName);

      return {
        status: 'ok',
        rows,
      };
    } catch (error) {
      app.logger.error({ error }, 'Failed to load recent raw events');

      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to load recent raw events.',
        rows: [],
      };
    }
  });

  app.get('/ingestion/parse-preview', async (request) => {
    const query = request.query as { limit?: string; sourceName?: string };

    if (!hasSupabaseAdminConfig()) {
      return {
        status: 'not_configured',
        message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for backend ingestion reads.',
        candidates: [],
      };
    }

    try {
      const limit = parseIngestionLimitParam(query.limit);
      const candidates = await buildRecentParsePreview(limit, query.sourceName);

      return {
        status: 'ok',
        candidates,
      };
    } catch (error) {
      app.logger.error({ error }, 'Failed to build parse preview');

      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to build parse preview.',
        candidates: [],
      };
    }
  });

  app.post('/ingestion/run/:sourceId', async (request) => {
    const params = request.params as { sourceId?: string };
    const body = (request.body ?? {}) as {
      mode?: string;
      dryRun?: boolean;
      notes?: string;
    };

    if (!hasSupabaseAdminConfig()) {
      return {
        status: 'not_configured',
        message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for backend ingestion writes.',
        sourceId: params.sourceId ?? null,
        logId: null,
      };
    }

    if (!params.sourceId) {
      return {
        status: 'error',
        message: 'Missing sourceId route parameter.',
        sourceId: null,
        logId: null,
      };
    }

    const mode = body.mode ?? 'manual';
    const dryRun = body.dryRun ?? true;
    const notes = body.notes ?? null;
    let source = null as Awaited<ReturnType<typeof getIngestionSourceById>>;
    let logId: string | null = null;

    try {
      source = await getIngestionSourceById(params.sourceId);

      if (!source) {
        return {
          status: 'error',
          message: 'Scrape source not found.',
          sourceId: params.sourceId,
          logId: null,
        };
      }

      if (!source.isActive) {
        return {
          status: 'error',
          message: 'Scrape source is inactive.',
          sourceId: params.sourceId,
          logId: null,
        };
      }

      logId = await createScrapeRunLog({
        source,
        mode,
        dryRun,
        notes,
      });

      const fetchResult = await fetchSourceContent(source);
      let rawRowsInserted = 0;
      let rawRowsSkipped = 0;

      if (!dryRun) {
        const insertSummary = await insertRawEventCandidates(source, fetchResult.candidates);
        rawRowsInserted = insertSummary.inserted;
        rawRowsSkipped = insertSummary.skipped;
        await updateSourceLastScrapedAt(source.id, fetchResult.fetchedAt);
      }

      await updateScrapeRunLog(logId, {
        stage: dryRun ? 'dry_run_complete' : 'raw_intake_complete',
        mode,
        dryRun,
        notes,
        source,
        fetchedAt: fetchResult.fetchedAt,
        fetchedUrl: fetchResult.fetchedUrl,
        fetchedUrls: fetchResult.fetchedUrls,
        fetchMethod: fetchResult.fetchMethod,
        rawRowsSeen: fetchResult.candidates.length,
        rawRowsInserted,
        rawRowsSkipped: dryRun ? 0 : rawRowsSkipped,
        eventsCreated: 0,
        rawContent: fetchResult.rawContent.slice(0, 12000),
      });

      return {
        status: 'ok',
        message: dryRun
          ? 'Source fetched and candidates extracted in dry-run mode.'
          : 'Source fetched and raw event candidates inserted.',
        source: {
          id: source.id,
          name: source.name,
        },
        run: {
          mode,
          dryRun,
          notes,
          logId,
          fetchedAt: fetchResult.fetchedAt,
          fetchedUrl: fetchResult.fetchedUrl,
          fetchedUrls: fetchResult.fetchedUrls,
          fetchMethod: fetchResult.fetchMethod,
          rawRowsSeen: fetchResult.candidates.length,
          rawRowsInserted,
          rawRowsSkipped: dryRun ? 0 : rawRowsSkipped,
          eventsCreated: 0,
        },
      };
    } catch (error) {
      if (logId && source) {
        try {
          await updateScrapeRunLog(logId, {
            stage: 'raw_intake_failed',
            mode,
            dryRun,
            notes,
            source,
            eventsCreated: 0,
            error: error instanceof Error ? error.message : 'Unknown ingestion failure.',
          });
        } catch {
          // Best-effort error logging should not mask the original failure.
        }
      }

      app.logger.error({ error, sourceId: params.sourceId }, 'Failed to queue ingestion run');

      return buildIngestionRunErrorResult(
        params.sourceId,
        logId,
        error instanceof Error ? error.message : 'Failed to queue ingestion run.',
      );
    }
  });
}
