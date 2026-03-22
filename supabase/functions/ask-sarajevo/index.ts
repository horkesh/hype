import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callClaude } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { question, language = 'bs' } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ success: false, error: 'No question provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = getSupabaseAdmin();

    // Load knowledge base
    const { data: kbRows } = await supabase
      .from('visit_sarajevo_kb')
      .select('page_title, content_text, category');

    // Load venue names for linking
    const { data: venues } = await supabase
      .from('venues')
      .select('id, name, category, neighborhood')
      .limit(500);

    const kbContent = (kbRows ?? [])
      .map((r: { page_title: string; content_text: string; category: string }) =>
        `## ${r.page_title} (${r.category})\n${r.content_text}`
      )
      .join('\n\n---\n\n');

    const venueList = (venues ?? [])
      .map((v: { id: string; name: string; category: string; neighborhood: string }) =>
        `${v.name} (${v.category}, ${v.neighborhood || 'N/A'}) [id:${v.id}]`
      )
      .join('\n');

    const systemPrompt = `You are "Ask Sarajevo", a friendly AI concierge that knows everything about Sarajevo.
Your knowledge comes from Visit Sarajevo (visitsarajevo.ba) — the official tourism board.

KNOWLEDGE BASE:
${kbContent || 'No knowledge base loaded — answer from general knowledge about Sarajevo.'}

VENUE DATABASE:
${venueList}

RULES:
- Answer in ${language === 'bs' ? 'Bosnian (ijekavica, Latin script, diacritics: č, ć, š, ž, đ)' : 'English'}
- Be conversational, warm, like a local friend explaining
- When you mention a place that matches a venue in our database, include its ID
- Keep answers concise (2-4 sentences)
- Always attribute: "Source: Visit Sarajevo" at the end
- If the question is about a specific attraction, give the Visit Sarajevo description
- If asked about food, reference the Places to Eat categories from Visit Sarajevo
- If asked about transport, reference their transport data

RESPONSE FORMAT (JSON):
{
  "answer_bs": "Bosnian answer",
  "answer_en": "English answer",
  "mentioned_venues": [{"venue_id": "uuid", "name": "Venue Name"}],
  "source_pages": ["https://www.visitsarajevo.ba/relevant-page/"]
}`;

    const result = await callClaude({
      model: 'claude-sonnet-4-5-20250929',
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
      max_tokens: 1024,
    });

    const text = result.content?.[0]?.text ?? '';

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      parsed = {
        answer_bs: text,
        answer_en: text,
        mentioned_venues: [],
        source_pages: [],
      };
    }

    // Validate mentioned venue IDs exist
    if (parsed?.mentioned_venues?.length && venues) {
      const venueIds = new Set((venues as { id: string }[]).map(v => v.id));
      parsed.mentioned_venues = parsed.mentioned_venues.filter(
        (v: { venue_id: string }) => venueIds.has(v.venue_id)
      );
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ask-sarajevo error:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
