import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { ErrorBanner } from '../components/ErrorBanner';
import { withTimeout } from '../lib/withTimeout';
import { canAdmin } from '../hooks/useAuth';
import type { UserRole } from '../hooks/useAuth';

const QUERY_TIMEOUT_MS = 15_000;

type NoteKind = 'venue' | 'event' | 'idea';

interface Note {
  id: number;
  author_id: string;
  author_display_name: string | null;
  author_role: string | null;
  kind: NoteKind;
  venue_id: string | null;
  venue_name: string | null;
  event_id: string | null;
  event_title: string | null;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

interface VenueOption { id: string; name: string }
interface EventOption { id: string; label: string }

const ROLE_COLORS: Record<string, string> = {
  editor: '#60A5FA',
  admin: '#D4A056',
  super_admin: '#A855F7',
};

const KIND_LABELS: Record<NoteKind, string> = {
  venue: 'Lokacije',
  event: 'Događaji',
  idea: 'Ideje',
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMin = Math.round((now - d.getTime()) / 60_000);
  if (diffMin < 1) return 'sada';
  if (diffMin < 60) return `prije ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `prije ${diffH} h`;
  return d.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface Props {
  role: UserRole;
  currentUserId: string | null;
}

export function NotesPage({ role, currentUserId }: Props) {
  const isAdmin = canAdmin(role);

  const [kindTab, setKindTab] = useState<NoteKind>('idea');
  const [allAuthors, setAllAuthors] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [composeOpen, setComposeOpen] = useState(false);
  const [draftBody, setDraftBody] = useState('');
  const [draftVenueId, setDraftVenueId] = useState('');
  const [draftEventId, setDraftEventId] = useState('');
  const [saving, setSaving] = useState(false);

  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load notes for the current tab
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await withTimeout(
        supabase.rpc('list_notes', {
          p_kind: kindTab,
          p_all_authors: allAuthors,
          p_limit: 200,
        }),
        QUERY_TIMEOUT_MS,
        `list_notes(${kindTab})`,
      );
      if (qError) {
        setError(qError.message);
      } else {
        setNotes((data ?? []) as Note[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, [kindTab, allAuthors]);

  useEffect(() => { load(); }, [load]);

  // Load venues/events into the compose picker on demand
  useEffect(() => {
    if (!composeOpen) return;
    if (kindTab === 'venue' && venues.length === 0) {
      supabase
        .from('venues')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
        .limit(2000)
        .then(({ data }) => {
          if (data) setVenues(data as VenueOption[]);
        });
    } else if (kindTab === 'event' && events.length === 0) {
      supabase
        .from('events')
        .select('id, title_bs, title_en, start_datetime')
        .order('start_datetime', { ascending: false })
        .limit(500)
        .then(({ data }) => {
          if (data) {
            setEvents(
              (data as any[]).map((e) => ({
                id: e.id,
                label: `${e.title_bs || e.title_en || '(bez naslova)'}${e.start_datetime ? ' — ' + new Date(e.start_datetime).toLocaleDateString('bs-BA') : ''}`,
              })),
            );
          }
        });
    }
  }, [composeOpen, kindTab, venues.length, events.length]);

  const handleSave = async () => {
    const body = draftBody.trim();
    if (!body || !currentUserId) return;
    if (kindTab === 'venue' && !draftVenueId) {
      setError('Odaberi lokaciju za bilješku.');
      return;
    }
    if (kindTab === 'event' && !draftEventId) {
      setError('Odaberi događaj za bilješku.');
      return;
    }
    setSaving(true);
    setError(null);
    const insert: Record<string, unknown> = {
      author_id: currentUserId,
      kind: kindTab,
      body,
      venue_id: kindTab === 'venue' ? draftVenueId : null,
      event_id: kindTab === 'event' ? draftEventId : null,
    };
    const { error: qError } = await supabase.from('notes').insert(insert);
    if (qError) {
      setError(qError.message);
    } else {
      setDraftBody('');
      setDraftVenueId('');
      setDraftEventId('');
      setComposeOpen(false);
      await load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Obrisati ovu bilješku?')) return;
    setDeletingId(id);
    const { error: qError } = await supabase.from('notes').delete().eq('id', id);
    if (qError) {
      setError(qError.message);
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
    setDeletingId(null);
  };

  const stats = useMemo(() => {
    return {
      total: notes.length,
      mine: notes.filter((n) => n.author_id === currentUserId).length,
    };
  }, [notes, currentUserId]);

  return (
    <div className="page">
      {error && <ErrorBanner error={error} onRetry={load} />}

      <div className="page-header">
        <h1 className="page-title">Bilješke</h1>
        <div className="page-stats">
          <span>{stats.total} {allAuthors ? 'ukupno' : 'mojih'}</span>
          {allAuthors && stats.mine > 0 && <span className="stat-blue">{stats.mine} mojih</span>}
        </div>
      </div>

      <div className="filters">
        {(['venue', 'event', 'idea'] as const).map((k) => (
          <button
            key={k}
            className={`lang-tab ${kindTab === k ? 'active' : ''}`}
            onClick={() => { setKindTab(k); setComposeOpen(false); }}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
        {isAdmin && (
          <label className="toggle" style={{ marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={allAuthors}
              onChange={(e) => setAllAuthors(e.target.checked)}
            />
            Svi autori
          </label>
        )}
        {!composeOpen && (
          <button className="save-btn" onClick={() => setComposeOpen(true)}>
            + Nova bilješka
          </button>
        )}
      </div>

      {composeOpen && (
        <div
          style={{
            background: 'rgba(212,160,86,0.06)',
            border: '1px solid rgba(212,160,86,0.25)',
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Nova bilješka — {KIND_LABELS[kindTab]}</div>

          {kindTab === 'venue' && (
            <div className="field">
              <label>Lokacija</label>
              <input
                list="venues-list"
                value={draftVenueId ? (venues.find((v) => v.id === draftVenueId)?.name ?? '') : ''}
                onChange={(e) => {
                  const match = venues.find((v) => v.name === e.target.value);
                  setDraftVenueId(match?.id ?? '');
                }}
                placeholder="Počni kucati ime lokacije..."
                className="edit-input"
              />
              <datalist id="venues-list">
                {venues.map((v) => <option key={v.id} value={v.name} />)}
              </datalist>
            </div>
          )}

          {kindTab === 'event' && (
            <div className="field">
              <label>Događaj</label>
              <input
                list="events-list"
                value={draftEventId ? (events.find((e) => e.id === draftEventId)?.label ?? '') : ''}
                onChange={(e) => {
                  const match = events.find((ev) => ev.label === e.target.value);
                  setDraftEventId(match?.id ?? '');
                }}
                placeholder="Počni kucati ime događaja..."
                className="edit-input"
              />
              <datalist id="events-list">
                {events.map((ev) => <option key={ev.id} value={ev.label} />)}
              </datalist>
            </div>
          )}

          <div className="field">
            <label>{kindTab === 'idea' ? 'Ideja' : 'Bilješka'}</label>
            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={4}
              placeholder={kindTab === 'idea'
                ? 'Šta bi bilo dobro dodati u aplikaciju? Šta nedostaje?'
                : 'Šta želiš da zapamtiš o ovome?'}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={saving || !draftBody.trim() || (kindTab === 'venue' && !draftVenueId) || (kindTab === 'event' && !draftEventId)}
            >
              {saving ? 'Čuvanje...' : 'Sačuvaj'}
            </button>
            <button
              className="page-btn"
              onClick={() => {
                setComposeOpen(false);
                setDraftBody('');
                setDraftVenueId('');
                setDraftEventId('');
                setError(null);
              }}
            >
              Otkaži
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Učitavanje...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          {kindTab === 'idea' ? 'Nema ideja još. Dodaj prvu! 💡' : 'Nema bilješki.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notes.map((n) => {
            const canDelete = n.author_id === currentUserId || isAdmin;
            return (
              <div
                key={n.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#A0A0A0' }}>
                    <span
                      style={{
                        color: ROLE_COLORS[n.author_role ?? ''] ?? '#A0A0A0',
                        fontWeight: 600,
                      }}
                    >
                      {n.author_display_name || 'nepoznat'}
                    </span>
                    {' · '}
                    {formatWhen(n.created_at)}
                    {n.kind === 'venue' && n.venue_name && (
                      <span style={{ marginLeft: 8 }}>
                        · <span style={{ color: '#D4A056' }}>{n.venue_name}</span>
                      </span>
                    )}
                    {n.kind === 'event' && n.event_title && (
                      <span style={{ marginLeft: 8 }}>
                        · <span style={{ color: '#D4A056' }}>{n.event_title}</span>
                      </span>
                    )}
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={deletingId === n.id}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#A0A0A0',
                        fontSize: 14,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title="Obriši"
                    >
                      {deletingId === n.id ? '…' : '×'}
                    </button>
                  )}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: '#E5E5E5', fontSize: 14 }}>
                  {n.body}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
