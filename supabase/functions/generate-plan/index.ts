import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

const OPENAI_STREAM_TIMEOUT_MS = 20_000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { moods = [], groupSize = 2, budget = 'mid', language = 'en' } = await req.json();

    const supabase = getSupabaseAdmin();

    // Fetch venues
    const { data: venues } = await supabase
      .from('venues')
      .select('id, name, category, neighborhood, vibe_tags, price_level, address')
      .limit(40);

    // Fetch tonight's events
    const today = new Date().toISOString().split('T')[0];
    const { data: events } = await supabase
      .from('events')
      .select('name, description, category, start_time, venue_name, price')
      .gte('start_time', `${today}T00:00:00`)
      .lte('start_time', `${today}T23:59:59`)
      .limit(15);

    const venueList = (venues ?? [])
      .map((v) => `- ${v.name} (${v.category}, ${v.neighborhood}, price_level: ${v.price_level ?? '?'})`)
      .join('\n');

    const eventList = events && events.length > 0
      ? events.map((e) => `- ${e.name} at ${e.venue_name}, starts ${e.start_time}, price: ${e.price ?? 'free/unknown'}`)
        .join('\n')
      : 'No special events tonight.';

    const budgetMap: Record<string, string> = {
      casual: 'budget-friendly (under 20 KM per person)',
      mid: 'moderate (20-50 KM per person)',
      premium: 'premium (50+ KM per person)',
    };

    const systemPrompt = `You are Hype, an expert Sarajevo evening planner. Create a detailed 3-4 stop evening plan.

Group size: ${groupSize} people.
Budget: ${budgetMap[budget] ?? 'moderate'}.
Moods/preferences: ${moods.length > 0 ? moods.join(', ') : 'open to anything'}.
Language for pitches and activities: ${language}.

Tonight's events:
${eventList}

Available venues:
${venueList || 'Various Sarajevo venues.'}

Create a realistic, enjoyable evening flow with timing, walking directions, and cost estimates.

Respond with ONLY valid JSON (no markdown):
{
  "tagline_en": "catchy evening tagline",
  "tagline_bs": "catchy evening tagline in Bosnian",
  "total_cost": estimated_total_number,
  "stops": [
    {
      "time": "e.g. 7:30 PM",
      "venue_name": "exact venue name",
      "activity_en": "what to do there (English)",
      "activity_bs": "what to do there (Bosnian)",
      "pitch_en": "why this is great (English)",
      "pitch_bs": "why this is great (Bosnian)",
      "walk_minutes": minutes_to_walk_from_previous_stop,
      "estimated_cost": cost_in_KM_per_person
    }
  ]
}`;

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    // AbortController covers the ENTIRE stream lifetime
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_STREAM_TIMEOUT_MS);

    let openAIRes: Response;
    try {
      openAIRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Plan my evening in Sarajevo!' },
          ],
          max_tokens: 1500,
          stream: true,
        }),
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      throw fetchErr;
    }

    if (!openAIRes.ok) {
      clearTimeout(timeoutId);
      const errText = await openAIRes.text();
      throw new Error(`OpenAI ${openAIRes.status}: ${errText}`);
    }

    // Pass SSE stream directly to client, clearing timeout when stream ends
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Pipe OpenAI stream → our response stream
    (async () => {
      try {
        const reader = openAIRes.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } catch (_err) {
        // Stream aborted or errored — write a done sentinel
        await writer.write(encoder.encode('\ndata: [DONE]\n\n')).catch(() => {});
      } finally {
        clearTimeout(timeoutId);
        await writer.close().catch(() => {});
      }
    })();

    return new Response(readable, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('generate-plan error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message ?? 'Internal error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
