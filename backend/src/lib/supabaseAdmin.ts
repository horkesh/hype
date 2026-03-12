const supabaseUrl = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function requireSupabaseAdminConfig() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing backend Supabase admin config. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
  };
}

export async function requestSupabaseAdminJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase admin request failed (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchSupabaseAdminJson<T>(path: string): Promise<T> {
  return requestSupabaseAdminJson<T>(path);
}

export async function requestSupabaseAdminNoContent(
  path: string,
  init?: RequestInit,
): Promise<void> {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig();

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase admin request failed (${response.status}): ${errorText}`);
  }
}
