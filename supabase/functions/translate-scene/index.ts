import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callGemini } from '../_shared/ai-clients.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();
  try {
    const { image_base64, mime_type = 'image/jpeg' } = await req.json();
    if (!image_base64) {
      return new Response(JSON.stringify({ success: false, error: 'Missing image_base64' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    const result = await callGemini({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [
        { inline_data: { mime_type, data: image_base64 } },
        { text: `Look at this image and find any Bosnian/Croatian/Serbian text visible.\n\nReturn JSON:\n{\n  "original_text": "the text you see in the original language",\n  "translation": "English translation",\n  "context": "1-2 sentences of cultural context",\n  "confidence": "high" | "medium" | "low"\n}\n\nIf no text is visible, return: { "original_text": "", "translation": "", "context": "No text detected in image", "confidence": "low" }` },
      ]}],
      maxOutputTokens: 512,
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    let parsed;
    try {
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(clean);
    } catch { parsed = { original_text: '', translation: text, context: '', confidence: 'low' }; }
    return new Response(JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  }
});
