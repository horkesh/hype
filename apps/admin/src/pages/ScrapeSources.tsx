import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { ErrorBanner } from '../components/ErrorBanner';
import { withTimeout } from '../lib/withTimeout';

const QUERY_TIMEOUT_MS = 15_000;

interface Source {
  id: string;
  name: string;
  source_url: string | null;
  tier: number | null;
  scrape_config: Record<string, unknown> | null;
  frequency_hours: number | null;
  is_active: boolean | null;
  last_scraped_at: string | null;
}

function fmtAgo(iso: string | null): string {
  if (!iso) return 'nikad';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'danas';
  if (days === 1) return 'jučer';
  return `prije ${days} dana`;
}

// Normalize "@handle", "handle", or a full instagram URL to the bare username.
function parseHandle(input: string): string {
  let s = input.trim();
  const m = s.match(/instagram\.com\/([^/?#]+)/i);
  if (m) s = m[1];
  return s.replace(/^@/, '').replace(/\/+$/, '');
}

export function ScrapeSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('');
  const [showInactive, setShowInactive] = useState(true);

  // Add form
  const [newHandle, setNewHandle] = useState('');
  const [newReason, setNewReason] = useState('festival');
  const [newFreq, setNewFreq] = useState(168);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await withTimeout(
        supabase
          .from('scrape_sources')
          .select('id, name, source_url, tier, scrape_config, frequency_hours, is_active, last_scraped_at')
          .order('is_active', { ascending: false })
          .order('name'),
        QUERY_TIMEOUT_MS,
        'scrape_sources',
      );
      if (qErr) { setError(qErr.message); return; }
      setSources((data ?? []) as Source[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (s: Source) => {
    setMsg('');
    const next = !s.is_active;
    const { error: e } = await supabase.from('scrape_sources').update({ is_active: next }).eq('id', s.id);
    if (e) { setMsg('Greška: ' + e.message); return; }
    setSources((prev) => prev.map((x) => (x.id === s.id ? { ...x, is_active: next } : x)));
  };

  const saveFreq = async (s: Source, freq: number) => {
    setMsg('');
    const { error: e } = await supabase.from('scrape_sources').update({ frequency_hours: freq }).eq('id', s.id);
    if (e) { setMsg('Greška: ' + e.message); return; }
    setSources((prev) => prev.map((x) => (x.id === s.id ? { ...x, frequency_hours: freq } : x)));
    setMsg('Frekvencija ažurirana.');
  };

  const addInstagram = async () => {
    const handle = parseHandle(newHandle);
    if (!handle) { setMsg('Greška: unesi Instagram handle ili URL.'); return; }
    setAdding(true);
    setMsg('');
    const payload = {
      name: `Instagram: @${handle}`,
      source_url: `https://www.instagram.com/${handle}/`,
      tier: 1,
      frequency_hours: newFreq,
      is_active: true,
      scrape_config: {
        username: handle,
        max_posts: 10,
        parser_hint: 'instagram_caption',
        fetch_method: 'apify_instagram',
        curation_reason: newReason || 'festival',
      },
    };
    const { error: e } = await supabase.from('scrape_sources').insert(payload);
    if (e) {
      setMsg(e.message.includes('duplicate') ? 'Greška: izvor već postoji.' : 'Greška: ' + e.message);
    } else {
      setMsg(`Dodano: @${handle}`);
      setNewHandle('');
      await load();
    }
    setAdding(false);
  };

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return sources.filter((s) => {
      if (!showInactive && !s.is_active) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sources, filter, showInactive]);

  const activeCount = sources.filter((s) => s.is_active).length;

  return (
    <div className="page">
      {error && <ErrorBanner error={error} onRetry={load} />}

      <div className="page-header">
        <h1 className="page-title">Izvori (scraping)</h1>
        <div className="page-stats">
          <span>{sources.length} izvora</span>
          <span className="stat-green">{activeCount} aktivnih</span>
        </div>
      </div>

      {/* Add Instagram source */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <strong style={{ fontSize: 13 }}>Dodaj Instagram izvor</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: '2 1 240px' }}>
            <label>Handle ili URL</label>
            <input
              className="edit-input"
              placeholder="@streetfoodmarket.sa"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addInstagram(); }}
            />
          </div>
          <div className="field" style={{ flex: '1 1 120px' }}>
            <label>Razlog</label>
            <select className="edit-input" value={newReason} onChange={(e) => setNewReason(e.target.value)}>
              <option value="festival">festival</option>
              <option value="venue">venue</option>
              <option value="music">music</option>
              <option value="nightlife">nightlife</option>
              <option value="culture">culture</option>
              <option value="other">other</option>
            </select>
          </div>
          <div className="field" style={{ flex: '0 1 110px' }}>
            <label>Sati / ciklus</label>
            <input className="edit-input" type="number" value={newFreq} onChange={(e) => setNewFreq(Number(e.target.value) || 168)} />
          </div>
          <button className="save-btn" onClick={addInstagram} disabled={adding}>
            {adding ? 'Dodajem...' : '+ Dodaj'}
          </button>
        </div>
      </div>

      <div className="filters">
        <input className="edit-input" style={{ flex: 1 }} placeholder="Filtriraj po imenu..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        <label className="toggle">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          Prikaži neaktivne
        </label>
        <button className="page-btn" onClick={load} disabled={loading}>{loading ? 'Učitavanje...' : 'Osvježi'}</button>
      </div>

      {msg && <div className={msg.startsWith('Greška') ? 'error' : 'success'} style={{ marginBottom: 8 }}>{msg}</div>}

      <div className="venue-list">
        {loading ? (
          <div className="loading">Učitavanje...</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">Nema izvora.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Tier</th>
                <th>Frekvencija (h)</th>
                <th>Zadnji put</th>
                <th>Aktivan</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id} className="venue-row">
                  <td className="venue-name">
                    {s.source_url ? (
                      <a href={s.source_url} target="_blank" rel="noreferrer" style={{ color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
                        {s.name}
                      </a>
                    ) : s.name}
                  </td>
                  <td className="muted-cell">{s.tier ?? '—'}</td>
                  <td className="muted-cell">
                    <input
                      type="number"
                      defaultValue={s.frequency_hours ?? 168}
                      style={{ width: 70, padding: '2px 6px' }}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v && v !== s.frequency_hours) saveFreq(s, v);
                      }}
                    />
                  </td>
                  <td className="muted-cell">{fmtAgo(s.last_scraped_at)}</td>
                  <td>
                    <label className="toggle" style={{ margin: 0 }}>
                      <input type="checkbox" checked={!!s.is_active} onChange={() => toggleActive(s)} />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="count">{visible.length} / {sources.length} izvora</div>
      </div>
    </div>
  );
}
