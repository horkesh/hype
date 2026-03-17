import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callGemini } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const supabase = getSupabaseAdmin();

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

    // Fetch today's events
    const today = new Date().toISOString().split('T')[0];
    const { data: events } = await supabase
      .from('events')
      .select('name, description, category, start_time, venue_name')
      .gte('start_time', `${today}T00:00:00`)
      .lte('start_time', `${today}T23:59:59`)
      .limit(10);

    // Fetch popular venues
    const { data: venues } = await supabase
      .from('venues')
      .select('name, category, neighborhood, vibe_tags')
      .limit(15);

    // Determine time of day
    const hour = new Date().getHours();
    const time_of_day = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    // Build prompt
    const eventSummary = events && events.length > 0
      ? events.map((e) => `- ${e.name} (${e.category}) at ${e.venue_name}`).join('\n')
      : 'No specific events today.';

    const venueSummary = venues && venues.length > 0
      ? venues.map((v) => `- ${v.name} (${v.category}, ${v.neighborhood})`).join('\n')
      : 'Various venues available.';

    const prompt = `You are the voice of Sarajevo's nightlife. It is ${time_of_day} in Sarajevo, Bosnia.

Today's events:
${eventSummary}

Popular venues:
${venueSummary}

Generate a short, vibrant city pulse blurb in both English and Bosnian that captures the energy and vibe of Sarajevo right now.
Keep each blurb to 2-3 sentences max. Be evocative and local.

Respond with ONLY valid JSON (no markdown):
{
  "pulse_en": "English blurb here",
  "pulse_bs": "Bosnian blurb here"
}`;

    const geminiResponse = await callGemini({
      model: 'gemini-2.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      maxOutputTokens: 512,
    });

    const rawText: string =
      geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip markdown code fences
    const cleaned = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    const { pulse_en, pulse_bs } = parsed;

    // Cache result in DB
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
