'use client';

import { EventDetailContent, type EventDetailInput } from '@look/ui';

export function EventView({ event, language }: { event: EventDetailInput; language: 'bs' | 'en' }) {
  return <EventDetailContent event={event} language={language} />;
}
