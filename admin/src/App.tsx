import { supabase } from './supabase';
import { useAuth, hasAccess } from './hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { VenueCuration } from './pages/VenueCuration';
import { EventManagement } from './pages/EventManagement';
import { UserManagement } from './pages/UserManagement';
import { AuditLog } from './pages/AuditLog';
import { Login } from './Login';
import { useState } from 'react';
import type { Page } from './components/Sidebar';

function DebugBanner({ info }: { info: string }) {
  return (
    <div style={{
      background: '#EF4444', color: '#fff', padding: '8px 16px',
      fontSize: 13, fontFamily: 'monospace', whiteSpace: 'pre-wrap',
    }}>
      DEBUG: {info}
    </div>
  );
}

export function App() {
  const { session, role, loading, error } = useAuth();
  const [activePage, setActivePage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="splash">
        <div className="splash-logo">L</div>
        <div style={{ color: '#A0A0A0', fontSize: 12, marginTop: 16 }}>Provjera sesije...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="splash">
        <div className="access-denied">
          <h2>Greška autentifikacije</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 12 }}>{error}</p>
          <button onClick={() => { supabase.auth.signOut(); location.reload(); }}>
            Ponovo učitaj
          </button>
        </div>
      </div>
    );
  }

  if (!session) return <Login />;

  if (!hasAccess(role)) {
    return (
      <div className="splash">
        <div className="access-denied">
          <h2>Pristup odbijen</h2>
          <p>Vaš nalog nema pristup admin panelu.</p>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
            role={role ?? 'null'} | uid={session.user.id.slice(0, 8)}
          </p>
          <button onClick={() => supabase.auth.signOut()}>Odjava</button>
        </div>
      </div>
    );
  }

  const handleSignOut = () => supabase.auth.signOut();

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        role={role!}
        email={session.user.email}
        onSignOut={handleSignOut}
      />
      <main className="main-content">
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'venues' && <VenueCuration role={role!} />}
        {activePage === 'events' && <EventManagement />}
        {activePage === 'audit' && <AuditLog />}
        {activePage === 'users' && <UserManagement />}
      </main>
    </div>
  );
}
