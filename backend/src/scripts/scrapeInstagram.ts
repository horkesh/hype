/**
 * scrapeInstagram.ts
 *
 * Apify-based Instagram event scraper. Fetches latest posts from
 * Sarajevo venue accounts and sends captions through parse-instagram
 * edge function to detect and insert events into raw_events.
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/scrapeInstagram.ts
 *
 * Requires APIFY_API_TOKEN in backend/.env
 */

import { requireSupabaseAdminConfig, requestSupabaseAdminJson } from '../lib/supabaseAdmin.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'apify~instagram-scraper';
const MAX_POSTS_PER_ACCOUNT = 10;
const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_ATTEMPTS = 60; // 5 min max wait

// Curated event-likely venues (clubs, theatres, cultural spaces, music venues)
const CURATED_EVENT_ACCOUNTS = [
  'cinemassloga',
  'jazzbina_sarajevo',
  'bkcsarajevo',
  'narodnopozoristesarajevo',
  'kamerniteatar55',
  'dom_mladih_skenderija',
  'cinestarcinemas_bih',
  'sarajevo_tourism',
  'undergroundclubsarajevo',
  'pivnica_hs',
  'pink.houdini',
  'blindtigersarajevo',
  'dasistwalter.pub',
  'hacienda.sarajevo',
  'mashlounge',
  'celtic_pub_sarajevo',
  'sarajevofilmfestival',
  'sarajevskizimskifestival',
  'meetingpoint_sa',
  'pozoristemladi_sarajevo',
  'sartr_teatar',
  'vijecnicasarajevo',
  'sevdaharthaus',
  'warchildhoodmuseum',
  'galerija1107',
  'zetraolympichall',
  'route66bikerbar',
];

async function loadHandlesFromDb(): Promise<string[]> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();
  const res = await fetch(`${supabaseUrl}/rest/v1/venues?select=website&website=ilike.*instagram*`, {
    headers: { apikey: supabaseServiceRoleKey, Authorization: `Bearer ${supabaseServiceRoleKey}` },
  });
  const venues: Array<{ website: string }> = await res.json();
  const handles: string[] = [];
  for (const v of venues) {
    const match = v.website?.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
    if (match && match[1].length > 2) handles.push(match[1].toLowerCase());
  }
  return handles;
}

async function buildAccountList(): Promise<string[]> {
  console.log('Loading Instagram handles from venue database...');
  const dbHandles = await loadHandlesFromDb();
  console.log(`  Found ${dbHandles.length} handles in DB`);

  // Merge: curated + DB, dedupe
  const all = new Set([...CURATED_EVENT_ACCOUNTS, ...dbHandles]);
  const accounts = [...all].sort();
  console.log(`  Total unique accounts: ${accounts.length}`);
  return accounts;
}

// Will be populated at runtime
let SARAJEVO_ACCOUNTS: string[] = [];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApifyRunResponse {
  data: {
    id: string;
    defaultDatasetId: string;
    status: string;
  };
}

