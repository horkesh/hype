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
  const supabase = await getServerSupabase();

  const [venues, events] = await Promise.all([
    listActiveVenues(supabase, { limit: 8 }),
    listUpcomingEvents(supabase, 12),
  ]);

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
