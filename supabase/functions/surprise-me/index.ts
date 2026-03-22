import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callClaude } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { moods = [], language = 'en' } = await req.json();

    // Determine time of day in Sarajevo
    const now = new Date();
    const sarajevoHour = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Sarajevo' })).getHours();
    let timeOfDay: string;
    let timeContext: string;
    if (sarajevoHour < 11) {
      timeOfDay = 'morning';
      timeContext = 'a spontaneous morning outing (coffee, brunch, sightseeing)';
    } else if (sarajevoHour < 15) {
      timeOfDay = 'afternoon';
      timeContext = 'a spontaneous afternoon adventure (lunch, exploring, culture)';
    } else if (sarajevoHour < 19) {
      timeOfDay = 'evening';
      timeContext = 'a spontaneous evening out (dinner, drinks, nightlife)';
    } else {
      timeOfDay = 'night';
      timeContext = 'a spontaneous late night plan (drinks, clubs, night vibes)';
    }

    // Holiday awareness
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HOLIDAYS: Record<string, string> = {
      '03-20': 'Bajram (Eid al-Fitr) first day',
      '03-21': 'Bajram second day',
      '03-22': 'Bajram third day — relaxed festive atmosphere',
      '05-27': 'Kurban Bajram first day',
      '01-01': 'New Year',
      '03-01': 'Independence Day',
      '05-01': 'Labour Day',
    };
    const holiday = HOLIDAYS[`${mm}-${dd}`] ?? null;
    const holidayContext = holiday ? `\nToday is ${holiday} — incorporate this festive context.` : '';

    const supabase = getSupabaseAdmin();

    // Fetch venues for prompt (curated subset) and enrichment (all) in parallel
    const [promptVenuesRes, allVenuesRes] = await Promise.all([
      supabase
        .from('venues')
        .select('id, name, category, neighborhood, vibe_tags, price_level, address')
        .in('category', ['cafe', 'restaurant', 'bar', 'club', 'museum', 'gallery', 'landmark', 'cultural_center', 'theatre', 'park', 'outdoor'])
        .limit(50),
      supabase
        .from('venues')
        .select('id, name, category, neighborhood')
        .limit(1200),
    ]);

    const venues = promptVenuesRes.data;
    const allVenues = allVenuesRes.data ?? [];

    const venueList = (venues ?? [])
      .map((v) => `- ${v.name} (${v.category}, ${v.neighborhood}, price: ${v.price_level ?? '?'})`)
      .join('\n');

    const moodContext = moods.length > 0
      ? `User moods/preferences: ${moods.join(', ')}.`
      : 'No specific mood — surprise them!';

    const isBosnian = language === 'bs';

    const prompt = `Generate a 2-3 stop micro-plan for ${timeContext} in Sarajevo.
It is currently ${timeOfDay} (${sarajevoHour}:00 local time). Suggest times that start from now and make sense for this time of day.${holidayContext}
${moodContext}

Available venues (ONLY use these exact names):
${venueList || 'Various Sarajevo venues.'}

Create an exciting, spontaneous ${timeOfDay} plan. Each stop should flow naturally into the next. Pick venues that make sense together geographically and thematically.

${isBosnian ? `Write ALL pitches in natural, grammatically correct Sarajevo Bosnian (Latin script, ijekavica).
Rules for Bosnian:
- Sound like a young local friend casually texting the plan, not a tourist brochure
- Use short, punchy sentences — max 15 words per pitch
- Never mix English words into Bosnian pitches
- Use proper grammar and diacritics (č, ć, š, ž, đ)
- Examples of good tone: "Ovdje se pije najbolja kafa u gradu", "Prošetaj čaršijom dok je mirno", "Obavezno probaj baklavu"` : 'Write pitches in casual, warm English. Sound like a local friend suggesting the plan.'}

Respond with ONLY valid JSON:
{
  "tagline_en": "short exciting tagline",
  "tagline_bs": "short exciting tagline in Bosnian",
  "stops": [
    {
      "venue_name": "exact venue name from list above",
      "time": "e.g. 10:00 AM",
      "pitch_en": "one sentence — why this stop (English)",
      "pitch_bs": "one sentence — why this stop (Bosnian)"
    }
  ]
}`;

    const aiResponse = await callClaude({
      model: 'claude-sonnet-4-5-20250929',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    });

    const rawText: string = aiResponse?.content?.[0]?.text ?? '{}';

    // Extract JSON from response
    let cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart > 0 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(cleaned);
    const { stops = [], tagline_en, tagline_bs } = parsed;

    // Enrich stops with venue data (fuzzy matching against ALL venues, not just prompt subset)
    const venueMap = new Map(allVenues.map((v) => [v.name.toLowerCase(), v]));
    // Pre-compute lowercase names for partial matching
    const venueLower = allVenues.map((v) => ({ lower: v.name.toLowerCase(), venue: v }));
    function findVenue(name: string | undefined) {
      if (!name) return null;
      const lower = name.toLowerCase();
      // Exact match first
      const exact = venueMap.get(lower);
      if (exact) return exact;
      // Partial match with pre-computed lowercase
      return venueLower.find(
        (entry) => entry.lower.includes(lower) || lower.includes(entry.lower)
      )?.venue ?? null;
    }
    const enrichedStops = stops.map((stop: any) => ({
      ...stop,
      venue: findVenue(stop.venue_name),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stops: enrichedStops,
          tagline_en: tagline_en ?? null,
          tagline_bs: tagline_bs ?? null,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('surprise-me error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message ?? 'Internal error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
