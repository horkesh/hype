import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ErrorBanner } from '../components/ErrorBanner';
import { withTimeout } from '../lib/withTimeout';

const QUERY_TIMEOUT_MS = 15_000;

interface WatchVenue {
  id: string;
  name: string;
  neighborhood: string | null;
  is_watch_party_venue: boolean | null;
  watch_party_note_bs: string | null;
  watch_party_note_en: string | null;
}

interface MatchEvent {
  id: string;
  title_bs: string | null;
  title_en: string | null;
  start_datetime: string | null;
  is_active: boolean | null;
}

function fmtKick(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('bs-BA', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function WatchPartyVenues() {
  const [flagged, setFlagged] = useState<WatchVenue[]>([]);
  const [matches, setMatches] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<WatchVenue[]>([]);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: venues, error: vErr }, { data: matchData }] = await Promise.all([
        withTimeout(
          supabase
            .from('venues')
            .select('id, name, neighborhood, is_watch_party_venue, watch_party_note_bs, watch_party_note_en')
            .eq('is_watch_party_venue', true)
            .order('name'),
          QUERY_TIMEOUT_MS,
          'watch_party_venues',
        ),
        supabase
          .from('events')
          .select('id, title_bs, title_en, start_datetime, is_active')
          .contains('tags', ['bih-match'])
          .order('start_datetime', { ascending: true }),
      ]);
      if (vErr) { setError(vErr.message); return; }
      setFlagged((venues ?? []) as WatchVenue[]);
      setMatches((matchData ?? []) as MatchEvent[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const runSearch = async () => {
    const q = search.trim();
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from('venues')
      .select('id, name, neighborhood, is_watch_party_venue, watch_party_note_bs, watch_party_note_en')
      .ilike('name', `%${q}%`)
      .eq('is_active', true)
      .order('name')
      .limit(30);
    setResults((data ?? []) as WatchVenue[]);
    setSearching(false);
  };

  const setFlag = async (venue: WatchVenue, on: boolean) => {
    setMsg('');
    const { error: e } = await supabase.from('venues').update({ is_watch_party_venue: on }).eq('id', venue.id);
    if (e) { setMsg('Greška: ' + e.message); return; }
    setMsg(on ? `"${venue.name}" dodan u Gdje gledati.` : `"${venue.name}" uklonjen.`);
    setResults((prev) => prev.map((v) => (v.id === venue.id ? { ...v, is_watch_party_venue: on } : v)));
    await load();
  };

  const saveNote = async (v: WatchVenue) => {
    setMsg('');
    const { error: e } = await supabase
      .from('venues')
      .update({ watch_party_note_bs: v.watch_party_note_bs || null, watch_party_note_en: v.watch_party_note_en || null })
      .eq('id', v.id);
    setMsg(e ? 'Greška: ' + e.message : 'Napomena sačuvana.');
  };

  const updateFlagged = (id: string, patch: Partial<WatchVenue>) =>
    setFlagged((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const toggleMatchActive = async (m: MatchEvent) => {
    setMsg('');
    const next = !m.is_active;
    const { error: e } = await supabase.from('events').update({ is_active: next }).eq('id', m.id);
    if (e) { setMsg('Greška: ' + e.message); return; }
    setMatches((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_active: next } : x)));
  };

  return (
    <div className="page">
      {error && <ErrorBanner error={error} onRetry={load} />}

      <div className="page-header">
        <h1 className="page-title">Svjetsko prvenstvo — gdje gledati</h1>
        <div className="page-stats">
          <span>{flagged.length} lokacija</span>
          <span className="stat-green">{matches.filter((m) => m.is_active).length} aktivnih utakmica</span>
        </div>
      </div>

      {msg && <div className={msg.startsWith('Greška') ? 'error' : 'success'} style={{ marginBottom: 12 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Where to watch */}
        <div>
          <h3 style={{ marginTop: 0 }}>Lokacije za gledanje</h3>

          <div className="filters" style={{ marginBottom: 12 }}>
            <input
              className="edit-input"
              style={{ flex: 1 }}
              placeholder="Pretraži lokacije za dodati..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
            />
            <button className="page-btn" onClick={runSearch} disabled={searching}>
              {searching ? 'Tražim...' : 'Traži'}
            </button>
          </div>

          {results.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: 13 }}>Rezultati pretrage</strong>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {results.map((v) => (
                  <div key={v.id} style={rowStyle}>
                    <div style={{ minWidth: 0 }}>
                      <div style={titleStyle}>{v.name}</div>
                      <div style={metaStyle}>{v.neighborhood ?? '—'}</div>
                    </div>
                    {v.is_watch_party_venue ? (
                      <span className="badge" style={{ background: '#22C55E', color: '#000' }}>✓ Dodano</span>
                    ) : (
                      <button className="page-btn" onClick={() => setFlag(v, true)}>+ Dodaj</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : flagged.length === 0 ? (
            <div className="empty-state">Nijedna lokacija nije označena. Pretraži i dodaj. ⚽</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {flagged.map((v) => (
                <div key={v.id} style={{ ...rowStyle, flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      <div style={metaStyle}>{v.neighborhood ?? '—'}</div>
                    </div>
                    <button className="ban-btn" onClick={() => setFlag(v, false)}>Ukloni</button>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="edit-input"
                      placeholder="Napomena BS (npr. veliki ekran, terasa)"
                      value={v.watch_party_note_bs ?? ''}
                      onChange={(e) => updateFlagged(v.id, { watch_party_note_bs: e.target.value })}
                    />
                    <input
                      className="edit-input"
                      placeholder="Note EN"
                      value={v.watch_party_note_en ?? ''}
                      onChange={(e) => updateFlagged(v.id, { watch_party_note_en: e.target.value })}
                    />
                    <button className="page-btn" style={{ flexShrink: 0 }} onClick={() => saveNote(v)}>Sačuvaj</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matches */}
        <div>
          <h3 style={{ marginTop: 0 }}>Utakmice BiH</h3>
          <p style={{ color: '#A0A0A0', fontSize: 12, marginTop: 0 }}>
            Utakmice su događaji s oznakom <code>bih-match</code>. Detalje (protivnik, vrijeme) uredi u <strong>Događaji</strong>; ovdje uključi/isključi vidljivost.
          </p>
          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : matches.length === 0 ? (
            <div className="empty-state">Nema utakmica s oznakom bih-match.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {matches.map((m) => (
                <div key={m.id} style={rowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={titleStyle}>{m.title_bs || m.title_en || '(bez naslova)'}</div>
                    <div style={metaStyle}>{fmtKick(m.start_datetime)}</div>
                  </div>
                  <label className="toggle" style={{ flexShrink: 0 }}>
                    <input type="checkbox" checked={!!m.is_active} onChange={() => toggleMatchActive(m)} />
                    Aktivna
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8, padding: '10px 12px',
};
const titleStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const metaStyle: React.CSSProperties = { fontSize: 11, color: '#A0A0A0' };
