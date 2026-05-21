import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ErrorBanner } from '../components/ErrorBanner';
import { withTimeout } from '../lib/withTimeout';

const QUERY_TIMEOUT_MS = 15_000;

// Fields the user doesn't care about seeing in the diff — they bump on every
// UPDATE but aren't a meaningful change to review.
const IGNORED_DIFF_KEYS = new Set(['updated_at']);

interface AuditRow {
  id: number;
  table_name: 'venues' | 'events' | string;
  row_id: string;
  row_label: string | null;
  action: string;
  actor_id: string | null;
  actor_role: string | null;
  actor_email: string | null;
  actor_display_name: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reverted_at: string | null;
  reverted_by: string | null;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  editor: '#60A5FA',
  admin: '#D4A056',
  super_admin: '#A855F7',
};

const TABLE_LABELS: Record<string, string> = {
  venues: 'Lokacija',
  events: 'Događaj',
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMin = Math.round((now - d.getTime()) / 60_000);
  if (diffMin < 1) return 'sada';
  if (diffMin < 60) return `prije ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `prije ${diffH} h`;
  return d.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
}

function summarizeChange(before: Record<string, unknown> | null, after: Record<string, unknown> | null): string {
  if (!before || !after) return '—';
  const keys = Object.keys(after).filter((k) => !IGNORED_DIFF_KEYS.has(k));
  if (keys.length === 0) return '(nema promjena)';
  if (keys.length === 1) return keys[0];
  if (keys.length <= 3) return keys.join(', ');
  return `${keys.slice(0, 2).join(', ')} +${keys.length - 2} još`;
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return '∅';
  if (typeof v === 'string') {
    if (v.length === 0) return '""';
    if (v.length > 200) return v.slice(0, 200) + '…';
    return v;
  }
  if (typeof v === 'boolean') return v ? 'da' : 'ne';
  if (Array.isArray(v)) return v.length === 0 ? '[]' : v.join(', ');
  return JSON.stringify(v);
}

export function AuditLog() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOnly, setEditorOnly] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reverting, setReverting] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ id: number; text: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await withTimeout(
        supabase.rpc('list_audit_log', { p_limit: 200, p_editor_only: editorOnly }),
        QUERY_TIMEOUT_MS,
        'list_audit_log',
      );
      if (qError) {
        setError(`Greška pri učitavanju: ${qError.message}`);
      } else if (data) {
        setRows(data as AuditRow[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, [editorOnly]);

  useEffect(() => { load(); }, [load]);

  const handleRevert = async (row: AuditRow) => {
    if (!confirm(`Vratiti ovu promjenu na "${row.row_label ?? row.row_id}"?\n\nPolja: ${summarizeChange(row.before, row.after)}`)) return;
    setReverting(row.id);
    setMsg(null);
    try {
      const { data, error: qError } = await supabase.rpc('revert_audit_change', { p_audit_id: row.id });
      if (qError) {
        setMsg({ id: row.id, text: 'Greška: ' + qError.message, ok: false });
      } else {
        const result = data as { status?: string; rows_affected?: number };
        if (result?.status === 'reverted') {
          setMsg({ id: row.id, text: 'Vraćeno', ok: true });
          await load();
        } else if (result?.status === 'already_reverted') {
          setMsg({ id: row.id, text: 'Već vraćeno', ok: false });
        } else if (result?.status === 'row_not_found') {
          setMsg({ id: row.id, text: 'Red ne postoji', ok: false });
        } else {
          setMsg({ id: row.id, text: 'Status: ' + (result?.status ?? 'unknown'), ok: false });
        }
      }
    } catch (err) {
      setMsg({ id: row.id, text: 'Greška: ' + (err instanceof Error ? err.message : String(err)), ok: false });
    }
    setReverting(null);
  };

  const openRow = (row: AuditRow) => {
    const path = row.table_name === 'venues' ? '/' : '/';
    // No deep-link to the admin's own pages today; just print the id so user can search.
    void path;
    setExpandedId((prev) => (prev === row.id ? null : row.id));
  };

  return (
    <div className="page">
      {error && <ErrorBanner error={error} onRetry={load} />}

      <div className="page-header">
        <h1 className="page-title">Promjene</h1>
        <div className="page-stats">
          <span>{rows.length} {editorOnly ? 'izmjena urednika' : 'izmjena ukupno'}</span>
        </div>
      </div>

      <div className="filters">
        <label className="toggle">
          <input
            type="checkbox"
            checked={editorOnly}
            onChange={(e) => setEditorOnly(e.target.checked)}
          />
          Samo urednici (sakrij admin akcije)
        </label>
        <button className="page-btn" onClick={load} disabled={loading}>
          {loading ? 'Učitavanje...' : 'Osvježi'}
        </button>
      </div>

      {loading ? (
        <div className="loading">Učitavanje...</div>
      ) : rows.length === 0 ? (
        <div className="empty-state">Nema zabilježenih promjena.</div>
      ) : (
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Kada</th>
                <th>Ko</th>
                <th>Šta</th>
                <th>Polja</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isExpanded = expandedId === row.id;
                const fieldKeys = row.after
                  ? Object.keys(row.after).filter((k) => !IGNORED_DIFF_KEYS.has(k))
                  : [];
                return (
                  <>
                    <tr
                      key={row.id}
                      className={`venue-row ${row.reverted_at ? 'banned-row' : ''} ${isExpanded ? 'selected' : ''}`}
                      onClick={() => openRow(row)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="muted-cell">{formatWhen(row.created_at)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {row.actor_display_name || row.actor_email || row.actor_id?.slice(0, 8) || '—'}
                        </div>
                        <span style={{ color: ROLE_COLORS[row.actor_role ?? ''] ?? '#A0A0A0', fontSize: 11 }}>
                          {row.actor_role}
                        </span>
                      </td>
                      <td>
                        <span className="badge cat">{TABLE_LABELS[row.table_name] ?? row.table_name}</span>
                        <div style={{ fontWeight: 600, marginTop: 4 }}>
                          {row.row_label ?? row.row_id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="muted-cell">{summarizeChange(row.before, row.after)}</td>
                      <td>
                        <div className="user-actions">
                          {row.reverted_at ? (
                            <span style={{ color: '#A855F7', fontSize: 11 }}>
                              ↺ vraćeno {formatWhen(row.reverted_at)}
                            </span>
                          ) : (
                            <button
                              className="ban-btn"
                              onClick={(e) => { e.stopPropagation(); handleRevert(row); }}
                              disabled={reverting === row.id}
                            >
                              {reverting === row.id ? 'Vraćam...' : '↺ Vrati'}
                            </button>
                          )}
                          {msg?.id === row.id && (
                            <span
                              className={msg.ok ? 'success' : 'error'}
                              style={{ fontSize: 11 }}
                            >
                              {msg.text}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${row.id}-detail`}>
                        <td colSpan={5} style={{ background: 'rgba(255,255,255,0.02)', padding: 16 }}>
                          <div style={{ fontSize: 12, fontFamily: 'monospace', marginBottom: 8, color: '#A0A0A0' }}>
                            ID: {row.row_id}
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                              <tr style={{ color: '#A0A0A0' }}>
                                <th style={{ textAlign: 'left', padding: 6, width: '20%' }}>Polje</th>
                                <th style={{ textAlign: 'left', padding: 6, width: '40%' }}>Prije</th>
                                <th style={{ textAlign: 'left', padding: 6, width: '40%' }}>Poslije</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fieldKeys.map((k) => (
                                <tr key={k} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                  <td style={{ padding: 6, fontFamily: 'monospace', color: '#D4A056' }}>{k}</td>
                                  <td style={{ padding: 6, color: '#EF4444', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {renderValue(row.before?.[k])}
                                  </td>
                                  <td style={{ padding: 6, color: '#22C55E', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {renderValue(row.after?.[k])}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
