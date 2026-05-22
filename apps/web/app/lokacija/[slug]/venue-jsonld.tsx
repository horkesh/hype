// Schema.org LocalBusiness JSON-LD for Google rich results. Renders as an
// inline <script type="application/ld+json"> so the structured data is in
// the initial HTML, not injected after hydration. Validate via Google's
// Rich Results Test on a deployed URL.
//
// dangerouslySetInnerHTML is the documented Next.js pattern for inline
// JSON-LD; safeJsonLdString escapes < > & and the JS LSEP/PSEP code
// points that JSON.stringify alone leaves untouched — neutralizing any
// chance of script-tag breakout if a malicious admin ever lands a < in a
// venue description.

import type { Venue } from '@look/shared';

// Built via String.fromCharCode so the source file never contains the raw
// U+2028 / U+2029 line-terminator code points — which crash some parsers
// and confuse the IDE.
const LSEP_REGEX = new RegExp(String.fromCharCode(0x2028), 'g');
const PSEP_REGEX = new RegExp(String.fromCharCode(0x2029), 'g');

function safeJsonLdString(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LSEP_REGEX, '\\u2028')
    .replace(PSEP_REGEX, '\\u2029');
}

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
  const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdString(cleaned) }}
    />
  );
}
