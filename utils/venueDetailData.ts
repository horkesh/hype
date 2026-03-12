import { supabase } from '@/integrations/supabase/client';
import { normalizeDailySpecialRows, normalizeVenue } from '@/utils/errorLogger';
import {
  addVenueFavoriteForCurrentUser,
  isVenueFavoritedByCurrentUser,
  removeVenueFavoriteForCurrentUser,
} from '@/utils/favorites';
import {
  VenueDetailEvent,
  VenueDetailLanguage,
  VenueDetailSpecial,
  VenueDetailVenue,
} from '@/utils/venueDetailScreen';

export async function loadVenueDetail(
  venueId: string,
  language: VenueDetailLanguage
): Promise<VenueDetailVenue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', venueId)
    .single();

  if (error) {
    throw error;
  }

  return data ? (normalizeVenue(data, language) as VenueDetailVenue) : null;
}

export async function loadVenueEvents(venueId: string): Promise<VenueDetailEvent[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('venue_id', venueId)
    .gte('start_datetime', now)
    .order('start_datetime', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as VenueDetailEvent[];
}

export async function loadVenueDailySpecials(
  venueId: string,
  language: VenueDetailLanguage
): Promise<VenueDetailSpecial[]> {
  const { data, error } = await supabase
    .from('daily_specials')
    .select('*')
    .eq('venue_id', venueId)
    .eq('is_active', true);

  if (error) {
    throw error;
  }

  return normalizeDailySpecialRows(data, language) as VenueDetailSpecial[];
}

export async function loadVenueSavedState(venueId: string): Promise<boolean> {
  return isVenueFavoritedByCurrentUser(venueId);
}

export async function toggleVenueSavedState(
  venueId: string,
  isSaved: boolean
): Promise<boolean> {
  if (isSaved) {
    await removeVenueFavoriteForCurrentUser(venueId);
    return false;
  }

  await addVenueFavoriteForCurrentUser(venueId);
  return true;
}
