// Single source of truth for the public Supabase URL + anon key.
//
// Resolution priority (so the same module works in every runtime):
//   1. Explicit globals injected by the host (process.env on Node/Next,
//      import.meta.env on Vite, etc.)
//   2. Vercel/Next public-prefixed env (`NEXT_PUBLIC_SUPABASE_*`)
//   3. Expo public-prefixed env (`EXPO_PUBLIC_SUPABASE_*`)
//   4. Vite public-prefixed env (`VITE_SUPABASE_*`)
//
// Server-only callers (apps/web RSC) get the same URL but use the
// `createServerSupabase` helper, which wires Next.js cookie storage.

declare const process: { env?: Record<string, string | undefined> } | undefined;

function readEnv(name: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    const v = process.env[name];
    if (v) return v;
  }
  // Vite (apps/admin) exposes import.meta.env at build time — duck-typed read.
  try {
    const im = (globalThis as any)?.import?.meta?.env;
    if (im && typeof im[name] === 'string') return im[name];
  } catch { /* not Vite */ }
  return undefined;
}

export function getSupabaseUrl(): string {
  const url =
    readEnv('NEXT_PUBLIC_SUPABASE_URL') ??
    readEnv('EXPO_PUBLIC_SUPABASE_URL') ??
    readEnv('VITE_SUPABASE_URL') ??
    readEnv('SUPABASE_URL');
  if (!url) throw new Error('Supabase URL missing — set NEXT_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL.');
  return url;
}

export function getSupabaseAnonKey(): string {
  const key =
    readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ??
    readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY') ??
    readEnv('VITE_SUPABASE_ANON_KEY') ??
    readEnv('SUPABASE_ANON_KEY');
  if (!key) throw new Error('Supabase anon key missing — set NEXT_PUBLIC_SUPABASE_ANON_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY.');
  return key;
}
