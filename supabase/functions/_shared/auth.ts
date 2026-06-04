import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Verify a Supabase JWT from the Authorization header.
 * Returns the authenticated user or null.
 */
export async function verifyUserAuth(req: Request): Promise<{ id: string; email?: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? undefined };
}

/**
 * Authorize a caller for admin-only functions. Two accepted credentials:
 *
 *  1. The service-role key as a Bearer token. Only server-side callers (the
 *     ingestion cron / backend scripts) hold it; Supabase auto-injects the same
 *     value into the edge runtime as SUPABASE_SERVICE_ROLE_KEY, so this needs no
 *     extra secret to be configured. It is strictly more privileged than a shared
 *     admin secret, so accepting it is sound.
 *  2. A shared X-Admin-Secret matching ADMIN_FUNCTION_SECRET, if that env var is
 *     configured (kept for callers that prefer not to send the service-role key).
 *
 * Fails closed when neither matches.
 */
export function verifyAdminAuth(req: Request): boolean {
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization');
  if (serviceRoleKey && authHeader === `Bearer ${serviceRoleKey}`) return true;

  const expected = Deno.env.get('ADMIN_FUNCTION_SECRET');
  const secret = req.headers.get('X-Admin-Secret');
  if (expected && secret === expected) return true;

  return false;
}
