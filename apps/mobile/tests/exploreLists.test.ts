import test from 'node:test';
import assert from 'node:assert/strict';

import { getDailySpecialPriceLabel, getExploreVenueMoodItems } from '@/utils/exploreLists';

test('getExploreVenueMoodItems keeps known moods in order and drops unknown entries', () => {
  const moodItems = getExploreVenueMoodItems(
    {
      id: 'venue-1',
      name: 'Cafe',
      category: 'cafe',
      neighborhood: null,
      price_level: 2,
      moods: ['coffee', 'chill', 'missing', 'party'],
      opening_hours: null,
      cover_image_url: null,
    },
    [
      { id: 'coffee', emoji: '\u2615', labelKey: 'moodCoffee' },
      { id: 'chill', emoji: '\u{1F60C}', labelKey: 'moodChill' },
      { id: 'party', emoji: '\u{1F389}', labelKey: 'moodParty' },
    ]
  );

  assert.deepEqual(moodItems, [
    { id: 'coffee', emoji: '\u2615' },
    { id: 'chill', emoji: '\u{1F60C}' },
  ]);
});

test('getDailySpecialPriceLabel formats BAM prices consistently', () => {
  assert.equal(
    getDailySpecialPriceLabel({
      id: 'special-1',
      venue_id: 'venue-1',
      venue_name: 'Cafe',
      menu_title: 'Pasta',
      price: 18,
      valid_times: '12:00-16:00',
      is_active: true,
      description: null,
    }),
    '18 KM'
  );
});
