// Universal venue-detail screen. Composed entirely of Phase 1 primitives so
// the same source renders on web (Next.js RSC) and mobile (Expo). Phase 4
// will iterate on this with more sections (hours grid, events rail, etc.);
// for Phase 2 we ship the hero + identity + description + insider tip + meta
// — enough to prove cross-platform parity end-to-end.

import * as React from 'react';
import { Box, Card, Heading, Image, Link, Stack, Text } from './components';

export interface VenueDetailInput {
  name: string;
  slug: string;
  category: string;
  neighborhood: string | null;
  address: string | null;
  cover_image_url: string | null;
  description: string | null;
  insider_tip: string | null;
  moods: string[] | null;
  google_rating: number | null;
  google_ratings_count: number | null;
  price_level: number | null;
  phone: string | null;
  website: string | null;
  instagram_handle: string | null;
  is_hidden_gem: boolean;
}

export interface VenueDetailContentProps {
  venue: VenueDetailInput;
  language?: 'bs' | 'en';
}

function priceDots(level: number | null): string {
  if (!level || level < 1) return '';
  return '€'.repeat(Math.min(level, 4));
}

export const VenueDetailContent: React.FC<VenueDetailContentProps> = ({ venue, language = 'bs' }) => {
  const isBs = language === 'bs';
  const meta = [
    venue.neighborhood,
    venue.category,
    priceDots(venue.price_level) || null,
  ].filter(Boolean).join(' · ');

  return (
    <Box backgroundColor="$background" gap="$6" padding="$4" maxWidth={720} width="100%" alignSelf="center">
      {venue.cover_image_url && (
        <Image
          source={{ uri: venue.cover_image_url }}
          aspect="hero"
          width="100%"
          height={320}
          borderRadius="$image"
        />
      )}

      <Stack gap="$2">
        {venue.is_hidden_gem && (
          <Text tone="accent" size="sm">{isBs ? 'Skriveni dragulj' : 'Hidden gem'}</Text>
        )}
        <Heading level="hero">{venue.name}</Heading>
        {meta && <Text tone="muted">{meta}</Text>}
        {venue.google_rating && (
          <Text tone="muted" size="sm">
            ★ {venue.google_rating.toFixed(1)}
            {venue.google_ratings_count ? ` (${venue.google_ratings_count})` : ''}
          </Text>
        )}
      </Stack>

      {venue.description && (
        <Card gap="$3">
          <Heading level="card">{isBs ? 'O lokaciji' : 'About'}</Heading>
          <Text>{venue.description}</Text>
        </Card>
      )}

      {venue.insider_tip && (
        <Card gap="$3" backgroundColor="$backgroundCard" borderColor="$accent">
          <Heading level="card">{isBs ? 'Savjet insajdera' : 'Insider tip'}</Heading>
          <Text>{venue.insider_tip}</Text>
        </Card>
      )}

      {(venue.address || venue.phone || venue.website || venue.instagram_handle) && (
        <Card gap="$3">
          <Heading level="card">{isBs ? 'Kontakt' : 'Contact'}</Heading>
          {venue.address && (
            <Stack gap="$1">
              <Text tone="muted" size="sm">{isBs ? 'Adresa' : 'Address'}</Text>
              <Text>{venue.address}</Text>
            </Stack>
          )}
          {venue.phone && (
            <Stack gap="$1">
              <Text tone="muted" size="sm">{isBs ? 'Telefon' : 'Phone'}</Text>
              <Link href={`tel:${venue.phone}`}>{venue.phone}</Link>
            </Stack>
          )}
          {venue.website && (
            <Stack gap="$1">
              <Text tone="muted" size="sm">{isBs ? 'Web' : 'Website'}</Text>
              <Link href={venue.website} external>{venue.website}</Link>
            </Stack>
          )}
          {venue.instagram_handle && (
            <Stack gap="$1">
              <Text tone="muted" size="sm">Instagram</Text>
              <Link href={`https://instagram.com/${venue.instagram_handle.replace(/^@/, '')}`} external>
                @{venue.instagram_handle.replace(/^@/, '')}
              </Link>
            </Stack>
          )}
        </Card>
      )}

      {venue.moods && venue.moods.length > 0 && (
        <Card gap="$3">
          <Heading level="card">{isBs ? 'Vibe' : 'Vibe'}</Heading>
          <Stack flexDirection="row" gap="$2" flexWrap="wrap">
            {venue.moods.map((m) => (
              <Box
                key={m}
                backgroundColor="$backgroundCard"
                borderRadius="$chip"
                paddingHorizontal="$3"
                paddingVertical="$1"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text size="sm" tone="muted">{m}</Text>
              </Box>
            ))}
          </Stack>
        </Card>
      )}
    </Box>
  );
};
