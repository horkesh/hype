import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callClaude } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();
  try {
    const { venue_id, batch_size = 5 } = await req.json();
    const supabase = getSupabaseAdmin();
    const selectFields = 'id, name, category, neighborhood, moods, google_rating, google_ratings_count, google_editorial_summary, google_top_reviews, address';
    let query = supabase.from('venues').select(selectFields).is('description_en', null).limit(batch_size);
    if (venue_id) { query = supabase.from('venues').select(selectFields).eq('id', venue_id); }
    const { data: venues, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;
    if (!venues?.length) {
      return new Response(JSON.stringify({ success: true, data: { enriched: 0, message: 'No venues need enrichment' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    // Run AI calls concurrently to avoid N+1 sequential blocking
    const results = await Promise.allSettled(
      venues.map(async (venue) => {
        // Build context from Google data when available
        const googleContext: string[] = [];
        if (venue.google_editorial_summary) googleContext.push(`Google says: "${venue.google_editorial_summary}"`);
        if (venue.google_rating) googleContext.push(`Rating: ${venue.google_rating}/5 (${venue.google_ratings_count ?? '?'} reviews)`);
        if (venue.google_top_reviews?.length) {
          const snippets = venue.google_top_reviews.slice(0, 2).map((r: string) => `"${r.slice(0, 150)}"`);
          googleContext.push(`Visitor reviews:\n${snippets.join('\n')}`);
        }
        if (venue.address) googleContext.push(`Address: ${venue.address}`);

        const prompt = `Write a 1-2 sentence description for this Sarajevo venue. Sound like a local friend recommending a spot — direct, specific, no filler. Mention one concrete thing that makes it worth going (a dish, a view, a vibe, a detail). Never use words like "beloved", "vibrant", "culinary journey", "hidden gem", "true food enthusiasts", or "immerse yourself".

Good examples:
- "Most famous ćevabdžinica in BiH. Ćevapi in somun since 1962. An institution."
- "Mexican restaurant by day, club by night. Cocktails, nachos, party atmosphere in Baščaršija."
- "Vegan/vegetarian restaurant with chef's table experience. Reservation required — Saša is host, chef, and server."

Venue: ${venue.name}
Category: ${venue.category}
Neighborhood: ${venue.neighborhood ?? 'Sarajevo'}
Moods: ${venue.moods?.join(', ') ?? 'general'}
${googleContext.length > 0 ? '\nReal visitor data (use this for accuracy — DO NOT copy it verbatim, just extract facts):\n' + googleContext.join('\n') : ''}

Return JSON: { "description_bs": "Bosnian description", "description_en": "English description" }`;
        const result = await callClaude({
          model: 'claude-haiku-4-5-20251001',
          messages: [{ role: 'user', content: prompt }],
          system: 'You write short, punchy venue descriptions for a Sarajevo city guide. Sound like a local, not a tourism board. No generic praise. Return valid JSON only.',
          max_tokens: 512,
        });
        const text = result.content?.[0]?.text ?? '';
        const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(clean);
        await supabase.from('venues').update({ description_bs: parsed.description_bs, description_en: parsed.description_en }).eq('id', venue.id);
        return venue.name;
      }),
    );
    const enriched = results.filter((r) => r.status === 'fulfilled').length;
    for (const r of results) {
      if (r.status === 'rejected') console.error('Failed to enrich venue:', r.reason);
    }
    return new Response(JSON.stringify({ success: true, data: { enriched, total: venues.length } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  }
});
