import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

interface RawEvent {
  id: string;
  title_raw: string | null;
  source_name: string | null;
  date_raw: string | null;
  venue_name_raw: string | null;
  image_url: string | null;
  venue_match_status: string | null;
  scraped_at: string | null;
}

export function RawEventReview() {
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<Record<string, string>>({});

  const fetchRawEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('raw_events')
      .select('id, title_raw, source_name, date_raw, venue_name_raw, image_url, venue_match_status, scraped_at')
      .neq('venue_match_status', 'promoted')
      .neq('venue_match_status', 'ignored')
      .order('scraped_at', { ascending: false })
      .limit(100);

    if (data) setRawEvents(data);
    if (error) console.error('Failed to fetch raw events:', error.message);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRawEvents(); }, [fetchRawEvents]);

  const handlePromote = async (id: string) => {
    setActionMsg(prev => ({ ...prev, [id]: 'Promoting...' }));
    const { error } = await supabase
      .from('raw_events')
      .update({ venue_match_status: 'promoted' })
      .eq('id', id);

    if (error) {
      setActionMsg(prev => ({ ...prev, [id]: 'Error: ' + error.message }));
    } else {
      setRawEvents(prev => prev.filter(e => e.id !== id));
      setActionMsg(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  };

  const handleDismiss = async (id: string) => {
    setActionMsg(prev => ({ ...prev, [id]: 'Dismissing...' }));
    const { error } = await supabase
      .from('raw_events')
      .update({ venue_match_status: 'ignored' })
      .eq('id', id);

    if (error) {
      setActionMsg(prev => ({ ...prev, [id]: 'Error: ' + error.message }));
    } else {
      setRawEvents(prev => prev.filter(e => e.id !== id));
      setActionMsg(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  };

  if (loading) return <div className="loading">Loading raw events...</div>;

  return (
    <div className="raw-events-section">
      <div className="raw-events-header">
        <h2>Unreviewed Raw Events</h2>
        <span className="count-badge">{rawEvents.length} pending</span>
      </div>

      {rawEvents.length === 0 ? (
        <div className="empty-state">No unreviewed raw events.</div>
      ) : (
        <div className="raw-event-grid">
          {rawEvents.map(ev => (
            <div key={ev.id} className="raw-event-card">
              {ev.image_url && (
                <img src={ev.image_url} alt={ev.title_raw ?? ''} className="raw-event-img" />
              )}
              <div className="raw-event-body">
                <div className="raw-event-title">{ev.title_raw ?? '(no title)'}</div>
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
                    onClick={() => handlePromote(ev.id)}
                    disabled={!!actionMsg[ev.id]}
                  >
                    Promote
                  </button>
                  <button
                    className="dismiss-btn"
                    onClick={() => handleDismiss(ev.id)}
                    disabled={!!actionMsg[ev.id]}
                  >
                    Dismiss
                  </button>
                  {actionMsg[ev.id] && (
                    <span className={actionMsg[ev.id].startsWith('Error') ? 'error' : 'success'}>
                      {actionMsg[ev.id]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
