/**
 * discoverInstagramHandlesApify.ts
 *
 * Finds Instagram handles for venues that don't have one yet by searching
 * Instagram via the Apify "Instagram Search Scraper" actor.
 *
 * Why: the legacy findInstagramHandles.ts depends on Google search scraping
 * (heavily CAPTCHA'd) and venue-website link extraction (frequently picks up
 * sponsor/payment-processor IG links as false positives). Apify's search API
 * returns Instagram's actual top-user matches, which is dramatically more
 * accurate for "venue name in Sarajevo" queries.
 *
 * Usage:
 *   node --env-file=backend/.env --import tsx backend/src/scripts/discoverInstagramHandlesApify.ts \
 *     [--limit=N] [--category=X] [--dry-run] [--min-confidence=high|medium|low]
 *
 * Cost: Apify Instagram Search Scraper is ~$0.50 / 1000 search results at
 * default rates. 1045 venues * ~5 results each ≈ $2.60 worst case.
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APIFY_TOKEN = process.env.APIFY_API_TOKEN!;

const ACTOR_ID = 'apify~instagram-search-scraper';
const SEARCH_LIMIT_PER_QUERY = 5;
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

const args = new Set(process.argv);
const DRY_RUN = args.has('--dry-run');
const LIMIT_FLAG = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = LIMIT_FLAG ? parseInt(LIMIT_FLAG.split('=')[1], 10) : Infinity;
const CAT_FLAG = process.argv.find((a) => a.startsWith('--category='));
const CATEGORY = CAT_FLAG ? CAT_FLAG.split('=')[1] : null;
const MIN_CONF_FLAG = process.argv.find((a) => a.startsWith('--min-confidence='));
const MIN_CONFIDENCE = (MIN_CONF_FLAG ? MIN_CONF_FLAG.split('=')[1] : 'medium') as
  | 'high'
  | 'medium'
  | 'low';

interface VenueRow {
  id: string;
  name: string;
  category: string | null;
  neighborhood: string | null;
}

interface ApifySearchResult {
  // Documented by apify/instagram-search-scraper:
  username?: string;
  fullName?: string;
  biography?: string;
  isVerified?: boolean;
  followersCount?: number;
  // The actor sometimes nests under "user"
  user?: {
    username?: string;
    fullName?: string;
    biography?: string;
    isVerified?: boolean;
    followersCount?: number;
  };
}

interface ApifyRunResponse {
  data: { id: string; defaultDatasetId: string; status: string };
}

interface ApifyRunStatus {
  data: { status: string };
}

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function score(venue: VenueRow, result: ApifySearchResult): {
  handle: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
} | null {
  const r = result.user ?? result;
  const username = r.username;
  if (!username) return null;

  const handleNorm = normalise(username);
  const nameNorm = normalise(venue.name);
  const fullNorm = normalise(r.fullName ?? '');
  const bioRaw = r.biography ?? '';
  const bioLower = bioRaw.toLowerCase();

  const usernameMentionsName = handleNorm.includes(nameNorm) || nameNorm.includes(handleNorm);
  const fullNameMentionsName = nameNorm.length >= 3 && fullNorm.includes(nameNorm);
  const sarajevoSignals: string[] = [];
  if (bioLower.includes('sarajevo')) sarajevoSignals.push('bio→Sarajevo');
  if (bioLower.includes('bosna') || bioLower.includes('bosnia') || bioLower.includes('herzegovina'))
    sarajevoSignals.push('bio→Bosnia');
  if (handleNorm.includes('sarajevo') || handleNorm.includes('sarajev'))
    sarajevoSignals.push('handle→Sarajevo');
  // Username suffixes like "_sa" / ".sa" / "_ba" / ".ba" are weak signals but
  // common for BiH businesses. Check the raw (un-normalized) username.
  if (/[._](sa|ba|bih)$/i.test(username)) sarajevoSignals.push('handle.suffix');
  if (fullNorm.includes('sarajevo')) sarajevoSignals.push('fullName→Sarajevo');
  if (venue.neighborhood && bioLower.includes(venue.neighborhood.toLowerCase()))
    sarajevoSignals.push(`bio→${venue.neighborhood}`);
  const hasSarajevoSignal = sarajevoSignals.length > 0;
  const verified = r.isVerified === true;
  const followers = r.followersCount ?? 0;

  const reasoning = [
    usernameMentionsName ? 'handle≈name' : null,
    fullNameMentionsName ? 'fullName≈name' : null,
    ...sarajevoSignals,
    verified ? 'verified' : null,
    `${followers}fr`,
  ]
    .filter(Boolean)
    .join(',');

  // For very short or single-word venue names ("KUK", "Art", "Birtija",
  // "Biblioteka"), substring matching is too lossy — Cologne galleries,
  // common dictionary words, generic concepts all match. Require an explicit
  // Sarajevo signal AND the handle/fullName to clearly mention the venue.
  const isShortName = nameNorm.length < 5;
  const isSingleWord = !venue.name.trim().includes(' ');
  const isGenericRisk = isShortName || isSingleWord;
  if (isGenericRisk && !hasSarajevoSignal) {
    return null;
  }

  // High: handle/fullName matches AND Sarajevo signal
  if ((usernameMentionsName || fullNameMentionsName) && hasSarajevoSignal) {
    return { handle: username, confidence: 'high', reasoning };
  }
  // Medium: handle/fullName matches (longer-name venues are safe enough on
  // name alone — e.g. "Sarajevski ratni teatar")
  if (usernameMentionsName || fullNameMentionsName) {
    return { handle: username, confidence: 'medium', reasoning };
  }
  // Low: just Sarajevo + followers, no name overlap — rarely useful, kept for
  // edge cases where the venue rebranded its handle entirely.
  if (hasSarajevoSignal && followers >= 500) {
    return { handle: username, confidence: 'low', reasoning };
  }
  return null;
}

function passesMinConfidence(c: 'high' | 'medium' | 'low'): boolean {
  const order = { high: 3, medium: 2, low: 1 };
  return order[c] >= order[MIN_CONFIDENCE];
}

async function fetchVenuesNeedingHandles(): Promise<VenueRow[]> {
  const params = new URLSearchParams({
    select: 'id,name,category,neighborhood',
    instagram_handle: 'is.null',
    is_active: 'eq.true',
    order: 'category,name',
  });
  if (CATEGORY) params.set('category', `eq.${CATEGORY}`);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/venues?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as VenueRow[];
}

async function updateVenueHandle(id: string, handle: string): Promise<void> {
  if (DRY_RUN) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/venues?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ instagram_handle: handle }),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`);
}

async function runApifySearch(query: string): Promise<ApifySearchResult[]> {
  // The actor's `search` field is a single string. Caller fans out concurrency.
  const startRes = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      search: query,
      searchType: 'user',
      searchLimit: SEARCH_LIMIT_PER_QUERY,
    }),
  });
  if (!startRes.ok) {
    throw new Error(`Apify start failed (${startRes.status}): ${(await startRes.text()).slice(0, 300)}`);
  }
  const run = (await startRes.json()) as ApifyRunResponse;
  const runId = run.data.id;
  const datasetId = run.data.defaultDatasetId;

  let status = run.data.status;
  let attempts = 0;
  while ((status === 'RUNNING' || status === 'READY') && attempts < MAX_POLL_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    attempts++;
    const checkRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    if (!checkRes.ok) continue;
    const checkData = (await checkRes.json()) as ApifyRunStatus;
    status = checkData.data.status;
  }
  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify run ${runId} ended with status: ${status}`);
  }

  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`,
  );
  if (!itemsRes.ok) throw new Error(`Apify dataset fetch failed: ${itemsRes.status}`);
  return (await itemsRes.json()) as ApifySearchResult[];
}

async function main() {
  log('=== discoverInstagramHandlesApify starting ===');
  log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  if (CATEGORY) log(`Category filter: ${CATEGORY}`);
  if (LIMIT < Infinity) log(`Limit: ${LIMIT}`);
  log(`Min confidence to save: ${MIN_CONFIDENCE}`);

  const venues = (await fetchVenuesNeedingHandles()).slice(0, LIMIT);
  log(`${venues.length} venue(s) to query`);
  if (venues.length === 0) return;

  // Build queries — venue name + Sarajevo (sometimes + neighborhood)
  const venueByQuery = new Map<string, VenueRow>();
  const queries: string[] = [];
  for (const v of venues) {
    // Apify input validator rejects most punctuation. Strip it before query.
    const safeName = v.name
      .replace(/[!?.,:;\-+=*&%$#@/\\~^|<>()[\]{}"'`„"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!safeName) continue;
    const q = `${safeName} Sarajevo`;
    if (!venueByQuery.has(q)) {
      venueByQuery.set(q, v);
      queries.push(q);
    }
  }

  // Run searches in parallel. Each Apify run is fast individually (~30s) but
  // sequential would be hours for 1000+ venues. Concurrency of 10 keeps API
  // load reasonable.
  const CONCURRENCY = 10;
  const stats = { saved: 0, lowConfidence: 0, noResults: 0, errors: 0 };

  async function processQuery(q: string): Promise<void> {
    const venue = venueByQuery.get(q);
    if (!venue) return;
    let results: ApifySearchResult[];
    try {
      results = await runApifySearch(q);
    } catch (err) {
      log(`  ERROR "${venue.name}": ${err instanceof Error ? err.message : err}`);
      stats.errors++;
      return;
    }
    if (results.length === 0) {
      stats.noResults++;
      return;
    }

    let best: ReturnType<typeof score> = null;
    for (const r of results) {
      const s = score(venue, r);
      if (!s) continue;
      if (!best) {
        best = s;
      } else {
        const orderRank = { high: 3, medium: 2, low: 1 };
        if (orderRank[s.confidence] > orderRank[best.confidence]) best = s;
      }
    }

    if (!best || !passesMinConfidence(best.confidence)) {
      if (best) log(`  [skip] "${venue.name}" → @${best.handle} (${best.confidence}, below threshold)`);
      stats.lowConfidence++;
      return;
    }

    const mark = best.confidence === 'high' ? '✅' : best.confidence === 'medium' ? '🟡' : '🔴';
    log(`  ${mark} "${venue.name}" → @${best.handle} [${best.confidence}; ${best.reasoning}]`);
    try {
      await updateVenueHandle(venue.id, best.handle);
      stats.saved++;
    } catch (err) {
      log(`  Update error: ${err instanceof Error ? err.message : err}`);
      stats.errors++;
    }
  }

  for (let i = 0; i < queries.length; i += CONCURRENCY) {
    const batch = queries.slice(i, i + CONCURRENCY);
    log(`Batch ${Math.floor(i / CONCURRENCY) + 1}: queries ${i + 1}-${i + batch.length} of ${queries.length}`);
    await Promise.all(batch.map(processQuery));
  }

  log('');
  log('=== discoverInstagramHandlesApify complete ===');
  log(`  Saved          : ${stats.saved}`);
  log(`  Low confidence : ${stats.lowConfidence}`);
  log(`  No results     : ${stats.noResults}`);
  log(`  Errors         : ${stats.errors}`);
  log(`  Total queried  : ${queries.length}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
