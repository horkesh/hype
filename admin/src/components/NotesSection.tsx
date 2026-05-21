import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';

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

const ROLE_COLORS: Record<string, string> = {
  editor: '#60A5FA',
  admin: '#D4A056',
  super_admin: '#A855F7',
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
  kind: NoteKind;
  venueId?: string;
  eventId?: string;
  currentUserId: string | null;
  isAdmin: boolean;
}

export function NotesSection({ kind, venueId, eventId, currentUserId, isAdmin }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [draftBody, setDraftBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await supabase.rpc('list_notes', {
        p_kind: kind,
        p_venue_id: venueId ?? null,
        p_event_id: eventId ?? null,
        p_all_authors: isAdmin,  // admin+ sees co-workers' notes inline too
        p_limit: 50,
      });
      if (qError) {
        setError(qError.message);
      } else {
        setNotes((data ?? []) as Note[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, [kind, venueId, eventId, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const body = draftBody.trim();
    if (!body || !currentUserId) return;
    setSaving(true);
    setError(null);
    const insert: Record<string, unknown> = {
      author_id: currentUserId,
      kind,
      body,
      venue_id: kind === 'venue' ? venueId ?? null : null,
      event_id: kind === 'event' ? eventId ?? null : null,
    };
    const { error: qError } = await supabase.from('notes').insert(insert);
    if (qError) {
      setError(qError.message);
    } else {
      setDraftBody('');
      setComposeOpen(false);
      await load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Obrisati ovu bilješku?')) return;
    setDeletingId(id);
    setError(null);
    const { error: qError } = await supabase.from('notes').delete().eq('id', id);
    if (qError) {
      setError(qError.message);
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="field" style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ margin: 0 }}>
          📝 Bilješke {notes.length > 0 && <span style={{ color: '#A0A0A0', fontWeight: 400 }}>({notes.length})</span>}
        </label>
        {!composeOpen && (
          <button
            type="button"
            className="page-btn"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setComposeOpen(true)}
          >
            + Dodaj
          </button>
        )}
      </div>

      {composeOpen && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            rows={3}
            placeholder="Nova bilješka..."
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button
              type="button"
              className="save-btn"
              onClick={handleSave}
              disabled={saving || !draftBody.trim()}
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              {saving ? 'Čuvanje...' : 'Sačuvaj'}
            </button>
            <button
              type="button"
              className="page-btn"
              onClick={() => { setComposeOpen(false); setDraftBody(''); }}
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              Otkaži
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '6px 10px', borderRadius: 6, fontSize: 12, marginBottom: 8 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="muted-text" style={{ fontSize: 12 }}>Učitavanje...</div>
      ) : notes.length === 0 && !composeOpen ? (
        <div className="muted-text" style={{ fontSize: 12 }}>Nema bilješki.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notes.map((n) => {
            const canDelete = n.author_id === currentUserId || isAdmin;
            return (
              <div
                key={n.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: '#A0A0A0' }}>
                    <span style={{
                      color: ROLE_COLORS[n.author_role ?? ''] ?? '#A0A0A0',
                      fontWeight: 600,
                    }}>
                      {n.author_display_name || 'nepoznat'}
                    </span>
                    {' · '}
                    {formatWhen(n.created_at)}
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      disabled={deletingId === n.id}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#A0A0A0',
                        fontSize: 11,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title="Obriši"
                    >
                      {deletingId === n.id ? '…' : '×'}
                    </button>
                  )}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: '#E5E5E5' }}>{n.body}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
