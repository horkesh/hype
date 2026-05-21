import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ErrorBanner } from '../components/ErrorBanner';
import { withTimeout } from '../lib/withTimeout';

const QUERY_TIMEOUT_MS = 15_000;

interface Series {
  id: string;
  name_bs: string;
  name_en: string | null;
  slug: string;
  description_bs: string | null;
  description_en: string | null;
  category: string | null;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
  website_url: string | null;
  ticket_url: string | null;
  is_featured: boolean | null;
  is_active: boolean | null;
}

const EMPTY_DRAFT: Series = {
  id: '',
  name_bs: '',
  name_en: null,
  slug: '',
  description_bs: null,
  description_en: null,
  category: 'music',
  cover_image_url: null,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  website_url: null,
  ticket_url: null,
  is_featured: false,
  is_active: true,
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await withTimeout(
        supabase
          .from('event_series')
          .select('id, name_bs, name_en, slug, description_bs, description_en, category, cover_image_url, start_date, end_date, website_url, ticket_url, is_featured, is_active')
          .order('start_date', { ascending: false }),
        QUERY_TIMEOUT_MS,
        'event_series',
      );
      if (qError) {
        setError(qError.message);
        return;
      }
      const rows = (data ?? []) as Series[];
      setSeries(rows);

      // Count child events per series
      const ids = rows.map((s) => s.id);
      if (ids.length > 0) {
        const { data: countData } = await supabase
          .from('events')
          .select('series_id')
          .in('series_id', ids);
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

  const handleSelect = (s: Series) => {
    setSelectedId(s.id);
    setDraft({ ...s });
    setMsg('');
  };

  const handleNew = () => {
    setSelectedId('new');
    setDraft({ ...EMPTY_DRAFT });
    setMsg('');
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

    const payload = {
      name_bs: draft.name_bs,
      name_en: draft.name_en || null,
      slug,
      description_bs: draft.description_bs || null,
      description_en: draft.description_en || null,
      category: draft.category || 'music',
      cover_image_url: draft.cover_image_url || null,
      start_date: draft.start_date,
      end_date: draft.end_date,
      website_url: draft.website_url || null,
      ticket_url: draft.ticket_url || null,
      is_featured: !!draft.is_featured,
      is_active: !!draft.is_active,
    };

    if (isNew) {
      const { data, error: qError } = await supabase
        .from('event_series')
        .insert(payload)
        .select('id')
        .single();
      if (qError) {
        setMsg('Greška: ' + qError.message);
      } else if (data) {
        setMsg('Kreirano!');
        await load();
        setSelectedId((data as any).id);
      }
    } else {
      const { error: qError } = await supabase
        .from('event_series')
        .update(payload)
        .eq('id', draft.id);
      if (qError) {
        setMsg('Greška: ' + qError.message);
      } else {
        setMsg('Sačuvano!');
        setSeries((prev) => prev.map((s) => (s.id === draft.id ? { ...s, ...payload } as Series : s)));
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!draft || selectedId === 'new') return;
    const childCount = eventCounts[draft.id] ?? 0;
    const confirmMsg = childCount > 0
      ? `Ova serija ima ${childCount} povezanih događaja koji će ostati bez serije. Sigurno obrisati?`
      : `Obrisati seriju "${draft.name_bs}"?`;
    if (!confirm(confirmMsg)) return;
    setSaving(true);
    const { error: qError } = await supabase.from('event_series').delete().eq('id', draft.id);
    if (qError) {
      setMsg('Greška: ' + qError.message);
    } else {
      setSeries((prev) => prev.filter((s) => s.id !== draft.id));
      setSelectedId(null);
      setDraft(null);
    }
    setSaving(false);
  };

  const update = (patch: Partial<Series>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : null));
    setMsg('');
  };

  return (
    <div className="page">
      {error && <ErrorBanner error={error} onRetry={load} />}

      <div className="page-header">
        <h1 className="page-title">Serije</h1>
        <div className="page-stats">
          <span>{series.length} serija</span>
          <span className="stat-green">{series.filter((s) => s.is_active).length} aktivnih</span>
        </div>
      </div>

      <div className="filters">
        <button className="save-btn" onClick={handleNew}>+ Nova serija</button>
        <button className="page-btn" onClick={load} disabled={loading}>
          {loading ? 'Učitavanje...' : 'Osvježi'}
        </button>
      </div>

      <div className="main-layout">
        <div className="venue-list">
          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : series.length === 0 ? (
            <div className="empty-state">Nema serija. Kreiraj prvu! 🎪</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Naziv</th>
                  <th>Kategorija</th>
                  <th>Datumi</th>
                  <th>Događaji</th>
                  <th>★</th>
                  <th>Aktivna</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr
                    key={s.id}
                    className={`venue-row ${s.id === selectedId ? 'selected' : ''}`}
                    onClick={() => handleSelect(s)}
                  >
                    <td className="venue-name">{s.name_bs}</td>
                    <td><span className="badge cat">{s.category}</span></td>
                    <td className="muted-cell">
                      {s.start_date} → {s.end_date}
                    </td>
                    <td className="muted-cell">{eventCounts[s.id] ?? 0}</td>
                    <td>{s.is_featured ? <span style={{ color: '#D4A056', fontWeight: 700 }}>★</span> : <span className="dot gray" />}</td>
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
                {draft.is_featured && (
                  <span className="badge" style={{ background: '#D4A056', color: '#000' }}>★ Istaknuto</span>
                )}
                {!draft.is_active && (
                  <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>Neaktivna</span>
                )}
                {selectedId !== 'new' && eventCounts[draft.id] !== undefined && (
                  <span className="badge">{eventCounts[draft.id]} događaja</span>
                )}
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
                  <label>Slug</label>
                  <input
                    className="edit-input"
                    value={draft.slug}
                    onChange={(e) => update({ slug: e.target.value })}
                    placeholder={slugify(draft.name_bs)}
                  />
                </div>
                <div className="field">
                  <label>Kategorija</label>
                  <select className="edit-input" value={draft.category ?? 'music'} onChange={(e) => update({ category: e.target.value })}>
                    <option value="music">music</option>
                    <option value="theatre">theatre</option>
                    <option value="film">film</option>
                    <option value="art">art</option>
                    <option value="culture">culture</option>
                    <option value="festival">festival</option>
                    <option value="other">other</option>
                  </select>
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

              <div className="field">
                <label>Cover image URL</label>
                <input
                  className="edit-input"
                  value={draft.cover_image_url ?? ''}
                  onChange={(e) => update({ cover_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <label className="toggle-field">
                <input type="checkbox" checked={!!draft.is_featured} onChange={(e) => update({ is_featured: e.target.checked })} />
                <span>★ Istaknuto</span>
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
                <button onClick={handleDelete} disabled={saving} className="ban-btn">
                  Obriši
                </button>
              )}
              {msg && (
                <span className={msg.startsWith('Greška') ? 'error' : 'success'}>{msg}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
