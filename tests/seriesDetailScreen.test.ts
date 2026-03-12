import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatSeriesDateRange,
  formatSeriesEventDate,
  formatSeriesEventTime,
  getSeriesCategoryEmoji,
  getSeriesCountdownStatus,
  getSeriesDescription,
  getSeriesDetailCopy,
  getSeriesEventTitle,
  getSeriesEventVenueName,
  getSeriesMoodEmoji,
  getSeriesTitle,
  groupSeriesEventsByDate,
} from '@/utils/seriesDetailScreen';

test('series detail title and description respect language fallback', () => {
  assert.equal(getSeriesTitle({ name_bs: 'Serija', name_en: 'Series' }, 'bs'), 'Serija');
  assert.equal(getSeriesTitle({ name_bs: 'Serija', name_en: '' }, 'en'), 'Serija');
  assert.equal(
    getSeriesDescription({ description_bs: null, description_en: 'English' }, 'bs'),
    'English'
  );
});

test('series detail countdown and date range formatting stay localized', () => {
  assert.equal(
    getSeriesCountdownStatus(
      { start_date: '2026-03-15', end_date: '2026-03-18' },
      'en',
      new Date(2026, 2, 12)
    ),
    'Starts in 3 days'
  );
  assert.equal(
    formatSeriesDateRange({ start_date: '2026-03-15', end_date: '2026-03-18' }, 'bs'),
    '15. - 18. mart 2026'
  );
});

test('series event grouping and formatting keep stable labels', () => {
  assert.equal(formatSeriesEventDate('2026-03-12T20:15:00', 'en'), 'Thursday, 12. March');
  assert.equal(formatSeriesEventTime('2026-03-12T20:15:00'), '20:15');

  const grouped = groupSeriesEventsByDate(
    [
      { id: '1', title_bs: 'A', title_en: null, start_datetime: '2026-03-12T20:15:00', price_bam: null, ticket_url: null, moods: [], venues: null, location_name: 'A' },
      { id: '2', title_bs: 'B', title_en: null, start_datetime: '2026-03-12T22:00:00', price_bam: null, ticket_url: null, moods: [], venues: null, location_name: 'B' },
    ],
    'en'
  );

  assert.equal(Object.keys(grouped)[0], 'Thursday, 12. March');
  assert.equal(grouped['Thursday, 12. March']?.length, 2);
});

test('series emoji, venue, and copy helpers return stable fallback values', () => {
  assert.equal(getSeriesCategoryEmoji('music'), '\ud83c\udfb5');
  assert.equal(getSeriesCategoryEmoji('unknown'), '\ud83c\udfaa');
  assert.equal(getSeriesMoodEmoji('party'), '\ud83c\udf89');
  assert.equal(getSeriesMoodEmoji('unknown'), '\u2728');
  assert.equal(getSeriesEventTitle({ title_bs: 'Naslov', title_en: null }, 'en'), 'Naslov');
  assert.equal(getSeriesEventVenueName({ venues: null, location_name: 'Dom mladih' }), 'Dom mladih');
  assert.equal(getSeriesDetailCopy('bs').save, 'Sa\u010duvaj seriju');
});
