import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

const STREAM_TIMEOUT_MS = 45_000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { moods = [], groupSize = 2, budget = 'mid', language = 'en' } = await req.json();

    // Determine time of day in Sarajevo
    const now = new Date();
    const sarajevoHour = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Sarajevo' })).getHours();
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
    const holidayContext = holiday ? `\nToday is ${holiday} — incorporate this festive context into the plan.` : '';

    const supabase = getSupabaseAdmin();

    // Fetch venues and events in parallel
    const today = now.toISOString().split('T')[0];
    const [venuesResult, eventsResult] = await Promise.all([
      supabase
        .from('venues')
        .select('id, name, category, neighborhood, vibe_tags, price_level, address')
        .in('category', ['cafe', 'restaurant', 'bar', 'club'])
        .limit(40),
      supabase
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

${isBosnian ? `Write ALL activities and pitches in natural, grammatically correct Sarajevo Bosnian (Latin script, ijekavica).
Rules for Bosnian:
- Sound like a young local friend casually planning, not a tourist brochure
- Use short, punchy sentences — max 15 words per activity/pitch
- Never mix English words into Bosnian text
- Use proper grammar and diacritics (č, ć, š, ž, đ)
- Examples of good tone: "Kreni na kafu kod Sebija", "Prošetaj Ferhadijom do Morića Hana", "Završi uz pivu na Bašči"` : 'Write activities and pitches in casual, warm English.'}

Respond with ONLY valid JSON:
{
  "tagline_en": "catchy tagline",
  "tagline_bs": "catchy tagline in Bosnian",
  "total_cost": estimated_total_number_in_KM,
  "stops": [
    {
      "time": "e.g. 10:00 AM",
      "venue_name": "exact venue name from the list",
      "activity_en": "what to do there (English)",
      "activity_bs": "what to do there (Bosnian)",
      "pitch_en": "one sentence — why this is great (English)",
      "pitch_bs": "one sentence — why this is great (Bosnian)",
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
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
