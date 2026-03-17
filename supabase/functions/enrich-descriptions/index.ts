import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callClaude } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();
  try {
    const { venue_id, batch_size = 5 } = await req.json();
    const supabase = getSupabaseAdmin();
    let query = supabase.from('venues').select('id, name, category, neighborhood, moods').is('description_en', null).limit(batch_size);
    if (venue_id) { query = supabase.from('venues').select('id, name, category, neighborhood, moods').eq('id', venue_id); }
    const { data: venues, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;
    if (!venues?.length) {
      return new Response(JSON.stringify({ success: true, data: { enriched: 0, message: 'No venues need enrichment' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    let enriched = 0;
    for (const venue of venues) {
      const prompt = `Write a 2-3 sentence description for this Sarajevo venue. Be engaging, warm, and specific.\n\nVenue: ${venue.name}\nCategory: ${venue.category}\nNeighborhood: ${venue.neighborhood ?? 'Sarajevo'}\nMoods: ${venue.moods?.join(', ') ?? 'general'}\n\nReturn JSON: { "description_bs": "Bosnian description", "description_en": "English description" }`;
      try {
        const result = await callClaude({
          model: 'claude-haiku-4-5-20251001',
          messages: [{ role: 'user', content: prompt }],
          system: 'You write bilingual venue descriptions for a Sarajevo city guide app. Return valid JSON only.',
          max_tokens: 512,
        });
        const text = result.content?.[0]?.text ?? '';
        const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(clean);
        await supabase.from('venues').update({ description_bs: parsed.description_bs, description_en: parsed.description_en }).eq('id', venue.id);
        enriched++;
      } catch (err) { console.error(`Failed to enrich ${venue.name}:`, err); }
    }
    return new Response(JSON.stringify({ success: true, data: { enriched, total: venues.length } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  }
});
