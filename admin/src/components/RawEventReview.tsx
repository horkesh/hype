import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';

interface RawEvent {
  id: string;
  title_raw: string | null;
  source_name: string | null;
  date_raw: string | null;
  venue_name_raw: string | null;
  image_url: string | null;
  venue_match_status: string | null;
  created_at: string | null;
}

type BulkAction = 'promote' | 'dismiss';

export function RawEventReview() {
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  const fetchRawEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('raw_events')
        .select('id, title_raw, source_name, date_raw, venue_name_raw, image_url, venue_match_status, created_at')
        .not('venue_match_status', 'in', '("promoted","ignored")')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setRawEvents(data);
      if (error) console.error('Failed to fetch raw events:', error.message);
    } catch (err) {
      console.error('Failed to fetch raw events:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRawEvents(); }, [fetchRawEvents]);

  const sources = useMemo(() => {
    return [...new Set(rawEvents.map(e => e.source_name).filter(Boolean) as string[])].sort();
  }, [rawEvents]);

  const visible = useMemo(() => {
    if (!sourceFilter) return rawEvents;
    return rawEvents.filter(e => e.source_name === sourceFilter);
  }, [rawEvents, sourceFilter]);

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelected(prev => {
      const allSelected = visible.every(e => prev.has(e.id));
      const next = new Set(prev);
      if (allSelected) {
        visible.forEach(e => next.delete(e.id));
      } else {
        visible.forEach(e => next.add(e.id));
      }
      return next;
    });
  };

  const runOne = async (id: string, action: BulkAction) => {
    const status = action === 'promote' ? 'promoted' : 'ignored';
    setActionMsg(prev => ({ ...prev, [id]: action === 'promote' ? 'Promoviram...' : 'Odbacujem...' }));
    const { error } = await supabase
      .from('raw_events')
      .update({ venue_match_status: status })
      .eq('id', id);
    if (error) {
      setActionMsg(prev => ({ ...prev, [id]: 'Greška: ' + error.message }));
    } else {
      setRawEvents(prev => prev.filter(e => e.id !== id));
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
      setActionMsg(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  };

  const runBulk = async (action: BulkAction) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const verb = action === 'promote' ? 'promovirati' : 'odbaciti';
    if (!confirm(`${ids.length} odabranih neobrađenih događaja — ${verb}?`)) return;
    setBulkRunning(true);
    setBulkMsg(null);
    const status = action === 'promote' ? 'promoted' : 'ignored';
    const { error } = await supabase
      .from('raw_events')
      .update({ venue_match_status: status })
      .in('id', ids);
    if (error) {
      setBulkMsg(`Greška: ${error.message}`);
    } else {
      setBulkMsg(`${action === 'promote' ? 'Promovirano' : 'Odbačeno'}: ${ids.length}`);
      setRawEvents(prev => prev.filter(e => !selected.has(e.id)));
      setSelected(new Set());
    }
    setBulkRunning(false);
  };

  if (loading) return <div className="loading">Učitavanje neobrađenih događaja...</div>;

  const allVisibleSelected = visible.length > 0 && visible.every(e => selected.has(e.id));

  return (
    <div className="raw-events-section">
      <div className="raw-events-header">
        <h2>Neobrađeni događaji (raw)</h2>
        <span className="count-badge">{visible.length} na čekanju</span>
      </div>

      {/* Toolbar */}
      <div className="filters" style={{ marginBottom: 12 }}>
        <label className="toggle">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleAllVisible}
            disabled={visible.length === 0}
          />
          Odaberi sve ({visible.length})
        </label>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          <option value="">Svi izvori</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          className="save-btn"
          onClick={() => runBulk('promote')}
          disabled={selected.size === 0 || bulkRunning}
        >
          {bulkRunning ? 'Radim...' : `✓ Promoviraj odabrane (${selected.size})`}
        </button>
        <button
          className="ban-btn"
          onClick={() => runBulk('dismiss')}
          disabled={selected.size === 0 || bulkRunning}
        >
          {bulkRunning ? 'Radim...' : `× Odbaci odabrane (${selected.size})`}
        </button>
        {bulkMsg && (
          <span className={bulkMsg.startsWith('Greška') ? 'error' : 'success'}>
            {bulkMsg}
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          {sourceFilter ? `Nema neobrađenih događaja iz "${sourceFilter}".` : 'Nema neobrađenih događaja.'}
        </div>
      ) : (
        <div className="raw-event-grid">
          {visible.map(ev => {
            const isSelected = selected.has(ev.id);
            return (
              <div
                key={ev.id}
                className="raw-event-card"
                style={{
                  position: 'relative',
                  border: isSelected ? '2px solid #D4A056' : undefined,
                  background: isSelected ? 'rgba(212,160,86,0.06)' : undefined,
                }}
              >
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(ev.id)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>
                {ev.image_url && (
                  <img src={ev.image_url} alt={ev.title_raw ?? ''} className="raw-event-img" />
                )}
                <div className="raw-event-body">
                  <div className="raw-event-title">{ev.title_raw ?? '(bez naziva)'}</div>
                  <div className="raw-event-meta">
                    {ev.date_raw && <span className="raw-meta-item">{ev.date_raw}</span>}
                    {ev.venue_name_raw && <span className="raw-meta-item">{ev.venue_name_raw}</span>}
                    {ev.source_name && <span className="badge">{ev.source_name}</span>}
                    {ev.venue_match_status && (
                      <span className="badge cat">{ev.venue_match_status}</span>
                    )}
                  </div>
                  <div className="raw-event-actions">
                    <button
                      className="promote-btn"
                      onClick={() => runOne(ev.id, 'promote')}
                      disabled={!!actionMsg[ev.id]}
                    >
                      Promoviraj
                    </button>
                    <button
                      className="dismiss-btn"
                      onClick={() => runOne(ev.id, 'dismiss')}
                      disabled={!!actionMsg[ev.id]}
                    >
                      Odbaci
                    </button>
                    {actionMsg[ev.id] && (
                      <span className={actionMsg[ev.id].startsWith('Greška') ? 'error' : 'success'}>
                        {actionMsg[ev.id]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
