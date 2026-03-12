import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getHomeEventCardContent,
  getHomeSeriesCardContent,
} from '@/utils/homeEventsSection';

test('getHomeEventCardContent returns localized title, venue, and free fallback', () => {
  const content = getHomeEventCardContent('en', {
    id: 'event-1',
    title_bs: 'Koncert',
    title_en: null,
    cover_image_url: null,
    start_datetime: '2026-03-12T18:00:00.000Z',
    moods: [],
    price_bam: null,
    location_name: 'Dom mladih',
    venues: null,
  });

  assert.equal(content.title, 'Koncert');
  assert.equal(content.venueName, 'Dom mladih');
  assert.equal(content.priceLabel, 'Free');
});

test('getHomeEventCardContent prefers related venue name and formatted price', () => {
  const content = getHomeEventCardContent('bs', {
    id: 'event-2',
    title_bs: 'Predstava',
    title_en: 'Play',
    cover_image_url: null,
    start_datetime: '2026-03-14T19:00:00.000Z',
    moods: [],
    price_bam: 15,
    location_name: 'Fallback venue',
    venues: [{ name: 'Narodno pozoriste' }],
  });

  assert.equal(content.title, 'Predstava');
  assert.equal(content.venueName, 'Narodno pozoriste');
  assert.equal(content.priceLabel, '15 KM');
});

test('getHomeSeriesCardContent returns localized title and countdown', () => {
  const content = getHomeSeriesCardContent('en', {
    id: 'series-1',
    name_bs: 'Festival',
    name_en: 'Festival Week',
    cover_image_url: null,
    start_date: '2026-03-15',
    end_date: '2026-03-20',
  });

  assert.equal(content.title, 'Festival Week');
  assert.ok(content.countdownLabel.length > 0);
});
