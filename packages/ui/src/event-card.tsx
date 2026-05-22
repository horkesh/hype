// EventCard — for events list + home rail.

import * as React from 'react';
import { Box, Card, Heading, Image, Stack, Text } from './components';

export interface EventCardInput {
  slug: string | null;
  title: string;
  category: string;
  start_datetime: string;
  cover_image_url: string | null;
  venue_name: string | null;
}

const SARAJEVO_DATE_FMT_BS = new Intl.DateTimeFormat('bs-BA', {
  timeZone: 'Europe/Sarajevo', day: 'numeric', month: 'short',
});
const SARAJEVO_DATE_FMT_EN = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Sarajevo', day: 'numeric', month: 'short',
});
const SARAJEVO_TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Sarajevo', hour: '2-digit', minute: '2-digit', hour12: false,
});

export const EventCard: React.FC<{ event: EventCardInput; language?: 'bs' | 'en' }> = ({
  event,
  language = 'bs',
}) => {
  const start = new Date(event.start_datetime);
  const dateLabel = (language === 'bs' ? SARAJEVO_DATE_FMT_BS : SARAJEVO_DATE_FMT_EN).format(start);
  const timeStr = SARAJEVO_TIME_FMT.format(start);
  const timeLabel = timeStr === '00:00' ? null : timeStr;

  return (
    <Card gap="$3" interactive>
      {event.cover_image_url ? (
        <Image
          source={{ uri: event.cover_image_url }}
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
          <Text tone="dim">🎫</Text>
        </Box>
      )}
      <Stack gap="$1">
        <Text tone="accent" size="sm">{event.category.toUpperCase()}</Text>
        <Heading level="card">{event.title}</Heading>
        <Text tone="muted" size="sm">
          {dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}
          {event.venue_name ? ` · ${event.venue_name}` : ''}
        </Text>
      </Stack>
    </Card>
  );
};
