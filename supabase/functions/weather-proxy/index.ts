import { corsHeaders, corsResponse } from '../_shared/cors.ts';

// Two keyless, free, no-signup weather sources. MET Norway (government-run) is the
// primary — very reliable; just needs a User-Agent. Open-Meteo is the fallback.
// Either way there's no secret to plant and nothing to expire. Downstream consumers
// (getHomeHeroState, hero-image prompt, City Pulse) match substrings like "clear"
// and "rain", so we normalise both sources to an OpenWeather-style lowercase phrase.

const fetchWithTimeout = async (url: string, ms: number, headers?: Record<string, string>) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, headers });
  } finally {
    clearTimeout(id);
  }
};

// MET Norway symbol_code (e.g. "lightrainshowers_day") → readable phrase.
function metCondition(symbol: string): string {
  const base = (symbol || '').replace(/_(day|night|polartwilight)$/, '');
  const map: Record<string, string> = {
    clearsky: 'clear sky', fair: 'mainly clear', partlycloudy: 'partly cloudy', cloudy: 'overcast clouds',
    fog: 'fog',
    lightrain: 'light rain', rain: 'moderate rain', heavyrain: 'heavy rain',
    lightrainshowers: 'light rain showers', rainshowers: 'rain showers', heavyrainshowers: 'heavy rain showers',
    lightsleet: 'light sleet', sleet: 'sleet', heavysleet: 'heavy sleet',
    lightsnow: 'light snow', snow: 'snow', heavysnow: 'heavy snow',
    lightsnowshowers: 'light snow showers', snowshowers: 'snow showers', heavysnowshowers: 'heavy snow showers',
    rainandthunder: 'thunderstorm', heavyrainandthunder: 'thunderstorm',
    rainshowersandthunder: 'thunderstorm', snowandthunder: 'thunderstorm',
  };
  // Fall back to the raw base — it still contains "rain"/"clear"/"snow"/"cloud" for the substring checks.
  return map[base] ?? base;
}

// Open-Meteo WMO weather_code → readable phrase.
function wmoCondition(code: number): string {
  const map: Record<number, string> = {
    0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast clouds',
    45: 'fog', 48: 'depositing rime fog',
    51: 'light drizzle', 53: 'moderate drizzle', 55: 'dense drizzle',
    56: 'light freezing drizzle', 57: 'dense freezing drizzle',
    61: 'light rain', 63: 'moderate rain', 65: 'heavy rain',
    66: 'light freezing rain', 67: 'heavy freezing rain',
    71: 'light snow', 73: 'moderate snow', 75: 'heavy snow', 77: 'snow grains',
    80: 'light rain showers', 81: 'moderate rain showers', 82: 'violent rain showers',
    85: 'light snow showers', 86: 'heavy snow showers',
    95: 'thunderstorm', 96: 'thunderstorm with slight hail', 99: 'thunderstorm with heavy hail',
  };
  return map[code] ?? '';
}

async function fromMet(lat: number, lon: number): Promise<{ temp: number; weatherCondition: string }> {
  const res = await fetchWithTimeout(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
    6_000,
    { 'User-Agent': 'LookSarajevo/1.0 https://hype-alpha.vercel.app' },
  );
  if (!res.ok) throw new Error(`met ${res.status}`);
  const data = await res.json();
  const ts = data?.properties?.timeseries?.[0];
  const temp = ts?.data?.instant?.details?.air_temperature;
  const symbol = ts?.data?.next_1_hours?.summary?.symbol_code
    ?? ts?.data?.next_6_hours?.summary?.symbol_code ?? '';
  if (typeof temp !== 'number') throw new Error('met: no temperature');
  return { temp: Math.round(temp), weatherCondition: metCondition(symbol) };
}

async function fromOpenMeteo(lat: number, lon: number): Promise<{ temp: number; weatherCondition: string }> {
  const res = await fetchWithTimeout(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
    6_000,
  );
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const data = await res.json();
  const current = data?.current ?? {};
  if (typeof current.temperature_2m !== 'number') throw new Error('open-meteo: no temperature');
  return { temp: Math.round(current.temperature_2m), weatherCondition: wmoCondition(Number(current.weather_code ?? -1)) };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  // Public home endpoint — no per-user login required (matches the pre-2026-04-10 design).
  try {
    const { lat, lon } = await req.json();
    if (lat == null || lon == null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing lat/lon' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // MET Norway primary, Open-Meteo fallback — return whichever responds.
    let result: { temp: number; weatherCondition: string } | null = null;
    let lastErr: unknown = null;
    for (const source of [fromMet, fromOpenMeteo]) {
      try {
        result = await source(Number(lat), Number(lon));
        break;
      } catch (e) {
        lastErr = e;
        console.error('weather source failed:', e instanceof Error ? e.message : e);
      }
    }

    if (!result) {
      const isTimeout = lastErr instanceof Error && lastErr.name === 'AbortError';
      return new Response(
        JSON.stringify({ success: false, error: isTimeout ? 'Weather service timed out' : 'Weather unavailable' }),
        { status: isTimeout ? 504 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('weather-proxy error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
