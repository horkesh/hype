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
  { id: 'party', emoji: '🎉', label_bs: 'Party', label_en: 'Party' },
  { id: 'chill', emoji: '😌', label_bs: 'Chill', label_en: 'Chill' },
  { id: 'girls_night', emoji: '👯', label_bs: 'Girls Night', label_en: 'Girls Night' },
  { id: 'date_night', emoji: '💑', label_bs: 'Date Night', label_en: 'Date Night' },
  { id: 'muzika', emoji: '🎵', label_bs: 'Muzika', label_en: 'Music' },
  { id: 'romantika', emoji: '💕', label_bs: 'Romantika', label_en: 'Romance' },
  { id: 'kultura', emoji: '🎭', label_bs: 'Kultura', label_en: 'Culture' },
  { id: 'foodie', emoji: '🍽️', label_bs: 'Foodie', label_en: 'Foodie' },
  { id: 'brunch', emoji: '🥐', label_bs: 'Brunch', label_en: 'Brunch' },
  { id: 'after_work', emoji: '🍻', label_bs: 'After Work', label_en: 'After Work' },
  { id: 'outdoor', emoji: '🌳', label_bs: 'Outdoor', label_en: 'Outdoor' },
  { id: 'turista', emoji: '📸', label_bs: 'Turista', label_en: 'Tourist' },
];

export function getTimeOfDayHeroMessage(language: HomeLanguage, hour: number): string {
  if (hour < 12) {
    return language === 'bs' ? 'Dobro jutro, Sarajevo! ☕' : 'Good morning, Sarajevo! ☕';
  }

  if (hour < 18) {
    return language === 'bs'
      ? 'Dobar dan! Šta radiš danas? 🌞'
      : 'Good afternoon! What are you up to? 🌞';
  }

  return language === 'bs'
    ? 'Dobro veče! Vrijeme je za izlazak 🌙'
    : 'Good evening! Time to go out 🌙';
}

export function getDefaultHeroSubtitle(language: HomeLanguage): string {
  return language === 'bs'
    ? 'Otkrijte najbolje što Sarajevo nudi danas'
    : 'Discover the best Sarajevo has to offer today';
}

export function getHomeSectionLabels(language: HomeLanguage): HomeSectionLabels {
  if (language === 'bs') {
    return {
      moods: 'Kako se osjećaš?',
      cafes: 'Kafić dana',
      events: 'Nadolazeći događaji',
      series: 'Festivali & Serijali',
      seeAll: 'Vidi sve',
    };
  }

  return {
    moods: 'How are you feeling?',
    cafes: 'Café of the day',
    events: 'Upcoming events',
    series: 'Festivals & Series',
    seeAll: 'See all',
  };
}

export function getEmptyEventsMessage(language: HomeLanguage): string {
  return language === 'bs'
    ? 'Ništa za danas — ali sutra je novi dan! 🌅'
    : 'Nothing for today — but tomorrow is a new day! 🌅';
}

export function getCafeDescription(
  language: HomeLanguage,
  descriptionBs: string | null,
  descriptionEn: string | null
): string | null {
  if (language === 'bs') {
    return descriptionBs ?? descriptionEn;
  }

  return descriptionEn ?? descriptionBs;
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
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysText = language === 'bs' ? 'dana' : 'days';

    return language === 'bs'
      ? `Počinje za ${daysUntil} ${daysText}`
      : `Starts in ${daysUntil} ${daysText}`;
  }

  if (now >= start && now <= end) {
    return language === 'bs' ? '🔥 Aktivno sada' : '🔥 Active now';
  }

  return language === 'bs' ? 'Završeno' : 'Ended';
}
