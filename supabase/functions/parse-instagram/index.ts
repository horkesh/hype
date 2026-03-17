import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callClaude } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();
  try {
    const { caption, account_name, post_url } = await req.json();
    if (!caption) {
      return new Response(JSON.stringify({ success: false, error: 'Missing caption' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    const result = await callClaude({
      model: 'claude-haiku-4-5-20251001',
      messages: [{ role: 'user', content: `Analyze this Instagram post caption from a Sarajevo venue/event account.\n\nAccount: @${account_name ?? 'unknown'}\nCaption: "${caption}"\n\nIs this an event announcement? If yes, extract the details.\n\nReturn JSON:\n{\n  "is_event": true/false,\n  "title": "event name" or null,\n  "date": "YYYY-MM-DD" or null,\n  "time": "HH:MM" or null,\n  "venue_name": "venue name" or null,\n  "price": "price string" or null,\n  "description_bs": "brief Bosnian description" or null,\n  "description_en": "brief English description" or null,\n  "moods": ["relevant mood ids"] or [],\n  "category": "event category" or null,\n  "confidence": "high" | "medium" | "low"\n}` }],
      system: 'You extract structured event data from Instagram captions for a Sarajevo events platform. Return valid JSON only.',
      max_tokens: 512,
    });
    const text = result.content?.[0]?.text ?? '';
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed;
    try { parsed = JSON.parse(clean); } catch { parsed = { is_event: false, confidence: 'low' }; }
    if (parsed.is_event && parsed.title) {
      const supabase = getSupabaseAdmin();
      await supabase.from('raw_events').insert({
        title: parsed.title, date: parsed.date, time: parsed.time,
        venue_name: parsed.venue_name, price: parsed.price,
        description_bs: parsed.description_bs, description_en: parsed.description_en,
        source: `instagram:@${account_name}`, source_url: post_url, status: 'pending',
      });
    }
    return new Response(JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  }
});
