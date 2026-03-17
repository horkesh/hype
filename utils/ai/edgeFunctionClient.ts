import { supabase } from '@/integrations/supabase/client';
import { publicConfig } from '@/utils/publicConfig';

/**
 * Standard invoke — uses supabase.functions.invoke.
 * For non-streaming edge functions.
 */
export async function invokeEdgeFunction<T = any>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, { body });
    if (error) {
      return { data: null, error: error.message ?? 'Edge function error' };
    }
    if (data && !data.success) {
      return { data: null, error: data.error ?? 'Unknown error' };
    }
    return { data: data?.data ?? data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? 'Network error' };
  }
}

/**
 * Streaming invoke — uses direct fetch for SSE.
 * Required because supabase.functions.invoke doesn't support ReadableStream.
 * Used by the Tonight Planner.
 */
export async function streamEdgeFunction(
  functionName: string,
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
): Promise<{ error: string | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const url = `${publicConfig.supabaseUrl}/functions/v1/${functionName}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        apikey: publicConfig.supabaseAnonKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { error: `${res.status}: ${errText}` };
    }

    const reader = res.body?.getReader();
    if (!reader) return { error: 'No response body' };

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      onChunk(text);
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? 'Stream error' };
  }
}
