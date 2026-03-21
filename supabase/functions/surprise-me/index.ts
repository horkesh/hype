import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callClaude } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { moods = [], language = 'en' } = await req.json();

    const supabase = getSupabaseAdmin();

    // Fetch venues (cafes, restaurants, bars, clubs)
    const { data: venues } = await supabase
      .from('venues')
      .select('id, name, category, neighborhood, vibe_tags, price_level, address')
      .in('category', ['cafe', 'restaurant', 'bar', 'club'])
      .limit(30);

    const venueList = (venues ?? [])
      .map((v) => `- ${v.name} (${v.category}, ${v.neighborhood}, price: ${v.price_level ?? '?'})`)
      .join('\n');

    const moodContext = moods.length > 0
      ? `User moods/preferences: ${moods.join(', ')}.`
      : 'No specific mood — surprise them!';

    const isBosnian = language === 'bs';

    const prompt = `Generate a 2-3 stop micro-plan for a spontaneous evening in Sarajevo.
${moodContext}

Available venues (ONLY use these exact names):
${venueList || 'Various Sarajevo venues.'}

Create an exciting, spontaneous evening plan. Each stop should flow naturally into the next. Pick venues that make sense together geographically and thematically.

${isBosnian ? 'Write pitches in natural Sarajevo Bosnian (Latin script, ijekavica). Sound like a local friend suggesting the plan.' : 'Write pitches in casual, warm English.'}

Respond with ONLY valid JSON:
{
  "tagline_en": "short exciting tagline",
  "tagline_bs": "short exciting tagline in Bosnian",
  "stops": [
    {
      "venue_name": "exact venue name from list above",
      "time": "e.g. 8:00 PM",
      "pitch_en": "one sentence — why this stop (English)",
      "pitch_bs": "one sentence — why this stop (Bosnian)"
    }
  ]
}`;

    const aiResponse = await callClaude({
      model: 'claude-haiku-4-5-20251001',
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

    // Enrich stops with venue data
    const venueMap = new Map((venues ?? []).map((v) => [v.name.toLowerCase(), v]));
    const enrichedStops = stops.map((stop: any) => ({
      ...stop,
      venue: venueMap.get(stop.venue_name?.toLowerCase()) ?? null,
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
