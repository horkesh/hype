// OpenAI
export async function callOpenAI(params: {
  model: 'gpt-4.1-mini' | 'gpt-4.1-nano';
  messages: Array<{ role: string; content: string }>;
  response_format?: { type: string };
  max_tokens?: number;
}) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        max_tokens: params.max_tokens ?? 1024,
        ...(params.response_format && { response_format: params.response_format }),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI ${res.status}: ${err}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Gemini
export async function callGemini(params: {
  model: 'gemini-2.5-flash-lite' | 'gemini-2.5-flash';
  contents: Array<{ role: string; parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> }>;
  maxOutputTokens?: number;
}) {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not set');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: params.contents,
        generationConfig: { maxOutputTokens: params.maxOutputTokens ?? 1024 },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Claude
export async function callClaude(params: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  system?: string;
}) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const controller = new AbortController();
  // Sonnet needs more time than Haiku
  const timeout = params.model.includes('sonnet') ? 45_000 : 20_000;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        max_tokens: params.max_tokens ?? 1024,
        messages: params.messages,
        ...(params.system && { system: params.system }),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude ${res.status}: ${err}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
