// VenueCard — used in the venues list and any rail that highlights venues.
// Keeps the design system honest: same card shape on web (clickable <a>) and
// mobile (touchable surface). The href is rendered via @look/ui's <Link>
// so the platform decides whether to open via expo-router or browser nav.

import * as React from 'react';
import { Box, Card, Heading, Image, Stack, Text } from './components';

export interface VenueCardInput {
  slug: string;
  name: string;
  category: string;
  neighborhood: string | null;
  cover_image_url: string | null;
  google_rating: number | null;
  is_hidden_gem: boolean;
}

export interface VenueCardProps {
  venue: VenueCardInput;
  // Bare wrapper: the consumer decides what wraps the card (web <a href> or
  // mobile <TouchableOpacity onPress>). Keeps this component platform-pure.
  children?: React.ReactNode;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  return (
    <Card gap="$3" interactive>
      {venue.cover_image_url ? (
        <Image
          source={{ uri: venue.cover_image_url }}
          width="100%"
          height={160}
          borderRadius="$image"
          aspect="hero"
        />
      ) : (
        <Box
          width="100%"
          height={160}
          borderRadius="$image"
          backgroundColor="$cardAlt"
          alignItems="center"
          justifyContent="center"
        >
          <Text tone="dim">📍</Text>
        </Box>
      )}
      <Stack gap="$1">
        {venue.is_hidden_gem && <Text tone="accent" size="sm">Skriveni dragulj</Text>}
        <Heading level="card">{venue.name}</Heading>
        <Text tone="muted" size="sm">
          {[venue.neighborhood, venue.category].filter(Boolean).join(' · ')}
        </Text>
        {venue.google_rating != null && (
          <Text tone="muted" size="sm">★ {venue.google_rating.toFixed(1)}</Text>
        )}
      </Stack>
    </Card>
  );
};
