import { SavedBadge, SavedEvent, SavedVenue } from '@/utils/savedScreen';

export interface SavedVenueCardModel {
  category: string;
  id: string;
  imageSource: string | null;
  moodBadges: string[];
  name: string;
  neighborhood: string | null;
  priceDisplay: string;
  venueId: string;
}

export interface SavedEventCardModel {
  dateDisplay: string;
  eventId: string;
  imageSource: string | null;
  priceDisplay: string;
  title: string;
  venueName: string;
}

export interface SavedBadgeCardModel {
  badgeId: string;
  badgeName: string;
  earnedDate: string;
  icon: string;
  isEarned: boolean;
  progress: { current: number; total: number };
  rawBadge: SavedBadge;
}

interface BuildSavedVenueCardModelsOptions {
  getPriceLevelDisplay: (level: number) => string;
  moodLookup: Record<string, string>;
}

interface BuildSavedEventCardModelsOptions {
  atLabel: string;
  formatDate: (dateString: string, atLabel: string) => string;
  freeLabel: string;
  isBosnian: boolean;
}

interface BuildSavedBadgeCardModelsOptions {
  earnedBadgeKeys: string[];
  formatDate: (dateString: string) => string;
  getProgress: (badgeKey: string) => { current: number; total: number };
  isBosnian: boolean;
}

export function buildSavedVenueCardModels(
  venues: SavedVenue[],
  options: BuildSavedVenueCardModelsOptions
): SavedVenueCardModel[] {
  return venues.map((venue) => ({
    category: venue.category,
    id: venue.id,
    imageSource: venue.cover_image_url,
    moodBadges: venue.moods.slice(0, 3).map((mood) => options.moodLookup[mood] || '\u2728'),
    name: venue.name,
    neighborhood: venue.neighborhood,
    priceDisplay: options.getPriceLevelDisplay(venue.price_level),
    venueId: venue.id,
  }));
}

export function buildSavedEventCardModels(
  events: SavedEvent[],
  options: BuildSavedEventCardModelsOptions
): SavedEventCardModel[] {
  return events.map((event) => ({
    dateDisplay: options.formatDate(event.start_datetime, options.atLabel),
    eventId: event.id,
    imageSource: event.cover_image_url,
    priceDisplay: event.price_bam ? `${event.price_bam} KM` : options.freeLabel,
    title: options.isBosnian ? event.title_bs : event.title_en || event.title_bs,
    venueName: event.venues?.name || event.location_name || '',
  }));
}

export function buildSavedBadgeCardModels(
  badges: SavedBadge[],
  options: BuildSavedBadgeCardModelsOptions
): SavedBadgeCardModel[] {
  const earnedDate = options.formatDate(new Date().toISOString());

  return badges.map((badge) => ({
    badgeId: badge.id,
    badgeName: options.isBosnian ? badge.name_bs : badge.name_en,
    earnedDate,
    icon: badge.icon,
    isEarned: options.earnedBadgeKeys.includes(badge.badge_key),
    progress: options.getProgress(badge.badge_key),
    rawBadge: badge,
  }));
}
