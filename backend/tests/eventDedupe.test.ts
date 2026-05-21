import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalEventKey,
  fuzzyCrossSourceKeys,
  fuzzyEventsMatch,
  venuesCompatibleForMerge,
  dayDelta,
} from '../src/services/eventDedupe.js';

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
    venueId: 'venue-bkc', locationName: null,
  });
  const day2 = canonicalEventKey({
    title: 'Jazz Night',
    startDatetime: '2026-05-17T20:00:00Z',
    venueId: 'venue-bkc', locationName: null,
  });
  assert.notEqual(day1, day2);
});

test('canonicalEventKey treats different venues as different events', () => {
  const a = canonicalEventKey({
    title: 'Open Mic', startDatetime: '2026-05-16T20:00:00Z',
    venueId: 'venue-a', locationName: null,
  });
  const b = canonicalEventKey({
    title: 'Open Mic', startDatetime: '2026-05-16T20:00:00Z',
    venueId: 'venue-b', locationName: null,
  });
  assert.notEqual(a, b);
});

test('canonicalEventKey returns null when start date is missing or malformed', () => {
  assert.equal(canonicalEventKey({ title: 'Some Event', startDatetime: null, venueId: 'v', locationName: null }), null);
  assert.equal(canonicalEventKey({ title: 'Some Event', startDatetime: 'not-a-date', venueId: 'v', locationName: null }), null);
});

test('canonicalEventKey returns null when title is too short to be meaningful', () => {
  assert.equal(canonicalEventKey({ title: 'X', startDatetime: '2026-05-16T00:00:00Z', venueId: 'v', locationName: null }), null);
});

// ─── fuzzyCrossSourceKeys ────────────────────────────────────────────────

test('fuzzyCrossSourceKeys: distinctive tokens, venue NOT in key', () => {
  // Same event ingested in two states — one with venue, one without — must
  // produce overlapping keys (this is the bug that caused the Garden of
  // Dreams / IH KAKO BIH TE JA duplicates).
  const withVenue = new Set(fuzzyCrossSourceKeys({ title: 'Garden of Dreams w/ Julya Karma @Cinemas Sloga' }));
  const withoutVenue = new Set(fuzzyCrossSourceKeys({ title: 'Garden of Dreams w/ Julya Karma' }));
  const overlap = [...withVenue].filter((k) => withoutVenue.has(k));
  assert.ok(overlap.length > 0, 'shared distinctive tokens must produce overlapping keys');
});

test('fuzzyCrossSourceKeys: WHO SEE — short artist name uses first-2-tokens fallback', () => {
  const a = fuzzyCrossSourceKeys({ title: 'WHO SEE - PROLONGIRANO @Cinemas Sloga' });
  const b = fuzzyCrossSourceKeys({ title: 'WHO SEE @ CINEMAS SLOGA SARAJEVO' });
  assert.deepEqual(a, b);
});

// ─── fuzzyEventsMatch ────────────────────────────────────────────────────

test('fuzzyEventsMatch: same event with asymmetric venue metadata DOES merge', () => {
  // The Garden of Dreams case — one row knows the venue, another doesn't.
  assert.ok(fuzzyEventsMatch(
    { title: 'Garden of Dreams w/ Julya Karma @Cinemas Sloga', startDatetime: '2026-03-20T21:00:00Z', venueId: 'v-cinemas-sloga', locationName: 'Cinemas Sloga' },
    { title: 'Garden of Dreams w/ Julya Karma', startDatetime: '2026-03-20T22:00:00Z', venueId: null, locationName: null },
  ));
});

test('fuzzyEventsMatch: distinct title prefix collides via shared distinctive token', () => {
  // PREMIJERA PREDSTAVE ŽENOMRZAC vs ŽENOMRZAC - RASPRODANO @Dom Mladih.
  assert.ok(fuzzyEventsMatch(
    { title: 'PREMIJERA PREDSTAVE ŽENOMRZAC', startDatetime: '2026-05-20T20:00:00Z', venueId: 'v-dom-mladih', locationName: null },
    { title: 'ŽENOMRZAC - RASPRODANO @Dom Mladih Sarajevo', startDatetime: '2026-05-20T20:00:00Z', venueId: 'v-dom-mladih', locationName: null },
  ));
});

test('fuzzyEventsMatch: anniversary framing collides via artist surname', () => {
  assert.ok(fuzzyEventsMatch(
    { title: 'SEKA ALEKSIĆ', startDatetime: '2026-05-23T22:00:00Z', venueId: 'v-aqua', locationName: null },
    { title: 'Aqua Club - Prvu Godišnjica sa Sekom Aleksić', startDatetime: '2026-05-23T22:00:00Z', venueId: 'v-aqua', locationName: null },
  ));
});

