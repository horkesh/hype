import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function subscribeToAuthChanges(
  onChange: (session: Session | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session);
  });

  return () => {
    subscription.unsubscribe();
  };
}
