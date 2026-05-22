import { type SupabaseClient } from '@supabase/supabase-js';
import { type Event } from '../types';

const EVENT_SELECT = `
  id, slug, title_bs, title_en, description_bs, description_en, category,
  start_datetime, cover_image_url, ticket_url, venue_id, location_name,
  is_active, status
`;

export async function getEventBySlug(supabase: SupabaseClient, slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('status', 'approved')
    .maybeSingle();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return (data as Event | null) ?? null;
}

export async function listUpcomingEvents(
  supabase: SupabaseClient,
  limit = 50,
): Promise<Event[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('is_active', true)
    .eq('status', 'approved')
    .gte('start_datetime', nowIso)
    .order('start_datetime', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Event[];
}

export function getEventTitle(event: Event, language: 'bs' | 'en'): string {
  if (language === 'bs') return event.title_bs ?? event.title_en ?? '';
  return event.title_en ?? event.title_bs ?? '';
}

export function getEventDescription(event: Event, language: 'bs' | 'en'): string | null {
  if (language === 'bs') return event.description_bs ?? event.description_en;
  return event.description_en ?? event.description_bs;
}
