// Edge functions run in UTC on Supabase. The naive pattern
//   new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Sarajevo' })).getHours()
// re-parses the formatted string in the *runtime* timezone, so on UTC it
// just returns UTC hours. This helper extracts the Sarajevo wall-clock
// hour via Intl.DateTimeFormat, which is timezone-agnostic.

const SARAJEVO_HOUR_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Sarajevo',
  hour: 'numeric',
  hour12: false,
});

export function getSarajevoHour(now: Date = new Date()): number {
  return parseInt(SARAJEVO_HOUR_FMT.format(now), 10) % 24;
}
