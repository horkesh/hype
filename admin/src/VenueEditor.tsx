import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

interface Venue {
  id: string;
  name: string;
  category: string;
  neighborhood: string | null;
  google_rating: number | null;
  google_editorial_summary: string | null;
  google_top_reviews: string[] | null;
  description_en: string | null;
  description_bs: string | null;
  cover_image_url: string | null;
}

export function VenueEditor({ onSignOut }: { onSignOut: () => void }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [needsDescFilter, setNeedsDescFilter] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editEn, setEditEn] = useState('');
  const [editBs, setEditBs] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [stats, setStats] = useState({ total: 0, withDesc: 0, withPhoto: 0 });

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('venues')
      .select('id, name, category, neighborhood, google_rating, google_editorial_summary, google_top_reviews, description_en, description_bs, cover_image_url')
      .order('name');

    if (data) {
      setVenues(data);
      setStats({
        total: data.length,
        withDesc: data.filter(v => v.description_en).length,
        withPhoto: data.filter(v => v.cover_image_url).length,
      });
    }
    if (error) console.error('Failed to fetch venues:', error.message);
    setLoading(false);
  }, []);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const categories = [...new Set(venues.map(v => v.category).filter(Boolean))].sort();

  const filtered = venues.filter(v => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && v.category !== categoryFilter) return false;
    if (needsDescFilter && v.description_en) return false;
    return true;
  });

  const selected = venues.find(v => v.id === selectedId);

  const handleSelect = (venue: Venue) => {
    setSelectedId(venue.id);
    setEditEn(venue.description_en ?? '');
    setEditBs(venue.description_bs ?? '');
    setSaveMsg('');
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase
      .from('venues')
      .update({ description_en: editEn || null, description_bs: editBs || null })
      .eq('id', selectedId);

    if (error) {
      setSaveMsg('Error: ' + error.message);
    } else {
      setSaveMsg('Saved!');
      setVenues(prev => prev.map(v =>
        v.id === selectedId
          ? { ...v, description_en: editEn || null, description_bs: editBs || null }
          : v
      ));
    }
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedId) return;
    const idx = filtered.findIndex(v => v.id === selectedId);
    if (e.key === 'ArrowDown' && idx < filtered.length - 1) {
      e.preventDefault();
      handleSelect(filtered[idx + 1]);
    }
    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      handleSelect(filtered[idx - 1]);
    }
  };

  return (
    <div className="editor" onKeyDown={handleKeyDown} tabIndex={0}>
      <header>
        <h1>Look Venue Editor</h1>
        <div className="stats">
          <span>{stats.total} venues</span>
          <span className="stat-good">{stats.withDesc} with descriptions</span>
          <span className="stat-good">{stats.withPhoto} with photos</span>
          <span className="stat-bad">{stats.total - stats.withDesc} need descriptions</span>
        </div>
        <button className="sign-out" onClick={onSignOut}>Sign Out</button>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Search venues..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search"
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="toggle">
          <input
            type="checkbox"
            checked={needsDescFilter}
            onChange={e => setNeedsDescFilter(e.target.checked)}
          />
          Needs description only
        </label>
      </div>

      <div className="main-layout">
        <div className="venue-list">
          {loading ? (
            <div className="loading">Loading venues...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>EN</th>
                  <th>BS</th>
                  <th>Photo</th>
                  <th>Reviews</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr
                    key={v.id}
                    className={`venue-row ${v.id === selectedId ? 'selected' : ''}`}
                    onClick={() => handleSelect(v)}
                  >
                    <td className="venue-name">{v.name}</td>
                    <td><span className="badge cat">{v.category}</span></td>
                    <td>{v.google_rating ? `${v.google_rating}★` : '—'}</td>
                    <td>{v.description_en ? <span className="dot green" /> : <span className="dot red" />}</td>
                    <td>{v.description_bs ? <span className="dot green" /> : <span className="dot red" />}</td>
                    <td>{v.cover_image_url ? <span className="dot green" /> : <span className="dot red" />}</td>
                    <td>{v.google_top_reviews?.length ? <span className="dot green" /> : <span className="dot gray" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="count">{filtered.length} / {venues.length} venues</div>
        </div>

        {selected && (
          <div className="edit-panel">
            <div className="edit-header">
              <h2>{selected.name}</h2>
              <span className="badge cat">{selected.category}</span>
              {selected.neighborhood && <span className="badge">{selected.neighborhood}</span>}
              {selected.google_rating && <span className="badge">{selected.google_rating}★</span>}
            </div>

            {selected.cover_image_url && (
              <img src={selected.cover_image_url} alt={selected.name} className="venue-photo" />
            )}

            {selected.google_editorial_summary && (
              <div className="google-context">
                <strong>Google says:</strong> {selected.google_editorial_summary}
              </div>
            )}

            {selected.google_top_reviews?.length ? (
              <div className="google-context">
                <strong>Top reviews:</strong>
                {selected.google_top_reviews.map((r, i) => (
                  <p key={i} className="review">"{r}"</p>
                ))}
              </div>
            ) : null}

            <div className="edit-fields">
              <div className="field">
                <label>English Description</label>
                <textarea value={editEn} onChange={e => setEditEn(e.target.value)} rows={4} />
              </div>
              <div className="field">
                <label>Bosnian Description (BS)</label>
                <textarea value={editBs} onChange={e => setEditBs(e.target.value)} rows={4} />
              </div>
            </div>

            <div className="edit-actions">
              <button onClick={handleSave} disabled={saving} className="save-btn">
                {saving ? 'Saving...' : 'Save Descriptions'}
              </button>
              {saveMsg && (
                <span className={saveMsg.startsWith('Error') ? 'error' : 'success'}>{saveMsg}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
