import { supabase } from '@/integrations/supabase/client';
import { Event, TimeSegment, TimeSegmentConfig, Venue } from '@/utils/tonightScreen';
import { getTonightSegmentRange } from '@/utils/tonightHelpers';

export async function loadTonightVenues(): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, category, latitude, longitude')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) {
    console.error('Error loading venues:', error);
    return [];
  }

  return data || [];
}

export async function loadTonightEvents(
  activeSegment: TimeSegment,
  segments: TimeSegmentConfig[]
): Promise<Event[]> {
  const range = getTonightSegmentRange(activeSegment, segments);

  if (!range) {
    return [];
  }

  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title_bs,
      title_en,
      description_bs,
      description_en,
      cover_image_url,
      start_datetime,
      price_bam,
      ticket_url,
      source,
      moods,
      category,
      location_name,
      venues (name)
    `)
    .gte('start_datetime', range.startTime.toISOString())
    .lt('start_datetime', range.endTime.toISOString())
    .eq('is_active', true)
    .eq('status', 'approved')
    .order('start_datetime', { ascending: true });

  if (error) {
    console.error('Error loading events:', error);
    return [];
  }

  return data || [];
}
