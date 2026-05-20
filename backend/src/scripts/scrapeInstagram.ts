/**
 * scrapeInstagram.ts
 *
 * Apify-based Instagram event scraper. Reads curated sources from
 * `scrape_sources` (fetch_method='apify_instagram'), respects per-source
 * `frequency_hours` via `last_scraped_at`, and feeds captions to the
 * `parse-instagram` edge function (Claude Haiku) which writes into
 * `raw_events` when a post looks like an event announcement.
 *
 * Usage:
 *   tsx backend/src/scripts/scrapeInstagram.ts                    # all due sources, all tiers
 *   tsx backend/src/scripts/scrapeInstagram.ts --tier=1           # only tier-1 due sources
 *   tsx backend/src/scripts/scrapeInstagram.ts --tier=2 --limit=5 # cap to 5 sources for testing
 *   tsx backend/src/scripts/scrapeInstagram.ts --dry-run          # list due sources, no Apify calls
 *   tsx backend/src/scripts/scrapeInstagram.ts --force            # ignore last_scraped_at gating
 *
 * Required env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   APIFY_API_TOKEN
 *   ADMIN_FUNCTION_SECRET     (matches the secret set on the Supabase edge function runtime)
 */

import {
  requireSupabaseAdminConfig,
  requestSupabaseAdminJson,
  requestSupabaseAdminNoContent,
} from '../lib/supabaseAdmin.js';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ADMIN_SECRET = process.env.ADMIN_FUNCTION_SECRET;
const ACTOR_ID = 'apify~instagram-scraper';
const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_ATTEMPTS = 60;

interface CliArgs {
  tier: number | null;
  limit: number | null;
  dryRun: boolean;
  force: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { tier: null, limit: null, dryRun: false, force: false };
  for (const arg of argv) {
    const tier = arg.match(/^--tier=(\d+)$/);
    if (tier) args.tier = Number(tier[1]);
    const limit = arg.match(/^--limit=(\d+)$/);
    if (limit) args.limit = Number(limit[1]);
    if (arg === '--dry-run') args.dryRun = true;
    if (arg === '--force') args.force = true;
  }
  return args;
}

interface ScrapeSourceRow {
  id: string;
  name: string;
  tier: number;
  frequency_hours: number;
  last_scraped_at: string | null;
  scrape_config: {
    fetch_method: string;
    username: string;
    max_posts?: number;
    curation_reason?: string;
  };
}

interface ApifyRunResponse {
  data: { id: string; defaultDatasetId: string; status: string };
}
interface ApifyRunStatus {
  data: { status: string };
}
interface InstagramPost {
  caption?: string;
  url?: string;
  shortCode?: string;
  ownerUsername?: string;
  timestamp?: string;
  displayUrl?: string;
  likesCount?: number;
}
interface ParseInstagramResult {
  success: boolean;
  data?: {
    is_event: boolean;
    title: string | null;
    date: string | null;
    venue_name: string | null;
    confidence: string;
  };
  error?: string;
}

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Source loading
// ---------------------------------------------------------------------------

async function loadDueSources(args: CliArgs): Promise<ScrapeSourceRow[]> {
  let path =
    '/rest/v1/scrape_sources?select=id,name,tier,frequency_hours,last_scraped_at,scrape_config' +
    '&scrape_config->>fetch_method=eq.apify_instagram&is_active=eq.true';
  if (args.tier !== null) path += `&tier=eq.${args.tier}`;
  path += '&order=tier.asc,last_scraped_at.asc.nullsfirst';

  const rows = await requestSupabaseAdminJson<ScrapeSourceRow[]>(path);

  const now = Date.now();
  const due = args.force
    ? rows
    : rows.filter((s) => {
        if (!s.last_scraped_at) return true;
        const elapsedH = (now - new Date(s.last_scraped_at).getTime()) / 3_600_000;
        return elapsedH >= s.frequency_hours;
      });

  return args.limit ? due.slice(0, args.limit) : due;
}

async function markScraped(sourceId: string): Promise<void> {
  await requestSupabaseAdminNoContent(
    `/rest/v1/scrape_sources?id=eq.${sourceId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ last_scraped_at: new Date().toISOString() }),
    },
  );
}

async function logScrapeRun(
  sourceId: string,
  eventsCreated: number,
  error: string | null,
): Promise<void> {
  await requestSupabaseAdminNoContent('/rest/v1/scrape_log', {
    method: 'POST',
    body: JSON.stringify({
      source_id: sourceId,
      events_created: eventsCreated,
      error: error,
    }),
  });
}

// ---------------------------------------------------------------------------
// Apify integration
// ---------------------------------------------------------------------------

async function scrapeInstagramAccount(
  username: string,
  maxPosts: number,
): Promise<InstagramPost[]> {
  if (!APIFY_TOKEN) throw new Error('APIFY_API_TOKEN not set');

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: 'posts',
        resultsLimit: maxPosts,
      }),
    },
  );

  if (!runRes.ok) {
    const errText = await runRes.text();
    throw new Error(`Apify start failed (${runRes.status}): ${errText.slice(0, 300)}`);
  }

  const run = (await runRes.json()) as ApifyRunResponse;
  const { id: runId, defaultDatasetId: datasetId } = run.data;
  let status = run.data.status;
  let attempts = 0;
  while ((status === 'RUNNING' || status === 'READY') && attempts < MAX_POLL_ATTEMPTS) {
    await sleep(POLL_INTERVAL_MS);
    attempts++;
    const checkRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`,
    );
    if (!checkRes.ok) continue;
    status = ((await checkRes.json()) as ApifyRunStatus).data.status;
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify run ${runId} ended with status: ${status}`);
  }

  const resultsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`,
  );
  if (!resultsRes.ok) throw new Error(`Failed to fetch dataset (${resultsRes.status})`);
  return resultsRes.json() as Promise<InstagramPost[]>;
}

