import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ROLE_LABELS } from '../hooks/useAuth';
import type { UserRole } from '../hooks/useAuth';
import { ErrorBanner } from '../components/ErrorBanner';
import { withTimeout } from '../lib/withTimeout';

const QUERY_TIMEOUT_MS = 15_000;

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
  total_checkins: number;
  total_submissions: number;
}

const ASSIGNABLE_ROLES: UserRole[] = ['user', 'editor', 'admin', 'super_admin'];

const ROLE_COLORS: Record<UserRole, string> = {
  user: '#A0A0A0',
  editor: '#60A5FA',
  admin: '#D4A056',
  super_admin: '#A855F7',
};

export function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await withTimeout(
        supabase.rpc('get_admin_user_list'),
        QUERY_TIMEOUT_MS,
        'get_admin_user_list',
      );
      if (qError) {
        setError(`Greška pri učitavanju korisnika: ${qError.message}`);
      } else if (data) {
        setProfiles(data as Profile[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  // .select() forces PostgREST to return the affected row so we can detect
  // RLS-silent denials (editor tries to bump someone to admin → no error, but
  // zero rows mutated and the UI used to show a misleading "Sačuvano").
  const handleRoleChange = async (id: string, newRole: UserRole) => {
    setUpdating(id);
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      setMsg(prev => ({ ...prev, [id]: 'Greška: ' + error.message }));
    } else if (!data) {
      setMsg(prev => ({ ...prev, [id]: 'Greška: nemate ovlasti za ovu izmjenu.' }));
    } else {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
      setMsg(prev => ({ ...prev, [id]: 'Sačuvano' }));
      setTimeout(() => setMsg(prev => { const next = { ...prev }; delete next[id]; return next; }), 2000);
    }
    setUpdating(null);
  };

  const handleBanToggle = async (id: string, currentBanned: boolean) => {
    setUpdating(id);
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentBanned })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      setMsg(prev => ({ ...prev, [id]: 'Greška: ' + error.message }));
    } else if (!data) {
      setMsg(prev => ({ ...prev, [id]: 'Greška: nemate ovlasti za ovu izmjenu.' }));
    } else {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_banned: !currentBanned } : p));
    }
    setUpdating(null);
  };

  const filtered = profiles.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.display_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.id.includes(q)
    );
  });

  return (
    <div className="page">
      {error && <ErrorBanner error={error} onRetry={loadProfiles} />}
      <div className="page-header">
        <h1 className="page-title">Korisnici</h1>
        <div className="page-stats">
          <span>{profiles.length} korisnika</span>
          <span className="stat-purple">{profiles.filter(p => p.role === 'super_admin').length} super admin</span>
          <span className="stat-gold">{profiles.filter(p => p.role === 'admin').length} admin</span>
          <span className="stat-blue">{profiles.filter(p => p.role === 'editor').length} urednik</span>
        </div>
      </div>

      <div className="filters">
        <input
          className="search"
          type="text"
          placeholder="Pretraži po imenu ili ID-u..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Učitavanje...</div>
      ) : (
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Ime</th>
                <th>ID</th>
                <th>Uloga</th>
                <th>Prijave</th>
                <th>Check-ini</th>
                <th>Registriran</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={p.is_banned ? 'banned-row' : ''}>
                  <td className="user-name">
                    {p.display_name || p.email || <span className="muted-text">(bez imena)</span>}
                    {p.is_banned && <span className="ban-badge">Banovan</span>}
                    {p.email && p.display_name && (
                      <div className="muted-text" style={{ fontSize: 11, fontWeight: 400 }}>{p.email}</div>
                    )}
                  </td>
                  <td className="user-id muted-text">{p.id.slice(0, 8)}…</td>
                  <td>
                    <select
                      value={p.role}
                      onChange={e => handleRoleChange(p.id, e.target.value as UserRole)}
                      disabled={updating === p.id}
                      className="role-select"
                      style={{ color: ROLE_COLORS[p.role] }}
                    >
                      {ASSIGNABLE_ROLES.map(r => (
                        <option key={r} value={r} style={{ color: ROLE_COLORS[r] }}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="muted-text">{p.total_submissions}</td>
                  <td className="muted-text">{p.total_checkins}</td>
                  <td className="muted-text">
                    {new Date(p.created_at).toLocaleDateString('bs-BA', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className="user-actions">
                      <button
                        className={p.is_banned ? 'unban-btn' : 'ban-btn'}
                        onClick={() => handleBanToggle(p.id, p.is_banned)}
                        disabled={updating === p.id}
                      >
                        {p.is_banned ? 'Odbanuj' : 'Banuj'}
                      </button>
                      {msg[p.id] && (
                        <span className={msg[p.id].startsWith('Greška') ? 'error' : 'success'} style={{ fontSize: 11 }}>
                          {msg[p.id]}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state">Nema korisnika.</div>}
        </div>
      )}
    </div>
  );
}
