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

function buildDatetime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
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

  // ISO passthrough
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
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
