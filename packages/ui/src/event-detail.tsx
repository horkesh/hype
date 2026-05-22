// Universal event-detail screen. Composed of Phase 1 primitives so the same
// source renders on web (Next.js RSC + client view) and mobile (Expo Router).

import * as React from 'react';
import { Box, Card, Heading, Image, Link, Stack, Text } from './components';

export interface EventDetailInput {
  slug: string | null;
  title: string;
  description: string | null;
  start_datetime: string;
  category: string;
  cover_image_url: string | null;
  ticket_url: string | null;
  venue_name: string | null;
  venue_slug: string | null;
  location_name: string | null;
}

export interface EventDetailContentProps {
  event: EventDetailInput;
  language?: 'bs' | 'en';
}

const SARAJEVO_DATE_FMT_BS = new Intl.DateTimeFormat('bs-BA', {
  timeZone: 'Europe/Sarajevo',
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
const SARAJEVO_DATE_FMT_EN = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Sarajevo',
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
const SARAJEVO_TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Sarajevo',
  hour: '2-digit', minute: '2-digit', hour12: false,
});

function isMidnight(iso: string): boolean {
  const d = new Date(iso);
  return SARAJEVO_TIME_FMT.format(d) === '00:00';
}

export const EventDetailContent: React.FC<EventDetailContentProps> = ({ event, language = 'bs' }) => {
  const isBs = language === 'bs';
  const start = new Date(event.start_datetime);
  const dateLabel = (isBs ? SARAJEVO_DATE_FMT_BS : SARAJEVO_DATE_FMT_EN).format(start);
  const timeLabel = isMidnight(event.start_datetime) ? null : SARAJEVO_TIME_FMT.format(start);
  const venueLabel = event.venue_name ?? event.location_name;

  return (
    <Box backgroundColor="$background" gap="$6" padding="$4" maxWidth={720} width="100%" alignSelf="center">
      {event.cover_image_url && (
        <Image
          source={{ uri: event.cover_image_url }}
          width="100%"
          height={320}
          borderRadius="$image"
          aspect="hero"
        />
      )}

      <Stack gap="$2">
        <Text tone="accent" size="sm">{event.category.toUpperCase()}</Text>
        <Heading level="hero">{event.title}</Heading>
        <Text tone="muted">
          {dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}
        </Text>
        {venueLabel && (
          <Text tone="muted">
            {isBs ? 'Lokacija: ' : 'Venue: '}
            {event.venue_slug
              ? <Link href={`/lokacija/${event.venue_slug}`}>{venueLabel}</Link>
              : venueLabel}
          </Text>
        )}
      </Stack>

      {event.description && (
        <Card gap="$3">
          <Heading level="card">{isBs ? 'O događaju' : 'About'}</Heading>
          <Text>{event.description}</Text>
        </Card>
      )}

      {event.ticket_url && (
        <Card gap="$3" backgroundColor="$accent">
          <Heading level="card" color="$background">
            {isBs ? 'Karte' : 'Tickets'}
          </Heading>
          <Link href={event.ticket_url} external>
            <Text color="$background" size="md">
              {isBs ? 'Kupi karte →' : 'Buy tickets →'}
            </Text>
          </Link>
        </Card>
      )}
    </Box>
  );
};
