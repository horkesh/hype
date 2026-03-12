import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/integrations/supabase/client';
import {
  hasSavedEventId,
  parseSavedEventIds,
  toggleSavedEventIdInList,
} from '@/utils/savedEventsStorage';
import { EventDetailEvent } from '@/utils/eventDetailScreen';

const SAVED_EVENTS_KEY = 'savedEvents';

export async function loadEventDetail(eventId: string): Promise<EventDetailEvent | null> {
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
      end_datetime,
      price_bam,
      ticket_url,
      source,
      moods,
      category,
      venue_id,
      location_name,
      venues (id, name)
    `)
    .eq('id', eventId)
    .single();

  if (error) {
    throw error;
  }

  return (data as EventDetailEvent | null) || null;
}

export async function loadEventSavedState(eventId: string): Promise<boolean> {
  const rawIds = await AsyncStorage.getItem(SAVED_EVENTS_KEY);
  const ids = parseSavedEventIds(rawIds);

  return hasSavedEventId(ids, eventId);
}

export async function toggleEventSavedState(eventId: string): Promise<boolean> {
  const rawIds = await AsyncStorage.getItem(SAVED_EVENTS_KEY);
  const ids = parseSavedEventIds(rawIds);
  const nextIds = toggleSavedEventIdInList(ids, eventId);

  await AsyncStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(nextIds));

  return hasSavedEventId(nextIds, eventId);
}
