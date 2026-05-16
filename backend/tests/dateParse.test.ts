import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRawDate } from '../src/services/dateParse.js';

function localParts(iso: string | null): { y: number; m: number; d: number } | null {
  if (!iso) return null;
  const d = new Date(iso);
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
}

test('parseRawDate parses Bosnian "DD. MonAbbrev YYYY" (ulaznice format)', () => {
  assert.deepEqual(localParts(parseRawDate('23. Maj 2026')), { y: 2026, m: 5, d: 23 });
});

test('parseRawDate parses Bosnian month abbreviations Avg, Okt, Nov, Dec, Jun', () => {
  assert.ok(parseRawDate('08. Avg 2026'));
  assert.ok(parseRawDate('31. Okt 2026'));
  assert.ok(parseRawDate('24. Nov 2026'));
  assert.ok(parseRawDate('19. Dec 2026'));
  assert.ok(parseRawDate('27. Jun 2026'));

  // Critical regression: "19. Dec 2026" used to fall through to the English
  // fallback regex which parsed day=20 (grabbing "20" from "2026").
  const back = new Date(parseRawDate('19. Dec 2026')!);
  assert.equal(back.getDate(), 19, 'must NOT grab day from "2026"');
  assert.equal(back.getMonth() + 1, 12);
});

test('parseRawDate parses Bosnian date ranges by taking the first day', () => {
  const back = new Date(parseRawDate('12 - 14 Jun 2026')!);
  assert.equal(back.getDate(), 12, 'range start date');
  assert.equal(back.getMonth() + 1, 6);
  assert.equal(back.getFullYear(), 2026);

  // Variants
  assert.ok(parseRawDate('12-14 Juni 2026'));
  assert.ok(parseRawDate('1 – 3 Mart 2026')); // en-dash
});

test('parseRawDate keeps existing formats working', () => {
  // YYYY-MM-DD is parsed as midnight UTC for ISO format compatibility — round-trip
  // through Date to compare local parts.
  assert.deepEqual(localParts(parseRawDate('2026-03-22')), { y: 2026, m: 3, d: 22 });
  assert.ok(parseRawDate('25.02.2026'));
  assert.ok(parseRawDate('25.02.2026 20:00'));
  assert.ok(parseRawDate('07/03'));
  assert.ok(parseRawDate('17 Mart 2026 20:00'));
  assert.ok(parseRawDate('23 Mart 2026'));
});

test('parseRawDate parses English AllEvents format "Fri 14 Mar 2026 19:30"', () => {
  const back = new Date(parseRawDate('Fri 14 Mar 2026 19:30')!);
  assert.equal(back.getDate(), 14);
  assert.equal(back.getMonth() + 1, 3);
  assert.equal(back.getHours(), 19);
  assert.equal(back.getMinutes(), 30);
});

test('parseRawDate rejects garbage rather than guessing', () => {
  assert.equal(parseRawDate(null), null);
  assert.equal(parseRawDate(''), null);
  assert.equal(parseRawDate('not a date'), null);
  assert.equal(parseRawDate('Jun 2026'), null, 'a bare month+year must not invent a day');
  assert.equal(parseRawDate('32. Maj 2026'), null, 'day > 31 is rejected');
  assert.equal(parseRawDate('15. Bogus 2026'), null, 'unknown month name is rejected');
});
