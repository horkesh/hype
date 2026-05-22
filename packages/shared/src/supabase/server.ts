// Server-side Supabase client for Next.js App Router (RSC + server actions +
// route handlers). Reads/writes the auth session via Next.js cookies so a
// signed-in user's RLS context applies to server-rendered queries.
//
// Per @supabase/ssr docs: server components cannot WRITE cookies — only
// route handlers and middleware can. We swallow set/remove no-ops in RSC.
// The actual token refresh happens in middleware.ts (apps/web wires this).

import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl } from './config';

export interface NextCookieStore {
  getAll: () => Array<{ name: string; value: string }>;
  set?: (name: string, value: string, options?: any) => void;
}

export function createServerSupabase(cookies: NextCookieStore): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  const methods: CookieMethodsServer = {
    getAll: () => cookies.getAll(),
    setAll: (items) => {
      if (!cookies.set) return; // RSC has no setter — middleware handles refresh.
      for (const { name, value, options } of items) {
        try { cookies.set(name, value, options); } catch { /* RSC: silently ignore */ }
      }
    },
  };
  return createServerClient(url, key, { cookies: methods });
}
