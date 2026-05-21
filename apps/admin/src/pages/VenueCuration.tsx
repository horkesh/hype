import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import type { UserRole } from '../hooks/useAuth';
import { ErrorBanner } from '../components/ErrorBanner';
import { ImageUpload } from '../components/ImageUpload';
import { NotesSection } from '../components/NotesSection';
import { canAdmin } from '../hooks/useAuth';
import { withTimeout } from '../lib/withTimeout';

const PAGE_SIZE = 50;
const QUERY_TIMEOUT_MS = 15_000;

// Mirror of utils/categoryLabels.ts CATEGORY_LABELS. Keep in sync when adding
// new venue categories — the Look app's getCategoryLabel() falls back to a
// pretty-printed raw value if the category isn't in its table, so a missing
// entry only affects polish, not function.
const VENUE_CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'restaurant',      label: 'Restoran' },
  { value: 'bar',             label: 'Bar' },
  { value: 'cafe',            label: 'Kafić' },
  { value: 'club',            label: 'Klub' },
  { value: 'pub',             label: 'Pub' },
  { value: 'bakery',          label: 'Pekara' },
  { value: 'fast_food',       label: 'Brza hrana' },
  { value: 'hookah',          label: 'Nargila bar' },
  { value: 'ice_cream',       label: 'Sladoled' },
  { value: 'dessert',         label: 'Slastičarna' },
  { value: 'cinema',          label: 'Kino' },
  { value: 'theatre',         label: 'Pozorište' },
  { value: 'concert_hall',    label: 'Koncertna dvorana' },
  { value: 'museum',          label: 'Muzej' },
  { value: 'gallery',         label: 'Galerija' },
  { value: 'cultural_center', label: 'Kulturni centar' },
  { value: 'park',            label: 'Park' },
  { value: 'outdoor',         label: 'Na otvorenom' },
  { value: 'landmark',        label: 'Znamenitost' },
  { value: 'spa',             label: 'Spa' },
  { value: 'wellness',        label: 'Wellness' },
];

const KNOWN_MOODS = [
  { id: 'party', label: 'Party' },
  { id: 'chill', label: 'Chill' },
  { id: 'girls_night', label: 'Girls Night' },
  { id: 'date_night', label: 'Date Night' },
  { id: 'music', label: 'Muzika' },
  { id: 'romance', label: 'Romantika' },
  { id: 'culture', label: 'Kultura' },
  { id: 'foodie', label: 'Foodie' },
  { id: 'brunch', label: 'Brunch' },
  { id: 'after_work', label: 'After Work' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'tourist', label: 'Turista' },
];

type FilterStatus = 'all' | 'curated' | 'uncurated' | 'no_bs' | 'no_en' | 'featured' | 'needs_review';
type LangTab = 'bs' | 'en';

interface Venue {
  id: string;
  name: string;
  category: string;
  neighborhood: string | null;
  address: string | null;
  instagram_handle: string | null;
  google_rating: number | null;
  cover_image_url: string | null;
  description_bs: string | null;
  description_en: string | null;
  insider_tip_bs: string | null;
  insider_tip_en: string | null;
  moods: string[] | null;
  is_hidden_gem: boolean | null;
  is_featured: boolean | null;
  is_curated: boolean;
  curator_notes: string | null;
  needs_review: boolean | null;
  review_notes: string | null;
  // cover_image_url shown directly; editable via ImageUpload
}

