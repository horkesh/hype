import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalEventKey, fuzzyCrossSourceKeys, dayDelta } from '../src/services/eventDedupe.js';

// Two events fuzzy-match when their key sets intersect.
function fuzzyMatch(
  a: { title: string; venueId: string | null; locationName: string | null },
  b: { title: string; venueId: string | null; locationName: string | null },
): boolean {
  const aKeys = new Set(fuzzyCrossSourceKeys(a));
  const bKeys = fuzzyCrossSourceKeys(b);
  return bKeys.some((k) => aKeys.has(k));
}

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

test('fuzzyCrossSourceKeys: WHO SEE — short artist name uses first-2-tokens fallback', () => {
  // No tokens ≥ 5 chars after stripping ("who", "see", "prolongirano", "cinemas",
  // "sloga", "sarajevo" — prolongirano is a stopword, sarajevo is noise). Falls
  // back to "who see" + venue → both titles produce the same single key.
  const a = fuzzyCrossSourceKeys({
    title: 'WHO SEE - PROLONGIRANO @Cinemas Sloga',
    venueId: 'v-cinemas-sloga',
    locationName: 'Cinemas Sloga',
  });
  const b = fuzzyCrossSourceKeys({
    title: 'WHO SEE @ CINEMAS SLOGA SARAJEVO',
    venueId: 'v-cinemas-sloga',
    locationName: 'Cinemas Sloga',
  });
  assert.deepEqual(a, b);
});

test('fuzzyCrossSourceKeys: distinct title prefix collides via shared distinctive token', () => {
  // Regression for the 2026-05-21 active duplicate:
  //   AllEvents: "PREMIJERA PREDSTAVE ŽENOMRZAC"
  //   KupiKartu: "ŽENOMRZAC - RASPRODANO @Dom Mladih Sarajevo"
  // First-2-tokens approach missed this ("premijera predstave" ≠ "zenomrzac
  // rasprodano"). Distinctive-token approach catches it on "zenomrzac".
  assert.ok(
    fuzzyMatch(
      { title: 'PREMIJERA PREDSTAVE ŽENOMRZAC', venueId: 'v-dom-mladih', locationName: null },
      { title: 'ŽENOMRZAC - RASPRODANO @Dom Mladih Sarajevo', venueId: 'v-dom-mladih', locationName: null },
    ),
    'titles share distinctive token "ženomrzac" → must fuzzy-match',
  );
});

test('fuzzyCrossSourceKeys: anniversary framing collides via artist surname', () => {
  // Regression for the 2026-05-21 active duplicate:
  //   Ulaznice: "SEKA ALEKSIĆ"
  //   IG:       "Aqua Club - Prvu Godišnjica sa Sekom Aleksić"
  // Shared distinctive token: "aleksic".
  assert.ok(
    fuzzyMatch(
      { title: 'SEKA ALEKSIĆ', venueId: 'v-aqua', locationName: null },
      { title: 'Aqua Club - Prvu Godišnjica sa Sekom Aleksić', venueId: 'v-aqua', locationName: null },
    ),
    'titles share distinctive token "aleksic" → must fuzzy-match',
  );
});

test('fuzzyCrossSourceKeys: different events at same venue do NOT collide', () => {
  // Two genuinely different concerts at Metalac on the same festival weekend
  // should remain distinct (ZOSTER and SKROZ have no overlapping distinctive
  // tokens, "live stage festival" tokens are all stopwords).
  assert.equal(
    fuzzyMatch(
      { title: 'ZOSTER @ 7. LIVE STAGE FESTIVAL SARAJEVO', venueId: 'v-metalac', locationName: null },
      { title: 'SKROZ @ 7. LIVE STAGE FESTIVAL SARAJEVO', venueId: 'v-metalac', locationName: null },
    ),
    false,
    'different bands at the same festival must not fuzzy-collide',
  );
});

test('fuzzyCrossSourceKeys: same title at different venues does NOT collide', () => {
  const a = fuzzyCrossSourceKeys({ title: 'Concert Aleksandra', venueId: 'venue-1', locationName: null });
  const b = fuzzyCrossSourceKeys({ title: 'Concert Aleksandra', venueId: 'venue-2', locationName: null });
  assert.equal(a.some((k) => b.includes(k)), false);
});

test('dayDelta returns calendar-day distance', () => {
  assert.equal(dayDelta('2026-05-21T19:00:00Z', '2026-05-22T19:00:00Z'), 1);
  assert.equal(dayDelta('2026-05-22T00:00:00Z', '2026-05-22T23:59:00Z'), 0);
  assert.equal(dayDelta('2026-08-12T19:00:00Z', '2026-08-13T19:00:00Z'), 1);
  assert.equal(dayDelta(null, '2026-05-22'), Infinity);
  assert.equal(dayDelta('not-a-date', '2026-05-22'), Infinity);
});
