import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ErrorBanner } from '../components/ErrorBanner';
import { withTimeout } from '../lib/withTimeout';

const QUERY_TIMEOUT_MS = 15_000;

interface UserStats {
  user_id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  account_created_at: string | null;
  last_sign_in_at: string | null;
  last_activity_at: string | null;
  edits_all_time: number;
  edits_since: number;
  edits_today: number;
  notes_all_time: number;
  notes_since: number;
  flags_raised: number;
  reverts_performed: number;
  active_days_since: number;
}

interface TimelineEvent {
  kind: 'edit' | 'flag' | 'revert' | 'note' | string;
  at: string;
  table_name: string;
  row_id: string | null;
  row_label: string | null;
  detail: string | null;
}

const ROLE_COLORS: Record<string, string> = {
  editor: '#60A5FA',
  admin: '#D4A056',
  super_admin: '#A855F7',
};

const KIND_LABEL: Record<string, { label: string; color: string }> = {
  edit:   { label: 'Izmjena',  color: '#60A5FA' },
  flag:   { label: 'Prijava',  color: '#F59E0B' },
  revert: { label: 'Vraćanje', color: '#A855F7' },
  note:   { label: 'Bilješka', color: '#22C55E' },
};

function formatWhen(iso: string | null): string {
  if (!iso || iso === '-infinity') return 'nikad';
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

function formatExact(iso: string | null): string {
  if (!iso || iso === '-infinity') return '—';
  return new Date(iso).toLocaleString('bs-BA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function UserStatistics() {
  const [rows, setRows] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timelines, setTimelines] = useState<Record<string, TimelineEvent[]>>({});
  const [timelineLoading, setTimelineLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await withTimeout(
        supabase.rpc('list_user_statistics'),
        QUERY_TIMEOUT_MS,
        'list_user_statistics',
      );
      if (qError) setError(qError.message);
      else setRows((data ?? []) as UserStats[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (userId: string) => {
    if (expandedId === userId) { setExpandedId(null); return; }
    setExpandedId(userId);
    if (!timelines[userId]) {
      setTimelineLoading(userId);
      const { data } = await supabase.rpc('user_activity_timeline', { p_user_id: userId, p_limit: 50 });
      setTimelines((prev) => ({ ...prev, [userId]: (data ?? []) as TimelineEvent[] }));
      setTimelineLoading(null);
    }
  };

  return (
    <div className="page">
      {error && <ErrorBanner error={error} onRetry={load} />}

      <div className="page-header">
        <h1 className="page-title">Statistike</h1>
        <div className="page-stats">
          <span>{rows.length} korisnika</span>
        </div>
      </div>

      <div className="filters">
        <button className="page-btn" onClick={load} disabled={loading}>
          {loading ? 'Učitavanje...' : 'Osvježi'}
        </button>
        <span className="muted-text" style={{ fontSize: 11 }}>
          Brojači &quot;od&quot; pokrivaju zadnjih 30 dana. Trajanje sesije se ne prati.
        </span>
      </div>

      {loading ? (
        <div className="loading">Učitavanje...</div>
      ) : rows.length === 0 ? (
        <div className="empty-state">Nema korisnika.</div>
      ) : (
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Korisnik</th>
                <th>Uloga</th>
                <th>Posljednja prijava</th>
                <th>Posljednja aktivnost</th>
                <th title="Aktivnih dana (30d)">Aktivnih dana</th>
                <th title="Izmjena ukupno · zadnjih 30d · danas">Izmjene</th>
                <th title="Bilješki ukupno · zadnjih 30d">Bilješke</th>
                <th title="Prijava za reviziju (30d)">⚠</th>
                <th title="Izvršenih vraćanja (30d)">↺</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isExpanded = expandedId === r.user_id;
                return (
                  <>
                    <tr
                      key={r.user_id}
                      className={`venue-row ${isExpanded ? 'selected' : ''}`}
                      onClick={() => toggleExpand(r.user_id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="user-name">
                        {r.display_name || r.email || r.user_id.slice(0, 8)}
                        {r.email && r.display_name && (
                          <div className="muted-text" style={{ fontSize: 11, fontWeight: 400 }}>{r.email}</div>
                        )}
                      </td>
                      <td>
                        <span style={{ color: ROLE_COLORS[r.role] ?? '#A0A0A0', fontSize: 12, fontWeight: 600 }}>
                          {r.role}
                        </span>
                      </td>
                      <td className="muted-cell" title={formatExact(r.last_sign_in_at)}>
                        {formatWhen(r.last_sign_in_at)}
                      </td>
                      <td className="muted-cell" title={formatExact(r.last_activity_at)}>
                        {formatWhen(r.last_activity_at)}
                      </td>
                      <td className={r.active_days_since > 0 ? 'stat-green' : 'muted-cell'}>
                        {r.active_days_since}
                      </td>
                      <td>
                        <span style={{ color: '#E5E5E5' }}>{r.edits_all_time}</span>
                        <span className="muted-text" style={{ fontSize: 11 }}>
                          {' · '}{r.edits_since}{' · '}{r.edits_today}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#E5E5E5' }}>{r.notes_all_time}</span>
                        <span className="muted-text" style={{ fontSize: 11 }}>
                          {' · '}{r.notes_since}
                        </span>
                      </td>
                      <td className={r.flags_raised > 0 ? 'stat-orange' : 'muted-cell'}>{r.flags_raised}</td>
                      <td className={r.reverts_performed > 0 ? 'stat-purple' : 'muted-cell'}>{r.reverts_performed}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${r.user_id}-timeline`}>
                        <td colSpan={9} style={{ background: 'rgba(255,255,255,0.02)', padding: 16 }}>
                          <div style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 10 }}>
                            Račun kreiran {formatWhen(r.account_created_at)} · ID {r.user_id.slice(0, 8)}…
                          </div>
                          {timelineLoading === r.user_id ? (
                            <div className="muted-text">Učitavanje vremenske ose...</div>
                          ) : (timelines[r.user_id] ?? []).length === 0 ? (
                            <div className="muted-text">Nema aktivnosti u zapisima.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {timelines[r.user_id].map((ev, idx) => {
                                const kindMeta = KIND_LABEL[ev.kind] ?? { label: ev.kind, color: '#A0A0A0' };
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '100px 90px 1fr',
                                      gap: 12,
                                      padding: '6px 10px',
                                      borderRadius: 6,
                                      background: 'rgba(255,255,255,0.02)',
                                      fontSize: 12,
                                      alignItems: 'baseline',
                                    }}
                                  >
                                    <span className="muted-text" title={formatExact(ev.at)}>
                                      {formatWhen(ev.at)}
                                    </span>
                                    <span style={{ color: kindMeta.color, fontWeight: 600 }}>
                                      {kindMeta.label}
                                    </span>
                                    <span style={{ color: '#E5E5E5' }}>
                                      <span style={{ color: '#D4A056' }}>{ev.row_label ?? ev.table_name}</span>
                                      {ev.detail && (
                                        <span className="muted-text" style={{ marginLeft: 8, fontSize: 11 }}>
                                          {ev.detail}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
