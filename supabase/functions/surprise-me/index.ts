import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callOpenAI } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { moods = [], language = 'en' } = await req.json();

    const supabase = getSupabaseAdmin();

    // Fetch open venues
    const { data: venues } = await supabase
      .from('venues')
      .select('id, name, category, neighborhood, vibe_tags, price_level, address')
      .eq('is_open', true)
      .limit(30);

    const venueList = (venues ?? [])
      .map((v) => `- ${v.name} (${v.category}, ${v.neighborhood}, price: ${v.price_level ?? '?'})`)
      .join('\n');

    const moodContext = moods.length > 0
      ? `User moods/preferences: ${moods.join(', ')}.`
      : 'No specific mood — surprise them!';

    const systemPrompt = `You are Hype, a Sarajevo nightlife curator. Generate a 2-3 stop micro-plan for tonight.
${moodContext}
Language for pitches: ${language}.

Available venues:
${venueList || 'Various Sarajevo venues.'}

Create an exciting, spontaneous evening plan. Each stop should flow naturally into the next.

Respond with ONLY valid JSON (no markdown):
{
  "tagline_en": "short exciting tagline in English",
  "tagline_bs": "short exciting tagline in Bosnian",
  "stops": [
    {
      "venue_name": "exact venue name from list",
      "time": "e.g. 8:00 PM",
      "pitch_en": "why this stop is exciting (English)",
      "pitch_bs": "why this stop is exciting (Bosnian)"
    }
  ]
}`;

    const aiResponse = await callOpenAI({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Give me a surprise plan for tonight!' },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1024,
    });

    const rawText: string = aiResponse?.choices?.[0]?.message?.content ?? '{}';

    // Strip markdown code fences
    const cleaned = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

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
