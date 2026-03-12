import assert from 'node:assert/strict';
import test from 'node:test';

import { buildTonightEventCardViewModels } from '@/utils/tonightContent';

test('buildTonightEventCardViewModels preserves event ids and rendered props', () => {
  const events = [
    {
      id: 'event-1',
      title_bs: 'Svirka',
      title_en: null,
      description_bs: null,
      description_en: null,
      cover_image_url: null,
      start_datetime: '2026-03-12T20:00:00.000Z',
      price_bam: null,
      ticket_url: null,
      source: null,
      moods: [],
      category: 'music',
      venues: null,
      location_name: 'Kino Bosna',
    },
  ] as const;

  const cards = buildTonightEventCardViewModels(events as any, () => ({
    eventTime: '20:00',
    eventTitle: 'Svirka',
    isSelected: false,
    priceText: 'Free',
    ticketButtonText: 'Buy',
    urgencyBadge: null,
    venueName: 'Kino Bosna',
  }));

  assert.deepEqual(cards, [
    {
      id: 'event-1',
      event: events[0],
      eventTime: '20:00',
      eventTitle: 'Svirka',
      isSelected: false,
      priceText: 'Free',
      ticketButtonText: 'Buy',
      urgencyBadge: null,
      venueName: 'Kino Bosna',
    },
  ]);
});
