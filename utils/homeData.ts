import { supabase } from '@/integrations/supabase/client';
import { moodToDbValue } from '@/utils/homeScreenContent';
import { invokeEdgeFunction } from '@/utils/ai/edgeFunctionClient';

export interface HomeVenue {
  id: string;
  name: string;
  cover_image_url: string | null;
  neighborhood: string | null;
  description_bs: string | null;
  description_en: string | null;
}

export interface HomeEventItem {
  id: string;
  title_bs: string;
  title_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  moods: string[];
  price_bam: number | null;
  location_name: string | null;
  venues?: {
    name: string;
  } | null;
}

export interface HomeEventSeries {
  id: string;
  name_bs: string;
  name_en: string;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
}

export async function loadHomeRandomCafe(): Promise<HomeVenue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, cover_image_url, neighborhood, description_bs, description_en')
    .eq('category', 'cafe')
    .limit(10);

  if (error || !data?.length) {
    return null;
  }

  return data[Math.floor(Math.random() * data.length)] as HomeVenue;
}

export async function loadHomeEventSeries(): Promise<HomeEventSeries[]> {
  const { data, error } = await supabase
    .from('event_series')
    .select('id, name_bs, name_en, cover_image_url, start_date, end_date')
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true })
    .limit(5);

  if (error) { console.error('loadHomeEventSeries error:', error); return []; }
  return (data ?? []) as HomeEventSeries[];
}

export async function loadHomeUpcomingEvents(
  selectedMood: string | null
): Promise<HomeEventItem[]> {
  let query = supabase
    .from('events')
    .select('id, title_bs, title_en, cover_image_url, start_datetime, moods, price_bam, location_name, venues(name)')
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(10);

  if (selectedMood) {
    query = query.contains('moods', [moodToDbValue(selectedMood)]);
  }

  const { data, error } = await query;
  if (error) { console.error('loadHomeUpcomingEvents error:', error); return []; }
  return (data ?? []) as HomeEventItem[];
}

export async function loadHomeFeaturedEvent(): Promise<HomeEventItem | null> {
  const { data, error } = await supabase
    .from('events')
    .select('id, title_bs, title_en, cover_image_url, start_datetime, moods, price_bam, location_name, venues(name)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) { console.error('loadHomeFeaturedEvent error:', error); return null; }
  return data as HomeEventItem | null;
}

export interface NewInTownVenue {
  id: string;
  name: string;
  cover_image_url: string | null;
  category: string;
  neighborhood: string | null;
  google_rating: number | null;
}

export async function loadHomeNewInTown(): Promise<NewInTownVenue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, cover_image_url, category, neighborhood, google_rating')
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) { console.error('loadHomeNewInTown error:', error); return []; }
  return (data ?? []) as NewInTownVenue[];
}

export async function loadHomeWeather(): Promise<{ temp: number; weatherCondition: string } | null> {
  try {
    const result = await invokeEdgeFunction<{ temp: number; weatherCondition: string }>('weather-proxy', {
      lat: 43.8563,
      lon: 18.4131,
    });
    if (result.error || !result.data) return null;
    return result.data;
  } catch {
    return null;
  }
}
