// Schema.org Event JSON-LD.

import type { Event } from '@look/shared';
import { JsonLd } from '@/lib/jsonld';

interface Props {
  event: Event;
  venueName?: string | null;
  venueAddress?: string | null;
}

export function EventJsonLd({ event, venueName, venueAddress }: Props) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': event.slug ? `https://look-app.com/dogadjaj/${event.slug}` : undefined,
    name: event.title_bs ?? event.title_en ?? undefined,
    description: event.description_bs ?? event.description_en ?? undefined,
    startDate: event.start_datetime,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: event.cover_image_url ?? undefined,
    location: venueName
      ? {
          '@type': 'Place',
          name: venueName,
          address: venueAddress
            ? {
                '@type': 'PostalAddress',
                streetAddress: venueAddress,
                addressLocality: 'Sarajevo',
                addressCountry: 'BA',
              }
            : undefined,
        }
      : event.location_name
        ? { '@type': 'Place', name: event.location_name }
        : undefined,
    offers: event.ticket_url
      ? {
          '@type': 'Offer',
          url: event.ticket_url,
          availability: 'https://schema.org/InStock',
        }
      : undefined,
  };

  return <JsonLd data={data} />;
}
