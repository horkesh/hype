export interface MoodFeedVenue {
  type: 'venue';
  id: string;
  name: string;
  cover_image_url: string | null;
  category: string;
  neighborhood: string | null;
  address: string | null;
  description_bs: string | null;
  description_en: string | null;
  moods: string[];
  is_hidden_gem: boolean;
  google_rating: number | null;
}

export interface MoodFeedEvent {
  type: 'event';
  id: string;
  title_bs: string;
  title_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  moods: string[];
  price_bam: number | null;
  location_name: string | null;
  venues: { name: string } | null;
}

export type MoodFeedItem = MoodFeedVenue | MoodFeedEvent;

/**
 * Interleave venues and events: 2 venues, 1 event, repeat.
 * Remainder of either list is appended at the end.
 */
export function interleaveFeedItems(
  venues: MoodFeedVenue[],
  events: MoodFeedEvent[],
): MoodFeedItem[] {
  const result: MoodFeedItem[] = [];
  let vi = 0;
  let ei = 0;
  while (vi < venues.length || ei < events.length) {
    for (let k = 0; k < 2 && vi < venues.length; k++, vi++) {
      result.push(venues[vi]);
    }
    if (ei < events.length) {
      result.push(events[ei++]);
    }
  }
  return result;
}
