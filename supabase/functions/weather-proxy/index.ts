import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { verifyUserAuth } from '../_shared/auth.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  // User auth required
  const user = await verifyUserAuth(req);
  if (!user) {
    return new Response(
      JSON.stringify({ success: false, error: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { lat, lon } = await req.json();
    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing lat/lon' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Weather service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    // 10s timeout — without this an OpenWeather hang would block the edge
    // function instance until the platform 60s kill, letting one slow upstream
    // pin a worker.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);
    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Weather API error' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          temp: Math.round(data.main?.temp ?? 0),
          weatherCondition: data.weather?.[0]?.main?.toLowerCase() ?? '',
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    // Log internally; return a generic message so we don't leak abort reasons
    // or upstream error shapes.
    console.error('weather-proxy error:', err);
    const isTimeout = err?.name === 'AbortError';
    return new Response(
      JSON.stringify({
        success: false,
        error: isTimeout ? 'Weather service timed out' : 'Internal error',
      }),
      { status: isTimeout ? 504 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
