import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callGemini } from '../_shared/ai-clients.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();
  try {
    const { image_url } = await req.json();
    if (!image_url) {
      return new Response(JSON.stringify({ success: false, error: 'Missing image_url' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    const imgRes = await fetch(image_url);
    const imgBuffer = await imgRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
    const result = await callGemini({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [
        { inline_data: { mime_type: 'image/jpeg', data: base64 } },
        { text: 'Classify this venue photo. Return JSON: { "tags": ["interior", "exterior", "food", "drinks", "atmosphere", "crowd"], "primary_tag": "most dominant tag", "quality": "high" | "medium" | "low", "description": "one sentence describing the image" }' },
      ]}],
      maxOutputTokens: 256,
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    let parsed;
    try { const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim(); parsed = JSON.parse(clean); }
    catch { parsed = { tags: [], primary_tag: 'unknown', quality: 'medium', description: '' }; }
    return new Response(JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  }
});