interface ApifyRunStatus {
  data: {
    status: string;
  };
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Apify integration
// ---------------------------------------------------------------------------

async function scrapeInstagramAccount(username: string): Promise<InstagramPost[]> {
  if (!APIFY_TOKEN) {
    throw new Error('APIFY_API_TOKEN not set');
  }

  log(`  Starting Apify run for @${username}...`);

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: 'posts',
        resultsLimit: MAX_POSTS_PER_ACCOUNT,
      }),
    },
  );

  if (!runRes.ok) {
    const errText = await runRes.text();
    throw new Error(`Apify start failed (${runRes.status}): ${errText.slice(0, 300)}`);
  }

  const run: ApifyRunResponse = await runRes.json();
  const runId = run.data.id;
  const datasetId = run.data.defaultDatasetId;

  log(`  Run ${runId} started, polling for completion...`);

  // Poll for completion
  let status = run.data.status;
  let attempts = 0;
  while ((status === 'RUNNING' || status === 'READY') && attempts < MAX_POLL_ATTEMPTS) {
    await sleep(POLL_INTERVAL_MS);
    attempts++;

    const checkRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`,
    );

    if (!checkRes.ok) {
      log(`  Warning: poll check failed (${checkRes.status}), retrying...`);
      continue;
    }

    const checkData: ApifyRunStatus = await checkRes.json();
    status = checkData.data.status;
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify run ${runId} ended with status: ${status}`);
  }

  log(`  Run succeeded, fetching results...`);

  // Fetch results
  const resultsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`,
  );

  if (!resultsRes.ok) {
    throw new Error(`Failed to fetch dataset (${resultsRes.status})`);
  }

  return resultsRes.json() as Promise<InstagramPost[]>;
}

// ---------------------------------------------------------------------------
// Edge function integration
// ---------------------------------------------------------------------------

async function parseCaption(
  caption: string,
  accountName: string,
  postUrl: string,
): Promise<ParseInstagramResult> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();

  const res = await fetch(`${supabaseUrl}/functions/v1/parse-instagram`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      caption,
      account_name: accountName,
      post_url: postUrl,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, error: `Edge function ${res.status}: ${errText.slice(0, 200)}` };
  }

  return res.json() as Promise<ParseInstagramResult>;
}

// ---------------------------------------------------------------------------
// Source seeding
// ---------------------------------------------------------------------------

interface ScrapeSourceRow {
  id: string;
  name: string;
}

async function seedInstagramSources(): Promise<void> {
  log('Seeding Instagram scrape_sources...');

  // Check which accounts already exist
  const existing = await requestSupabaseAdminJson<ScrapeSourceRow[]>(
    '/rest/v1/scrape_sources?select=id,name&scrape_config->>fetch_method=eq.apify_instagram',
  );

  const existingNames = new Set(existing.map((r) => r.name));
  const toInsert = SARAJEVO_ACCOUNTS.filter(
    (username) => !existingNames.has(`Instagram: @${username}`),
  ).map((username) => ({
    name: `Instagram: @${username}`,
    source_url: `https://www.instagram.com/${username}/`,
    tier: 2,
    frequency_hours: 12,
    is_active: true,
    scrape_config: {
      fetch_method: 'apify_instagram',
      username,
      max_posts: MAX_POSTS_PER_ACCOUNT,
      parser_hint: 'instagram_caption',
    },
  }));

  if (toInsert.length === 0) {
    log(`  All ${SARAJEVO_ACCOUNTS.length} Instagram sources already seeded.`);
    return;
  }

  await requestSupabaseAdminJson<ScrapeSourceRow[]>(
    '/rest/v1/scrape_sources?select=id,name',
    {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(toInsert),
    },
  );

  log(`  Seeded ${toInsert.length} new Instagram sources (${existingNames.size} already existed).`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function processAccount(username: string): Promise<{ events: number; posts: number; skipped: number }> {
  let posts: InstagramPost[];
  try {
    posts = await scrapeInstagramAccount(username);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`  [error] Failed to scrape @${username}: ${msg}`);
    return { events: 0, posts: 0, skipped: 0 };
  }

  log(`  Got ${posts.length} posts from @${username}`);

  let events = 0;
  let skipped = 0;

  for (const post of posts) {
    const caption = post.caption?.trim();
    if (!caption || caption.length < 20) {
      skipped++;
      continue;
    }

    const postUrl = post.url ?? `https://www.instagram.com/p/${post.shortCode ?? 'unknown'}/`;

    try {
      const result = await parseCaption(caption, username, postUrl);

      if (!result.success) {
        log(`    [parse error] ${result.error}`);
        continue;
      }

      if (result.data?.is_event) {
        events++;
        log(`    [event] "${result.data.title}" on ${result.data.date ?? '?'} (${result.data.confidence})`);
      }
    } catch (err) {
      log(`    [error] Parse failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { events, posts: posts.length, skipped };
}

async function main() {
  if (!APIFY_TOKEN) {
    console.error('APIFY_API_TOKEN is not set in environment. Add it to backend/.env');
    console.error('Get a token at https://console.apify.com/account/integrations');
    process.exit(1);
  }

  // Build account list from DB + curated list
  SARAJEVO_ACCOUNTS = await buildAccountList();

  // Seed Instagram sources into scrape_sources table
  await seedInstagramSources();

  log(`\nStarting Instagram scrape for ${SARAJEVO_ACCOUNTS.length} accounts...\n`);

  let totalEvents = 0;
  let totalPosts = 0;
  let totalErrors = 0;

  for (const username of SARAJEVO_ACCOUNTS) {
    log(`--- @${username} ---`);
    try {
      const result = await processAccount(username);
      totalEvents += result.events;
      totalPosts += result.posts;
      log(`  Summary: ${result.posts} posts, ${result.events} events, ${result.skipped} skipped\n`);
    } catch (err) {
      totalErrors++;
      log(`  [fatal] ${err instanceof Error ? err.message : String(err)}\n`);
    }
  }

  log('=== Instagram Scrape Complete ===');
  log(`  Accounts: ${SARAJEVO_ACCOUNTS.length}`);
  log(`  Total posts: ${totalPosts}`);
  log(`  Events detected: ${totalEvents}`);
  log(`  Account errors: ${totalErrors}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
