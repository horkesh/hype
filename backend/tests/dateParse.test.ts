import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRawDate } from '../src/services/dateParse.js';

// Read the Sarajevo wall-clock date components from a UTC ISO string. Used
// across tests because parseRawDate now interprets input as Sarajevo local
// (so '23. Maj 2026' → 2026-05-22T22:00:00Z, but the test cares that the
// Sarajevo date is the 23rd of May).
const SARAJEVO_PARTS_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Sarajevo',
  year: 'numeric', month: '2-digit', day: '2-digit',
});

function localParts(iso: string | null): { y: number; m: number; d: number } | null {
  if (!iso) return null;
  const [yyyy, mm, dd] = SARAJEVO_PARTS_FMT.format(new Date(iso)).split('-');
  return { y: Number(yyyy), m: Number(mm), d: Number(dd) };
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
  const back = localParts(parseRawDate('19. Dec 2026'))!;
  assert.equal(back.d, 19, 'must NOT grab day from "2026"');
  assert.equal(back.m, 12);
});

test('parseRawDate parses Bosnian date ranges by taking the first day', () => {
  const back = localParts(parseRawDate('12 - 14 Jun 2026'))!;
  assert.equal(back.d, 12, 'range start date');
  assert.equal(back.m, 6);
  assert.equal(back.y, 2026);

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
  const iso = parseRawDate('Fri 14 Mar 2026 19:30')!;
  const parts = localParts(iso)!;
  assert.equal(parts.d, 14);
  assert.equal(parts.m, 3);
  // Verify wall-clock hour/minute via Sarajevo TZ formatter.
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Sarajevo',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  assert.equal(fmt.format(new Date(iso)), '19:30');
});

test('parseRawDate interprets wall-clock as Sarajevo TZ regardless of runtime', () => {
  // Regression: previously used new Date(y, m-1, d, h, mi) which on UTC
  // runtimes (GH Actions cron) stored "20:00 Sarajevo" as 20:00 UTC = 22:00
  // Sarajevo. Now we anchor on Sarajevo TZ via Intl, so any runtime gets the
  // same UTC ISO output.
  const iso = parseRawDate('25.05.2026 20:00')!;
  // 20:00 CEST = 18:00 UTC
  assert.equal(iso, '2026-05-25T18:00:00.000Z');
  // And 20:00 CET (winter) = 19:00 UTC
  const isoWinter = parseRawDate('25.01.2026 20:00')!;
  assert.equal(isoWinter, '2026-01-25T19:00:00.000Z');
});

test('parseRawDate ISO without timezone offset uses Sarajevo TZ', () => {
  // Pre-fix: ISO passthrough used `new Date(s)` which treats no-offset
  // strings as runtime-local, so on UTC edge "2026-05-22T20:30" became
  // 20:30 UTC instead of 20:30 Sarajevo.
  const iso = parseRawDate('2026-05-22T20:30')!;
  assert.equal(iso, '2026-05-22T18:30:00.000Z'); // 20:30 CEST = 18:30 UTC
});

test('parseRawDate ISO with explicit offset passes through unchanged', () => {
  // AllEvents JSON-LD includes the offset — preserve those byte-for-byte.
  const iso = parseRawDate('2026-04-15T19:30:00+02:00')!;
  assert.equal(iso, '2026-04-15T17:30:00.000Z');
});

test('parseRawDate ISO with Z (UTC) passes through unchanged', () => {
  const iso = parseRawDate('2026-05-22T18:30:00.000Z')!;
  assert.equal(iso, '2026-05-22T18:30:00.000Z');
});

test('parseRawDate rejects rollover dates (Feb 30, Apr 31)', () => {
  // Date.UTC accepts these and rolls forward to a valid date in the next
  // month — without a sanity check, a typo'd "30.02.2026" would silently
  // land as March 1 in the events table.
  assert.equal(parseRawDate('30.02.2026'), null);
  assert.equal(parseRawDate('31.04.2026'), null);
  assert.equal(parseRawDate('29.02.2027'), null); // 2027 isn't a leap year
});

test('parseRawDate handles "YYYY-MM-DD HH:MM" with space separator (parse-instagram output)', () => {
  // parse-instagram joins parsed.date + parsed.time with a space, not a "T".
  // Pre-fix, this format silently failed and 22 IG raw_events sat unpromoted.
  const iso = parseRawDate('2026-05-22 20:30')!;
  assert.equal(iso, '2026-05-22T18:30:00.000Z'); // 20:30 CEST = 18:30 UTC
});

test('parseRawDate rejects garbage rather than guessing', () => {
  assert.equal(parseRawDate(null), null);
  assert.equal(parseRawDate(''), null);
  assert.equal(parseRawDate('not a date'), null);
  assert.equal(parseRawDate('Jun 2026'), null, 'a bare month+year must not invent a day');
  assert.equal(parseRawDate('32. Maj 2026'), null, 'day > 31 is rejected');
  assert.equal(parseRawDate('15. Bogus 2026'), null, 'unknown month name is rejected');
});
