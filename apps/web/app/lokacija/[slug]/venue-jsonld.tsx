// Schema.org LocalBusiness JSON-LD. The actual inline-script + escape
// machinery lives in @/lib/jsonld; this file only shapes the data.

import type { Venue } from '@look/shared';
import { JsonLd } from '@/lib/jsonld';

export function VenueJsonLd({ venue }: { venue: Venue }) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://look-app.com/lokacija/${venue.slug}`,
    name: venue.name,
    description: venue.description_bs ?? venue.description_en ?? undefined,
    image: venue.cover_image_url ?? undefined,
    address: venue.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: venue.address,
          addressLocality: 'Sarajevo',
          addressCountry: 'BA',
        }
      : undefined,
    geo: venue.latitude && venue.longitude
      ? { '@type': 'GeoCoordinates', latitude: venue.latitude, longitude: venue.longitude }
      : undefined,
    telephone: venue.phone ?? undefined,
    url: venue.website ?? undefined,
    aggregateRating: venue.google_rating && venue.google_ratings_count
      ? {
          '@type': 'AggregateRating',
          ratingValue: venue.google_rating,
          ratingCount: venue.google_ratings_count,
        }
      : undefined,
    priceRange: venue.price_level ? '€'.repeat(venue.price_level) : undefined,
  };

  return <JsonLd data={data} />;
}
