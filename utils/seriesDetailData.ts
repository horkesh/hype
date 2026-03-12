import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/integrations/supabase/client';
import {
  hasSavedSeriesId,
  parseSavedSeriesIds,
  toggleSavedSeriesIdInList,
} from '@/utils/savedSeriesStorage';
import { SeriesDetailEvent, SeriesDetailSeries } from '@/utils/seriesDetailScreen';

const SAVED_SERIES_KEY = 'savedSeries';

export async function loadSeriesDetail(seriesId: string): Promise<SeriesDetailSeries | null> {
  const { data, error } = await supabase
    .from('event_series')
    .select('*')
    .eq('id', seriesId)
    .single();

  if (error) {
    throw error;
  }

  return (data as SeriesDetailSeries | null) || null;
}

export async function loadSeriesEvents(seriesId: string): Promise<SeriesDetailEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('id, title_bs, title_en, start_datetime, price_bam, ticket_url, moods, venues(name), location_name')
    .eq('series_id', seriesId)
    .eq('is_active', true)
    .order('start_datetime', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as SeriesDetailEvent[];
}

export async function loadSeriesSavedState(seriesId: string): Promise<boolean> {
  const rawIds = await AsyncStorage.getItem(SAVED_SERIES_KEY);
  const ids = parseSavedSeriesIds(rawIds);

  return hasSavedSeriesId(ids, seriesId);
}

export async function toggleSeriesSavedState(seriesId: string): Promise<boolean> {
  const rawIds = await AsyncStorage.getItem(SAVED_SERIES_KEY);
  const ids = parseSavedSeriesIds(rawIds);
  const nextIds = toggleSavedSeriesIdInList(ids, seriesId);

  await AsyncStorage.setItem(SAVED_SERIES_KEY, JSON.stringify(nextIds));

  return hasSavedSeriesId(nextIds, seriesId);
}
