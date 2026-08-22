// RECOVERED 2026-08-22 from the live project (kyfoqltmkqwtnrdlacqv, version 15).
// This function was deployed but had no source in the repo.
//
// supabase/functions/parse-events/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

// ====== CONFIG ======
const BATCH_SIZE = 5;
const MAX_ATTEMPTS = 3;

// Sarajevo-only mode (ON)
const SARAJEVO_ONLY = true;

// If you want moderation first, switch to "pending"
const STATUS_DEFAULT: "pending" | "approved" | "rejected" = "approved";

// Allowed enums / controlled vocab
const TYPES_ALLOWED = ["venue_linked", "standalone"] as const;

const CATEGORIES_ALLOWED = [
  "music",
  "food",
  "culture",
  "sport",
  "nightlife",
  "art",
  "film",
  "theatre",
  "festival",
  "market",
  "workshop",
  "charity",
  "other",
];

const MOODS_ALLOWED = [
  "Party",
  "Chill",
  "Girls Night",
  "Date Night",
  "Muzika",
  "Romantika",
  "Kultura",
  "Foodie",
  "Brunch",
  "After Work",
  "Outdoor",
  "Turista",
];

// Sarajevo bounding box (rough, safe)
const SARAJEVO_BBOX = {
  minLat: 43.78,
  maxLat: 43.95,
  minLon: 18.25,
  maxLon: 18.55,
};

// Fetch a larger pool so we can prioritize Sarajevo-likely rows
const FETCH_MULTIPLIER = 10;

// ====== SARAJEVO DETECTION CONFIG ======

const SARAJEVO_VENUE_ALIASES = [
  "dom mladih",
  "dom omladine",
  "bkc",
  "bosanski kulturni centar",
  "cinemas sloga",
  "kino sloga",
  "sloga",
  "kamerni teatar 55",
  "kamerni teatar",
  "narodno pozoriste sarajevo",
  "narodno pozoriste",
  "sarajevo war theatre",
  "sarajevski ratni teatar",
  "sartr",
  "skenderija",
  "dvorana mirza delimustafic",
  "stadion grbavica",
  "grbavica",
  "kosevo",
  "stadion asim ferhatovic hase",
  "asim ferhatovic hase",
  "zetra",
  "juan antonio samaranch",
];

const SARAJEVO_KEYWORDS = [
  "sarajevo",
  "marijin dvor",
  "bascarsija",
  "baščaršija",
  "grbavica",
  "hrasno",
  "otoka",
  "cengic vila",
  "čengić vila",
  "dobrinja",
  "ilidza",
  "ilidža",
  "cobanija",
  "čobanija",
  "kosevo",
  "koševo",
  "stup",
  "alipasino polje",
  "alipašino polje",
  "nedzarici",
  "nedžarići",
  "bistrik",
  "vogosca",
  "vogošća",
];

const NEGATIVE_CITY_HINTS = [
  "mostar",
  "banja luka",
  "tuzla",
  "zenica",
  "bijeljina",
  "trebinje",
  "brcko",
  "brčko",
  "livno",
  "siroki brijeg",
  "široki brijeg",
  "cazin",
  "bihac",
  "bihać",
  "konjic",
  "prijedor",
  "doboj",
  "capljina",
  "čapljina",
];

// ====== HELPERS ======
function safeJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function normText(v: any): string {
  return (typeof v === "string" ? v : "").trim();
}

// Normalize for matching: lowercase, strip diacritics, cleanup
function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9\s@]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(haystack: string, needles: string[]): boolean {
  const h = norm(haystack);
  return needles.some((n) => h.includes(norm(n)));
}

function pickAllowed<T extends string>(value: any, allowed: readonly T[], fallback: T): T {
  if (typeof value === "string" && allowed.includes(value as T)) return value as T;
  return fallback;
}

function pickArrayAllowed(value: any, allowed: string[]): string[] {
  if (!Array.isArray(value)) return [];
  const out = value
    .filter((v) => typeof v === "string" && allowed.includes(v))
    .map((v) => v.trim());
  return [...new Set(out)];
}