// ---------------------------------------------------------------------------
// Edge function integration
// ---------------------------------------------------------------------------

async function parseCaption(
  caption: string,
  accountName: string,
  postUrl: string,
  imageUrl?: string,
): Promise<ParseInstagramResult> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();

  const headers: Record<string, string> = {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
    'Content-Type': 'application/json',
  };
  if (ADMIN_SECRET) headers['X-Admin-Secret'] = ADMIN_SECRET;

  const res = await fetch(`${supabaseUrl}/functions/v1/parse-instagram`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      caption,
      account_name: accountName,
      post_url: postUrl,
      image_url: imageUrl,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, error: `Edge function ${res.status}: ${errText.slice(0, 200)}` };
  }
  return res.json() as Promise<ParseInstagramResult>;
}

// ---------------------------------------------------------------------------
// Per-source processing
// ---------------------------------------------------------------------------

interface ProcessResult {
  events: number;
  posts: number;
  skipped: number;
  parseErrors: number;
}

async function processSource(source: ScrapeSourceRow): Promise<ProcessResult> {
  const username = source.scrape_config.username;
  const maxPosts = source.scrape_config.max_posts ?? 10;

  log(`  Scraping @${username} (tier ${source.tier}, max ${maxPosts} posts)...`);
  const posts = await scrapeInstagramAccount(username, maxPosts);
  log(`  Got ${posts.length} posts from @${username}`);

  let events = 0;
  let skipped = 0;
  let parseErrors = 0;

  for (const post of posts) {
    const caption = post.caption?.trim();
    if (!caption || caption.length < 20) {
      skipped++;
      continue;
    }
    const postUrl =
      post.url ?? `https://www.instagram.com/p/${post.shortCode ?? 'unknown'}/`;
    const result = await parseCaption(caption, username, postUrl, post.displayUrl);
    if (!result.success) {
      parseErrors++;
      log(`    [parse error] ${result.error}`);
      continue;
    }
    if (result.data?.is_event) {
      events++;
      log(
        `    [event] "${result.data.title}" on ${result.data.date ?? '?'} (${result.data.confidence})`,
      );
    }
  }

  return { events, posts: posts.length, skipped, parseErrors };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!APIFY_TOKEN && !args.dryRun) {
    console.error('APIFY_API_TOKEN is not set. Add it to backend/.env');
    process.exit(1);
  }
  if (!ADMIN_SECRET && !args.dryRun) {
    console.error(
      'WARNING: ADMIN_FUNCTION_SECRET not set — parse-instagram edge function will return 403.',
    );
    console.error('Set it in backend/.env and in Supabase Edge Function secrets.');
  }

  const due = await loadDueSources(args);
  log(`Found ${due.length} due Instagram source(s)${args.tier ? ` in tier ${args.tier}` : ''}`);

  if (args.dryRun) {
    for (const s of due) {
      log(
        `  [dry-run] @${s.scrape_config.username} (tier ${s.tier}, last: ${s.last_scraped_at ?? 'never'})`,
      );
    }
    return;
  }

  let totalEvents = 0;
  let totalPosts = 0;
  let totalScrapeErrors = 0;
  let totalParseErrors = 0;

  for (const source of due) {
    const username = source.scrape_config.username;
    log(`--- @${username} ---`);
    try {
      const result = await processSource(source);
      totalEvents += result.events;
      totalPosts += result.posts;
      totalParseErrors += result.parseErrors;
      await markScraped(source.id);
      await logScrapeRun(source.id, result.events, null);
      log(
        `  Summary: ${result.posts} posts, ${result.events} events, ${result.skipped} skipped, ${result.parseErrors} parse errors\n`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      totalScrapeErrors++;
      // 404 / private / banned handles end up here. We still mark last_scraped_at so
      // we don't pound the dead handle every run, but log the error for cleanup.
      await markScraped(source.id);
      await logScrapeRun(source.id, 0, msg.slice(0, 500));
      log(`  [scrape error] ${msg}\n`);
    }
  }

  log('=== Instagram Scrape Complete ===');
  log(`  Sources processed: ${due.length}`);
  log(`  Posts: ${totalPosts}`);
  log(`  Events detected: ${totalEvents}`);
  log(`  Scrape errors (dead handles): ${totalScrapeErrors}`);
  log(`  Parse errors: ${totalParseErrors}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
