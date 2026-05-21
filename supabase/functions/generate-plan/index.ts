import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { getActiveHoliday } from '../_shared/holidays.ts';
import { verifyUserAuth } from '../_shared/auth.ts';
import { getSarajevoHour } from '../_shared/sarajevoTime.ts';

const STREAM_TIMEOUT_MS = 45_000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  const user = await verifyUserAuth(req);
  if (!user) {
    return new Response(
      JSON.stringify({ success: false, error: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { moods = [], groupSize = 2, budget = 'mid', language = 'en' } = await req.json();

    // Determine time of day in Sarajevo (edge runtime is UTC)
    const now = new Date();
    const sarajevoHour = getSarajevoHour(now);
    let timeOfDay: string;
    let timeContext: string;
    if (sarajevoHour < 11) {
      timeOfDay = 'morning';
      timeContext = 'a morning/brunch outing with coffee, pastries, and sightseeing';
    } else if (sarajevoHour < 15) {
      timeOfDay = 'afternoon';
      timeContext = 'an afternoon plan with lunch, exploring, and culture';
    } else if (sarajevoHour < 19) {
      timeOfDay = 'evening';
      timeContext = 'an evening plan with dinner, drinks, and atmosphere';
    } else {
      timeOfDay = 'night';
      timeContext = 'a late night plan with drinks, nightlife, and vibes';
    }

    // Holiday awareness
    const holiday = getActiveHoliday(now);
    const holidayContext = holiday ? `\nToday is ${holiday} — incorporate this festive context into the plan.` : '';

    // Fetch venues and events in parallel — `today` must be Sarajevo-local
    // so late-night users (00:00–02:00 local) see today's events, not yesterday's.
    const today = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Sarajevo' });
    const [venuesResult, eventsResult] = await Promise.all([
      supabaseAdmin
        .from('venues')
        .select('id, name, category, neighborhood, vibe_tags, price_level, address')
        .in('category', ['cafe', 'restaurant', 'bar', 'club'])
        .limit(40),
      supabaseAdmin
        .from('events')
        .select('name, description, category, start_time, venue_name, price')
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`)
        .limit(15),
    ]);

    const venues = venuesResult.data;
    const events = eventsResult.data;

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

    const isBosnian = language === 'bs';

    const prompt = `Create a detailed 3-4 stop ${timeContext} plan for Sarajevo.
It is currently ${timeOfDay} (${sarajevoHour}:00 local time). Start times from now onward.${holidayContext}

Group size: ${groupSize} people.
Budget: ${budgetMap[budget] ?? 'moderate'}.
Moods/preferences: ${moods.length > 0 ? moods.join(', ') : 'open to anything'}.

Today's events:
${eventList}

Available venues (ONLY use these exact original names — NEVER translate or alter venue names, keep them in their original language):
${venueList || 'Various Sarajevo venues.'}

Create a realistic ${timeOfDay} flow. Pick venues that work geographically (walking distance between stops). Include timing, walking directions, and cost estimates.

IMPORTANT — WRITE BOSNIAN FIRST, THEN TRANSLATE TO ENGLISH:
1. Write ALL _bs fields FIRST (tagline_bs, activity_bs, pitch_bs). Think in Bosnian, write in Bosnian.
   Rules for Bosnian:
   - Sound like a young local friend casually planning, not a tourist brochure
   - Use short, punchy sentences — max 15 words per activity/pitch
   - Never mix English words into Bosnian text
   - Use proper grammar and diacritics (č, ć, š, ž, đ)
   - Use Sarajevo Bosnian — "kafa" not "kava", "uvijek" not "uvek", "vrijedi" not "vredi", "ovdje" not "ovde"
   - Examples of good tone: "Kreni na kafu kod Sebija", "Prošetaj Ferhadijom do Morića Hana", "Završi uz pivu na Bašči"
2. THEN translate each Bosnian field into natural English for the _en fields. Rephrase idioms — don't translate literally.

Respond with ONLY valid JSON:
{
  "tagline_bs": "catchy tagline in Bosnian (write FIRST)",
  "tagline_en": "English translation",
  "total_cost": estimated_total_number_in_KM,
  "stops": [
    {
      "time": "e.g. 10:00 AM",
      "venue_name": "exact venue name from the list",
      "activity_bs": "what to do there (Bosnian, write FIRST)",
      "activity_en": "English translation",
      "pitch_bs": "one sentence — why this is great (Bosnian, write FIRST)",
      "pitch_en": "English translation",
      "walk_minutes": minutes_to_walk_from_previous,
      "estimated_cost": cost_in_KM_per_person
    }
  ]
}`;

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    let claudeRes: Response;
    try {
      claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1500,
          stream: true,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      throw fetchErr;
    }

    if (!claudeRes.ok) {
      clearTimeout(timeoutId);
      const errText = await claudeRes.text();
      throw new Error(`Claude ${claudeRes.status}: ${errText}`);
    }

    // Transform Claude SSE → OpenAI-compatible SSE format
    // Claude: data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"..."}}
    // OpenAI: data: {"choices":[{"delta":{"content":"..."}}]}
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const reader = claudeRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (!data) continue;

            try {
              const event = JSON.parse(data);
              if (event.type === 'content_block_delta' && event.delta?.text) {
                // Translate to OpenAI format
                const openAIChunk = JSON.stringify({
                  choices: [{ delta: { content: event.delta.text } }],
                });
                await writer.write(encoder.encode(`data: ${openAIChunk}\n\n`));
              } else if (event.type === 'message_stop') {
                await writer.write(encoder.encode('data: [DONE]\n\n'));
              }
            } catch {
              // Non-JSON line, skip
            }
          }
        }
        // Final done sentinel
        await writer.write(encoder.encode('data: [DONE]\n\n')).catch(() => {});
      } catch (_err) {
        await writer.write(encoder.encode('data: [DONE]\n\n')).catch(() => {});
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
