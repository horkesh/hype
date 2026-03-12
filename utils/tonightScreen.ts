export interface Event {
  id: string;
  title_bs: string;
  title_en: string | null;
  description_bs: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  price_bam: number | null;
  ticket_url: string | null;
  source: string | null;
  moods: string[];
  category: string;
  venues?: {
    name: string;
  } | null;
  location_name: string | null;
}

export interface Venue {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

export interface PlanStop {
  time: string;
  venueName: string;
  activity: string;
  price: number;
}

export interface AIPlan {
  stops: PlanStop[];
  total: number;
}

export type TimeSegment = 'morning' | 'lunch' | 'evening' | 'night';

export interface TimeSegmentConfig {
  key: TimeSegment;
  emoji: string;
  label: string;
  startHour: number;
  endHour: number;
}

export type MoodId =
  | 'date_night'
  | 'party'
  | 'chill'
  | 'culture'
  | 'girlsnight'
  | 'outdoor'
  | 'foodie'
  | 'live_music'
  | 'sports'
  | 'art'
  | 'coffee'
  | 'drinks';

export const TONIGHT_MOODS: { id: MoodId; emoji: string; label_bs: string; label_en: string }[] = [
  { id: 'date_night', emoji: '\u{1F496}', label_bs: 'Romantika', label_en: 'Date Night' },
  { id: 'party', emoji: '\u{1F389}', label_bs: 'Žurka', label_en: 'Party' },
  { id: 'chill', emoji: '\u{1F60C}', label_bs: 'Opušteno', label_en: 'Chill' },
  { id: 'culture', emoji: '\u{1F3AD}', label_bs: 'Kultura', label_en: 'Culture' },
  { id: 'girlsnight', emoji: '\u{1F46F}', label_bs: 'Girls night', label_en: 'Girls Night' },
  { id: 'outdoor', emoji: '\u{1F333}', label_bs: 'Napolju', label_en: 'Outdoor' },
  { id: 'foodie', emoji: '\u{1F37D}', label_bs: 'Gurmani', label_en: 'Foodie' },
  { id: 'live_music', emoji: '\u{1F3B8}', label_bs: 'Live muzika', label_en: 'Live Music' },
  { id: 'sports', emoji: '\u26BD', label_bs: 'Sport', label_en: 'Sports' },
  { id: 'art', emoji: '\u{1F3A8}', label_bs: 'Umjetnost', label_en: 'Art' },
  { id: 'coffee', emoji: '\u2615', label_bs: 'Kafa', label_en: 'Coffee' },
  { id: 'drinks', emoji: '\u{1F379}', label_bs: 'Piće', label_en: 'Drinks' },
];

export interface TonightPlannerLabels {
  budget: string;
  close: string;
  generate: string;
  group: string;
  mood: string;
  nextPlan: string;
  save: string;
  share: string;
  title: string;
  total: string;
}

export interface TonightVoteLabels {
  close: string;
  createVote: string;
  results: string;
  selectedCount: string;
  shareLink: string;
  title: string;
  vote: string;
  voteLink: string;
  votePrompt: string;
  voteWord: string;
}

export function getTonightPlannerLabels(
  isBosnian: boolean,
  budget: number,
  groupSize: number
): TonightPlannerLabels {
  return {
    budget: isBosnian ? `Budžet: ${budget} KM` : `Budget: ${budget} KM`,
    close: 'X',
    generate: isBosnian ? 'Generiši plan \u2728' : 'Generate plan \u2728',
    group: isBosnian ? `Grupa: ${groupSize} osoba` : `Group: ${groupSize} people`,
    mood: isBosnian ? 'Raspoloženje' : 'Mood',
    nextPlan: isBosnian ? '\u{1F504} Daj drugi plan' : '\u{1F504} Another plan',
    save: isBosnian ? '\u{1F4BE} Sačuvaj' : '\u{1F4BE} Save',
    share: isBosnian ? '\u{1F4E4} Podijeli' : '\u{1F4E4} Share',
    title: isBosnian ? 'AI Planer večeri' : 'AI Evening Planner',
    total: isBosnian ? 'Ukupno:' : 'Total:',
  };
}

export function getTonightVoteLabels(isBosnian: boolean): TonightVoteLabels {
  return {
    close: 'X',
    createVote: isBosnian ? 'Kreiraj glasanje' : 'Create vote',
    results: isBosnian ? 'Rezultati:' : 'Results:',
    selectedCount: isBosnian ? 'Izabrano:' : 'Selected:',
    shareLink: isBosnian ? '\u{1F4E4} Podijeli link' : '\u{1F4E4} Share link',
    title: isBosnian ? 'Grupno glasanje' : 'Group Voting',
    vote: isBosnian ? 'Glasaj' : 'Vote',
    voteLink: isBosnian ? 'Link za glasanje:' : 'Voting link:',
    votePrompt: isBosnian
      ? 'Izaberi 2-4 događaja za glasanje'
      : 'Select 2-4 events for voting',
    voteWord: isBosnian ? 'glasova' : 'votes',
  };
}

export function isFreeEvent(price: number | null): boolean {
  return price === null || price === 0;
}

export function buildTonightSegments(t: (key: string) => string): TimeSegmentConfig[] {
  return [
    { key: 'morning', emoji: '\u2615', label: t('morning'), startHour: 6, endHour: 12 },
    { key: 'lunch', emoji: '\u{1F37D}', label: t('lunch'), startHour: 12, endHour: 17 },
    { key: 'evening', emoji: '\u{1F306}', label: t('evening'), startHour: 17, endHour: 22 },
    { key: 'night', emoji: '\u{1F319}', label: t('night'), startHour: 22, endHour: 6 },
  ];
}

export function buildTonightPlanShareText(language: string, currentPlan: AIPlan): string {
  const planText = currentPlan.stops
    .map((stop, index) => `${index + 1}. ${stop.time} - ${stop.venueName} - ${stop.activity} - ~${stop.price} KM`)
    .join('\n');

  return `${language === 'bs' ? 'Moj plan za večeras' : 'My plan for tonight'}:\n\n${planText}\n\n${
    language === 'bs' ? 'Ukupno' : 'Total'
  }: ~${currentPlan.total} KM\n\n${language === 'bs' ? 'Kreirano sa Hype app' : 'Created with Hype app'}`;
}

export function buildTonightVoteShareText(language: string, voteLink: string): string {
  return `${language === 'bs' ? 'Glasaj za večeras!' : 'Vote for tonight!'}\n\n${voteLink}\n\n${
    language === 'bs' ? 'Kreirano sa Hype app' : 'Created with Hype app'
  }`;
}