interface EditState {
  description_bs: string;
  description_en: string;
  insider_tip_bs: string;
  insider_tip_en: string;
  moods: string[];
  curator_notes: string;
  is_curated: boolean;
  // admin-only fields
  name: string;
  category: string;
  neighborhood: string;
  address: string;
  instagram_handle: string;
  is_hidden_gem: boolean;
  is_featured: boolean;
  needs_review: boolean;
  review_notes: string;
  cover_image_url: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const EMPTY_EDIT: EditState = {
  description_bs: '',
  description_en: '',
  insider_tip_bs: '',
  insider_tip_en: '',
  moods: [],
  curator_notes: '',
  is_curated: false,
  name: '',
  category: 'restaurant',
  neighborhood: '',
  address: '',
  instagram_handle: '',
  is_hidden_gem: false,
  is_featured: false,
  needs_review: false,
  review_notes: '',
  cover_image_url: '',
};

function venueToEdit(v: Venue): EditState {
  return {
    description_bs: v.description_bs ?? '',
    description_en: v.description_en ?? '',
    insider_tip_bs: v.insider_tip_bs ?? '',
    insider_tip_en: v.insider_tip_en ?? '',
    moods: v.moods ?? [],
    curator_notes: v.curator_notes ?? '',
    is_curated: v.is_curated ?? false,
    name: v.name,
    category: v.category,
    neighborhood: v.neighborhood ?? '',
    address: v.address ?? '',
    instagram_handle: v.instagram_handle ?? '',
    is_hidden_gem: v.is_hidden_gem ?? false,
    is_featured: v.is_featured ?? false,
    needs_review: v.needs_review ?? false,
    review_notes: v.review_notes ?? '',
    cover_image_url: v.cover_image_url ?? '',
  };
}

interface Props {
  role: UserRole;
  currentUserId: string | null;
  pendingSelectionId?: string | null;
  onPendingHandled?: () => void;
}

export function VenueCuration({ role, currentUserId, pendingSelectionId, onPendingHandled }: Props) {
  const isAdmin = canAdmin(role);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  // 250ms debounce on the search input — without this every keystroke
  // re-runs loadVenues (typing "sarajevo" = 8 queries).
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState<string[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [langTab, setLangTab] = useState<LangTab>('bs');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [dirty, setDirty] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('venues')
      .select('category, neighborhood')
      .then(({ data }) => {
        if (!data) return;
        setAllCategories([...new Set(data.map(v => v.category).filter(Boolean))].sort() as string[]);
        setAllNeighborhoods([...new Set(data.map(v => v.neighborhood).filter(Boolean))].sort() as string[]);
      });
  }, []);

  const loadVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('venues')
        .select(
          'id, name, category, neighborhood, address, instagram_handle, google_rating, cover_image_url, description_bs, description_en, insider_tip_bs, insider_tip_en, moods, is_hidden_gem, is_featured, is_curated, curator_notes, needs_review, review_notes',
          { count: 'exact' }
        )
        .order('name');

      if (debouncedSearch) query = query.ilike('name', `%${debouncedSearch}%`);
      if (categoryFilter) query = query.eq('category', categoryFilter);
      if (neighborhoodFilter) query = query.eq('neighborhood', neighborhoodFilter);
      if (statusFilter === 'curated') query = query.eq('is_curated', true);
      else if (statusFilter === 'uncurated') query = query.eq('is_curated', false);
      else if (statusFilter === 'no_bs') query = query.is('description_bs', null);
      else if (statusFilter === 'no_en') query = query.is('description_en', null);
      else if (statusFilter === 'featured') query = query.eq('is_featured', true);
      else if (statusFilter === 'needs_review') query = query.eq('needs_review', true);

      query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      const { data, count, error: qError } = await withTimeout(query, QUERY_TIMEOUT_MS, 'venues');
      if (qError) {
        setError(`Greška pri učitavanju lokacija: ${qError.message} (code: ${qError.code})`);
      } else {
        if (data) setVenues(data as Venue[]);
        setTotal(count ?? 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, [debouncedSearch, categoryFilter, neighborhoodFilter, statusFilter, page]);

  // Reset to page 0 whenever filters change
  useEffect(() => { setPage(0); }, [debouncedSearch, categoryFilter, neighborhoodFilter, statusFilter]);

  useEffect(() => { loadVenues(); }, [loadVenues]);

  // Cmd+K command palette jumps here with a pending venue ID. Fetch that row
  // directly so it can be selected even if it's not in the current filter.
  useEffect(() => {
    if (!pendingSelectionId) return;
    const inList = venues.find(v => v.id === pendingSelectionId);
    if (inList) {
      setSelectedId(inList.id);
      setEdit(venueToEdit(inList));
      setSaveMsg('');
      setDirty(false);
      onPendingHandled?.();
      return;
    }
    supabase
      .from('venues')
      .select(
        'id, name, category, neighborhood, address, instagram_handle, google_rating, cover_image_url, description_bs, description_en, insider_tip_bs, insider_tip_en, moods, is_hidden_gem, is_featured, is_curated, curator_notes, needs_review, review_notes'
      )
      .eq('id', pendingSelectionId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { onPendingHandled?.(); return; }
        const venue = data as Venue;
        setVenues(prev => [venue, ...prev]);
        setSelectedId(venue.id);
        setEdit(venueToEdit(venue));
        setSaveMsg('');
        setDirty(false);
        onPendingHandled?.();
      });
  }, [pendingSelectionId, venues, onPendingHandled]);

