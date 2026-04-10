/**
 * Known holidays for Sarajevo. Islamic dates shift yearly -- update each Jan.
 * Format: 'MM-DD' date key + description. Multi-day holidays get multiple entries.
 *
 * Merged from generate-plan, surprise-me, generate-pulse, and generate-hero-image.
 */
export const HOLIDAYS: Array<{ date: string; name: string }> = [
  // Fixed holidays
  { date: '01-01', name: "NOVA GODINA (New Year's Day) -- Sarajevo recovers from last night's celebrations." },
  { date: '01-02', name: "Still New Year's holiday weekend." },
  { date: '01-07', name: 'BOZIC (Orthodox Christmas) -- part of Sarajevo celebrates.' },
  { date: '03-01', name: 'DAN NEZAVISNOSTI (Independence Day) -- national holiday.' },
  { date: '05-01', name: 'PRAZNIK RADA (Labour Day) -- picnics, outdoor gatherings, Vrelo Bosne is packed.' },
  { date: '11-25', name: 'DAN DRZAVNOSTI (Statehood Day) -- national holiday.' },
  { date: '12-25', name: 'BOZIC (Catholic Christmas) -- part of Sarajevo celebrates.' },
  { date: '12-31', name: 'New Year Eve -- festive night atmosphere.' },
  // Ramazan 2026: ~Feb 18 - Mar 19
  { date: '02-18', name: 'RAMAZAN starts today. Iftar gatherings begin at sunset. Special menus at many restaurants.' },
  { date: '03-19', name: 'Last day of RAMAZAN. Tomorrow is Bajram! City is preparing for celebrations.' },
  // Ramazan Bajram (Eid al-Fitr) 2026: March 20-22
  { date: '03-20', name: 'BAJRAM (Eid al-Fitr) -- first day! This is the BIGGEST celebration in Sarajevo. Morning: Bajram prayers. Then family visits, baklava, coffee, festive atmosphere everywhere. "Bajram serif mubarek olsun!"' },
  { date: '03-21', name: 'BAJRAM (Eid al-Fitr) -- second day. Family lunches, visiting relatives, walks, kids getting bajramluk (money gifts). Relaxed festive mood.' },
  { date: '03-22', name: 'BAJRAM (Eid al-Fitr) -- third day. The celebration continues, more relaxed. Evening gatherings with friends.' },
  // Kurban Bajram (Eid al-Adha) 2026: ~May 27-29
  { date: '05-27', name: 'KURBAN BAJRAM (Eid al-Adha) -- first day. Major holiday. Morning prayers, traditional meals, family gatherings.' },
  { date: '05-28', name: 'KURBAN BAJRAM -- second day. Family visits continue, generous hospitality.' },
  { date: '05-29', name: 'KURBAN BAJRAM -- third day.' },
];

/**
 * Return the holiday name/description if today matches a known holiday date,
 * or null otherwise. Uses Sarajevo timezone.
 */
export function getActiveHoliday(now: Date): string | null {
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Sarajevo' });
  // dateStr is 'YYYY-MM-DD'; extract 'MM-DD'
  const mmdd = dateStr.slice(5); // '01-01', '03-20', etc.
  const match = HOLIDAYS.find(h => h.date === mmdd);
  return match ? match.name : null;
}