test('fuzzyEventsMatch: different events at same venue do NOT collide', () => {
  // ZOSTER and SKROZ — no overlapping distinctive tokens.
  assert.equal(fuzzyEventsMatch(
    { title: 'ZOSTER @ 7. LIVE STAGE FESTIVAL SARAJEVO', startDatetime: '2026-08-12T20:00:00Z', venueId: 'v-metalac', locationName: null },
    { title: 'SKROZ @ 7. LIVE STAGE FESTIVAL SARAJEVO', startDatetime: '2026-08-12T20:00:00Z', venueId: 'v-metalac', locationName: null },
  ), false);
});

test('fuzzyEventsMatch: two different DRAMA plays at same theatre do NOT collide', () => {
  // Regression: dry-run flagged "Marlene Dietrich" and "Ubistvo u Orijent
  // Expressu" as a fuzzy match because both started with "DRAMA:". With
  // "drama" added to FUZZY_STOPWORDS the only shared token is gone.
  assert.equal(fuzzyEventsMatch(
    { title: 'DRAMA: "Ubistvo u Orijent Expressu"', startDatetime: '2026-04-15T17:30:00Z', venueId: 'v-narodno', locationName: null },
    { title: 'DRAMA: "Marlene Dietrich: pet tačaka optužnice"', startDatetime: '2026-04-14T17:30:00Z', venueId: 'v-narodno', locationName: null },
  ), false);
});

test('fuzzyEventsMatch: same title at different known venues does NOT collide', () => {
  // Different venue_ids both populated → different events.
  assert.equal(fuzzyEventsMatch(
    { title: 'Concert Aleksandra', startDatetime: '2026-05-16T20:00:00Z', venueId: 'venue-1', locationName: null },
    { title: 'Concert Aleksandra', startDatetime: '2026-05-16T20:00:00Z', venueId: 'venue-2', locationName: null },
  ), false);
});

test('fuzzyEventsMatch: events 3+ days apart do NOT collide', () => {
  assert.equal(fuzzyEventsMatch(
    { title: 'Garden of Dreams w/ Julya Karma', startDatetime: '2026-03-20T20:00:00Z', venueId: null, locationName: null },
    { title: 'Garden of Dreams w/ Julya Karma', startDatetime: '2026-03-25T20:00:00Z', venueId: null, locationName: null },
  ), false);
});

test('fuzzyEventsMatch: midnight ingest vs timed ingest of same event DOES merge', () => {
  // The IH KAKO BIH TE JA case — one row at midnight (date-only parse), the
  // other at 20:00, same day, neither has venue.
  assert.ok(fuzzyEventsMatch(
    { title: 'IH, KAKO BIH TE JA 19/03', startDatetime: '2026-03-19T00:00:00Z', venueId: null, locationName: null },
    { title: 'Ih, kako bih te ja', startDatetime: '2026-03-19T20:00:00Z', venueId: null, locationName: null },
  ));
});

// ─── venuesCompatibleForMerge ────────────────────────────────────────────

test('venuesCompatibleForMerge: same venue_id', () => {
  assert.ok(venuesCompatibleForMerge({ venueId: 'v', locationName: null }, { venueId: 'v', locationName: null }));
});

test('venuesCompatibleForMerge: different venue_ids', () => {
  assert.equal(venuesCompatibleForMerge({ venueId: 'a', locationName: null }, { venueId: 'b', locationName: null }), false);
});

test('venuesCompatibleForMerge: one null venue_id is permissive', () => {
  assert.ok(venuesCompatibleForMerge({ venueId: 'v', locationName: null }, { venueId: null, locationName: null }));
  assert.ok(venuesCompatibleForMerge({ venueId: null, locationName: null }, { venueId: 'v', locationName: null }));
});

test('venuesCompatibleForMerge: both null venue_id + same locationName', () => {
  assert.ok(venuesCompatibleForMerge(
    { venueId: null, locationName: 'Cinemas Sloga' },
    { venueId: null, locationName: 'cinemas sloga' },
  ));
});

test('venuesCompatibleForMerge: both null venue_id + different locationNames', () => {
  assert.equal(venuesCompatibleForMerge(
    { venueId: null, locationName: 'Cinemas Sloga' },
    { venueId: null, locationName: 'AQUA CLUB' },
  ), false);
});

// ─── dayDelta ────────────────────────────────────────────────────────────

test('dayDelta returns calendar-day distance', () => {
  assert.equal(dayDelta('2026-05-21T19:00:00Z', '2026-05-22T19:00:00Z'), 1);
  assert.equal(dayDelta('2026-05-22T00:00:00Z', '2026-05-22T23:59:00Z'), 0);
  assert.equal(dayDelta('2026-08-12T19:00:00Z', '2026-08-13T19:00:00Z'), 1);
  assert.equal(dayDelta(null, '2026-05-22'), Infinity);
  assert.equal(dayDelta('not-a-date', '2026-05-22'), Infinity);
});
