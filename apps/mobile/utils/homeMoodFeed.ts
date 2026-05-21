import { supabase } from '@/integrations/supabase/client';
import { moodToDbValue } from '@/utils/homeScreenContent';
import {
  interleaveFeedItems,
  MoodFeedEvent,
  MoodFeedItem,
  MoodFeedVenue,
} from '@/utils/homeMoodFeedUtils';

export type { MoodFeedEvent, MoodFeedItem, MoodFeedVenue };
export { interleaveFeedItems };

/**
 * Load venues and events matching a mood, then interleave them.
 */
export async function loadMoodFeed(moodId: string): Promise<MoodFeedItem[]> {
  const dbMood = moodToDbValue(moodId);

  const [venuesResult, eventsResult] = await Promise.all([
    supabase
      .from('venues')
      .select('id, name, cover_image_url, category, neighborhood, address, description_bs, description_en, moods, is_hidden_gem, google_rating')
      .contains('moods', [dbMood])
      .limit(15),
    supabase
      .from('events')
      .select('id, title_bs, title_en, cover_image_url, start_datetime, moods, price_bam, location_name, venues(name)')
      .contains('moods', [dbMood])
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
      .limit(10),
  ]);

  const venues: MoodFeedVenue[] = (venuesResult.data ?? []).map((v: any) => ({
    type: 'venue' as const,
    id: v.id,
    name: v.name,
    cover_image_url: v.cover_image_url,
    category: v.category ?? '',
    neighborhood: v.neighborhood,
    address: v.address,
    description_bs: v.description_bs,
    description_en: v.description_en,
    moods: v.moods ?? [],
    is_hidden_gem: v.is_hidden_gem ?? false,
    google_rating: v.google_rating,
  }));

  const events: MoodFeedEvent[] = (eventsResult.data ?? []).map((e: any) => ({
    type: 'event' as const,
    id: e.id,
    title_bs: e.title_bs,
    title_en: e.title_en,
    cover_image_url: e.cover_image_url,
    start_datetime: e.start_datetime,
    moods: e.moods ?? [],
    price_bam: e.price_bam,
    location_name: e.location_name,
    venues: e.venues,
  }));

  return interleaveFeedItems(venues, events);
}
