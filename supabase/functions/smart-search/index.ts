import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callOpenAI } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { query, language = 'en' } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'query is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch available categories and neighborhoods for context
    const { data: venuesMeta } = await supabase
      .from('venues')
      .select('category, neighborhood')
      .limit(200);

    const categories = [...new Set((venuesMeta ?? []).map((v) => v.category).filter(Boolean))];
    const neighborhoods = [...new Set((venuesMeta ?? []).map((v) => v.neighborhood).filter(Boolean))];

    const systemPrompt = `You are a smart search assistant for Hype, a Sarajevo nightlife app.
Available venue categories: ${categories.join(', ')}.
Available neighborhoods: ${neighborhoods.join(', ')}.
Language: ${language}.

Classify the user query as either "search" (looking for specific venues/filters) or "conversation" (asking for recommendations or chatting).

For "search" mode, extract structured filters.
For "conversation" mode, provide a friendly response and suggest specific venue names if applicable.

Respond with ONLY valid JSON (no markdown):
{
  "mode": "search" | "conversation",
  "filters": {
    "category": string | null,
    "neighborhood": string | null,
    "query": string,
    "mood": string | null,
    "priceLevel": number | null,
    "isOpen": boolean | null
  },
  "response": string | null,
  "venueNames": string[] | null
}`;

    const aiResponse = await callOpenAI({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 512,
    });

    const rawText: string = aiResponse?.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(rawText);

    const { mode, filters, response: aiResponseText, venueNames } = parsed;

    let matchedVenues: any[] | undefined;

    // If conversation mode returned venue names, fetch them from DB
    if (mode === 'conversation' && venueNames && venueNames.length > 0) {
      const { data: venuesData } = await supabase
        .from('venues')
        .select('*')
        .in('name', venueNames)
        .limit(10);
      matchedVenues = venuesData ?? [];
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          mode: mode ?? 'search',
          filters: filters ?? { query, category: null, neighborhood: null, mood: null, priceLevel: null, isOpen: null },
          response: aiResponseText ?? null,
          venueNames: venueNames ?? null,
          matchedVenues: matchedVenues ?? null,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('smart-search error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message ?? 'Internal error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
