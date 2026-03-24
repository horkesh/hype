import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callGemini } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/** Sarajevo-relevant keywords for filtering RSS headlines. */
const SARAJEVO_KEYWORDS = [
  'sarajev', 'baščarši', 'ilidž', 'trebević', 'vrelo bosn',
  'grbavic', 'skenderij', 'marijin dvor', 'otoka', 'dobrinja',
  'željezničar', 'željo', 'sarajevo', 'kanton', 'kcus',
  'vijećnic', 'olimpij', 'zetra', 'bascarsij', 'centar',
];

/**
 * Known holidays for Sarajevo. Islamic dates shift yearly — update each Jan.
 * Format: 'MM-DD' → description. Multi-day holidays get multiple entries.
 */
const HOLIDAYS: Record<string, string> = {
  // Ramazan Bajram (Eid al-Fitr) 2026: March 20-22
  '03-20': 'BAJRAM (Eid al-Fitr) — first day! This is the BIGGEST celebration in Sarajevo. Morning: Bajram prayers. Then family visits, baklava, coffee, festive atmosphere everywhere. "Bajram šerif mubarek olsun!"',
  '03-21': 'BAJRAM (Eid al-Fitr) — second day. Family lunches, visiting relatives, walks, kids getting bajramluk (money gifts). Relaxed festive mood.',
  '03-22': 'BAJRAM (Eid al-Fitr) — third day. The celebration continues, more relaxed. Evening gatherings with friends.',
  // Kurban Bajram (Eid al-Adha) 2026: ~May 27-29
  '05-27': 'KURBAN BAJRAM (Eid al-Adha) — first day. Major holiday. Morning prayers, traditional meals, family gatherings.',
  '05-28': 'KURBAN BAJRAM — second day. Family visits continue, generous hospitality.',
  '05-29': 'KURBAN BAJRAM — third day.',
  // Fixed holidays
  '01-01': 'NOVA GODINA (New Year\'s Day) — Sarajevo recovers from last night\'s celebrations.',
  '01-02': 'Still New Year\'s holiday weekend.',
  '03-01': 'DAN NEZAVISNOSTI (Independence Day) — national holiday.',
  '05-01': 'PRAZNIK RADA (Labour Day) — picnics, outdoor gatherings, Vrelo Bosne is packed.',
  '11-25': 'DAN DRŽAVNOSTI (Statehood Day) — national holiday.',
  '12-25': 'BOŽIĆ (Catholic Christmas) — part of Sarajevo celebrates.',
  '01-07': 'BOŽIĆ (Orthodox Christmas) — part of Sarajevo celebrates.',
  // Ramazan 2026: ~Feb 18 - Mar 19
  '02-18': 'RAMAZAN starts today. Iftar gatherings begin at sunset. Special menus at many restaurants.',
  '03-19': 'Last day of RAMAZAN. Tomorrow is Bajram! City is preparing for celebrations.',
};

function getTodayHoliday(now: Date): string | null {
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return HOLIDAYS[`${mm}-${dd}`] ?? null;
}

