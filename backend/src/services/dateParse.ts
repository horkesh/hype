// Date parsing for raw_events.date_raw strings coming out of source extractors.
//
// Order matters: Bosnian patterns run before the English-month fallback,
// otherwise strings like "19. Dec 2026" trip the loose English regex and
// parse day=20 (grabbing "20" from "2026").

const monthNumbers: Record<string, number> = {
  // Bosnian — long
  januar: 1, februar: 2, mart: 3, april: 4, maj: 5,
  juni: 6, juli: 7, august: 8, avgust: 8,
  septembar: 9, oktobar: 10, novembar: 11, decembar: 12,
  // Bosnian / English short — overlap intentionally collapsed
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5,
  jun: 6, jul: 7, aug: 8, avg: 8,
  sep: 9, sept: 9, oct: 10, okt: 10, nov: 11, dec: 12,
};

function lookupMonth(name: string): number | null {
  return monthNumbers[name.toLowerCase().replace(/\.$/, '')] ?? null;
}

// Sarajevo TZ hour formatter reused across calls.
const SARAJEVO_HOUR_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Sarajevo',
  hour: 'numeric',
  hour12: false,
});

// Interpret (year, month, day, hour, minute) as Sarajevo wall-clock time and
// return the corresponding UTC ISO string. Sarajevo is CET (+1) or CEST (+2)
// depending on the date — try both offsets and pick whichever lands the
// wall-clock back on the requested hour when displayed in Sarajevo.
//
// Why this exists: the previous implementation used `new Date(year, month-1,
// day, hour, minute)` which constructs in the runtime timezone. On the GH
// Actions cron (UTC) that stored "20:00 Sarajevo" scraped strings as 20:00
// UTC = 22:00 Sarajevo — every cron-scraped event drifted +2h during CEST.
// Locally-run scrapes on Sarajevo machines happened to produce correct
// values, which is why the bug took a while to surface.
function buildDatetime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(naiveUtc)) return null;

  // Reject silent rollovers (Feb 30 → Mar 1, Apr 31 → May 1). Date.UTC
  // accepts overflowing day numbers and rolls them forward — we want a
  // hard rejection so the caller sees the date as unparseable instead of
  // getting a wrong-day event in the DB.
  const probe = new Date(naiveUtc);
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }

  for (const offsetHours of [2, 1] as const) {
    const candidate = new Date(naiveUtc - offsetHours * 3_600_000);
    if (Number.isNaN(candidate.getTime())) continue;
    // Intl formats midnight as "24" in some locales; normalize.
    const formattedHour = parseInt(SARAJEVO_HOUR_FMT.format(candidate), 10) % 24;
    if (formattedHour === hour) {
      return candidate.toISOString();
    }
  }

  // Spring-forward gap (e.g. 2:30 on the Sunday clocks jump ahead doesn't
  // exist as a real moment). Fall back to the +2 candidate so we at least
  // produce a valid timestamp.
  return new Date(naiveUtc - 2 * 3_600_000).toISOString();
}

// Supported formats:
//   "YYYY-MM-DDTHH:MM..."  ISO passthrough
//   "YYYY-MM-DD"           midnight
//   "DD.MM.YYYY HH:MM"     exact time
//   "DD.MM.YYYY"           midnight
//   "DD/MM"                current year, midnight
//   "DD. Mon YYYY"         Bosnian, dot after day, abbreviated month ("23. Maj 2026", "08. Avg 2026")
//   "DD Mon YYYY [HH:MM]"  Bosnian without dot ("17 Mart 2026 20:00")
//   "DD - DD Mon YYYY"     Bosnian/English range — takes the first day ("12 - 14 Jun 2026")
//   "Day DD Mon YYYY ..."  English fallback for AllEvents ("Fri 14 Mar 2026 19:30")
export function parseRawDate(dateRaw: string | null): string | null {
  if (!dateRaw) return null;
  const s = dateRaw.trim();
  if (!s) return null;

  // ISO passthrough — but only when the string has a timezone designator.
  // `new Date("2026-05-22T20:30")` (no offset, no Z) is parsed as runtime-
  // local, so on UTC edge that's UTC, in Sarajevo it's Sarajevo → 2h drift.
  // If there's no offset/Z we strip the T and re-route through buildDatetime.
  const isoLike = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/);
  if (isoLike) {
    const [, y, m, d, hh, mm, offset] = isoLike;
    if (offset) {
      const parsed = new Date(s);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }
    return buildDatetime(Number(y), Number(m), Number(d), Number(hh), Number(mm));
  }

  // YYYY-MM-DD HH:MM  (parse-instagram joins date+time with a space)
  const isoDateSpace = s.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/);
  if (isoDateSpace) {
    const [, y, m, d, hh, mm] = isoDateSpace;
    return buildDatetime(Number(y), Number(m), Number(d), Number(hh), Number(mm));
  }

  // YYYY-MM-DD
  const isoDate = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    const [, y, m, d] = isoDate;
    return buildDatetime(Number(y), Number(m), Number(d));
  }

  // DD.MM.YYYY HH:MM
  const dotDatetime = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (dotDatetime) {
    const [, d, m, y, hh, mm] = dotDatetime;
    return buildDatetime(Number(y), Number(m), Number(d), Number(hh), Number(mm));
  }

  // DD.MM.YYYY
  const dotDate = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotDate) {
    const [, d, m, y] = dotDate;
    return buildDatetime(Number(y), Number(m), Number(d));
  }

  // DD/MM (assume current year)
  const slashDate = s.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (slashDate) {
    const [, d, m] = slashDate;
    return buildDatetime(new Date().getFullYear(), Number(m), Number(d));
  }

  // Range: "12 - 14 Jun 2026" or "12-14 Juni 2026" — take the first day
  const rangeMatch = s.match(
    /^(\d{1,2})\s*[-–—]\s*\d{1,2}\.?\s+([a-zA-Zčćšžđ.]+)\s+(\d{4})$/i,
  );
  if (rangeMatch) {
    const [, d, monthName, y] = rangeMatch;
    const month = lookupMonth(monthName);
    if (month) return buildDatetime(Number(y), month, Number(d));
  }

  // Bosnian: "23. Maj 2026", "08. Avg 2026", "17 Mart 2026 20:00", "23 Mart 2026"
  const bsMatch = s.match(
    /^(\d{1,2})\.?\s+([a-zA-Zčćšžđ.]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/i,
  );
  if (bsMatch) {
    const [, d, monthName, y, hh, mm] = bsMatch;
    const month = lookupMonth(monthName);
    if (month) {
      return buildDatetime(Number(y), month, Number(d), Number(hh ?? 0), Number(mm ?? 0));
    }
  }

  // English-style fallback: "Fri 14 Mar 2026 19:30" — DAY MONTH YEAR [HH:MM] with optional
  // weekday prefix. Anchored so a bare "Jun 2026" tail of an unrecognized format can't
  // sneak through with garbage day digits.
  const enMatch = s.match(
    /^(?:[A-Za-z]+\s+)?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/,
  );
  if (enMatch) {
    const [, d, monthName, y, hh, mm] = enMatch;
    const month = lookupMonth(monthName);
    if (month) {
      return buildDatetime(Number(y), month, Number(d), Number(hh ?? 0), Number(mm ?? 0));
    }
  }

  return null;
}