function isWithinSarajevoBBox(lat: number, lon: number): boolean {
  return (
    lat >= SARAJEVO_BBOX.minLat &&
    lat <= SARAJEVO_BBOX.maxLat &&
    lon >= SARAJEVO_BBOX.minLon &&
    lon <= SARAJEVO_BBOX.maxLon
  );
}

// Extract the venue-like tail after "@..." from title_raw (Kupikartu pattern)
function extractAtVenueFromTitle(titleRaw: any): string {
  const t = normText(titleRaw);
  const idx = t.lastIndexOf("@");
  if (idx === -1) return "";
  return t.slice(idx + 1).trim();
}

// Minimal JSON-LD locality sniff + quick Sarajevo mention check
function htmlSaysSarajevo(rawHtml: string): boolean {
  const h = rawHtml || "";
  if (!h) return false;

  if (/sarajevo/i.test(h)) return true;

  const scripts =
    h.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];

  for (const s of scripts) {
    const jsonText = s
      .replace(/^[\s\S]*?>/, "")
      .replace(/<\/script>[\s\S]*$/, "")
      .trim();

    try {
      const data = JSON.parse(jsonText);
      const objs = Array.isArray(data) ? data : [data];

      for (const obj of objs) {
        const locality =
          obj?.location?.address?.addressLocality ??
          obj?.address?.addressLocality ??
          obj?.location?.addressLocality;

        if (typeof locality === "string" && /sarajevo/i.test(locality)) return true;

        const graph = obj?.["@graph"];
        if (Array.isArray(graph)) {
          for (const g of graph) {
            const loc =
              g?.location?.address?.addressLocality ??
              g?.address?.addressLocality ??
              g?.location?.addressLocality;
            if (typeof loc === "string" && /sarajevo/i.test(loc)) return true;
          }
        }
      }
    } catch {
      // ignore malformed json-ld
    }
  }

  return false;
}

// Prefilter: ONLY skip if strong non-Sarajevo signal.
// Uses title + "@venue" tail + url + html.
function shouldSkipAsNonSarajevo(row: any): boolean {
  const title = normText(row?.title_raw);
  const atVenue = extractAtVenueFromTitle(row?.title_raw);
  const url = normText(row?.source_url);
  const html = normText(row?.raw_html);

  const combined = `${title} ${atVenue} ${url}`;

  // Strong positives: never skip
  if (hasAny(atVenue, SARAJEVO_VENUE_ALIASES)) return false;
  if (hasAny(combined, SARAJEVO_KEYWORDS)) return false;
  if (htmlSaysSarajevo(html)) return false;

  // Strong negatives: skip
  if (hasAny(combined, NEGATIVE_CITY_HINTS)) return true;

  // Unknown: do NOT skip (let AI decide, then hard-gate)
  return false;
}

// Post-parse Sarajevo test using parsed signals
function isSarajevoByParsedSignals(e: any): boolean {
  const name = normText(e?.location_name);
  const addr = normText(e?.location_address);
  const city = normText(e?.city);

  const textBlob = `${name} ${addr} ${city}`;

  if (hasAny(textBlob, SARAJEVO_KEYWORDS)) return true;
  if (hasAny(textBlob, SARAJEVO_VENUE_ALIASES)) return true;

  const lat = typeof e?.latitude === "number" ? e.latitude : null;
  const lon = typeof e?.longitude === "number" ? e.longitude : null;

  if (lat === null || lon === null) return false;
  return isWithinSarajevoBBox(lat, lon);
}

// Hard gate that falls back to RAW signals if AI output is weak
function passesSarajevoGate(e: any, row: any): boolean {
  if (isSarajevoByParsedSignals(e)) return true;

  const title = normText(row?.title_raw);
  const atVenue = extractAtVenueFromTitle(row?.title_raw);
  const html = normText(row?.raw_html);

  if (hasAny(atVenue, SARAJEVO_VENUE_ALIASES)) return true;
  if (hasAny(`${title} ${atVenue}`, SARAJEVO_KEYWORDS)) return true;
  if (htmlSaysSarajevo(html)) return true;

  return false;
}

