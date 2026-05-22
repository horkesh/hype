import type { Metadata } from 'next';
import { listActiveVenues } from '@look/shared';
import { getServerSupabase } from '@/lib/supabase-server';
import { VenueListView } from './venue-list-view';

export const metadata: Metadata = {
  title: 'Lokacije u Sarajevu · Look',
  description: 'Otkrij najbolje kafiće, restorane, barove, klubove i kulturna mjesta u Sarajevu.',
  alternates: {
    canonical: '/lokacije',
    languages: { 'bs-BA': '/lokacije', en: '/en/venues' },
  },
  openGraph: {
    title: 'Lokacije u Sarajevu · Look',
    description: 'Otkrij najbolje kafiće, restorane, barove i klubove u Sarajevu.',
    locale: 'bs_BA',
    type: 'website',
  },
};

export const revalidate = 3600;

export default async function VenuesListPage() {
  const supabase = await getServerSupabase();
  const venues = await listActiveVenues(supabase, { limit: 120 });

  const cards = venues.map((v) => ({
    slug: v.slug,
    name: v.name,
    category: v.category,
    neighborhood: v.neighborhood,
    cover_image_url: v.cover_image_url,
    google_rating: v.google_rating,
    is_hidden_gem: v.is_hidden_gem,
  }));

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 40, color: '#F5F5F5', marginBottom: 8 }}>
        Lokacije
      </h1>
      <p style={{ color: '#A1A1AA', marginBottom: 32 }}>
        {venues.length} mjesta · sortirano po Google ocjeni
      </p>
      <VenueListView venues={cards} />
    </main>
  );
}
