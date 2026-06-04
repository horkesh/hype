import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { ErrorBanner } from '../components/ErrorBanner';
import { withTimeout } from '../lib/withTimeout';

const QUERY_TIMEOUT_MS = 15_000;

// event_series.category enum (live DB).
const SERIES_CATEGORIES = [
  'music', 'food', 'culture', 'sport', 'nightlife', 'art', 'film',
  'theatre', 'festival', 'market', 'workshop', 'charity', 'other',
] as const;

const SERIES_KINDS = [
  { value: 'festival', label: 'Festival (vrh)' },
  { value: 'program', label: 'Program / track (dijete)' },
  { value: 'collection', label: 'Kolekcija' },
] as const;

interface Series {
  id: string;
  name_bs: string;
  name_en: string | null;
  slug: string;
  description_bs: string | null;
  description_en: string | null;
  category: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  start_date: string;
  end_date: string;
  website_url: string | null;
  ticket_url: string | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  is_major: boolean | null;
  home_priority: number | null;
  series_kind: string | null;
  parent_series_id: string | null;
  track_label_bs: string | null;
  track_label_en: string | null;
  venue_area_bs: string | null;
  venue_area_en: string | null;
}

const SELECT_COLS =
  'id, name_bs, name_en, slug, description_bs, description_en, category, cover_image_url, logo_url, ' +
  'start_date, end_date, website_url, ticket_url, is_featured, is_active, is_major, home_priority, ' +
  'series_kind, parent_series_id, track_label_bs, track_label_en, venue_area_bs, venue_area_en';

const EMPTY_DRAFT: Series = {
  id: '',
  name_bs: '',
  name_en: null,
  slug: '',
  description_bs: null,
  description_en: null,
  category: 'festival',
  cover_image_url: null,
  logo_url: null,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  website_url: null,
  ticket_url: null,
  is_featured: false,
  is_active: true,
  is_major: false,
  home_priority: null,
  series_kind: 'festival',
  parent_series_id: null,
  track_label_bs: null,
  track_label_en: null,
  venue_area_bs: null,
  venue_area_en: null,
};

