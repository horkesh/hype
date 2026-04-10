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
 * Verify a service-role secret for admin-only functions.
 * Checks the X-Admin-Secret header against ADMIN_FUNCTION_SECRET env var.
 */
export function verifyAdminAuth(req: Request): boolean {
  const secret = req.headers.get('X-Admin-Secret');
  const expected = Deno.env.get('ADMIN_FUNCTION_SECRET');
  if (!expected) return false; // fail closed if secret not configured
  return secret === expected;
}