// ====== MAIN ======
Deno.serve(async () => {
  try {
    // Fetch larger pool so Sarajevo-likely rows don't get stuck behind backlog
    const { data: rows, error } = await supabase
      .from("raw_events")
      .select("*")
      .eq("parsed", false)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE * FETCH_MULTIPLIER);

    if (error) return new Response(`db read error: ${error.message}`, { status: 500 });
    if (!rows || rows.length === 0) return new Response("no unparsed rows");

    // Prioritize Sarajevo-likely rows (i.e., NOT strong-negative) when Sarajevo-only is on
    let queue = rows;
    if (SARAJEVO_ONLY) {
      const sarajevoFirst = rows.filter((r) => !shouldSkipAsNonSarajevo(r));
      queue = sarajevoFirst.length > 0 ? sarajevoFirst : rows;
    }
    queue = queue.slice(0, BATCH_SIZE);

    let parsedCount = 0;
    let skippedCount = 0;

    for (const row of queue) {
      const attempts = (row.parse_attempts ?? 0) as number;

      // If max attempts exceeded, permanently remove from queue
      if (attempts >= MAX_ATTEMPTS) {
        const nowIso = new Date().toISOString();
        await supabase
          .from("raw_events")
          .update({
            parsed: true,
            parsed_at: nowIso,
            parse_attempts: attempts + 1,
          })
          .eq("id", row.id);
        skippedCount += 1;
        continue;
      }

      // Sarajevo-only cheap skip ONLY for strong non-Sarajevo signals
      if (SARAJEVO_ONLY && shouldSkipAsNonSarajevo(row)) {
        await supabase
          .from("raw_events")
          .update({ parse_attempts: attempts + 1 })
          .eq("id", row.id);
        skippedCount += 1;
        continue;
      }

      const input = {
        source_name: row.source_name,
        source_url: row.source_url,
        title_raw: row.title_raw,
        description_raw: row.description_raw,
        date_raw: row.date_raw,
        venue_raw: row.venue_raw,
        image_url: row.image_url,
        raw_html: row.raw_html,
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You extract Bosnia and Herzegovina event data (Sarajevo focus) from messy scraped inputs. " +
              "Return ONLY JSON. If not an event, return {\"skip\":true,\"reason\":\"...\"}. " +
              "Dates must be ISO 8601 with timezone (+01:00). Prefer Europe/Sarajevo. " +
              "Always provide explicit location fields: location_name, location_address, city, country, latitude, longitude. " +
              "Infer city from venue/address whenever possible; if unknown, set city to \"\" and still provide best location_name/location_address.",
          },
          {
            role: "user",
            content:
              "Return JSON with this shape:\n" +
              "{\n" +
              "  \"skip\": boolean,\n" +
              "  \"reason\"?: string,\n" +
              "  \"event\"?: {\n" +
              "    \"title_bs\": string,\n" +
              "    \"title_en\": string,\n" +
              "    \"description_bs\": string,\n" +
              "    \"description_en\": string,\n" +
              "    \"type\": \"venue_linked\"|\"standalone\",\n" +
              "    \"category\": " +
              JSON.stringify(CATEGORIES_ALLOWED) +
              ",\n" +
              "    \"moods\": string[],\n" +
              "    \"tags\": string[],\n" +
              "    \"location_name\": string,\n" +
              "    \"location_address\": string,\n" +
              "    \"city\": string,\n" +
              "    \"country\": string,\n" +
              "    \"latitude\": number|null,\n" +
              "    \"longitude\": number|null,\n" +
              "    \"start_datetime\": string,\n" +
              "    \"end_datetime\": string|null,\n" +
              "    \"is_recurring\": boolean,\n" +
              "    \"recurrence_rule\": string|null,\n" +
              "    \"cover_image_url\": string|null,\n" +
              "    \"price_bam\": number|null,\n" +
              "    \"ticket_url\": string|null,\n" +
              "    \"source\": string\n" +
              "  }\n" +
              "}\n\n" +
              "Hard rules:\n" +
              "- If you cannot confidently produce title_bs and start_datetime, set skip=true.\n" +
              "- moods must be a subset of: " +
              JSON.stringify(MOODS_ALLOWED) +
              "\n" +
              "- category must be one of: " +
              JSON.stringify(CATEGORIES_ALLOWED) +
              "\n" +
              "- type must be venue_linked or standalone.\n" +
              "- ticket_url should be the best event link; if unsure, use source_url.\n" +
              "- If you provide latitude/longitude, ensure they match the venue/address.\n" +
              (SARAJEVO_ONLY
                ? "- IMPORTANT: Only output Sarajevo events. If not Sarajevo, set skip=true.\n"
                : "") +
              "\nInput:\n" +
              JSON.stringify(input),
          },
        ],
      });

      const out = safeJsonParse(completion.choices[0]?.message?.content ?? "{}");
      if (!out || out.skip || !out.event) {
        await supabase
          .from("raw_events")
          .update({ parse_attempts: attempts + 1 })
          .eq("id", row.id);
        skippedCount += 1;
        continue;
      }

      const e = out.event;

      if (!e.title_bs || !e.start_datetime) {
        await supabase
          .from("raw_events")
          .update({ parse_attempts: attempts + 1 })
          .eq("id", row.id);
        skippedCount += 1;
        continue;
      }

      // Hard Sarajevo gate after parse (with raw fallbacks)
      if (SARAJEVO_ONLY && !passesSarajevoGate(e, row)) {
        await supabase
          .from("raw_events")
          .update({ parse_attempts: attempts + 1 })
          .eq("id", row.id);
        skippedCount += 1;
        continue;
      }

      const nowIso = new Date().toISOString();

      const payload = {
        title_bs: String(e.title_bs),
        title_en: String(e.title_en ?? e.title_bs),
        description_bs: String(e.description_bs ?? ""),
        description_en: String(e.description_en ?? ""),

        type: pickAllowed(e.type, TYPES_ALLOWED, "standalone"),
        category: pickAllowed(e.category, CATEGORIES_ALLOWED, "other"),

        moods: pickArrayAllowed(e.moods, MOODS_ALLOWED),
        tags: Array.isArray(e.tags)
          ? [
              ...new Set(
                e.tags
                  .filter((t: any) => typeof t === "string")
                  .map((t: string) => t.trim())
                  .filter(Boolean)
                  .slice(0, 12)
              ),
            ]
          : [],

        series_id: null,
        venue_id: null,

        location_name: normText(e.location_name),
        location_address: normText(e.location_address),
        latitude: typeof e.latitude === "number" ? e.latitude : null,
        longitude: typeof e.longitude === "number" ? e.longitude : null,

        start_datetime: String(e.start_datetime),
        end_datetime: e.end_datetime ? String(e.end_datetime) : null,

        is_recurring: Boolean(e.is_recurring ?? false),
        recurrence_rule: e.recurrence_rule ? String(e.recurrence_rule) : null,

        cover_image_url: e.cover_image_url ?? row.image_url ?? null,
        price_bam: typeof e.price_bam === "number" ? e.price_bam : null,

        ticket_url: e.ticket_url ?? row.source_url ?? null,
        source: String(e.source ?? row.source_name ?? "unknown"),

        submitted_by: null,
        status: STATUS_DEFAULT,

        is_featured: false,
        attendance_count: 0,
        is_active: true,

        created_at: nowIso,
        updated_at: nowIso,
      };

      const ins = await supabase.from("events").insert(payload);

      if (ins.error) {
        await supabase
          .from("raw_events")
          .update({ parse_attempts: attempts + 1 })
          .eq("id", row.id);
        skippedCount += 1;
        continue;
      }

      await supabase
        .from("raw_events")
        .update({
          parsed: true,
          parsed_at: nowIso,
          parse_attempts: attempts + 1,
        })
        .eq("id", row.id);

      parsedCount += 1;
    }

    return new Response(`ok: parsed ${parsedCount}, skipped ${skippedCount}`);
  } catch (err) {
    const msg =
      err instanceof Error ? `${err.name}: ${err.message}\n${err.stack ?? ""}` : String(err);
    return new Response(msg, { status: 500 });
  }
});
