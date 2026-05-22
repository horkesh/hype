#!/usr/bin/env node
// Post-build SEO injector for the Expo Router web static export.
//
// Expo Router 6 (SDK 54) only renders each dynamic-route template once
// per `expo export -p web` — generateStaticParams lets it write the
// rendered HTML to every URL path (so /venue/<id>.html files exist),
// but the bytes are identical across all IDs. This script rewrites the
// per-id HTMLs with real titles, descriptions, OG, and Schema.org
// JSON-LD so Googlebot and OG bots (Twitter, Facebook, WhatsApp) see
// proper metadata before any JavaScript executes.
//
// It also fills in metadata for the top-level static routes (home,
// wellness, lokacije equivalents, events list). The body of each HTML
// stays as the prerendered React shell — content still hydrates
// client-side — but `<head>` is now meaningful for SEO and social.
//
// Run after `expo export -p web` via the apps/mobile build:web script.
// Reads EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (same
// env Expo's build itself uses).

import { createClient } from '@supabase/supabase-js';
import { readFile, writeFile, access } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..');
const DIST = resolve(APP_ROOT, 'dist');

// Expo loads .env automatically during `expo export`, but this script
// runs in a plain Node process afterward — so parse the file ourselves.
// Only fills env keys that aren't already set (CI/Vercel-set vars win).
try {
  const envText = readFileSync(resolve(APP_ROOT, '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const k = m[1];
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
} catch {
  // No .env file (CI environment) — fine if env vars are already set.
}

const SITE_URL = process.env.LOOK_SITE_URL ?? 'https://hype-alpha.vercel.app';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('[inject-seo] EXPO_PUBLIC_SUPABASE_* missing — skipping injection.');
  process.exit(0);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLdSafe(obj) {
  // U+2028 / U+2029 break inline scripts; replace via codepoint to avoid
  // having those literal chars in this file source.
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(new RegExp(String.fromCharCode(0x2028), 'g'), '\\u2028')
    .replace(new RegExp(String.fromCharCode(0x2029), 'g'), '\\u2029');
}

function buildHeadTags({ title, description, url, image, ogType, jsonLd, locale = 'bs_BA' }) {
  const lines = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}"/>`,
    `<link rel="canonical" href="${esc(url)}"/>`,
    `<meta property="og:title" content="${esc(title)}"/>`,
    `<meta property="og:description" content="${esc(description)}"/>`,
    `<meta property="og:type" content="${esc(ogType)}"/>`,
    `<meta property="og:url" content="${esc(url)}"/>`,
    `<meta property="og:locale" content="${esc(locale)}"/>`,
  ];
  if (image) {
    lines.push(`<meta property="og:image" content="${esc(image)}"/>`);
    lines.push(`<meta name="twitter:card" content="summary_large_image"/>`);
    lines.push(`<meta name="twitter:image" content="${esc(image)}"/>`);
  } else {
    lines.push(`<meta name="twitter:card" content="summary"/>`);
  }
  lines.push(`<meta name="twitter:title" content="${esc(title)}"/>`);
  lines.push(`<meta name="twitter:description" content="${esc(description)}"/>`);
  if (jsonLd) {
    lines.push(`<script type="application/ld+json">${jsonLdSafe(jsonLd)}</script>`);
  }
  return lines.join('');
}

async function rewriteHtml(file, headTags) {
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    return false;
  }
  // Expo emits `<title data-rh="true"></title>` as the helmet placeholder.
  // Replace that whole tag — and only that tag — with our head block.
  const next = html.replace(
    /<title[^>]*data-rh="true"[^>]*><\/title>/,
    headTags,
  );
  if (next === html) {
    // Placeholder not found; some templates may not have it. Inject
    // immediately after <head> as a fallback.
    const fallback = html.replace('<head>', `<head>${headTags}`);
    if (fallback === html) return false;
    await writeFile(file, fallback);
    return true;
  }
  await writeFile(file, next);
  return true;
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function injectVenues() {
  const { data, error } = await supabase
    .from('venues')
    .select(
      'id, name, description_bs, description_en, cover_image_url, neighborhood, category, address, latitude, longitude, google_rating, google_ratings_count',
    )
    .eq('is_active', true);
  if (error) {
    console.warn('[inject-seo] venues query failed:', error.message);
    return 0;
  }
  let count = 0;
  for (const v of data ?? []) {
    const file = join(DIST, 'venue', `${v.id}.html`);
    if (!(await fileExists(file))) continue;
    const desc =
      (v.description_bs ?? v.description_en ?? '').slice(0, 200) ||
      `${v.name}${v.neighborhood ? ` u ${v.neighborhood}` : ''} — otkrij ovo mjesto na Look.`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: v.name,
      ...(v.address ? { address: v.address } : {}),
      ...(v.latitude != null && v.longitude != null
        ? { geo: { '@type': 'GeoCoordinates', latitude: v.latitude, longitude: v.longitude } }
        : {}),
      ...(v.cover_image_url ? { image: v.cover_image_url } : {}),
      ...(v.google_rating != null && v.google_ratings_count != null
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: v.google_rating,
              reviewCount: v.google_ratings_count,
            },
          }
        : {}),
    };
    const tags = buildHeadTags({
      title: `${v.name} · Look Sarajevo`,
      description: desc,
      url: `${SITE_URL}/venue/${v.id}`,
      image: v.cover_image_url,
      ogType: 'business.business',
      jsonLd,
    });
    if (await rewriteHtml(file, tags)) count++;
  }
  console.log(`[inject-seo] venues: ${count} pages rewritten`);
  return count;
}

