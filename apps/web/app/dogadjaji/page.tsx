import type { Metadata } from 'next';
import { listUpcomingEvents, getEventTitle } from '@look/shared';
import { getServerSupabase } from '@/lib/supabase-server';
import { EventListView } from './event-list-view';

export const metadata: Metadata = {
  title: 'Događaji u Sarajevu · Look',
  description: 'Koncerti, pozorište, izložbe i nightlife u Sarajevu — sortirano po datumu.',
  alternates: {
    canonical: '/dogadjaji',
    languages: { 'bs-BA': '/dogadjaji', en: '/en/events' },
  },
  openGraph: {
    title: 'Događaji u Sarajevu · Look',
    description: 'Koncerti, pozorište, izložbe i nightlife u Sarajevu.',
    locale: 'bs_BA',
    type: 'website',
  },
};

export const revalidate = 300;

export default async function EventsListPage() {
  const supabase = await getServerSupabase();
  const events = await listUpcomingEvents(supabase, 100);

  const cards = events.map((e) => ({
    slug: e.slug,
    title: getEventTitle(e, 'bs'),
    category: e.category,
    start_datetime: e.start_datetime,
    cover_image_url: e.cover_image_url,
    venue_name: e.location_name,
  }));

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 40, color: '#F5F5F5', marginBottom: 8 }}>
        Događaji
      </h1>
      <p style={{ color: '#A1A1AA', marginBottom: 32 }}>
        {events.length} predstojećih · sortirano po datumu
      </p>
      <EventListView events={cards} />
    </main>
  );
}
