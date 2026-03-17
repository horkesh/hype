import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Login } from './Login';
import { VenueEditor } from './VenueEditor';
import { EventEditor } from './EventEditor';
import type { Session } from '@supabase/supabase-js';

type Tab = 'venues' | 'events';

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('venues');

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

  const handleSignOut = () => supabase.auth.signOut();

  return (
    <div>
      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'venues' ? 'active' : ''}`}
          onClick={() => setActiveTab('venues')}
        >
          Venues
        </button>
        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
      </nav>
      {activeTab === 'venues'
        ? <VenueEditor onSignOut={handleSignOut} />
        : <EventEditor onSignOut={handleSignOut} />
      }
    </div>
  );
}
