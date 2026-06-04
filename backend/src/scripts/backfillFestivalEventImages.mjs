/**
 * backfillFestivalEventImages.mjs
 *
 * One-off: pull the real per-event lineup posters from a festival's Instagram
 * (via Apify) and set each matched event's cover_image_url (re-hosted in the
 * hero-images bucket). Events that don't get a confident individual match keep
 * whatever cover they already have (the festival artwork fallback).
 *
 *   node backend/src/scripts/backfillFestivalEventImages.mjs [--apply] [--username=streetfoodmarket.sa] [--limit=60]
 *
 * Default is a DRY RUN (prints the match table, no writes/uploads). Pass --apply
 * to download + upload + update. Env read from backend/.env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APIFY_API_TOKEN
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, '../../.env'); // backend/.env

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = loadEnv(ENV_PATH);
const URL = env.SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const APIFY = env.APIFY_API_TOKEN;
if (!URL || !KEY || !APIFY) { console.error('Missing SUPABASE_URL / SERVICE_ROLE_KEY / APIFY_API_TOKEN in backend/.env'); process.exit(1); }

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const USERNAME = (args.find((a) => a.startsWith('--username=')) ?? '--username=streetfoodmarket.sa').split('=')[1];
const LIMIT = Number((args.find((a) => a.startsWith('--limit=')) ?? '--limit=60').split('=')[1]);
const SERIES_SLUGS = ['street-food-market-2026', 'street-food-market-gin-weekend-2026', 'world-cup-2026'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s ?? '')
  .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const isFanZone = (ev) => /fan zone|navijacka zona/.test(norm(`${ev.title_en} ${ev.title_bs}`));

// Distinctive artist/act keyword from an event title (strip generic framing).
// Take the part after the last colon (the act), drop parentheticals + a trailing
// dash-subtitle + generic words, then normalize.
function keyword(ev) {
  let t = ev.title_en || ev.title_bs || '';
  if (t.includes(':')) t = t.slice(t.lastIndexOf(':') + 1);   // "Balašević Night: Naopake bajke" → "Naopake bajke"
  t = t.replace(/\([^)]*\)/g, ' ');                            // drop "(Oliver & Gibonni)"
  t = t.replace(/\s*[\-–—]\s*.*$/, '');                        // drop trailing "– subtitle"
  t = t.replace(/\b(tribute|night|vece|veče|day|dan|dj)\b/gi, '');
  const n = norm(t);
  return n.length >= 3 ? n : norm(ev.title_bs || ev.title_en || '');
}

async function sb(path, init) {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

async function apifyPosts(username, limit) {
  const run = await (await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${APIFY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directUrls: [`https://www.instagram.com/${username}/`], resultsType: 'posts', resultsLimit: limit }),
  })).json();
  const { id, defaultDatasetId } = run.data;
  let status = run.data.status, tries = 0;
  process.stdout.write(`  Apify run ${id} `);
  while ((status === 'RUNNING' || status === 'READY') && tries < 72) {
    await sleep(5000); tries++;
    const c = await (await fetch(`https://api.apify.com/v2/actor-runs/${id}?token=${APIFY}`)).json();
    status = c.data.status; process.stdout.write('.');
  }
  process.stdout.write(`\n  status: ${status}\n`);
  if (status !== 'SUCCEEDED') throw new Error(`Apify run ended: ${status}`);
  return (await (await fetch(`https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${APIFY}`)).json());
}

async function uploadImage(displayUrl, eventId) {
  const imgRes = await fetch(displayUrl);
  if (!imgRes.ok) throw new Error(`image fetch ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const objectPath = `festival/event-${eventId}.jpg`;
  const up = await fetch(`${URL}/storage/v1/object/hero-images/${objectPath}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'x-upsert': 'true', 'Content-Type': 'image/jpeg' },
    body: buf,
  });
  if (!up.ok) throw new Error(`upload ${up.status}: ${(await up.text()).slice(0, 120)}`);
  return `${URL}/storage/v1/object/public/hero-images/${objectPath}`;
}

async function main() {
  // 1. events in our festival series
  const seriesRows = await (await sb(`/rest/v1/event_series?select=id,slug&slug=in.(${SERIES_SLUGS.join(',')})`)).json();
  const ids = seriesRows.map((s) => s.id);
  const events = await (await sb(`/rest/v1/events?select=id,title_bs,title_en,series_id,start_datetime&series_id=in.(${ids.join(',')})&order=start_datetime.asc`)).json();
  console.log(`Festival events: ${events.length}`);

  // 2. scrape posts
  console.log(`Scraping @${USERNAME} (max ${LIMIT})...`);
  const posts = (await apifyPosts(USERNAME, LIMIT))
    .map((p) => ({ caption: p.caption ?? '', img: p.displayUrl, url: p.url, ncap: norm(p.caption ?? ''), ts: p.timestamp }))
    .filter((p) => p.img && p.ncap.length > 10);
  console.log(`Usable posts with image+caption: ${posts.length}\n`);

  // 3. greedy match: each non-fan-zone event → best UNUSED post whose caption contains
  //    its keyword. Fan-zone events are recurring (same thing weekly) so they all SHARE
  //    one fan-zone poster.
  const used = new Set();
  const fanPost = posts.find((p) => /navijacka zona|fan zone/.test(p.ncap)) ?? null;
  if (fanPost) used.add(fanPost.url);
  const matches = [];
  for (const ev of events) {
    if (isFanZone(ev)) { matches.push({ ev, kw: 'fan zone', post: fanPost }); continue; }
    const kw = keyword(ev);
    let best = null, bestLen = 0;
    for (const p of posts) {
      if (used.has(p.url)) continue;
      if (kw && p.ncap.includes(kw) && kw.length > bestLen) { best = p; bestLen = kw.length; }
    }
    if (best) used.add(best.url);
    matches.push({ ev, kw, post: best });
  }

  // 4. report
  const hit = matches.filter((m) => m.post);
  console.log('MATCHES:');
  for (const m of matches) {
    const title = m.ev.title_en || m.ev.title_bs;
    console.log(`  ${m.post ? '✓' : '·'} ${title}  [kw="${m.kw}"]${m.post ? `  ← ${m.post.url}` : ''}`);
  }
  console.log(`\n${hit.length}/${events.length} events matched to a distinct post.`);
  if (!APPLY) { console.log('\nDRY RUN — re-run with --apply to download, upload, and set covers.'); return; }

  // 5. apply
  let ok = 0;
  for (const m of hit) {
    try {
      const publicUrl = await uploadImage(m.post.img, m.ev.id);
      await sb(`/rest/v1/events?id=eq.${m.ev.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ cover_image_url: publicUrl }) });
      ok++;
      console.log(`  set: ${m.ev.title_en || m.ev.title_bs}`);
    } catch (e) {
      console.log(`  FAIL ${m.ev.title_en || m.ev.title_bs}: ${e.message}`);
    }
  }
  console.log(`\nApplied ${ok}/${hit.length} per-event covers.`);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
