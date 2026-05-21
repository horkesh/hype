import { DailySpecial, ExploreLookupItem, Venue } from '@/utils/exploreScreen';

export interface ExploreVenueMoodItem {
  id: string;
  emoji: string;
}

export function getExploreVenueMoodItems(
  venue: Venue,
  moods: ExploreLookupItem[],
  limit = 3
): ExploreVenueMoodItem[] {
  return (venue.moods ?? [])
    .slice(0, limit)
    .flatMap((moodId) => {
      const mood = moods.find((entry) => entry.id === moodId);

      if (!mood) {
        return [];
      }

      return [{ id: mood.id, emoji: mood.emoji }];
    });
}

export function getDailySpecialPriceLabel(special: DailySpecial): string {
  return `${special.price} KM`;
}