  const handleSelect = useCallback((venue: Venue) => {
    setSelectedId(venue.id);
    setEdit(venueToEdit(venue));
    setSaveMsg('');
    setDirty(false);
  }, []);

  const handleNew = () => {
    setSelectedId('new');
    setEdit({ ...EMPTY_EDIT });
    setSaveMsg('');
    setDirty(true);  // a new venue is implicitly "dirty" so Save is enabled
  };

  const updateEdit = (patch: Partial<EditState>) => {
    setEdit(prev => prev ? { ...prev, ...patch } : null);
    setDirty(true);
    setSaveMsg('');
  };

  const toggleMood = (moodId: string) => {
    if (!edit) return;
    const next = edit.moods.includes(moodId)
      ? edit.moods.filter(m => m !== moodId)
      : [...edit.moods, moodId];
    updateEdit({ moods: next });
  };

  const selectNext = useCallback(() => {
    if (!selectedId) return;
    const idx = venues.findIndex(v => v.id === selectedId);
    if (idx < 0) return;
    const next = venues[(idx + 1) % venues.length];
    if (next) handleSelect(next);
  }, [selectedId, venues, handleSelect]);

  const handleSave = async (opts?: { advance?: boolean }) => {
    if (!selectedId || !edit) return;
    if (!edit.name.trim()) {
      setSaveMsg('Greška: naziv je obavezan.');
      return;
    }
    setSaving(true);
    setSaveMsg('');

    const isNew = selectedId === 'new';

    const update: Record<string, unknown> = {
      name: edit.name,
      category: edit.category,
      neighborhood: edit.neighborhood || null,
      address: edit.address || null,
      instagram_handle: edit.instagram_handle || null,
      description_bs: edit.description_bs || null,
      description_en: edit.description_en || null,
      insider_tip_bs: edit.insider_tip_bs || null,
      insider_tip_en: edit.insider_tip_en || null,
      moods: edit.moods,
      curator_notes: edit.curator_notes || null,
      is_curated: edit.is_curated,
      is_hidden_gem: edit.is_hidden_gem,
      is_featured: edit.is_featured,
      needs_review: edit.needs_review,
      review_notes: edit.needs_review ? (edit.review_notes || null) : null,
      cover_image_url: edit.cover_image_url || null,
    };

    // Stamp review metadata on transitions: false → true sets requested_at/by,
    // true → false clears them. Selected reflects the row's current DB state.
    const wasFlagged = selected?.needs_review ?? false;
    if (edit.needs_review && !wasFlagged) {
      const { data: { user } } = await supabase.auth.getUser();
      update.review_requested_at = new Date().toISOString();
      update.review_requested_by = user?.id ?? null;
    } else if (!edit.needs_review && wasFlagged) {
      update.review_requested_at = null;
      update.review_requested_by = null;
    }

    if (isNew) {
      // INSERT path. Add required defaults that the UPDATE path didn't need.
      update.slug = slugify(edit.name) + '-' + Math.random().toString(36).slice(2, 8);
      update.is_active = true;
      // Initial author-of-flag on new venues created already flagged
      if (edit.needs_review && !update.review_requested_at) {
        const { data: { user } } = await supabase.auth.getUser();
        update.review_requested_at = new Date().toISOString();
        update.review_requested_by = user?.id ?? null;
      }

      const { data, error } = await supabase
        .from('venues')
        .insert(update)
        .select(
          'id, name, category, neighborhood, address, instagram_handle, google_rating, cover_image_url, description_bs, description_en, insider_tip_bs, insider_tip_en, moods, is_hidden_gem, is_featured, is_curated, curator_notes, needs_review, review_notes'
        )
        .single();

      if (error) {
        setSaveMsg('Greška: ' + error.message);
      } else if (data) {
        const created = data as Venue;
        setVenues(prev => [created, ...prev]);
        setSelectedId(created.id);
        setEdit(venueToEdit(created));
        setSaveMsg('Kreirano!');
        setDirty(false);
      }
      setSaving(false);
      return;
    }

    // Chain .select() so PostgREST returns the affected rows. RLS row-filters
    // silently — without this, an editor blocked from updating a column gets
    // {error: null, data: null}, the UI shows "Sačuvano!", and the local
    // state diverges from the server until the next reload.
    const { data, error } = await supabase
      .from('venues')
      .update(update)
      .eq('id', selectedId)
      .select()
      .maybeSingle();

    if (error) {
      setSaveMsg('Greška: ' + error.message);
    } else if (!data) {
      setSaveMsg('Greška: izmjene su odbijene (nemate ovlasti).');
    } else {
      setSaveMsg('Sačuvano!');
      setDirty(false);
      setVenues(prev => prev.map(v =>
        v.id === selectedId ? { ...v, ...(data as Venue) } : v
      ));
      if (opts?.advance) {
        // Use setTimeout so the saved indicator is briefly visible.
        setTimeout(() => selectNext(), 200);
      }
    }
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl+S works from any field
    if ((e.metaKey || e.ctrlKey) && e.key === 's' && selectedId && edit && dirty) {
      e.preventDefault();
      void handleSave();
      return;
    }
    // Arrow nav only when not typing in a field
    if (!selectedId || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
    const idx = venues.findIndex(v => v.id === selectedId);
    if (e.key === 'ArrowDown' && idx < venues.length - 1) {
      e.preventDefault();
      handleSelect(venues[idx + 1]);
    }
    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      handleSelect(venues[idx - 1]);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const selected = venues.find(v => v.id === selectedId);

  return (
    <div className="page venue-curation" onKeyDown={handleKeyDown} tabIndex={0} ref={wrapRef}>
      {error && <ErrorBanner error={error} onRetry={loadVenues} />}
      <div className="page-header">
        <h1 className="page-title">Lokacije</h1>
        <div className="page-stats">
          <span>{total} lokacija</span>
          {venues.some(v => v.is_curated) && (
            <span className="stat-green">
              {venues.filter(v => v.is_curated).length} pregledano na ovoj stranici
            </span>
          )}
        </div>
      </div>

      <div className="filters">
        <button onClick={handleNew} className="save-btn" style={{ flexShrink: 0 }}>
          + Nova lokacija
        </button>
        <input
          className="search"
          type="text"
          placeholder="Pretraži lokacije..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">Sve kategorije</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={neighborhoodFilter} onChange={e => setNeighborhoodFilter(e.target.value)}>
          <option value="">Svi kvartovi</option>
          {allNeighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as FilterStatus)}>
          <option value="all">Sve</option>
          <option value="needs_review">⚠ Za reviziju</option>
          <option value="featured">Istaknuto</option>
          <option value="uncurated">Nije pregledano</option>
          <option value="curated">Pregledano</option>
          <option value="no_bs">Nema opisa (BS)</option>
          <option value="no_en">Nema opisa (EN)</option>
        </select>
      </div>

      <div className="main-layout">
        {/* List */}
        <div className="venue-list">
          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Naziv</th>
                  <th>Kategorija</th>
                  <th>Kvart</th>
                  <th>Ocjena</th>
                  <th>BS</th>
                  <th>EN</th>
                  <th>★</th>
                  <th>✓</th>
                </tr>
              </thead>
              <tbody>
                {venues.map(v => (
                  <tr
                    key={v.id}
                    className={`venue-row ${v.id === selectedId ? 'selected' : ''}`}
                    onClick={() => handleSelect(v)}
                  >
                    <td className="venue-name">{v.name}</td>
                    <td><span className="badge cat">{v.category}</span></td>
                    <td className="muted-cell">{v.neighborhood ?? '—'}</td>
                    <td className="muted-cell">{v.google_rating ? `${v.google_rating}★` : '—'}</td>
                    <td>{v.description_bs ? <span className="dot green" /> : <span className="dot red" />}</td>
                    <td>{v.description_en ? <span className="dot green" /> : <span className="dot red" />}</td>
                    <td>
                      {v.needs_review ? <span title="Detaljnija provjera" style={{ color: '#F59E0B', fontWeight: 700 }}>⚠</span> :
                       v.is_featured ? <span style={{ color: '#D4A056', fontWeight: 700 }}>★</span> :
                       <span className="dot gray" />}
                    </td>
                    <td>{(v.is_curated ?? false) ? <span className="curated-check">✓</span> : <span className="dot gray" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                ← Prethodna
              </button>
              <span className="page-info">Stranica {page + 1} od {totalPages}</span>
              <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Sljedeća →
              </button>
            </div>
          )}
        </div>

        {/* Edit panel */}
        {(selected || selectedId === 'new') && edit && (
          <div className="edit-panel">
            {/* Header */}
            <div className="edit-header">
              <input
                className="edit-input edit-title-input"
                value={edit.name}
                onChange={e => updateEdit({ name: e.target.value })}
              />
              <div className="edit-header-meta">
                <select
                  className="edit-input"
                  value={edit.category}
                  onChange={e => updateEdit({ category: e.target.value })}
                  style={{ width: 180, cursor: 'pointer' }}
                >
                  {!VENUE_CATEGORIES.some(c => c.value === edit.category) && edit.category && (
                    <option value={edit.category}>{edit.category} (nepoznata)</option>
                  )}
                  {VENUE_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {selected?.google_rating && <span className="badge">{selected.google_rating}★</span>}
                {edit.is_hidden_gem && <span className="badge gem">Hidden gem</span>}
                {edit.is_featured && <span className="badge" style={{ background: '#D4A056', color: '#000' }}>★ Istaknuto</span>}
                {edit.needs_review && <span className="badge" style={{ background: '#F59E0B', color: '#000' }}>⚠ Za reviziju</span>}
              </div>
            </div>

            {selected && (
              <ImageUpload
                pathPrefix={selected.id}
                currentUrl={edit.cover_image_url || null}
                onUploaded={(url) => updateEdit({ cover_image_url: url })}
              />
            )}
            {!selected && selectedId === 'new' && (
              <div style={{
                background: 'rgba(212,160,86,0.06)',
                border: '1px solid rgba(212,160,86,0.2)',
                borderRadius: 10,
                padding: 12,
                fontSize: 12,
                color: '#A0A0A0',
              }}>
                Slika će biti dostupna nakon kreiranja lokacije.
              </div>
            )}

            <div className="admin-fields">
              <div className="field-row">
                <div className="field">
                  <label>Kvart</label>
                  <input
                    className="edit-input"
                    value={edit.neighborhood}
                    onChange={e => updateEdit({ neighborhood: e.target.value })}
                    placeholder="Kvart"
                  />
                </div>
                <div className="field">
                  <label>Instagram</label>
                  <input
                    className="edit-input"
                    value={edit.instagram_handle}
                    onChange={e => updateEdit({ instagram_handle: e.target.value })}
                    placeholder="@handle"
                  />
                </div>
              </div>
              <div className="field">
                <label>Adresa</label>
                <input
                  className="edit-input"
                  value={edit.address}
                  onChange={e => updateEdit({ address: e.target.value })}
                  placeholder="Adresa"
                />
              </div>
              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={edit.is_hidden_gem}
                  onChange={e => updateEdit({ is_hidden_gem: e.target.checked })}
                />
                <span>Obilježi kao hidden gem</span>
              </label>
              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={edit.is_featured}
                  onChange={e => updateEdit({ is_featured: e.target.checked })}
                />
                <span>★ Istaknuto (pojavljuje se na Home rail-u)</span>
              </label>
            </div>

            {/* Language tabs */}
            <div className="lang-tabs">
              <button
                className={`lang-tab ${langTab === 'bs' ? 'active' : ''}`}
                onClick={() => setLangTab('bs')}
                type="button"
              >
                Bosanski
              </button>
              <button
                className={`lang-tab ${langTab === 'en' ? 'active' : ''}`}
                onClick={() => setLangTab('en')}
                type="button"
              >
                English
              </button>
            </div>

            <div className="edit-fields">
              {langTab === 'bs' ? (
                <>
                  <div className="field">
                    <label>Opis (Bosanski)</label>
                    <textarea
                      value={edit.description_bs}
                      onChange={e => updateEdit({ description_bs: e.target.value })}
                      rows={5}
                      placeholder="Opis lokacije na bosanskom..."
                    />
                    <div className="char-count">{edit.description_bs.length} znakova</div>
                  </div>
                  <div className="field">
                    <label>Insajderski savjet (Bosanski)</label>
                    <textarea
                      value={edit.insider_tip_bs}
                      onChange={e => updateEdit({ insider_tip_bs: e.target.value })}
                      rows={3}
                      placeholder="Savjet za posjetitelje..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="field">
                    <label>Description (English)</label>
                    <textarea
                      value={edit.description_en}
                      onChange={e => updateEdit({ description_en: e.target.value })}
                      rows={5}
                      placeholder="Venue description in English..."
                    />
                    <div className="char-count">{edit.description_en.length} characters</div>
                  </div>
                  <div className="field">
                    <label>Insider Tip (English)</label>
                    <textarea
                      value={edit.insider_tip_en}
                      onChange={e => updateEdit({ insider_tip_en: e.target.value })}
                      rows={3}
                      placeholder="Tip for visitors..."
                    />
                  </div>
                </>
              )}

              {/* Moods */}
              <div className="field">
                <label>Raspoloženja</label>
                <div className="mood-chips">
                  {KNOWN_MOODS.map(mood => (
                    <button
                      key={mood.id}
                      type="button"
                      className={`mood-chip ${edit.moods.includes(mood.id) ? 'active' : ''}`}
                      onClick={() => toggleMood(mood.id)}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Curator notes */}
              <div className="field">
                <label>Napomene kustosa</label>
                <textarea
                  value={edit.curator_notes}
                  onChange={e => updateEdit({ curator_notes: e.target.value })}
                  rows={2}
                  placeholder="Interne napomene (nisu vidljive korisnicima)..."
                />
              </div>

              {/* Detaljnija provjera — flag for closer review */}
              <div
                className="field"
                style={{
                  background: edit.needs_review ? 'rgba(245,158,11,0.08)' : 'transparent',
                  border: edit.needs_review ? '1px solid rgba(245,158,11,0.35)' : '1px solid transparent',
                  borderRadius: 8,
                  padding: edit.needs_review ? 12 : 0,
                  marginTop: 8,
                  transition: 'all 0.2s',
                }}
              >
                <label className="toggle-field">
                  <input
                    type="checkbox"
                    checked={edit.needs_review}
                    onChange={e => updateEdit({ needs_review: e.target.checked })}
                  />
                  <span style={{ color: edit.needs_review ? '#F59E0B' : undefined, fontWeight: edit.needs_review ? 600 : undefined }}>
                    ⚠ Detaljnija provjera — sakrij iz aplikacije dok se ne provjeri
                  </span>
                </label>
                {edit.needs_review && (
                  <textarea
                    value={edit.review_notes}
                    onChange={e => updateEdit({ review_notes: e.target.value })}
                    rows={3}
                    placeholder="Šta je sumnjivo ili pogrešno? (npr. duplikat, pogrešna lokacija, sadržaj koji ne odgovara)..."
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            </div>

            {/* Notes (per-venue, admin-tier only). Hidden until the venue exists. */}
            {selected && (
              <NotesSection
                kind="venue"
                venueId={selected.id}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            )}

            {/* Actions */}
            <div className="edit-actions">
              <label className="curated-toggle">
                <input
                  type="checkbox"
                  checked={edit.is_curated}
                  onChange={e => updateEdit({ is_curated: e.target.checked })}
                />
                <span>Pregledano</span>
              </label>
              <button onClick={() => handleSave()} disabled={saving || !dirty} className="save-btn">
                {saving ? 'Čuvanje...' : (selectedId === 'new' ? 'Kreiraj' : 'Sačuvaj (⌘S)')}
              </button>
              {selectedId !== 'new' && (
                <>
                  <button
                    onClick={() => handleSave({ advance: true })}
                    disabled={saving || !dirty}
                    className="save-btn"
                    style={{ background: 'rgba(212,160,86,0.18)', color: '#D4A056', border: '1px solid rgba(212,160,86,0.4)' }}
                  >
                    Sačuvaj i sljedeća →
                  </button>
                  <button
                    onClick={selectNext}
                    disabled={saving || dirty || venues.length === 0}
                    className="page-btn"
                    title="Preskoči i idi na sljedeću (ako nema izmjena)"
                  >
                    Sljedeća →
                  </button>
                </>
              )}
              {saveMsg && (
                <span className={saveMsg.startsWith('Greška') ? 'error' : 'success'}>
                  {saveMsg}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
