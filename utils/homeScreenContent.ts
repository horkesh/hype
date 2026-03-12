export type HomeLanguage = 'bs' | 'en';

interface HomeMoodOption {
  id: string;
  emoji: string;
  label_bs: string;
  label_en: string;
}

interface HomeSectionLabels {
  moods: string;
  cafes: string;
  events: string;
  series: string;
  seeAll: string;
}

export const HOME_MOODS: HomeMoodOption[] = [
  { id: 'party', emoji: '\u{1F389}', label_bs: 'Party', label_en: 'Party' },
  { id: 'chill', emoji: '\u{1F60C}', label_bs: 'Chill', label_en: 'Chill' },
  { id: 'girls_night', emoji: '\u{1F46F}', label_bs: 'Girls Night', label_en: 'Girls Night' },
  { id: 'date_night', emoji: '\u{1F491}', label_bs: 'Date Night', label_en: 'Date Night' },
  { id: 'muzika', emoji: '\u{1F3B5}', label_bs: 'Muzika', label_en: 'Music' },
  { id: 'romantika', emoji: '\u{1F495}', label_bs: 'Romantika', label_en: 'Romance' },
  { id: 'kultura', emoji: '\u{1F3AD}', label_bs: 'Kultura', label_en: 'Culture' },
  { id: 'foodie', emoji: '\u{1F37D}\uFE0F', label_bs: 'Foodie', label_en: 'Foodie' },
  { id: 'brunch', emoji: '\u{1F950}', label_bs: 'Brunch', label_en: 'Brunch' },
  { id: 'after_work', emoji: '\u{1F37B}', label_bs: 'After Work', label_en: 'After Work' },
  { id: 'outdoor', emoji: '\u{1F333}', label_bs: 'Outdoor', label_en: 'Outdoor' },
  { id: 'turista', emoji: '\u{1F4F8}', label_bs: 'Turista', label_en: 'Tourist' },
];

export function getTimeOfDayHeroMessage(language: HomeLanguage, hour: number): string {
  if (hour < 12) {
    return language === 'bs'
      ? 'Dobro jutro, Sarajevo! \u2615'
      : 'Good morning, Sarajevo! \u2615';
  }

  if (hour < 18) {
    return language === 'bs'
      ? 'Dobar dan! Šta radiš danas? \u{1F31E}'
      : 'Good afternoon! What are you up to? \u{1F31E}';
  }

  return language === 'bs'
    ? 'Dobro ve\u010de! Vrijeme je za izlazak \u{1F319}'
    : 'Good evening! Time to go out \u{1F319}';
}

export function getDefaultHeroSubtitle(language: HomeLanguage): string {
  return language === 'bs'
    ? 'Otkrijte najbolje \u0161to Sarajevo nudi danas'
    : 'Discover the best Sarajevo has to offer today';
}

export function getHomeSectionLabels(language: HomeLanguage): HomeSectionLabels {
  if (language === 'bs') {
    return {
      moods: 'Kako se osjećaš?',
      cafes: 'Kafi\u0107 dana',
      events: 'Nadolaze\u0107i doga\u0111aji',
      series: 'Festivali & Serijali',
      seeAll: 'Vidi sve',
    };
  }

  return {
    moods: 'How are you feeling?',
    cafes: 'Cafe of the day',
    events: 'Upcoming events',
    series: 'Festivals & Series',
    seeAll: 'See all',
  };
}

export function getEmptyEventsMessage(language: HomeLanguage): string {
  return language === 'bs'
    ? 'Ništa za danas, ali sutra je novi dan! \u{1F304}'
    : 'Nothing for today, but tomorrow is a new day! \u{1F304}';
}

export function getCafeDescription(
  language: HomeLanguage,
  descriptionBs: string | null,
  descriptionEn: string | null
): string | null {
  return language === 'bs' ? (descriptionBs ?? descriptionEn) : (descriptionEn ?? descriptionBs);
}

export function formatEventDateLabel(
  language: HomeLanguage,
  dateString: string,
  now: Date = new Date()
): string {
  const date = new Date(dateString);
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return language === 'bs' ? 'Danas' : 'Today';
  }

  if (date.toDateString() === tomorrow.toDateString()) {
    return language === 'bs' ? 'Sutra' : 'Tomorrow';
  }

  return date.toLocaleDateString(language === 'bs' ? 'bs-BA' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getSeriesCountdownLabel(
  language: HomeLanguage,
  startDate: string,
  endDate: string,
  now: Date = new Date()
): string {
  const start = toLocalCalendarDate(startDate);
  const end = toLocalCalendarDate(endDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (today < start) {
    const daysUntil = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysText = language === 'bs' ? 'dana' : 'days';

    return language === 'bs'
      ? `Po\u010dinje za ${daysUntil} ${daysText}`
      : `Starts in ${daysUntil} ${daysText}`;
  }

  if (today >= start && today <= end) {
    return language === 'bs' ? '\u{1F525} Aktivno sada' : '\u{1F525} Active now';
  }

  return language === 'bs' ? 'Zavr\u0161eno' : 'Ended';
}

function toLocalCalendarDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}
