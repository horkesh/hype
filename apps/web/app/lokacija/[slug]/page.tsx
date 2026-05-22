import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVenueBySlug, getVenueDescription, getVenueInsiderTip } from '@look/shared';
import { getServerSupabase } from '@/lib/supabase-server';
import { VenueJsonLd } from './venue-jsonld';
import { VenueView } from './venue-view';

// Phase 2 proof-of-concept route: server-rendered venue detail. Same
// VenueDetailContent component renders on mobile via the parallel
// _phase2_demo route. Visual goal: pixel-identical output cross-platform.

interface Params { slug: string }

// ISR cache: revalidate every hour. Venue rows rarely change; when admin
// edits one, the next visitor gets fresh data within 60 min.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await getServerSupabase();
  const venue = await getVenueBySlug(supabase, slug);
  if (!venue) return { title: 'Lokacija nije pronađena · Look' };

  const description = getVenueDescription(venue, 'bs') ?? `${venue.name} u Sarajevu.`;
  const title = `${venue.name} · Look Sarajevo`;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 200),
      images: venue.cover_image_url ? [{ url: venue.cover_image_url }] : undefined,
      locale: 'bs_BA',
      type: 'website',
    },
    twitter: {
      card: venue.cover_image_url ? 'summary_large_image' : 'summary',
      title,
      description: description.slice(0, 200),
      images: venue.cover_image_url ? [venue.cover_image_url] : undefined,
    },
    alternates: {
      canonical: `/lokacija/${slug}`,
      languages: { 'bs-BA': `/lokacija/${slug}`, 'en': `/en/venue/${slug}` },
    },
  };
}

export default async function VenuePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await getServerSupabase();
  const venue = await getVenueBySlug(supabase, slug);
  if (!venue) notFound();

  const description = getVenueDescription(venue, 'bs');
  const insiderTip = getVenueInsiderTip(venue, 'bs');

  return (
    <>
      <VenueJsonLd venue={venue} />
      <VenueView
        venue={{
          name: venue.name,
          slug: venue.slug,
          category: venue.category,
          neighborhood: venue.neighborhood,
          address: venue.address,
          cover_image_url: venue.cover_image_url,
          description,
          insider_tip: insiderTip,
          moods: venue.moods,
          google_rating: venue.google_rating,
          google_ratings_count: venue.google_ratings_count,
          price_level: venue.price_level,
          phone: venue.phone,
          website: venue.website,
          instagram_handle: venue.instagram_handle,
          is_hidden_gem: venue.is_hidden_gem,
        }}
        language="bs"
      />
    </>
  );
}
