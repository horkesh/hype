import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ErrorBanner } from '../components/ErrorBanner';
import { withTimeout } from '../lib/withTimeout';
import type { Page } from './../components/Sidebar';

const QUERY_TIMEOUT_MS = 15_000;

interface FlaggedItem {
  kind: 'venue' | 'event';
  id: string;
  label: string;
  review_notes: string | null;
  review_requested_at: string | null;
  review_requested_by: string | null;
  requester_name: string | null;
  category?: string | null;
  start_datetime?: string | null;
  venue_name?: string | null;
}

interface Props {
  onNavigate: (page: Page) => void;
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = Date.now();
  const diffMin = Math.round((now - d.getTime()) / 60_000);
  if (diffMin < 1) return 'sada';
  if (diffMin < 60) return `prije ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `prije ${diffH} h`;
  return d.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatEventDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function ReviewQueue({ onNavigate }: Props) {
  const [items, setItems] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [venuesRes, eventsRes] = await Promise.all([
        withTimeout(
          supabase
            .from('venues')
            .select('id, name, category, review_notes, review_requested_at, review_requested_by')
            .eq('needs_review', true)
            .order('review_requested_at', { ascending: false }),
          QUERY_TIMEOUT_MS,
          'venues-flagged',
        ),
        withTimeout(
          supabase
            .from('events')
            .select('id, title_bs, title_en, category, start_datetime, review_notes, review_requested_at, review_requested_by, venues(name)')
            .eq('needs_review', true)
            .order('review_requested_at', { ascending: false }),
          QUERY_TIMEOUT_MS,
          'events-flagged',
        ),
      ]);

      if (venuesRes.error) { setError('Lokacije: ' + venuesRes.error.message); return; }
      if (eventsRes.error) { setError('Događaji: ' + eventsRes.error.message); return; }

      const requesterIds = new Set<string>();
      (venuesRes.data ?? []).forEach((v: any) => v.review_requested_by && requesterIds.add(v.review_requested_by));
      (eventsRes.data ?? []).forEach((e: any) => e.review_requested_by && requesterIds.add(e.review_requested_by));

      const requesters: Record<string, string> = {};
      if (requesterIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', Array.from(requesterIds));
        (profiles ?? []).forEach((p: any) => { requesters[p.id] = p.display_name; });
      }

      const venueItems: FlaggedItem[] = (venuesRes.data ?? []).map((v: any) => ({
        kind: 'venue',
        id: v.id,
        label: v.name,
        category: v.category,
        review_notes: v.review_notes,
        review_requested_at: v.review_requested_at,
        review_requested_by: v.review_requested_by,
        requester_name: v.review_requested_by ? (requesters[v.review_requested_by] ?? null) : null,
      }));

      const eventItems: FlaggedItem[] = (eventsRes.data ?? []).map((e: any) => ({
        kind: 'event',
        id: e.id,
        label: e.title_bs || e.title_en || '(bez naslova)',
        category: e.category,
        start_datetime: e.start_datetime,
        venue_name: e.venues?.name ?? null,
        review_notes: e.review_notes,
        review_requested_at: e.review_requested_at,
        review_requested_by: e.review_requested_by,
        requester_name: e.review_requested_by ? (requesters[e.review_requested_by] ?? null) : null,
      }));

      const combined = [...venueItems, ...eventItems].sort((a, b) => {
        const at = a.review_requested_at ? Date.parse(a.review_requested_at) : 0;
        const bt = b.review_requested_at ? Date.parse(b.review_requested_at) : 0;
        return bt - at;
      });

      setItems(combined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async (item: FlaggedItem) => {
    if (!confirm(`Označiti kao riješeno i vratiti u aplikaciju?\n\n"${item.label}"`)) return;
    const key = `${item.kind}:${item.id}`;
    setResolving(key);
    setMsg(null);
    try {
      const table = item.kind === 'venue' ? 'venues' : 'events';
      const { error: qError } = await supabase
        .from(table)
        .update({
          needs_review: false,
          review_notes: null,
          review_requested_at: null,
          review_requested_by: null,
        })
        .eq('id', item.id);
      if (qError) {
        setMsg({ id: key, text: 'Greška: ' + qError.message, ok: false });
      } else {
        setMsg({ id: key, text: 'Riješeno', ok: true });
        setItems((prev) => prev.filter((it) => !(it.kind === item.kind && it.id === item.id)));
      }
    } catch (err) {
      setMsg({ id: key, text: 'Greška: ' + (err instanceof Error ? err.message : String(err)), ok: false });
    }
    setResolving(null);
  };

  const handleOpen = (item: FlaggedItem) => {
    onNavigate(item.kind === 'venue' ? 'venues' : 'events');
  };

  return (
    <div className="page">
      {error && <ErrorBanner error={error} onRetry={load} />}

      <div className="page-header">
        <h1 className="page-title">Za reviziju</h1>
        <div className="page-stats">
          <span>{items.length} stavki čeka</span>
          {items.filter((i) => i.kind === 'venue').length > 0 && (
            <span className="stat-orange">
              {items.filter((i) => i.kind === 'venue').length} lokacija
            </span>
          )}
          {items.filter((i) => i.kind === 'event').length > 0 && (
            <span className="stat-orange">
              {items.filter((i) => i.kind === 'event').length} događaja
            </span>
          )}
        </div>
      </div>

      <div className="filters">
        <button className="page-btn" onClick={load} disabled={loading}>
          {loading ? 'Učitavanje...' : 'Osvježi'}
        </button>
      </div>

      {loading ? (
        <div className="loading">Učitavanje...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">Nema stavki za reviziju. 🎉</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => {
            const key = `${item.kind}:${item.id}`;
            return (
              <div
                key={key}
                style={{
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className="badge cat">
                        {item.kind === 'venue' ? 'Lokacija' : 'Događaj'}
                      </span>
                      {item.category && (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          {item.category}
                        </span>
                      )}
                      {item.kind === 'event' && item.start_datetime && (
                        <span style={{ fontSize: 12, color: '#A0A0A0' }}>
                          {formatEventDate(item.start_datetime)}
                          {item.venue_name ? ` · ${item.venue_name}` : ''}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{item.label}</h3>
                    <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 4 }}>
                      Prijavio {item.requester_name ?? 'nepoznat'} {formatWhen(item.review_requested_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
                    <button
                      className="page-btn"
                      onClick={() => handleOpen(item)}
                      style={{ minWidth: 140 }}
                    >
                      Otvori detalje →
                    </button>
                    <button
                      className="unban-btn"
                      onClick={() => handleResolve(item)}
                      disabled={resolving === key}
                      style={{ minWidth: 140 }}
                    >
                      {resolving === key ? 'Vraćam...' : '✓ Vrati u aplikaciju'}
                    </button>
                    {msg?.id === key && (
                      <span className={msg.ok ? 'success' : 'error'} style={{ fontSize: 11 }}>
                        {msg.text}
                      </span>
                    )}
                  </div>
                </div>
                {item.review_notes && (
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: 6,
                      padding: 12,
                      fontSize: 13,
                      whiteSpace: 'pre-wrap',
                      color: '#E5E5E5',
                    }}
                  >
                    {item.review_notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