interface ProgramEvent {
  id: string;
  title_bs: string | null;
  title_en: string | null;
  start_datetime: string | null;
  series_id: string | null;
  venue_name: string | null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('bs-BA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function SeriesManagement() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Series | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [kindFilter, setKindFilter] = useState('');

  // ── Program builder state (only meaningful when a festival is selected) ──
  const [attached, setAttached] = useState<ProgramEvent[]>([]);
  const [suggestions, setSuggestions] = useState<ProgramEvent[]>([]);
  const [programLoading, setProgramLoading] = useState(false);
  const [attachTarget, setAttachTarget] = useState<string>(''); // series id to attach into
  const [programMsg, setProgramMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await withTimeout(
        supabase.from('event_series').select(SELECT_COLS).order('start_date', { ascending: false }),
        QUERY_TIMEOUT_MS,
        'event_series',
      );
      if (qError) { setError(qError.message); return; }
      const rows = (data ?? []) as unknown as Series[];
      setSeries(rows);

      const ids = rows.map((s) => s.id);
      if (ids.length > 0) {
        const { data: countData } = await supabase.from('events').select('series_id').in('series_id', ids);
        const counts: Record<string, number> = {};
        (countData ?? []).forEach((row: any) => {
          if (row.series_id) counts[row.series_id] = (counts[row.series_id] ?? 0) + 1;
        });
        setEventCounts(counts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Children (tracks) of the currently-selected festival.
  const children = useMemo(
    () => (draft && selectedId !== 'new' ? series.filter((s) => s.parent_series_id === draft.id) : []),
    [series, draft, selectedId],
  );

  // Parent options for a "program" series = all festivals/collections (not itself).
  const parentOptions = useMemo(
    () => series.filter((s) => s.series_kind !== 'program' && s.id !== draft?.id),
    [series, draft],
  );

  // Load the program (attached events + in-window unassigned suggestions) for a festival.
  const loadProgram = useCallback(async (festival: Series, childIds: string[]) => {
    setProgramLoading(true);
    setProgramMsg('');
    const memberIds = [festival.id, ...childIds];
    try {
      const [{ data: att }, { data: sugg }] = await Promise.all([
        supabase
          .from('events')
          .select('id, title_bs, title_en, start_datetime, series_id, venues(name)')
          .in('series_id', memberIds)
          .order('start_datetime', { ascending: true }),
        supabase
          .from('events')
          .select('id, title_bs, title_en, start_datetime, series_id, venues(name)')
          .is('series_id', null)
          .eq('is_active', true)
          .gte('start_datetime', festival.start_date + 'T00:00:00')
          .lte('start_datetime', festival.end_date + 'T23:59:59')
          .order('start_datetime', { ascending: true })
          .limit(100),
      ]);
      const norm = (r: any): ProgramEvent => ({
        id: r.id, title_bs: r.title_bs, title_en: r.title_en,
        start_datetime: r.start_datetime, series_id: r.series_id,
        venue_name: r.venues?.name ?? null,
      });
      setAttached((att ?? []).map(norm));
      setSuggestions((sugg ?? []).map(norm));
    } catch (err) {
      setProgramMsg('Greška pri učitavanju programa: ' + (err instanceof Error ? err.message : String(err)));
    }
    setProgramLoading(false);
  }, []);

  const handleSelect = (s: Series) => {
    setSelectedId(s.id);
    setDraft({ ...s });
    setMsg('');
    setAttached([]); setSuggestions([]); setProgramMsg('');
    setAttachTarget(s.id);
    if (s.series_kind === 'festival') {
      const childIds = series.filter((c) => c.parent_series_id === s.id).map((c) => c.id);
      void loadProgram(s, childIds);
    }
  };

  const handleNew = (preset?: Partial<Series>) => {
    setSelectedId('new');
    setDraft({ ...EMPTY_DRAFT, ...preset });
    setMsg('');
    setAttached([]); setSuggestions([]); setProgramMsg('');
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setMsg('');
    const isNew = selectedId === 'new';

    const slug = draft.slug || slugify(draft.name_bs);
    if (!draft.name_bs.trim() || !slug) {
      setMsg('Greška: naziv (BS) je obavezan.');
      setSaving(false);
      return;
    }

    const isProgram = draft.series_kind === 'program';
    const payload = {
      name_bs: draft.name_bs,
      name_en: draft.name_en || null,
      slug,
      description_bs: draft.description_bs || null,
      description_en: draft.description_en || null,
      category: draft.category || 'festival',
      cover_image_url: draft.cover_image_url || null,
      logo_url: draft.logo_url || null,
      start_date: draft.start_date,
      end_date: draft.end_date,
      website_url: draft.website_url || null,
      ticket_url: draft.ticket_url || null,
      is_featured: !!draft.is_featured,
      is_active: !!draft.is_active,
      is_major: !!draft.is_major,
      home_priority: draft.home_priority === null || Number.isNaN(draft.home_priority) ? null : draft.home_priority,
      series_kind: draft.series_kind || 'festival',
      parent_series_id: isProgram ? (draft.parent_series_id || null) : null,
      track_label_bs: isProgram ? (draft.track_label_bs || null) : null,
      track_label_en: isProgram ? (draft.track_label_en || null) : null,
      venue_area_bs: draft.venue_area_bs || null,
      venue_area_en: draft.venue_area_en || null,
    };

    if (isNew) {
      const { data, error: qError } = await supabase.from('event_series').insert(payload).select('id').single();
      if (qError) { setMsg('Greška: ' + qError.message); }
      else if (data) { setMsg('Kreirano!'); await load(); setSelectedId((data as any).id); setDraft({ ...draft, id: (data as any).id }); }
    } else {
      const { error: qError } = await supabase.from('event_series').update(payload).eq('id', draft.id);
      if (qError) { setMsg('Greška: ' + qError.message); }
      else {
        setMsg('Sačuvano!');
        setSeries((prev) => prev.map((s) => (s.id === draft.id ? { ...s, ...payload } as Series : s)));
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!draft || selectedId === 'new') return;
    const childCount = children.length;
    const eventCount = eventCounts[draft.id] ?? 0;
    const warn = [
      childCount > 0 ? `${childCount} program(a)/track-ova` : '',
      eventCount > 0 ? `${eventCount} događaja` : '',
    ].filter(Boolean).join(' i ');
    const confirmMsg = warn
      ? `Ova serija ima ${warn} koji će ostati bez serije/roditelja. Sigurno obrisati?`
      : `Obrisati seriju "${draft.name_bs}"?`;
    if (!confirm(confirmMsg)) return;
    setSaving(true);
    const { error: qError } = await supabase.from('event_series').delete().eq('id', draft.id);
    if (qError) { setMsg('Greška: ' + qError.message); }
    else { setSeries((prev) => prev.filter((s) => s.id !== draft.id)); setSelectedId(null); setDraft(null); }
    setSaving(false);
  };

  const update = (patch: Partial<Series>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : null));
    setMsg('');
  };

  // ── Program builder actions ──
  const refreshProgram = async () => {
    if (!draft) return;
    const childIds = series.filter((c) => c.parent_series_id === draft.id).map((c) => c.id);
    await loadProgram(draft, childIds);
    // refresh attached counts for the festival + children
    const ids = [draft.id, ...childIds];
    const { data: countData } = await supabase.from('events').select('series_id').in('series_id', ids);
    const counts: Record<string, number> = { ...eventCounts };
    ids.forEach((id) => (counts[id] = 0));
    (countData ?? []).forEach((row: any) => { if (row.series_id) counts[row.series_id] = (counts[row.series_id] ?? 0) + 1; });
    setEventCounts(counts);
  };

  const attachEvent = async (eventId: string) => {
    const target = attachTarget || draft?.id;
    if (!target) return;
    setProgramMsg('');
    const { error: e } = await supabase.from('events').update({ series_id: target }).eq('id', eventId);
    if (e) { setProgramMsg('Greška: ' + e.message); return; }
    await refreshProgram();
  };

  const detachEvent = async (eventId: string) => {
    setProgramMsg('');
    const { error: e } = await supabase.from('events').update({ series_id: null }).eq('id', eventId);
    if (e) { setProgramMsg('Greška: ' + e.message); return; }
    await refreshProgram();
  };

  const trackName = (id: string | null): string => {
    if (!id || !draft) return '—';
    if (id === draft.id) return draft.name_bs + ' (festival)';
    const c = series.find((s) => s.id === id);
    return c ? (c.track_label_bs || c.name_bs) : '—';
  };

  const visibleSeries = kindFilter ? series.filter((s) => (s.series_kind ?? 'festival') === kindFilter) : series;

  return (
    <div className="page">
      {error && <ErrorBanner error={error} onRetry={load} />}

      <div className="page-header">
        <h1 className="page-title">Festivali & serije</h1>
        <div className="page-stats">
          <span>{series.length} serija</span>
          <span className="stat-green">{series.filter((s) => s.is_active).length} aktivnih</span>
          <span className="stat-orange">{series.filter((s) => s.is_major).length} major</span>
        </div>
      </div>

      <div className="filters">
        <button className="save-btn" onClick={() => handleNew()}>+ Novi festival / serija</button>
        <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
          <option value="">Sve vrste</option>
          {SERIES_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
        <button className="page-btn" onClick={load} disabled={loading}>
          {loading ? 'Učitavanje...' : 'Osvježi'}
        </button>
      </div>

      <div className="main-layout">
        <div className="venue-list">
          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : visibleSeries.length === 0 ? (
            <div className="empty-state">Nema serija. Kreiraj prvu! 🎪</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Naziv</th>
                  <th>Vrsta</th>
                  <th>Datumi</th>
                  <th>Događaji</th>
                  <th>Major</th>
                  <th>Aktivna</th>
                </tr>
              </thead>
              <tbody>
                {visibleSeries.map((s) => (
                  <tr
                    key={s.id}
                    className={`venue-row ${s.id === selectedId ? 'selected' : ''}`}
                    onClick={() => handleSelect(s)}
                  >
                    <td className="venue-name">
                      {s.parent_series_id ? <span style={{ color: '#666' }}>↳ </span> : null}
                      {s.name_bs}
                    </td>
                    <td><span className="badge cat">{s.series_kind ?? 'festival'}</span></td>
                    <td className="muted-cell">{s.start_date} → {s.end_date}</td>
                    <td className="muted-cell">{eventCounts[s.id] ?? 0}</td>
                    <td>{s.is_major ? <span style={{ color: '#D4A056', fontWeight: 700 }}>★</span> : <span className="dot gray" />}</td>
                    <td>{s.is_active ? <span className="curated-check">✓</span> : <span className="dot red" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {draft && (
          <div className="edit-panel">
            <div className="edit-header">
              <h2>{selectedId === 'new' ? 'Nova serija' : draft.name_bs || '(bez naziva)'}</h2>
              <div className="edit-header-meta">
                <span className="badge cat">{draft.series_kind ?? 'festival'}</span>
                {draft.is_major && <span className="badge" style={{ background: '#D4A056', color: '#000' }}>★ Major</span>}
                {draft.is_featured && <span className="badge">Istaknuto</span>}
                {!draft.is_active && <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>Neaktivna</span>}
              </div>
            </div>

            <div className="edit-fields">
              <div className="field-row">
                <div className="field">
                  <label>Naziv (BS)</label>
                  <input className="edit-input" value={draft.name_bs} onChange={(e) => update({ name_bs: e.target.value })} />
                </div>
                <div className="field">
                  <label>Name (EN)</label>
                  <input className="edit-input" value={draft.name_en ?? ''} onChange={(e) => update({ name_en: e.target.value })} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Vrsta</label>
                  <select className="edit-input" value={draft.series_kind ?? 'festival'} onChange={(e) => update({ series_kind: e.target.value })}>
                    {SERIES_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Kategorija</label>
                  <select className="edit-input" value={draft.category ?? 'festival'} onChange={(e) => update({ category: e.target.value })}>
                    {SERIES_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Program/track parenting */}
              {draft.series_kind === 'program' && (
                <div className="field-row">
                  <div className="field">
                    <label>Roditelj (festival)</label>
                    <select className="edit-input" value={draft.parent_series_id ?? ''} onChange={(e) => update({ parent_series_id: e.target.value || null })}>
                      <option value="">— odaberi festival —</option>
                      {parentOptions.map((p) => <option key={p.id} value={p.id}>{p.name_bs}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Track oznaka (BS / EN)</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="edit-input" placeholder="Žurke" value={draft.track_label_bs ?? ''} onChange={(e) => update({ track_label_bs: e.target.value })} />
                      <input className="edit-input" placeholder="Parties" value={draft.track_label_en ?? ''} onChange={(e) => update({ track_label_en: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              <div className="field-row">
                <div className="field">
                  <label>Slug</label>
                  <input className="edit-input" value={draft.slug} onChange={(e) => update({ slug: e.target.value })} placeholder={slugify(draft.name_bs)} />
                </div>
                <div className="field">
                  <label>Home prioritet (manji = više)</label>
                  <input
                    type="number"
                    className="edit-input"
                    value={draft.home_priority ?? ''}
                    onChange={(e) => update({ home_priority: e.target.value === '' ? null : Number(e.target.value) })}
                    placeholder="npr. 1"
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Početak</label>
                  <input type="date" className="edit-input" value={draft.start_date} onChange={(e) => update({ start_date: e.target.value })} />
                </div>
                <div className="field">
                  <label>Kraj</label>
                  <input type="date" className="edit-input" value={draft.end_date} onChange={(e) => update({ end_date: e.target.value })} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Lokacija / područje (BS)</label>
                  <input className="edit-input" value={draft.venue_area_bs ?? ''} onChange={(e) => update({ venue_area_bs: e.target.value })} placeholder="npr. Vilsonovo šetalište" />
                </div>
                <div className="field">
                  <label>Area (EN)</label>
                  <input className="edit-input" value={draft.venue_area_en ?? ''} onChange={(e) => update({ venue_area_en: e.target.value })} />
                </div>
              </div>

              <div className="field">
                <label>Opis (BS)</label>
                <textarea value={draft.description_bs ?? ''} onChange={(e) => update({ description_bs: e.target.value })} rows={3} />
              </div>
              <div className="field">
                <label>Description (EN)</label>
                <textarea value={draft.description_en ?? ''} onChange={(e) => update({ description_en: e.target.value })} rows={3} />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Website URL</label>
                  <input type="url" className="edit-input" value={draft.website_url ?? ''} onChange={(e) => update({ website_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="field">
                  <label>Ticket URL</label>
                  <input type="url" className="edit-input" value={draft.ticket_url ?? ''} onChange={(e) => update({ ticket_url: e.target.value })} placeholder="https://..." />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Cover image URL</label>
                  <input className="edit-input" value={draft.cover_image_url ?? ''} onChange={(e) => update({ cover_image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="field">
                  <label>Logo URL</label>
                  <input className="edit-input" value={draft.logo_url ?? ''} onChange={(e) => update({ logo_url: e.target.value })} placeholder="https://..." />
                </div>
              </div>

              <label className="toggle-field">
                <input type="checkbox" checked={!!draft.is_major} onChange={(e) => update({ is_major: e.target.checked })} />
                <span>★ Major — istakni na Home "Veliki događaji"</span>
              </label>
              <label className="toggle-field">
                <input type="checkbox" checked={!!draft.is_featured} onChange={(e) => update({ is_featured: e.target.checked })} />
                <span>Istaknuto</span>
              </label>
              <label className="toggle-field">
                <input type="checkbox" checked={!!draft.is_active} onChange={(e) => update({ is_active: e.target.checked })} />
                <span>Aktivna (vidljiva u aplikaciji)</span>
              </label>
            </div>

            <div className="edit-actions">
              <button onClick={handleSave} disabled={saving} className="save-btn">
                {saving ? 'Čuvanje...' : (selectedId === 'new' ? 'Kreiraj' : 'Sačuvaj')}
              </button>
              {selectedId !== 'new' && (
                <button onClick={handleDelete} disabled={saving} className="ban-btn">Obriši</button>
              )}
              {msg && <span className={msg.startsWith('Greška') ? 'error' : 'success'}>{msg}</span>}
            </div>

            {/* ── Program builder (festivals only, after save) ── */}
            {selectedId !== 'new' && draft.series_kind === 'festival' && (
              <div style={{ marginTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>Program festivala</h3>
                <p style={{ color: '#A0A0A0', fontSize: 12, margin: '0 0 16px' }}>
                  Tracks (programi) + svi povezani događaji. Prijedlozi su događaji u terminu festivala koji još nisu u programu — jedan klik ih dodaje.
                </p>

                {/* Tracks */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>Tracks / programi ({children.length})</strong>
                    <button
                      className="page-btn"
                      onClick={() => handleNew({
                        series_kind: 'program',
                        parent_series_id: draft.id,
                        category: draft.category,
                        start_date: draft.start_date,
                        end_date: draft.end_date,
                        is_active: true,
                      })}
                    >
                      + Novi track
                    </button>
                  </div>
                  {children.length === 0 ? (
                    <div style={{ color: '#666', fontSize: 12 }}>Nema track-ova. (Npr. SFF → "Žurke / Parties".)</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {children.map((c) => (
                        <button key={c.id} className="badge" style={{ cursor: 'pointer' }} onClick={() => handleSelect(c)}>
                          {c.track_label_bs || c.name_bs} · {eventCounts[c.id] ?? 0}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {programMsg && <div className={programMsg.startsWith('Greška') ? 'error' : 'success'} style={{ marginBottom: 8 }}>{programMsg}</div>}

                {/* Attach target picker */}
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Dodaj događaje u:</label>
                  <select className="edit-input" value={attachTarget} onChange={(e) => setAttachTarget(e.target.value)}>
                    <option value={draft.id}>{draft.name_bs} (festival)</option>
                    {children.map((c) => <option key={c.id} value={c.id}>{c.track_label_bs || c.name_bs}</option>)}
                  </select>
                </div>

                {programLoading ? (
                  <div className="loading">Učitavanje programa...</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Suggestions (unassigned, in window) */}
                    <div>
                      <strong style={{ fontSize: 13 }}>Prijedlozi u terminu ({suggestions.length})</strong>
                      <div style={{ marginTop: 8, maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {suggestions.length === 0 ? (
                          <div style={{ color: '#666', fontSize: 12 }}>Nema neraspoređenih događaja u ovom terminu.</div>
                        ) : suggestions.map((ev) => (
                          <div key={ev.id} style={rowStyle}>
                            <div style={{ minWidth: 0 }}>
                              <div style={evTitleStyle}>{ev.title_bs || ev.title_en || '(bez naslova)'}</div>
                              <div style={evMetaStyle}>{fmtDateTime(ev.start_datetime)}{ev.venue_name ? ` · ${ev.venue_name}` : ''}</div>
                            </div>
                            <button className="page-btn" style={{ flexShrink: 0 }} onClick={() => attachEvent(ev.id)}>+ Dodaj</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Attached program */}
                    <div>
                      <strong style={{ fontSize: 13 }}>U programu ({attached.length})</strong>
                      <div style={{ marginTop: 8, maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {attached.length === 0 ? (
                          <div style={{ color: '#666', fontSize: 12 }}>Još nema povezanih događaja.</div>
                        ) : attached.map((ev) => (
                          <div key={ev.id} style={rowStyle}>
                            <div style={{ minWidth: 0 }}>
                              <div style={evTitleStyle}>{ev.title_bs || ev.title_en || '(bez naslova)'}</div>
                              <div style={evMetaStyle}>
                                {fmtDateTime(ev.start_datetime)} · <span style={{ color: '#D4A056' }}>{trackName(ev.series_id)}</span>
                              </div>
                            </div>
                            <button className="page-btn" style={{ flexShrink: 0 }} onClick={() => detachEvent(ev.id)}>Ukloni</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8, padding: '8px 10px',
};
const evTitleStyle: React.CSSProperties = { fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const evMetaStyle: React.CSSProperties = { fontSize: 11, color: '#A0A0A0' };
