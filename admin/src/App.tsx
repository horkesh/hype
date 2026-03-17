import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Login } from './Login';
import { VenueEditor } from './VenueEditor';
import type { Session } from '@supabase/supabase-js';

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (!session) return <Login />;
  return <VenueEditor onSignOut={() => supabase.auth.signOut()} />;
}