/** Fetch klix.ba RSS and extract Sarajevo-relevant headlines. */
async function fetchKlixHeadlines(): Promise<string[]> {
  try {
    const res = await fetch('https://www.klix.ba/rss', {
      headers: { 'User-Agent': 'HypeApp/1.0 CityPulse' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];

    const xml = await res.text();

    // Simple XML parsing — extract <item> titles and descriptions
    const items: { title: string; desc: string; category: string }[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
      const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? block.match(/<description>(.*?)<\/description>/)?.[1] ?? '';
      const category = block.match(/<category[^>]*>(.*?)<\/category>/)?.[1] ?? '';
      items.push({ title, desc, category });
    }

    // Filter for Sarajevo relevance
    const lower = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const relevant = items.filter(({ title, desc }) => {
      const combined = lower(title + ' ' + desc);
      return SARAJEVO_KEYWORDS.some(kw => combined.includes(lower(kw)));
    });

    // Return top 8 relevant headlines
    return relevant.slice(0, 8).map(r => r.title);
  } catch (err) {
    console.error('Klix RSS fetch failed:', err);
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json().catch(() => ({}));
    const weather = body?.weather ?? null;

    // Check cache
    const { data: cached } = await supabase
      .from('city_pulse')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      if (age < CACHE_TTL_MS) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              pulse_bs: cached.pulse_bs,
              pulse_en: cached.pulse_en,
              time_of_day: cached.time_of_day,
            },
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // Fetch context in parallel: events, venues, klix headlines
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const [eventsResult, venuesResult, klixHeadlines] = await Promise.all([
      supabase
        .from('events')
        .select('title_en, description_en, category, start_datetime, location_name, venues(name)')
        .gte('start_datetime', `${today}T00:00:00`)
        .lte('start_datetime', `${today}T23:59:59`)
        .eq('status', 'approved')
        .eq('is_active', true)
        .limit(10),
      supabase
        .from('venues')
        .select('name, category, neighborhood')
        .in('category', ['cafe', 'restaurant', 'bar', 'club'])
        .limit(30),
      fetchKlixHeadlines(),
    ]);

    const events = eventsResult.data;
    const venues = venuesResult.data;

    // Time context
    const hour = now.getHours();
    const time_of_day = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const fullDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // Weather context — build a rich weather hint for the AI
    let weatherLine = '';
    let weatherGuidance = '';
    if (weather?.temp !== undefined) {
      const cond = (weather.condition || 'clear').toLowerCase();
      weatherLine = `Current weather: ${weather.temp}°C, ${cond}.`;

      // Build weather-aware guidance
      if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm')) {
        weatherGuidance = 'It\'s rainy — lean into cozy indoor vibes: warm drinks, čorba, indoor cafés. Mention staying dry.';
      } else if (cond.includes('snow')) {
        weatherGuidance = 'Snow in Sarajevo! Suggest warm indoor spots, hot čaj or salep, enjoying the winter scenery.';
      } else if (cond.includes('fog') || cond.includes('mist')) {
        weatherGuidance = 'Foggy/misty — atmospheric vibes. Cozy indoor spots work great.';
      } else if (weather.temp >= 28) {
        weatherGuidance = 'It\'s hot — suggest terraces with shade, cold drinks, evening outings when it cools down.';
      } else if (weather.temp <= 0) {
        weatherGuidance = 'Freezing cold — warm indoor spots, hot drinks, bundle-up energy.';
      } else if (weather.temp >= 18 && (cond.includes('clear') || cond.includes('sun') || cond === 'clouds' || cond === 'few clouds')) {
        weatherGuidance = 'Beautiful weather — push outdoor terraces, walks, parks, riverside spots.';
      }
    }

    const eventSummary = events && events.length > 0
      ? events.map((e: any) => `- ${e.title_en} (${e.category}) at ${e.venues?.name ?? e.location_name ?? 'TBA'}`).join('\n')
      : 'No specific events in our database today.';

    const venueSummary = venues && venues.length > 0
      ? venues.map((v) => `- ${v.name} (${v.category}, ${v.neighborhood})`).join('\n')
      : 'Various venues available.';

    const newsBlock = klixHeadlines.length > 0
      ? `\nLocal news headlines (klix.ba):\n${klixHeadlines.map(h => `- ${h}`).join('\n')}\n`
      : '';

    const todayHoliday = getTodayHoliday(now);
    const holidayBlock = todayHoliday
      ? `\n⚠️ TODAY IS A HOLIDAY: ${todayHoliday}\nThis MUST be the primary theme of the pulse. Everything else is secondary.\n`
      : '';

    const prompt = `You are a local Sarajevo friend writing a 1-2 sentence "City Pulse" for a going-out app. Today is ${fullDate}, ${time_of_day}.
${holidayBlock}
WHAT MATTERS TODAY:
- If a holiday is marked above, it MUST dominate the pulse — greetings, what people are doing at this time of day
- If it IS a holiday, match the RHYTHM of the day to the time:
  * Bajram morning → "Bajram mubarek! After prayers, time for family and baklava."
  * Bajram afternoon → "Resting after that Bajram lunch? Perfect time for a slow walk."
  * Bajram evening → "Family visits done, time to grab a coffee with friends."
  * Ramazan evening → "Iftar time! The city comes alive after sunset."
- Weekend: Friday after džuma is when the weekend starts. Saturday night is peak going-out.
- Season + weather: use the current weather data below to shape the vibe (indoor vs outdoor, hot vs cold drinks, etc.)
- Festivals: SFF (Aug), Jazz Fest (Jul), MESS (Oct)
${newsBlock ? `\nLOCAL NEWS — ONLY mention if it's a BIG deal that affects the whole city (major event, protest, road closure, big sports win, celebrity visit). IGNORE niche stories, random crime, politics, or anything most people wouldn't care about when deciding where to go:\n${newsBlock}` : ''}
${weatherLine ? weatherLine + '\n' : ''}${weatherGuidance ? 'WEATHER GUIDANCE: ' + weatherGuidance + '\n' : ''}${dayOfWeek === 'Friday' || dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday' ? `It's the weekend (${dayOfWeek}).\n` : ''}
Today's events:
${eventSummary}

APPROVED VENUE LIST — you MUST pick from these. Any venue not on this list does NOT exist:
${venueSummary}

RULES:
- You can ONLY mention venues from the APPROVED VENUE LIST above. If a venue is not on that list, it does not exist in our app. Never reference Zlatna Ribica, Željo, or any other venue from your general knowledge — ONLY the list above.
- Match the TIME OF DAY: morning = coffee/brunch vibes, afternoon = lunch/walk, evening = dinner/going out, night = bars/clubs
- If it's a holiday, show you understand HOW people actually celebrate it at this time of day — not just "it's Bajram"
- The pulse should help someone decide what to do RIGHT NOW
- Sound like a Sarajlija texting a friend — casual, warm, specific
- Never use: "vibrant", "bustling", "immerse", "tapestry", "heartbeat of the city", "hidden gem", "discover"
- Under 160 characters per language

Great examples (use venue names from the APPROVED list, not these):
  BS: "Bajram mubarek! Poslije ručka, šetnja i kafu. Grad miriše na baklavu."
  EN: "Bajram mubarek! Post-lunch walk and coffee. The whole city smells like baklava."
  BS: "Kiša pada, idealno za toplu čorbu i kafu. Zagrij se."
  EN: "Rainy afternoon — warm up with čorba and coffee somewhere cozy."
  BS: "Petak popodne, sunce sija. Navrati na [venue from list] prije večernje gužve."
  EN: "Friday afternoon sun. Drop by [venue from list] before the evening rush."

CRITICAL for pulse_bs: Write in BOSNIAN using LATIN SCRIPT only. Never Cyrillic. Use Sarajevo Bosnian — "uvijek" not "uvek", "kafa" not "kava", "vrijedi" not "vredi". Sound like a Sarajlija texting.

Respond with ONLY valid JSON (no markdown):
{
  "pulse_en": "English pulse",
  "pulse_bs": "Bosnian pulse"
}`;

    const geminiResponse = await callGemini({
      model: 'gemini-2.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      maxOutputTokens: 512,
    });

    const rawText: string =
      geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip markdown fences and any preamble text before the JSON
    let cleaned = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // If the model output thinking before JSON, extract just the JSON object
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart > 0 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(cleaned);
    const { pulse_en, pulse_bs } = parsed;

    // Cache result
    await supabase.from('city_pulse').insert({
      pulse_en,
      pulse_bs,
      time_of_day,
    });

    return new Response(
      JSON.stringify({ success: true, data: { pulse_bs, pulse_en, time_of_day } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('generate-pulse error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message ?? 'Internal error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
