import type { Metadata } from 'next';
import {
  listActiveVenues,
  listUpcomingEvents,
  getEventTitle,
} from '@look/shared';
import { getServerSupabase } from '@/lib/supabase-server';
import { HomeView } from './home-view';

export const metadata: Metadata = {
  title: 'Look · Otkrij Sarajevo',
  description: 'Lokacije, događaji i ljudi u Sarajevu.',
  alternates: {
    canonical: '/',
    languages: { 'bs-BA': '/', en: '/en' },
  },
  openGraph: {
    title: 'Look · Otkrij Sarajevo',
    description: 'Lokacije, događaji i ljudi u Sarajevu.',
    locale: 'bs_BA',
    type: 'website',
  },
};

export const revalidate = 300;

export default async function Home() {
  let venues: Awaited<ReturnType<typeof listActiveVenues>>;
  let events: Awaited<ReturnType<typeof listUpcomingEvents>>;
  try {
    const supabase = await getServerSupabase();
    [venues, events] = await Promise.all([
      listActiveVenues(supabase, { limit: 8 }),
      listUpcomingEvents(supabase, 12),
    ]);
  } catch (err) {
    console.error('[home-page] data fetch failed', err);
    const inspect = (v: unknown): string => {
      if (v === null) return 'null';
      if (typeof v !== 'object') return String(v);
      const e = v as Record<string, unknown>;
      const keys = [
        ...Object.getOwnPropertyNames(e),
        ...(typeof Object.getOwnPropertySymbols === 'function'
          ? Object.getOwnPropertySymbols(e).map((s) => s.toString())
          : []),
      ];
      const pairs = keys.map((k) => `  ${k}: ${typeof e[k] === 'object' ? JSON.stringify(e[k]) : String(e[k])}`);
      const ctor = (v as { constructor?: { name?: string } }).constructor?.name ?? 'Object';
      return `${ctor} {\n${pairs.join('\n')}\n}`;
    };
    const message = inspect(err);
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: '0 auto', color: '#F5F5F5' }}>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, color: '#EF4444' }}>
          Data fetch failed
        </h1>
        <p style={{ color: '#A1A1AA' }}>
          The home page couldn't load venues + events. Underlying error:
        </p>
        <pre style={{ background: '#1E1E1E', padding: 16, borderRadius: 8, overflow: 'auto', color: '#F5F5F5', fontSize: 13 }}>
          {message}
        </pre>
        <p style={{ color: '#A1A1AA', marginTop: 24, fontSize: 13 }}>
          Hit <a href="/api/env-check" style={{ color: '#D4A056' }}>/api/env-check</a> to see what env vars the server has.
        </p>
      </main>
    );
  }

  const venueCards = venues.map((v) => ({
    slug: v.slug,
    name: v.name,
    category: v.category,
    neighborhood: v.neighborhood,
    cover_image_url: v.cover_image_url,
    google_rating: v.google_rating,
    is_hidden_gem: v.is_hidden_gem,
  }));

  const eventCards = events.map((e) => ({
    slug: e.slug,
    title: getEventTitle(e, 'bs'),
    category: e.category,
    start_datetime: e.start_datetime,
    cover_image_url: e.cover_image_url,
    venue_name: e.location_name,
  }));

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 48, paddingTop: 24 }}>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 48, color: '#F5F5F5', margin: 0 }}>
          Look
        </h1>
        <p style={{ color: '#A1A1AA', marginTop: 8, fontSize: 18 }}>
          Otkrij Sarajevo — lokacije, događaji, ljudi.
        </p>
      </header>
      <HomeView venues={venueCards} events={eventCards} />
    </main>
  );
}
