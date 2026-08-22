// RECOVERED 2026-08-22 from the live project (kyfoqltmkqwtnrdlacqv, version 10).
// This function was deployed but had no source in the repo.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as cheerio from "https://esm.sh/cheerio@1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const LIST_URL = "https://www.kupikartu.ba/karte";
const BASE = "https://www.kupikartu.ba";
const MAX_EVENTS_PER_RUN = 25;

function absUrl(href: string, base: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function uniq(arr: string[]) {
  return [...new Set(arr)];
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: { "user-agent": "HYPEbot/1.0 (+https://hype.ba)" },
  });
  if (!res.ok) return null;
  return await res.text();
}

function isEventUrl(url: string) {
  // Accept ONLY event detail pages
  return url.startsWith("https://www.kupikartu.ba/karte/event/");
}

function extractOgImage($: cheerio.CheerioAPI) {
  return $('meta[property="og:image"]').attr("content")?.trim() || null;
}

function extractTitle($: cheerio.CheerioAPI) {
  const h1 = $("h1").first().text().trim();
  if (h1) return h1;
  const title = $("title").text().trim();
  return title || null;
}

Deno.serve(async () => {
  // 1) Fetch listing page
  const listHtml = await fetchHtml(LIST_URL);
  if (!listHtml) return new Response("list fetch failed", { status: 500 });

  const $ = cheerio.load(listHtml);

  // 2) Collect links, absolutize, and STRICT-filter to event URLs only
  const allLinks = $("a[href]")
    .map((_, a) => absUrl($(a).attr("href")!.trim(), BASE))
    .get();

  const eventLinks = uniq(allLinks)
    .filter(isEventUrl)
    .slice(0, MAX_EVENTS_PER_RUN);

  if (eventLinks.length === 0) {
    return new Response("no /karte/event/ links found on listing page");
  }

  // 3) Fetch each event detail page and store raw HTML
  const rows: any[] = [];

  for (const url of eventLinks) {
    // Extra guard (paranoia)
    if (!isEventUrl(url)) continue;

    const html = await fetchHtml(url);
    if (!html) continue;

    const d = cheerio.load(html);

    rows.push({
      source_name: "kupikartu",
      source_url: url,
      title_raw: extractTitle(d),
      description_raw: null,
      date_raw: null,
      venue_raw: null,
      image_url: extractOgImage(d),
      raw_html: html,
      raw_json: null,
      parsed: false,
    });
  }

  if (rows.length === 0) {
    return new Response("no detail pages fetched (all failed)", { status: 500 });
  }

  // 4) Upsert into raw_events (dedupe by source_url)
  const { error } = await supabase.from("raw_events").upsert(rows, {
    onConflict: "source_url",
  });

  if (error) return new Response(`db error: ${error.message}`, { status: 500 });

  return new Response(`ok: inserted/updated ${rows.length}`);
});
