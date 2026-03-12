import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeDailySpecial,
  normalizeDailySpecialRows,
  normalizeVenue,
  normalizeVenueRows,
} from '@/utils/dataAdapters';

test('normalizeVenue keeps localized insider tips and normalized instagram urls', () => {
  const venue = normalizeVenue(
    {
      id: 'venue-1',
      instagram_handle: '@hype',
      insider_tip_bs: 'Najbolja basta',
      insider_tip_en: 'Best terrace',
      price_range: '3',
    },
    'en'
  );

  assert.equal(venue.price_level, 3);
  assert.equal(venue.price_range, '3');
  assert.equal(venue.insider_tip, 'Best terrace');
  assert.equal(venue.instagram, 'https://instagram.com/hype');
});

test('normalizeVenueRows returns an empty list for missing rows', () => {
  assert.deepEqual(normalizeVenueRows(undefined, 'bs'), []);
});

test('normalizeDailySpecial keeps localized title and derived valid time range', () => {
  const special = normalizeDailySpecial(
    {
      id: 'special-1',
      description_bs: 'Topla supa',
      description_en: 'Hot soup',
      price_bam: 9,
      title_bs: 'Dnevna supa',
      title_en: 'Soup of the day',
      valid_time_start: '12:00',
      valid_time_end: '15:00',
      venue: { name: 'Basca' },
    },
    'bs'
  );

  assert.equal(special.menu_title, 'Dnevna supa');
  assert.equal(special.description, 'Topla supa');
  assert.equal(special.price, 9);
  assert.equal(special.valid_times, '12:00 - 15:00');
  assert.equal(special.venue_name, 'Basca');
});

test('normalizeDailySpecialRows normalizes each row with language fallback', () => {
  const specials = normalizeDailySpecialRows(
    [
      {
        id: 'special-2',
        menu_title: 'Coffee deal',
        price: 4,
        valid_times: '08:00 - 12:00',
        venue_name: 'Kafa',
      },
    ],
    'en'
  );

  assert.equal(specials[0]?.menu_title, 'Coffee deal');
  assert.equal(specials[0]?.price_bam, 4);
});
