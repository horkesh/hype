import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export type UserRole = 'user' | 'editor' | 'admin' | 'super_admin';

interface AuthState {
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
}

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return (data?.role as UserRole) ?? 'user';
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    session: null,
    role: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    // Step 1: Get initial session (single call, no races)
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        setState({ session: null, role: null, loading: false, error: 'getSession: ' + error.message });
        return;
      }

      let role: UserRole | null = null;
      if (session?.user) {
        try {
          role = await fetchUserRole(session.user.id);
        } catch (err: any) {
          if (!mounted) return;
          setState({ session: null, role: null, loading: false, error: 'fetchRole: ' + (err?.message ?? String(err)) });
          return;
        }
      }
      if (!mounted) return;
      setState({ session, role, loading: false, error: null });
    }).catch((err) => {
      if (!mounted) return;
      setState({ session: null, role: null, loading: false, error: 'auth catch: ' + (err?.message ?? String(err)) });
    });

    // Step 2: Only react to explicit sign-in/sign-out (ignore TOKEN_REFRESHED to avoid races)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_IN' && session) {
          let role: UserRole | null = null;
          try {
            role = await fetchUserRole(session.user.id);
          } catch { /* fallback below */ }
          if (!mounted) return;
          setState({ session, role, loading: false, error: null });
        } else if (event === 'SIGNED_OUT') {
          setState({ session: null, role: null, loading: false, error: null });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function canAdmin(role: UserRole | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isSuperAdmin(role: UserRole | null): boolean {
  return role === 'super_admin';
}

export function hasAccess(role: UserRole | null): boolean {
  return role === 'editor' || role === 'admin' || role === 'super_admin';
}

export const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Korisnik',
  editor: 'Urednik',
  admin: 'Admin',
  super_admin: 'Super Admin',
};
