import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { RawEventReview } from '../components/RawEventReview';
import { ErrorBanner } from '../components/ErrorBanner';
import { NotesSection } from '../components/NotesSection';
import { withTimeout } from '../lib/withTimeout';

interface Props {
  currentUserId: string | null;
}

const QUERY_TIMEOUT_MS = 15_000;

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
  is_featured: boolean | null;
  needs_review: boolean | null;
  review_notes: string | null;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nacrt' },
  { value: 'pending', label: 'Na čekanju' },
  { value: 'approved', label: 'Odobreno' },
];

const STATUS_COLORS: Record<string, string> = {
  approved: '#22C55E',
  pending: '#F59E0B',
  draft: '#A0A0A0',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('bs-BA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function EventManagement({ currentUserId }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [editTitleBs, setEditTitleBs] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editDescBs, setEditDescBs] = useState('');
  const [editDescEn, setEditDescEn] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDatetime, setEditDatetime] = useState('');
  const [editTicketUrl, setEditTicketUrl] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editNeedsReview, setEditNeedsReview] = useState(false);
  const [editReviewNotes, setEditReviewNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [langTab, setLangTab] = useState<'bs' | 'en'>('bs');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const query = supabase
        .from('events')
        .select('id, title_bs, title_en, description_bs, description_en, category, start_datetime, ticket_url, status, cover_image_url, venue_id, is_featured, needs_review, review_notes, venues(name)')
        .order('start_datetime', { ascending: true });

      const { data, error } = await withTimeout(query, QUERY_TIMEOUT_MS, 'events');

      if (error) {
        setFetchError('Greška pri učitavanju događaja: ' + error.message + ' (code: ' + error.code + ')');
      } else if (data) {
        setEvents(data.map((e: any) => ({ ...e, venue_name: e.venues?.name ?? null })));
      }
    } catch (err: any) {
      setFetchError(err?.message ?? String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const categories = [...new Set(events.map(e => e.category).filter(Boolean) as string[])].sort();
  const now = new Date().toISOString();

  const filtered = events.filter(e => {
    if (categoryFilter && e.category !== categoryFilter) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    if (upcomingOnly && e.start_datetime && e.start_datetime < now) return false;
    if (featuredOnly && !e.is_featured) return false;
    if (needsReviewOnly && !e.needs_review) return false;
    return true;
  });

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
    setEditFeatured(ev.is_featured ?? false);
    setEditNeedsReview(ev.needs_review ?? false);
    setEditReviewNotes(ev.review_notes ?? '');
    setSaveMsg('');
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setSaveMsg('');

    const selected = events.find(e => e.id === selectedId);
    const wasFlagged = selected?.needs_review ?? false;

    const update: Record<string, unknown> = {
      title_bs: editTitleBs || null,
      title_en: editTitleEn || null,
      description_bs: editDescBs || null,
      description_en: editDescEn || null,
      category: editCategory || null,
      start_datetime: editDatetime ? new Date(editDatetime).toISOString() : null,
      ticket_url: editTicketUrl || null,
      status: editStatus || null,
      is_featured: editFeatured,
      needs_review: editNeedsReview,
      review_notes: editNeedsReview ? (editReviewNotes || null) : null,
    };

    if (editNeedsReview && !wasFlagged) {
      const { data: { user } } = await supabase.auth.getUser();
      update.review_requested_at = new Date().toISOString();
      update.review_requested_by = user?.id ?? null;
    } else if (!editNeedsReview && wasFlagged) {
      update.review_requested_at = null;
      update.review_requested_by = null;
    }

    const { error } = await supabase.from('events').update(update).eq('id', selectedId);

    if (error) {
      setSaveMsg('Greška: ' + error.message);
    } else {
      setSaveMsg('Sačuvano!');
      setEvents(prev => prev.map(e => e.id === selectedId ? { ...e, ...update } : e));
    }
    setSaving(false);
  };

  const selected = events.find(e => e.id === selectedId);

  return (
    <div className="page">
      {fetchError && <ErrorBanner error={fetchError} onRetry={fetchEvents} />}
      <div className="page-header">
        <h1 className="page-title">Događaji</h1>
        <div className="page-stats">
          <span>{events.length} događaja</span>
          <span className="stat-green">{events.filter(e => e.status === 'approved').length} odobreno</span>
          <span className="stat-orange">{events.filter(e => e.status === 'pending').length} na čekanju</span>
        </div>
      </div>

      <div className="filters">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">Sve kategorije</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Svi statusi</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <label className="toggle">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={e => setUpcomingOnly(e.target.checked)}
          />
          Samo predstojeći
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={e => setFeaturedOnly(e.target.checked)}
          />
          ★ Samo istaknuti
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={needsReviewOnly}
            onChange={e => setNeedsReviewOnly(e.target.checked)}
          />
          ⚠ Samo za reviziju
        </label>
      </div>

      <div className="main-layout">
        {/* Event list */}
        <div className="venue-list">
          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Naziv (BS)</th>
                  <th>Kategorija</th>
                  <th>Datum</th>
                  <th>Lokacija</th>
                  <th>Status</th>
                  <th>★</th>
                  <th>Foto</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ev => (
                  <tr
                    key={ev.id}
                    className={`venue-row ${ev.id === selectedId ? 'selected' : ''}`}
                    onClick={() => handleSelect(ev)}
                  >
                    <td className="venue-name">{ev.title_bs ?? '(bez naslova BS)'}</td>
                    <td>{ev.category ? <span className="badge cat">{ev.category}</span> : '—'}</td>
                    <td className="muted-cell">{formatDate(ev.start_datetime)}</td>
                    <td className="muted-cell">{ev.venue_name ?? '—'}</td>
                    <td>
                      <span style={{ color: STATUS_COLORS[ev.status ?? ''] ?? '#A0A0A0', fontSize: 12, fontWeight: 600 }}>
                        {STATUS_OPTIONS.find(s => s.value === ev.status)?.label ?? ev.status ?? '—'}
                      </span>
                    </td>
                    <td>
                      {ev.needs_review ? <span title="Za reviziju" style={{ color: '#F59E0B', fontWeight: 700 }}>⚠</span> :
                       ev.is_featured ? <span style={{ color: '#D4A056', fontWeight: 700 }}>★</span> :
                       <span className="dot gray" />}
                    </td>
                    <td>{ev.cover_image_url ? <span className="dot green" /> : <span className="dot red" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="count">{filtered.length} / {events.length} događaja</div>

          {/* Raw events inside the scrollable list */}
          <div style={{ marginTop: 24, flexShrink: 0 }}>
            <RawEventReview />
          </div>
        </div>

        {/* Edit panel */}
        {selected && (
          <div className="edit-panel">
            <div className="edit-header">
              <h2>{selected.title_bs ?? selected.title_en ?? '(bez naslova)'}</h2>
              <div className="edit-header-meta">
                {selected.category && <span className="badge cat">{selected.category}</span>}
                {selected.venue_name && <span className="badge">{selected.venue_name}</span>}
                {editNeedsReview && <span className="badge" style={{ background: '#F59E0B', color: '#000' }}>⚠ Za reviziju</span>}
              </div>
            </div>

            {selected.cover_image_url && (
              <img
                src={selected.cover_image_url}
                alt={selected.title_en ?? ''}
                className="venue-photo"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            <div className="lang-tabs">
              <button className={`lang-tab ${langTab === 'bs' ? 'active' : ''}`} onClick={() => setLangTab('bs')} type="button">
                Bosanski
              </button>
              <button className={`lang-tab ${langTab === 'en' ? 'active' : ''}`} onClick={() => setLangTab('en')} type="button">
                English
              </button>
            </div>

            <div className="edit-fields">
              {langTab === 'bs' ? (
                <>
                  <div className="field">
                    <label>Naslov (Bosanski)</label>
                    <input type="text" className="edit-input" value={editTitleBs} onChange={e => setEditTitleBs(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Opis (Bosanski)</label>
                    <textarea value={editDescBs} onChange={e => setEditDescBs(e.target.value)} rows={4} />
                  </div>
                </>
              ) : (
                <>
                  <div className="field">
                    <label>Title (English)</label>
                    <input type="text" className="edit-input" value={editTitleEn} onChange={e => setEditTitleEn(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Description (English)</label>
                    <textarea value={editDescEn} onChange={e => setEditDescEn(e.target.value)} rows={4} />
                  </div>
                </>
              )}

              <div className="field-row">
                <div className="field">
                  <label>Kategorija</label>
                  <input type="text" className="edit-input" value={editCategory} onChange={e => setEditCategory(e.target.value)} />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="edit-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">— odaberi —</option>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Datum i vrijeme</label>
                  <input
                    type="datetime-local"
                    className="edit-input"
                    value={editDatetime}
                    onChange={e => setEditDatetime(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>URL za karte</label>
                <input type="url" className="edit-input" value={editTicketUrl} onChange={e => setEditTicketUrl(e.target.value)} placeholder="https://..." />
              </div>

              <label className="toggle-field" style={{ marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={editFeatured}
                  onChange={e => setEditFeatured(e.target.checked)}
                />
                <span>★ Istaknuto (pojavljuje se na Home rail-u)</span>
              </label>

              {/* Detaljnija provjera — hides from app until admin reviews */}
              <div
                style={{
                  marginTop: 12,
                  background: editNeedsReview ? 'rgba(245,158,11,0.08)' : 'transparent',
                  border: editNeedsReview ? '1px solid rgba(245,158,11,0.35)' : '1px solid transparent',
                  borderRadius: 8,
                  padding: editNeedsReview ? 12 : 0,
                  transition: 'all 0.2s',
                }}
              >
                <label className="toggle-field">
                  <input
                    type="checkbox"
                    checked={editNeedsReview}
                    onChange={e => setEditNeedsReview(e.target.checked)}
                  />
                  <span style={{ color: editNeedsReview ? '#F59E0B' : undefined, fontWeight: editNeedsReview ? 600 : undefined }}>
                    ⚠ Detaljnija provjera — sakrij iz aplikacije dok se ne provjeri
                  </span>
                </label>
                {editNeedsReview && (
                  <textarea
                    value={editReviewNotes}
                    onChange={e => setEditReviewNotes(e.target.value)}
                    rows={3}
                    placeholder="Šta je sumnjivo ili pogrešno? (npr. duplikat, pogrešan datum, otkazano)..."
                    style={{ marginTop: 8, width: '100%' }}
                  />
                )}
              </div>
            </div>

            {/* Notes (per-event, admin-tier only) */}
            <NotesSection
              kind="event"
              eventId={selected.id}
              currentUserId={currentUserId}
              isAdmin={true /* event page is shown to all admin tiers; show all-author notes inline */}
            />

            <div className="edit-actions">
              <button onClick={handleSave} disabled={saving} className="save-btn">
                {saving ? 'Čuvanje...' : 'Sačuvaj'}
              </button>
              {saveMsg && (
                <span className={saveMsg.startsWith('Greška') ? 'error' : 'success'}>{saveMsg}</span>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
