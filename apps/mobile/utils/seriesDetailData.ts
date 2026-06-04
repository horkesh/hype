import { supabase } from '@/integrations/supabase/client';
import {
  hasSavedSeriesId,
  loadSavedSeriesIdsFromStorage,
  saveSavedSeriesIdsToStorage,
  toggleSavedSeriesIdInList,
} from '@/utils/savedSeriesStorage';
import { SeriesDetailEvent, SeriesDetailSeries } from '@/utils/seriesDetailScreen';

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
  // A festival aggregates its own events PLUS those of its child "program"
  // tracks (e.g. SFF → "Parties", Street Food Market → "Gin Weekend"), so the
  // program page shows the complete schedule. parent_series_id links a track
  // to its festival.
  const { data: children } = await supabase
    .from('event_series')
    .select('id')
    .eq('parent_series_id', seriesId);
  const seriesIds = [seriesId, ...((children ?? []).map((c) => c.id as string))];

  const { data, error } = await supabase
    .from('events')
    .select('id, title_bs, title_en, start_datetime, price_bam, ticket_url, moods, venues(name), location_name')
    .in('series_id', seriesIds)
    .eq('is_active', true)
    .order('start_datetime', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as SeriesDetailEvent[];
}

export async function loadSeriesSavedState(seriesId: string): Promise<boolean> {
  const ids = await loadSavedSeriesIdsFromStorage();

  return hasSavedSeriesId(ids, seriesId);
}

export async function toggleSeriesSavedState(seriesId: string): Promise<boolean> {
  const ids = await loadSavedSeriesIdsFromStorage();
  const nextIds = toggleSavedSeriesIdInList(ids, seriesId);

  await saveSavedSeriesIdsToStorage(nextIds);

  return hasSavedSeriesId(nextIds, seriesId);
}
