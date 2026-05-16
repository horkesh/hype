import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalEventKey } from '../src/services/eventDedupe.js';

test('canonicalEventKey collapses the same event across sources', () => {
  const kupikartu = canonicalEventKey({
    title: 'Aleksandra Mladenović — Sarajevo Live',
    startDatetime: '2026-05-16T20:00:00Z',
    venueId: 'venue-aqua',
    locationName: null,
  });
  const ulaznice = canonicalEventKey({
    title: 'ALEKSANDRA MLADENOVIĆ - Sarajevo Live',
    startDatetime: '2026-05-16T21:00:00Z',
    venueId: 'venue-aqua',
    locationName: 'AQUA CLUB',
  });

  assert.equal(kupikartu, ulaznice);
});

test('canonicalEventKey ignores diacritics, case, punctuation, and "Sarajevo" noise', () => {
  const a = canonicalEventKey({
    title: 'Premijera u Narodnom pozorištu (Sarajevo)',
    startDatetime: '2026-06-01T19:30:00+02:00',
    venueId: null,
    locationName: 'Narodno pozorište Sarajevo',
  });
  const b = canonicalEventKey({
    title: 'PREMIJERA U NARODNOM POZORISTU',
    startDatetime: '2026-06-01T00:00:00Z',
    venueId: null,
    locationName: 'Narodno Pozoriste',
  });

  assert.equal(a, b);
});

test('canonicalEventKey treats different days as different events', () => {
  const day1 = canonicalEventKey({
    title: 'Jazz Night',
    startDatetime: '2026-05-16T20:00:00Z',
    venueId: 'venue-bkc',
    locationName: null,
  });
  const day2 = canonicalEventKey({
    title: 'Jazz Night',
    startDatetime: '2026-05-17T20:00:00Z',
    venueId: 'venue-bkc',
    locationName: null,
  });

  assert.notEqual(day1, day2);
});

test('canonicalEventKey treats different venues as different events', () => {
  const venueA = canonicalEventKey({
    title: 'Open Mic',
    startDatetime: '2026-05-16T20:00:00Z',
    venueId: 'venue-a',
    locationName: null,
  });
  const venueB = canonicalEventKey({
    title: 'Open Mic',
    startDatetime: '2026-05-16T20:00:00Z',
    venueId: 'venue-b',
    locationName: null,
  });

  assert.notEqual(venueA, venueB);
});

test('canonicalEventKey returns null when start date is missing or malformed', () => {
  assert.equal(
    canonicalEventKey({
      title: 'Some Event',
      startDatetime: null,
      venueId: 'venue-x',
      locationName: null,
    }),
    null,
  );
  assert.equal(
    canonicalEventKey({
      title: 'Some Event',
      startDatetime: 'not-a-date',
      venueId: 'venue-x',
      locationName: null,
    }),
    null,
  );
});

test('canonicalEventKey returns null when title is too short to be meaningful', () => {
  assert.equal(
    canonicalEventKey({
      title: 'X',
      startDatetime: '2026-05-16T00:00:00Z',
      venueId: 'venue-x',
      locationName: null,
    }),
    null,
  );
});