async function injectEvents() {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title_bs, title_en, description_bs, description_en, cover_image_url, start_datetime, location_name, category, ticket_url',
    )
    .eq('is_active', true)
    .eq('status', 'approved')
    .gte('start_datetime', nowIso);
  if (error) {
    console.warn('[inject-seo] events query failed:', error.message);
    return 0;
  }
  let count = 0;
  for (const e of data ?? []) {
    const file = join(DIST, 'event', `${e.id}.html`);
    if (!(await fileExists(file))) continue;
    const title = e.title_bs ?? e.title_en ?? 'Događaj';
    const desc =
      (e.description_bs ?? e.description_en ?? '').slice(0, 200) ||
      `${title}${e.location_name ? ` u ${e.location_name}` : ''} — događaj na Look.`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: title,
      description: desc,
      startDate: e.start_datetime,
      ...(e.cover_image_url ? { image: e.cover_image_url } : {}),
      ...(e.location_name ? { location: { '@type': 'Place', name: e.location_name } } : {}),
      ...(e.ticket_url ? { offers: { '@type': 'Offer', url: e.ticket_url } } : {}),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    };
    const tags = buildHeadTags({
      title: `${title} · Look Sarajevo`,
      description: desc,
      url: `${SITE_URL}/event/${e.id}`,
      image: e.cover_image_url,
      ogType: 'event',
      jsonLd,
    });
    if (await rewriteHtml(file, tags)) count++;
  }
  console.log(`[inject-seo] events: ${count} pages rewritten`);
  return count;
}

async function injectTopLevel() {
  const tops = [
    {
      file: 'index.html',
      title: 'Look · Otkrij Sarajevo',
      description:
        'Lokacije, događaji i ljudi u Sarajevu. Otkrij najbolja mjesta, koncerte i kulturna dešavanja u gradu.',
      url: '/',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Look',
        url: SITE_URL,
        description: 'Otkrij Sarajevo — lokacije, događaji, ljudi.',
        inLanguage: 'bs-BA',
      },
    },
    {
      file: 'wellness.html',
      title: 'Wellness u Sarajevu · Look',
      description:
        'Spa, masaže, fitness studiji, yoga, kozmetički saloni i estetske klinike u Sarajevu.',
      url: '/wellness',
      ogType: 'website',
      jsonLd: null,
    },
    {
      file: '(tabs)/explore.html',
      title: 'Istraži Sarajevo · Look',
      description: 'Kafići, restorani, barovi, klubovi, kultura i wellness — sve na jednom mjestu.',
      url: '/explore',
      ogType: 'website',
      jsonLd: null,
    },
    {
      file: '(tabs)/tonight.html',
      title: 'Večeras u Sarajevu · Look',
      description: 'Šta se dešava večeras u Sarajevu — koncerti, izložbe, nightlife.',
      url: '/tonight',
      ogType: 'website',
      jsonLd: null,
    },
  ];
  let count = 0;
  for (const t of tops) {
    const file = join(DIST, t.file);
    if (!(await fileExists(file))) continue;
    const tags = buildHeadTags({
      title: t.title,
      description: t.description,
      url: `${SITE_URL}${t.url}`,
      ogType: t.ogType,
      jsonLd: t.jsonLd,
    });
    if (await rewriteHtml(file, tags)) count++;
  }
  console.log(`[inject-seo] top-level: ${count} pages rewritten`);
  return count;
}

async function main() {
  console.log(`[inject-seo] starting (dist=${DIST}, site=${SITE_URL})`);
  const v = await injectVenues();
  const e = await injectEvents();
  const t = await injectTopLevel();
  console.log(`[inject-seo] done — venues=${v}, events=${e}, top=${t}`);
}

main().catch((err) => {
  console.error('[inject-seo] fatal:', err);
  process.exit(1);
});
