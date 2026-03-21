import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { RawEventReview } from './RawEventReview';

interface Event {
  id: string;
  title_bs: string | null;
  title_en: string | null;
  description_bs: string | null;
  description_en: string | null;
  category: string | null;
  start_datetime: string | null;
  ticket_url: string | null;
  status: string | null;
  cover_image_url: string | null;
  venue_id: string | null;
  venue_name: string | null;
}

const STATUS_OPTIONS = ['draft', 'pending', 'approved'];

export function EventEditor({ onSignOut }: { onSignOut: () => void }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Edit state
  const [editTitleBs, setEditTitleBs] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editDescBs, setEditDescBs] = useState('');
  const [editDescEn, setEditDescEn] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDatetime, setEditDatetime] = useState('');
  const [editTicketUrl, setEditTicketUrl] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, title_bs, title_en, description_bs, description_en,
        category, start_datetime, ticket_url, status, cover_image_url,
        venue_id, venues(name)
      `)
      .order('start_datetime', { ascending: true });

    if (data) {
      const mapped: Event[] = data.map((e: any) => ({
        ...e,
        venue_name: e.venues?.name ?? null,
      }));
      setEvents(mapped);
    }
    if (error) console.error('Failed to fetch events:', error.message);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const categories = [...new Set(events.map(e => e.category).filter(Boolean) as string[])].sort();

  const now = new Date().toISOString();

  const filtered = events.filter(e => {
    if (categoryFilter && e.category !== categoryFilter) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    if (upcomingOnly && e.start_datetime && e.start_datetime < now) return false;
    return true;
  });

  const selected = events.find(e => e.id === selectedId);

  const handleSelect = (ev: Event) => {
    setSelectedId(ev.id);
    setEditTitleBs(ev.title_bs ?? '');
    setEditTitleEn(ev.title_en ?? '');
    setEditDescBs(ev.description_bs ?? '');
    setEditDescEn(ev.description_en ?? '');
    setEditCategory(ev.category ?? '');
    setEditDatetime(ev.start_datetime ? ev.start_datetime.slice(0, 16) : '');
    setEditTicketUrl(ev.ticket_url ?? '');
    setEditStatus(ev.status ?? '');
    setSaveMsg('');
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase
      .from('events')
      .update({
        title_bs: editTitleBs || null,
        title_en: editTitleEn || null,
        description_bs: editDescBs || null,
        description_en: editDescEn || null,
        category: editCategory || null,
        start_datetime: editDatetime ? new Date(editDatetime).toISOString() : null,
        ticket_url: editTicketUrl || null,
        status: editStatus || null,
      })
      .eq('id', selectedId);

    if (error) {
      setSaveMsg('Error: ' + error.message);
    } else {
      setSaveMsg('Saved!');
      setEvents(prev => prev.map(e =>
        e.id === selectedId
          ? {
              ...e,
              title_bs: editTitleBs || null,
              title_en: editTitleEn || null,
              description_bs: editDescBs || null,
              description_en: editDescEn || null,
              category: editCategory || null,
              start_datetime: editDatetime ? new Date(editDatetime).toISOString() : null,
              ticket_url: editTicketUrl || null,
              status: editStatus || null,
            }
          : e
      ));
    }
    setSaving(false);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const statusColor = (s: string | null) => {
    if (s === 'approved') return '#22C55E';
    if (s === 'pending') return '#F59E0B';
    return '#A0A0A0';
  };

  return (
    <div className="editor" tabIndex={0}>
      <header>
        <h1>Look Event Editor</h1>
        <div className="stats">
          <span>{events.length} events</span>
          <span className="stat-good">{events.filter(e => e.status === 'approved').length} approved</span>
          <span className="stat-bad">{events.filter(e => e.status === 'pending').length} pending</span>
          <span>{events.filter(e => e.cover_image_url).length} with photos</span>
        </div>
        <button className="sign-out" onClick={onSignOut}>Sign Out</button>
      </header>

      <div className="filters">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="toggle">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={e => setUpcomingOnly(e.target.checked)}
          />
          Upcoming only
        </label>
      </div>

      <div className="main-layout">
        <div className="venue-list">
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title (BS)</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Photo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ev => (
                  <tr
                    key={ev.id}
                    className={`venue-row ${ev.id === selectedId ? 'selected' : ''}`}
                    onClick={() => handleSelect(ev)}
                  >
                    <td className="venue-name">{ev.title_bs ?? '(no BS title)'}</td>
                    <td>{ev.category ? <span className="badge cat">{ev.category}</span> : '—'}</td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(ev.start_datetime)}</td>
                    <td style={{ fontSize: 12, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.venue_name ?? '—'}
                    </td>
                    <td>
                      <span style={{ color: statusColor(ev.status), fontSize: 12, fontWeight: 600 }}>
                        {ev.status ?? '—'}
                      </span>
                    </td>
                    <td>{ev.cover_image_url ? <span className="dot green" /> : <span className="dot red" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="count">{filtered.length} / {events.length} events</div>
        </div>

        {selected && (
          <div className="edit-panel">
            <div className="edit-header">
              <h2>{selected.title_bs ?? selected.title_en ?? '(untitled)'}</h2>
              {selected.category && <span className="badge cat">{selected.category}</span>}
              {selected.venue_name && <span className="badge">{selected.venue_name}</span>}
            </div>

            {selected.cover_image_url && (
              <img src={selected.cover_image_url} alt={selected.title_en ?? ''} className="venue-photo" />
            )}

            <div className="edit-fields">
              <div className="field">
                <label>Title (BS)</label>
                <input
                  type="text"
                  value={editTitleBs}
                  onChange={e => setEditTitleBs(e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="field">
                <label>Title (EN)</label>
                <input
                  type="text"
                  value={editTitleEn}
                  onChange={e => setEditTitleEn(e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="field">
                <label>Description (BS)</label>
                <textarea value={editDescBs} onChange={e => setEditDescBs(e.target.value)} rows={3} />
              </div>
              <div className="field">
                <label>Description (EN)</label>
                <textarea value={editDescEn} onChange={e => setEditDescEn(e.target.value)} rows={3} />
              </div>
              <div className="field">
                <label>Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="field">
                <label>Start Date/Time</label>
                <input
                  type="datetime-local"
                  value={editDatetime}
                  onChange={e => setEditDatetime(e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="field">
                <label>Ticket URL</label>
                <input
                  type="url"
                  value={editTicketUrl}
                  onChange={e => setEditTicketUrl(e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="field">
                <label>Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #3A3A4E', background: '#1A1A2E', color: '#FAFAF8', fontSize: 14 }}
                >
                  <option value="">— select —</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="edit-actions">
              <button onClick={handleSave} disabled={saving} className="save-btn">
                {saving ? 'Saving...' : 'Save Event'}
              </button>
              {saveMsg && (
                <span className={saveMsg.startsWith('Error') ? 'error' : 'success'}>{saveMsg}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        <RawEventReview />
      </div>
    </div>
  );
}
