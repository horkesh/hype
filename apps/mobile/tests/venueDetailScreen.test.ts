import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatVenueEventDate,
  getVenueDetailCopy,
  getVenueHoursRows,
  getVenuePriceLevelDisplay,
  getVenueTodayHours,
  isVenueOpenNow,
  VenueOpeningHours,
} from '@/utils/venueDetailScreen';

test('getVenuePriceLevelDisplay uses clean euro symbols', () => {
  assert.equal(getVenuePriceLevelDisplay(3), '\u20ac\u20ac\u20ac');
});

test('formatVenueEventDate returns compact day month and time', () => {
  assert.equal(formatVenueEventDate('2026-03-12T08:05:00'), '12.3. 08:05');
});

test('isVenueOpenNow respects the current weekday schedule', () => {
  const openingHours: VenueOpeningHours = {
    4: [{ open: '18:00', close: '23:00' }],
  };

  assert.equal(isVenueOpenNow(openingHours, new Date(2026, 2, 12, 20, 15)), true);
  assert.equal(isVenueOpenNow(openingHours, new Date(2026, 2, 12, 17, 45)), false);
});

test('getVenueTodayHours falls back to localized closed and unknown labels', () => {
  const openingHours: VenueOpeningHours = {
    4: [{ open: '09:00', close: '17:00' }],
  };

  assert.equal(getVenueTodayHours(openingHours, 'bs', new Date(2026, 2, 12, 10, 0)), '09:00 - 17:00');
  assert.equal(getVenueTodayHours({}, 'en', new Date(2026, 2, 12, 10, 0)), 'Closed');
  assert.equal(getVenueTodayHours(null, 'bs', new Date(2026, 2, 12, 10, 0)), 'Nepoznato');
});

test('getVenueHoursRows returns localized day names and closed labels', () => {
  const rows = getVenueHoursRows(
    {
      0: [{ open: '10:00', close: '14:00' }],
    },
    'bs'
  );

  assert.equal(rows[0]?.dayName, 'Nedjelja');
  assert.equal(rows[0]?.hoursText, '10:00 - 14:00');
  assert.equal(rows[1]?.hoursText, 'Zatvoreno');
});

test('getVenueDetailCopy exposes sign-in text for save prompts', () => {
  const copy = getVenueDetailCopy('en');

  assert.equal(copy.signInRequiredTitle, 'Sign in required');
  assert.match(copy.signInRequiredMessage, /sign in from Profile/i);
});
