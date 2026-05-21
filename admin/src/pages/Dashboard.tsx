import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { canAdmin } from '../hooks/useAuth';
import type { UserRole } from '../hooks/useAuth';

interface Stats {
  venuesTotal: number;
  venuesCurated: number;
  venuesWithDescBs: number;
  venuesWithDescEn: number;
  venuesWithPhoto: number;
  eventsApproved: number;
  eventsPending: number;
  rawEventsPending: number;
}

interface ActivityToday {
  edits: number;
  notes: number;
  reviewsFlagged: number;
}

interface EditorActivity {
  editor_id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  edits: number;
  notes: number;
  reviews_flagged: number;
  last_active: string | null;
}

interface Props {
  currentUserId: string | null;
  role: UserRole;
}

const ROLE_COLORS: Record<string, string> = {
  editor: '#60A5FA',
  admin: '#D4A056',
  super_admin: '#A855F7',
};

function formatRelative(iso: string | null): string {
  if (!iso) return 'nikad';
  const d = new Date(iso);
  const now = Date.now();
  const diffMin = Math.round((now - d.getTime()) / 60_000);
  if (diffMin < 1) return 'sada';
  if (diffMin < 60) return `prije ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `prije ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `prije ${diffD} d`;
  return d.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function Dashboard({ currentUserId, role }: Props) {
  const isAdmin = canAdmin(role);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityToday | null>(null);
  const [editorActivity, setEditorActivity] = useState<EditorActivity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const results = await Promise.all([
          supabase.from('venues').select('*', { count: 'exact', head: true }),
          supabase.from('venues').select('*', { count: 'exact', head: true }).eq('is_curated', true),
          supabase.from('venues').select('*', { count: 'exact', head: true }).not('description_bs', 'is', null),
          supabase.from('venues').select('*', { count: 'exact', head: true }).not('description_en', 'is', null),
          supabase.from('venues').select('*', { count: 'exact', head: true }).not('cover_image_url', 'is', null),
          supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('raw_events').select('*', { count: 'exact', head: true })
            .not('venue_match_status', 'in', '("promoted","ignored")'),
        ]);

        const errors = results
          .map((r, i) => r.error ? `q${i}: ${r.error.message}` : null)
          .filter(Boolean);

        if (errors.length > 0) {
          setError(errors.join(' | '));
        }

        setStats({
          venuesTotal: results[0].count ?? 0,
          venuesCurated: results[1].count ?? 0,
          venuesWithDescBs: results[2].count ?? 0,
          venuesWithDescEn: results[3].count ?? 0,
          venuesWithPhoto: results[4].count ?? 0,
          eventsApproved: results[5].count ?? 0,
          eventsPending: results[6].count ?? 0,
          rawEventsPending: results[7].count ?? 0,
        });
      } catch (err: any) {
        setError('catch: ' + (err?.message ?? String(err)));
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startIso = startOfDay.toISOString();

    Promise.all([
      supabase.from('audit_log').select('*', { count: 'exact', head: true })
        .eq('actor_id', currentUserId).gte('created_at', startIso),
      supabase.from('notes').select('*', { count: 'exact', head: true })
        .eq('author_id', currentUserId).gte('created_at', startIso),
      // Flags raised by this user today, found via audit_log: actor=me + after diff contains needs_review:true
      supabase.from('audit_log').select('*', { count: 'exact', head: true })
        .eq('actor_id', currentUserId).gte('created_at', startIso)
        .filter('after->needs_review', 'eq', 'true'),
    ]).then(([editsRes, notesRes, reviewsRes]) => {
      setActivity({
        edits: editsRes.count ?? 0,
        notes: notesRes.count ?? 0,
        reviewsFlagged: reviewsRes.count ?? 0,
      });
    });
  }, [currentUserId]);

  // Admin+ see all editor+admin activity in one card.
  useEffect(() => {
    if (!isAdmin) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    supabase
      .rpc('list_editor_activity', { p_since: startOfDay.toISOString() })
      .then(({ data, error: qError }) => {
        if (qError) {
          console.error('list_editor_activity:', qError.message);
          return;
        }
        setEditorActivity((data ?? []) as EditorActivity[]);
      });
  }, [isAdmin]);

  if (loading) return <div className="loading">Učitavanje...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Pregled</h1>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {activity && (
        <div className="dashboard-section">
          <h2 className="section-title">Vaša aktivnost danas</h2>
          <div className="stat-cards">
            <StatCard label="Izmjena" value={activity.edits} color={activity.edits > 0 ? 'green' : undefined} />
            <StatCard label="Bilješki" value={activity.notes} color={activity.notes > 0 ? 'green' : undefined} />
            <StatCard label="Prijavljeno za reviziju" value={activity.reviewsFlagged} color={activity.reviewsFlagged > 0 ? 'orange' : undefined} />
          </div>
        </div>
      )}

      {isAdmin && editorActivity && editorActivity.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">Aktivnost urednika danas</h2>
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Urednik</th>
                  <th>Uloga</th>
                  <th>Izmjene</th>
                  <th>Bilješke</th>
                  <th>Prijave</th>
                  <th>Posljednja aktivnost</th>
                </tr>
              </thead>
              <tbody>
                {editorActivity.map((e) => {
                  const isActive = e.edits > 0 || e.notes > 0 || e.reviews_flagged > 0;
                  return (
                    <tr key={e.editor_id} style={{ opacity: isActive ? 1 : 0.55 }}>
                      <td className="user-name">
                        {e.display_name || e.email || e.editor_id.slice(0, 8)}
                        {e.email && e.display_name && (
                          <div className="muted-text" style={{ fontSize: 11, fontWeight: 400 }}>{e.email}</div>
                        )}
                      </td>
                      <td>
                        <span style={{ color: ROLE_COLORS[e.role] ?? '#A0A0A0', fontSize: 12, fontWeight: 600 }}>
                          {e.role}
                        </span>
                      </td>
                      <td className={e.edits > 0 ? 'stat-green' : 'muted-cell'}>{e.edits}</td>
                      <td className={e.notes > 0 ? 'stat-green' : 'muted-cell'}>{e.notes}</td>
                      <td className={e.reviews_flagged > 0 ? 'stat-orange' : 'muted-cell'}>{e.reviews_flagged}</td>
                      <td className="muted-cell">{formatRelative(e.last_active)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats && (
        <>
          <div className="dashboard-section">
            <h2 className="section-title">Lokacije</h2>
            <div className="stat-cards">
              <StatCard label="Ukupno" value={stats.venuesTotal} />
              <StatCard label="Pregledano" value={stats.venuesCurated} sub={`${stats.venuesTotal > 0 ? Math.round((stats.venuesCurated / stats.venuesTotal) * 100) : 0}%`} color="green" />
              <StatCard label="Nije pregledano" value={stats.venuesTotal - stats.venuesCurated} color={stats.venuesTotal - stats.venuesCurated > 0 ? 'orange' : undefined} />
              <StatCard label="S opisom (BS)" value={stats.venuesWithDescBs} color="green" />
              <StatCard label="S opisom (EN)" value={stats.venuesWithDescEn} color="green" />
              <StatCard label="S fotografijom" value={stats.venuesWithPhoto} color="green" />
            </div>
            <div className="progress-wrap">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats.venuesTotal > 0 ? Math.round((stats.venuesCurated / stats.venuesTotal) * 100) : 0}%` }} />
              </div>
              <span className="progress-label">{stats.venuesCurated} / {stats.venuesTotal} pregledano</span>
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">Događaji</h2>
            <div className="stat-cards">
              <StatCard label="Odobreni" value={stats.eventsApproved} color="green" />
              <StatCard label="Na čekanju" value={stats.eventsPending} color={stats.eventsPending > 0 ? 'orange' : undefined} />
              <StatCard label="Neobrađeni (raw)" value={stats.rawEventsPending} color={stats.rawEventsPending > 0 ? 'orange' : undefined} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: {
  label: string;
  value: number;
  sub?: string;
  color?: 'green' | 'red' | 'orange';
}) {
  const colorMap: Record<string, string> = {
    green: '#22C55E',
    red: '#EF4444',
    orange: '#F59E0B',
  };
  return (
    <div className="stat-card">
      <div className="stat-card-value" style={color ? { color: colorMap[color] } : undefined}>
        {value}
        {sub && <span className="stat-card-sub"> {sub}</span>}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
