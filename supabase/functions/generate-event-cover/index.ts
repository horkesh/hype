import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { verifyAdminAuth } from '../_shared/auth.ts';

// ─── Image generation (reuses hero-image pattern) ───────────────────────────

async function generateImage(prompt: string): Promise<{ base64: string; mimeType: string }> {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not set');

  const imagenResult = await tryImagen(apiKey, prompt);
  if (imagenResult) return imagenResult;

  const geminiModels = ['gemini-2.0-flash-exp', 'gemini-2.5-flash-preview-05-20'];
  for (const model of geminiModels) {
    const result = await tryGeminiImage(apiKey, model, prompt);
    if (result) return result;
  }

  throw new Error('All image generation models failed');
}

async function tryImagen(apiKey: string, prompt: string): Promise<{ base64: string; mimeType: string } | null> {
  const models = ['imagen-4.0-fast-generate-001', 'imagen-3.0-generate-002'];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60_000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: '16:9' },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.log(`Imagen ${model}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const prediction = data.predictions?.[0];
      if (prediction?.bytesBase64Encoded) {
        console.log(`Image generated with ${model}`);
        return { base64: prediction.bytesBase64Encoded, mimeType: prediction.mimeType || 'image/png' };
      }
    } catch (e) {
      console.log(`Imagen ${model} error:`, e.message);
    }
  }

  return null;
}

async function tryGeminiImage(apiKey: string, model: string, prompt: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.log(`Gemini ${model}: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
      if (part.inline_data?.data) {
        console.log(`Image generated with ${model}`);
        return { base64: part.inline_data.data, mimeType: part.inline_data.mime_type || 'image/png' };
      }
    }
  } catch (e) {
    console.log(`Gemini ${model} error:`, e.message);
  }

  return null;
}

// ─── Prompt builder ─────────────────────────────────────────────────────────

function buildEventCoverPrompt(event: {
  title_bs: string;
  title_en: string | null;
  category: string;
  moods: string[];
  description_bs: string | null;
  description_en: string | null;
  venue_name: string | null;
}): string {
  const title = event.title_en || event.title_bs;
  const description = event.description_en || event.description_bs || '';
  const category = event.category || '';
  const moods = (event.moods || []).join(', ');
  const venue = event.venue_name || '';

  // Category-based visual cues
  const categoryScenes: Record<string, string> = {
    music: 'concert stage with dramatic lighting, musical instruments, sound waves visualization',
    film: 'cinema atmosphere, film reel aesthetic, dramatic cinematic lighting',
    theatre: 'theatrical stage with spotlight, velvet curtains, dramatic performance setting',
    art: 'art gallery with elegant lighting, creative abstract compositions, paint textures',
    culture: 'cultural heritage setting, traditional architecture, warm ambient lighting',
    nightlife: 'nightclub atmosphere, neon lights, dance floor energy',
    food: 'elegant dining table setting, artisan food presentation, warm candlelight',
    sport: 'dynamic athletic scene, stadium lights, motion blur energy',
    education: 'modern presentation space, clean design, professional seminar atmosphere',
    workshop: 'creative workshop space, tools and materials, hands-on activity atmosphere',
    conference: 'modern conference hall, professional stage setup, keynote presentation atmosphere',
    other: 'stylish urban event space, modern design, inviting atmosphere',
  };

  const scene = categoryScenes[category.toLowerCase()] || categoryScenes.other;

  return `Professional event cover image for "${title}". ${scene}. ${description ? `Theme: ${description.slice(0, 100)}.` : ''} ${moods ? `Mood: ${moods}.` : ''} ${venue ? `Venue atmosphere inspired by ${venue}.` : ''} Cinematic photograph, shallow depth of field, professional event photography, 16:9 aspect ratio, no text, no watermarks, no logos, 1920x1080. IMPORTANT: if people appear they must be distant silhouettes or shot from behind — NEVER show recognizable faces, close-up portraits, or people looking at camera.`;
}

// ─── Main handler ───────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  if (!verifyAdminAuth(req)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Admin authentication required' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const eventId = body.event_id;

    if (!eventId) {
      return new Response(
        JSON.stringify({ success: false, error: 'event_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch event details
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('id, title_bs, title_en, category, moods, description_bs, description_en, venue_id, location_name, venues(name)')
      .eq('id', eventId)
      .single();

    if (fetchError || !event) {
      return new Response(
        JSON.stringify({ success: false, error: `Event not found: ${fetchError?.message || 'no data'}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const venueName = (event.venues as any)?.name || event.location_name || null;

    // Build prompt and generate
    const prompt = buildEventCoverPrompt({
      title_bs: event.title_bs,
      title_en: event.title_en,
      category: event.category,
      moods: event.moods || [],
      description_bs: event.description_bs,
      description_en: event.description_en,
      venue_name: venueName,
    });

    console.log('Generating event cover with prompt:', prompt.slice(0, 120) + '...');

    const { base64, mimeType } = await generateImage(prompt);

    // Upload to Supabase Storage
    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
    const filename = `event_${eventId}_${Date.now()}.${ext}`;

    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from('event-covers')
      .upload(filename, bytes, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('event-covers')
      .getPublicUrl(filename);

    const imageUrl = urlData.publicUrl;

    // Update the event
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ cover_image_url: imageUrl })
      .eq('id', eventId);

    if (updateError) {
      throw new Error(`Event update failed: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: { image_url: imageUrl, event_id: eventId } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('generate-event-cover error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
