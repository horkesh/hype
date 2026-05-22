// Browser / React-Native Supabase client. Single shared instance per process.
// Works in apps/mobile (Expo, uses AsyncStorage under the hood by default in
// supabase-js), apps/admin (Vite), and any apps/web 'use client' component.
//
// Server components in apps/web should NOT import this — use
// `createServerSupabase()` from ./server.ts instead so the session cookie
// is read from the Next.js request rather than from window.localStorage.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl } from './config';

let cached: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return cached;
}
