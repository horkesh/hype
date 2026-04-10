import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { getActiveHoliday } from '../_shared/holidays.ts';
import { verifyUserAuth } from '../_shared/auth.ts';

const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

// ─── Time & context helpers ──────────────────────────────────────────────────

function getTimeOfDay(hour: number): string {
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

// ─── Prompt builder ──────────────────────────────────────────────────────────

function buildImagePrompt(
  timeOfDay: string,
  weather: { temp: number; condition: string } | null,
  holiday: string | null,
): string {
  // Base scene — always anchored to time of day
  const scenes: Record<string, string> = {
    morning: 'Close-up of a traditional Bosnian coffee set — copper džezva and fildžan cups on a hand-hammered tray, steam rising, on a worn wooden cafe table in Baščaršija',
    afternoon: 'Close-up of freshly baked somun bread on a stone counter beside a copper coffee pot, dappled sunlight through a cafe window in old Sarajevo',
    evening: 'Intimate close-up of a lantern-lit cafe table with a Turkish coffee cup and a small plate of rahat lokum, warm amber glow on weathered stone walls',
    night: 'Close-up of glowing warm lanterns reflecting on rain-slicked Baščaršija cobblestones, shallow depth of field, intimate nighttime atmosphere',
  };

  const lighting: Record<string, string> = {
    morning: 'soft warm morning sunlight, golden tones',
    afternoon: 'bright natural daylight, vivid colors',
    evening: 'golden hour amber and pink light, long shadows',
    night: 'warm street lamp glow, dramatic shadows, ambient lighting',
  };

  let scene = scenes[timeOfDay] || scenes.evening;
  let light = lighting[timeOfDay] || lighting.evening;

  // Weather — layered on top of the time-of-day base
  if (weather) {
    const cond = weather.condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle')) {
      scene += ', rain-slicked cobblestones with reflections';
      light += ', moody atmospheric wet surfaces';
    } else if (cond.includes('snow')) {
      scene += ', light dusting of snow on rooftops and cobblestones';
      light += ', soft diffused winter light';
    } else if (cond.includes('cloud') || cond.includes('overcast')) {
      light = light.replace('golden', 'soft diffused');
    }
    if (weather.temp < 0) {
      scene += ', frost on windowpanes, cozy indoor glow visible';
    } else if (weather.temp > 30) {
      scene += ', shade-seeking cafe patrons, sunlit terraces';
    }
  }

  // Holiday — layered on top, never replaces the base scene or lighting
  if (holiday) {
    const h = holiday.toLowerCase();
    if (h.includes('bajram') || h.includes('eid')) {
      scene += ', festive holiday atmosphere, traditional decorations, families greeting each other';
      light += ', celebratory warmth';
    } else if (h.includes('christmas') || h.includes('božić')) {
      scene += ', subtle festive decorations, warm holiday atmosphere';
    } else if (h.includes('new year')) {
      scene += ', festive lights and celebration atmosphere';
      light += ', festive sparkle';
    } else if (h.includes('independence') || h.includes('labour')) {
      scene += ', flags and outdoor gathering atmosphere';
    }
  }

  return `Cinematic photograph, ${scene}, Sarajevo Bosnia, ${light}, shallow depth of field, professional travel photography, 16:9 aspect ratio, no text, no watermarks, 1920x1080. IMPORTANT: if people appear they must be distant silhouettes or shot from behind — NEVER show recognizable faces, close-up portraits, or people looking at camera.`;
}

// ─── Gemini Image Generation ─────────────────────────────────────────────────

async function generateImage(prompt: string): Promise<{ base64: string; mimeType: string }> {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not set');

  // Try Imagen API first (fastest, purpose-built for image generation)
  const imagenResult = await tryImagen(apiKey, prompt);
  if (imagenResult) return imagenResult;

  // Fallback: try Gemini native image generation models
  const geminiModels = [
    'gemini-2.0-flash-exp',
    'gemini-2.5-flash-preview-05-20',
  ];

  for (const model of geminiModels) {
    const result = await tryGeminiImage(apiKey, model, prompt);
    if (result) return result;
  }

  throw new Error('All image generation models failed');
}

/** Try Imagen `:predict` endpoint */
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

/** Try Gemini `:generateContent` with responseModalities IMAGE */
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
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
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

// ─── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  const user = await verifyUserAuth(req);
  if (!user) {
    return new Response(
      JSON.stringify({ success: false, error: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const weather = body.weather ?? null;

    const now = new Date();
    // Sarajevo is UTC+1 (CET) / UTC+2 (CEST)
    const sarajevoHour = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Sarajevo' })).getHours();
    const timeOfDay = getTimeOfDay(sarajevoHour);
    const holiday = getActiveHoliday(now);

    // Check cache: look for a recent city_pulse row with a hero_image_url
    const cacheThreshold = new Date(now.getTime() - CACHE_TTL_MS).toISOString();
    const { data: cached } = await supabaseAdmin
      .from('city_pulse')
      .select('hero_image_url')
      .gte('created_at', cacheThreshold)
      .not('hero_image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cached?.hero_image_url) {
      return new Response(
        JSON.stringify({ success: true, data: { image_url: cached.hero_image_url, cached: true } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Generate new image
    const prompt = buildImagePrompt(timeOfDay, weather, holiday);
    console.log('Generating hero image with prompt:', prompt.slice(0, 100) + '...');

    const { base64, mimeType } = await generateImage(prompt);

    // Upload to Supabase Storage
    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
    const filename = `hero_${now.getTime()}.${ext}`;

    // Decode base64 to Uint8Array
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from('hero-images')
      .upload(filename, bytes, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('hero-images')
      .getPublicUrl(filename);

    const imageUrl = urlData.publicUrl;

    // Cache in city_pulse table (update the most recent row, or insert)
    const { data: recentPulse } = await supabaseAdmin
      .from('city_pulse')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentPulse) {
      await supabaseAdmin
        .from('city_pulse')
        .update({ hero_image_url: imageUrl })
        .eq('id', recentPulse.id);
    }

    return new Response(
      JSON.stringify({ success: true, data: { image_url: imageUrl, cached: false } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('generate-hero-image error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
