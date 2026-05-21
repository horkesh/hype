import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../supabase';

interface Item {
  kind: 'venue' | 'event';
  id: string;
  label: string;
  sub?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (item: Item) => void;
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function CommandPalette({ open, onClose, onSelect }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lazy-load the searchable index on first open. ~1100 venues + ~40 events
  // is fine to hold in memory; pre-normalized for fast filtering.
  const ensureLoaded = useCallback(async () => {
    if (loaded) return;
    const [venuesRes, eventsRes] = await Promise.all([
      supabase.from('venues').select('id, name, category').order('name').limit(2000),
      supabase
        .from('events')
        .select('id, title_bs, title_en, start_datetime, venues(name)')
        .order('start_datetime', { ascending: false })
        .limit(500),
    ]);
    const venueItems: Item[] = (venuesRes.data ?? []).map((v: any) => ({
      kind: 'venue',
      id: v.id,
      label: v.name,
      sub: v.category ?? undefined,
    }));
    const eventItems: Item[] = (eventsRes.data ?? []).map((e: any) => ({
      kind: 'event',
      id: e.id,
      label: e.title_bs || e.title_en || '(bez naslova)',
      sub: [
        e.start_datetime ? new Date(e.start_datetime).toLocaleDateString('bs-BA') : null,
        e.venues?.name ?? null,
      ].filter(Boolean).join(' · ') || undefined,
    }));
    setItems([...venueItems, ...eventItems]);
    setLoaded(true);
  }, [loaded]);

  useEffect(() => {
    if (open) {
      ensureLoaded();
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, ensureLoaded]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 30);
    const q = normalize(query.trim());
    const tokens = q.split(/\s+/);
    return items
      .map((item) => {
        const target = normalize(item.label);
        // Score: contains all tokens? Use position of first match as tiebreaker.
        let allMatch = true;
        let firstPos = Infinity;
        for (const t of tokens) {
          const pos = target.indexOf(t);
          if (pos === -1) { allMatch = false; break; }
          if (pos < firstPos) firstPos = pos;
        }
        return allMatch ? { item, score: firstPos } : null;
      })
      .filter((x): x is { item: Item; score: number } => x !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 50)
      .map((x) => x.item);
  }, [items, query]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && filtered[activeIdx]) {
      e.preventDefault();
      onSelect(filtered[activeIdx]);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 96,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          width: '90%',
          maxWidth: 640,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pretraži lokacije i događaje..."
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: 16,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {!loaded ? (
            <div className="loading" style={{ padding: 24, textAlign: 'center' }}>Učitavanje...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 24, color: '#A0A0A0', fontSize: 13, textAlign: 'center' }}>
              {query ? 'Nema rezultata.' : 'Počni kucati za pretragu.'}
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={`${item.kind}:${item.id}`}
                  onClick={() => { onSelect(item); onClose(); }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 20px',
                    background: isActive ? 'rgba(212,160,86,0.12)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#fff',
                    fontFamily: 'inherit',
                    borderLeft: isActive ? '3px solid #D4A056' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: item.kind === 'venue' ? 'rgba(96,165,250,0.15)' : 'rgba(212,160,86,0.15)',
                        color: item.kind === 'venue' ? '#60A5FA' : '#D4A056',
                      }}
                    >
                      {item.kind === 'venue' ? 'Lokacija' : 'Događaj'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                  </div>
                  {item.sub && (
                    <div style={{ fontSize: 12, color: '#A0A0A0', paddingLeft: 56 }}>{item.sub}</div>
                  )}
                </button>
              );
            })
          )}
        </div>
        <div
          style={{
            padding: '8px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11,
            color: '#A0A0A0',
            display: 'flex',
            gap: 16,
          }}
        >
          <span>↑↓ kretanje</span>
          <span>↵ otvori</span>
          <span>Esc zatvori</span>
        </div>
      </div>
    </div>
  );
}
