export interface SavedVenue {
  id: string;
  name: string;
  category: string;
  neighborhood: string | null;
  price_level: number;
  moods: string[];
  cover_image_url: string | null;
}

export interface SavedEvent {
  id: string;
  title_bs: string;
  title_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  price_bam: number | null;
  venues?: {
    name: string;
  } | null;
  location_name: string | null;
}

export interface SavedBadge {
  id: string;
  badge_key: string;
  name_bs: string;
  name_en: string;
  description_bs: string;
  description_en: string;
  icon: string;
  criteria: any;
  is_active: boolean;
}

export type SavedTabKey = 'venues' | 'events' | 'badges';

export interface SavedTabLabel {
  key: SavedTabKey;
  label: string;
}

export interface SavedEmptyStateConfig {
  buttonRoute: '/(tabs)/profile' | '/(tabs)/explore' | '/(tabs)/tonight';
  buttonText: string;
  emoji: string;
  subtitle: string;
  title: string;
}

export const SAVED_MOODS: Record<string, string> = {
  party: '\u{1F389}',
  chill: '\u{1F60C}',
  girls_night: '\u{1F46F}',
  date_night: '\u{1F491}',
  music: '\u{1F3B5}',
  romance: '\u{1F495}',
  culture: '\u{1F3AD}',
  foodie: '\u{1F37D}',
  brunch: '\u{1F950}',
  after_work: '\u{1F37B}',
  outdoor: '\u{1F333}',
  tourist: '\u{1F4F8}',
};

export const DEMO_EARNED_BADGES = ['kafedzija', 'explorer', 'hype_og'];

export function getSavedPriceLevelDisplay(level: number): string {
  return '\u20ac'.repeat(level);
}

export function formatSavedEventDate(dateString: string, atLabel: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${day}.${month}. ${atLabel} ${hours}:${formattedMinutes}`;
}

export function getSavedBadgeProgress(
  badgeKey: string
): { current: number; total: number } {
  const mockProgress: Record<string, { current: number; total: number }> = {
    kafedzija: { current: 10, total: 10 },
    nocna_ptica: { current: 2, total: 5 },
    kulturnjak: { current: 1, total: 5 },
    gurman: { current: 4, total: 10 },
    explorer: { current: 3, total: 3 },
    svaki_mood: { current: 8, total: 12 },
    storyteller: { current: 3, total: 10 },
    mahala_local: { current: 15, total: 30 },
    hype_og: { current: 1, total: 1 },
    underground_vip: { current: 1, total: 5 },
  };

  return mockProgress[badgeKey] || { current: 0, total: 10 };
}

export function formatSavedBadgeDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export function getSavedTabLabels(isBosnian: boolean): SavedTabLabel[] {
  return [
    {
      key: 'venues',
      label: isBosnian ? '\u2764\uFE0F Favoriti' : '\u2764\uFE0F Favorites',
    },
    {
      key: 'events',
      label: isBosnian ? '\u{1F39F}\uFE0F Dogadaji' : '\u{1F39F}\uFE0F Events',
    },
    {
      key: 'badges',
      label: isBosnian ? '\u{1F3C6} Bedzevi' : '\u{1F3C6} Badges',
    },
  ];
}

export function getSavedEmptyState(
  activeTab: SavedTabKey,
  isSignedIn: boolean,
  isBosnian: boolean
): SavedEmptyStateConfig {
  const isVenuesTab = activeTab === 'venues';
  const isEventsTab = activeTab === 'events';
  const isSignedOutVenuesState = isVenuesTab && !isSignedIn;

  if (isSignedOutVenuesState) {
    return {
      buttonRoute: '/(tabs)/profile',
      buttonText: isBosnian ? 'Otvori profil' : 'Open profile',
      emoji: '\u2764\uFE0F',
      subtitle: isBosnian
        ? 'Otvori Profil i prijavi se da bi favoriti bili sacuvani na svim uredajima.'
        : 'Open Profile and sign in so your favorites stay synced across devices.',
      title: isBosnian ? 'Prijavi se da sacuvas mjesta' : 'Sign in to save places',
    };
  }

  if (isVenuesTab) {
    return {
      buttonRoute: '/(tabs)/explore',
      buttonText: isBosnian ? 'Istrazi mjesta' : 'Explore places',
      emoji: '\u2764\uFE0F',
      subtitle: isBosnian
        ? 'Sacuvaj svoja omiljena mjesta da ih lako pronades kasnije.'
        : 'Save your favorite places so they are easy to find later.',
      title: isBosnian ? 'Nema sacuvanih mjesta' : 'No saved places yet',
    };
  }

  if (isEventsTab) {
    return {
      buttonRoute: '/(tabs)/tonight',
      buttonText: isBosnian ? 'Pogledaj dogadaje' : 'See events',
      emoji: '\u{1F39F}\uFE0F',
      subtitle: isBosnian
        ? 'Sacuvaj dogadaje koji te zanimaju.'
        : 'Save events that catch your eye.',
      title: isBosnian ? 'Nema sacuvanih dogadaja' : 'No saved events yet',
    };
  }

  return {
    buttonRoute: '/(tabs)/explore',
    buttonText: isBosnian ? 'Istrazi grad' : 'Explore the city',
    emoji: '\u{1F3C6}',
    subtitle: isBosnian
      ? 'Osvoji bedzeve kroz aktivnost u aplikaciji.'
      : 'Earn badges through your activity in the app.',
    title: isBosnian ? 'Nema bedzeva' : 'No badges yet',
  };
}
