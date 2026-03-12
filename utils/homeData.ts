import { supabase } from '@/integrations/supabase/client';
import { publicConfig } from '@/utils/publicConfig';

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

const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPENWEATHER_API_KEY = publicConfig.openWeatherApiKey;

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
  const { data } = await supabase
    .from('event_series')
    .select('id, name_bs, name_en, cover_image_url, start_date, end_date')
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true })
    .limit(5);

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
    query = query.contains('moods', [selectedMood]);
  }

  const { data } = await query;
  return (data ?? []) as HomeEventItem[];
}

export async function loadHomeWeather(): Promise<{
  temp: number;
  weatherCondition: string;
} | null> {
  if (!OPENWEATHER_API_KEY) {
    return null;
  }

  const response = await fetch(
    `${OPENWEATHER_API_URL}?lat=43.8563&lon=18.4131&units=metric&appid=${OPENWEATHER_API_KEY}`
  );
  const data = await response.json();

  return {
    temp: Math.round(data?.main?.temp ?? 0),
    weatherCondition: data?.weather?.[0]?.main?.toLowerCase?.() ?? '',
  };
}
