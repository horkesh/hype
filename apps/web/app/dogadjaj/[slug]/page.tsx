import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlug, getEventDescription, getEventTitle, getVenueById } from '@look/shared';
import { getServerSupabase } from '@/lib/supabase-server';
import { EventJsonLd } from './event-jsonld';
import { EventView } from './event-view';

interface Params { slug: string }

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await getServerSupabase();
  const event = await getEventBySlug(supabase, slug);
  if (!event) return { title: 'Događaj nije pronađen · Look' };

  const title = getEventTitle(event, 'bs');
  const description = getEventDescription(event, 'bs') ?? `${title} u Sarajevu.`;

  return {
    title: `${title} · Look Sarajevo`,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 200),
      images: event.cover_image_url ? [{ url: event.cover_image_url }] : undefined,
      locale: 'bs_BA',
      type: 'article',
    },
    twitter: {
      card: event.cover_image_url ? 'summary_large_image' : 'summary',
      title,
      description: description.slice(0, 200),
      images: event.cover_image_url ? [event.cover_image_url] : undefined,
    },
    alternates: {
      canonical: `/dogadjaj/${slug}`,
      languages: { 'bs-BA': `/dogadjaj/${slug}`, 'en': `/en/event/${slug}` },
    },
  };
}

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await getServerSupabase();
  const event = await getEventBySlug(supabase, slug);
  if (!event) notFound();

  // Resolve venue identity for JSON-LD Place + the visible "Lokacija" line.
  const venue = event.venue_id ? await getVenueById(supabase, event.venue_id) : null;
  const title = getEventTitle(event, 'bs');
  const description = getEventDescription(event, 'bs');

  return (
    <>
      <EventJsonLd event={event} venueName={venue?.name ?? null} venueAddress={venue?.address ?? null} />
      <EventView
        event={{
          slug: event.slug,
          title,
          description,
          start_datetime: event.start_datetime,
          category: event.category,
          cover_image_url: event.cover_image_url,
          ticket_url: event.ticket_url,
          venue_name: venue?.name ?? null,
          venue_slug: venue?.slug ?? null,
          location_name: event.location_name,
        }}
        language="bs"
      />
    </>
  );
}
