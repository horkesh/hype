// Venue read queries. Pure functions that take a Supabase client (so the
// caller decides whether they're server-side or browser-side) and return
// shaped data ready for UI consumption.

import { type SupabaseClient } from '@supabase/supabase-js';
import { type Venue } from '../types';

// price_level is aliased from google_price_level — the table column is
// google_price_level (Places enrichment), but consumer code historically
// reads venue.price_level. PostgREST `alias:column` keeps the consumer
// shape stable.
const VENUE_SELECT = `
  id, slug, name, category, neighborhood, address, cover_image_url,
  description_bs, description_en, insider_tip_bs, insider_tip_en, moods,
  google_rating, google_ratings_count, price_level:google_price_level,
  phone, website, instagram_handle, latitude, longitude,
  is_active, is_featured, is_hidden_gem
`;

export async function getVenueBySlug(supabase: SupabaseClient, slug: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select(VENUE_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) {
    // Don't leak the error to the caller for not-found scenarios — RLS
    // returns the same null. Throw only on transport / permission errors.
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return (data as Venue | null) ?? null;
}

export async function listActiveVenues(
  supabase: SupabaseClient,
  opts: { limit?: number; category?: string | null; neighborhood?: string | null } = {},
): Promise<Venue[]> {
  let q = supabase
    .from('venues')
    .select(VENUE_SELECT)
    .eq('is_active', true)
    .order('google_rating', { ascending: false, nullsFirst: false });
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.neighborhood) q = q.eq('neighborhood', opts.neighborhood);
  q = q.limit(opts.limit ?? 60);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Venue[];
}

export async function getVenueById(supabase: SupabaseClient, id: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select(VENUE_SELECT)
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return (data as Venue | null) ?? null;
}

export function getVenueDescription(venue: Venue, language: 'bs' | 'en'): string | null {
  if (language === 'bs') return venue.description_bs ?? venue.description_en;
  return venue.description_en ?? venue.description_bs;
}

export function getVenueInsiderTip(venue: Venue, language: 'bs' | 'en'): string | null {
  if (language === 'bs') return venue.insider_tip_bs ?? venue.insider_tip_en;
  return venue.insider_tip_en ?? venue.insider_tip_bs;
}
