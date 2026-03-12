import { supabase } from '@/integrations/supabase/client';
import { normalizeVenueRows } from '@/utils/errorLogger';
import {
  getCurrentUserId,
  getFavoriteVenueIdsForCurrentUser,
  removeVenueFavoriteForCurrentUser,
} from '@/utils/favorites';
import {
  loadSavedEventIdsFromStorage,
  removeSavedEventIdFromList,
  saveSavedEventIdsToStorage,
} from '@/utils/savedEventsStorage';
import { SavedBadge, SavedEvent, SavedVenue } from '@/utils/savedScreen';

export async function loadSavedVenues(
  language: string
): Promise<{ isSignedIn: boolean; venues: SavedVenue[] }> {
  const userId = await getCurrentUserId();
  const ids = await getFavoriteVenueIdsForCurrentUser();

  if (ids.length === 0) {
    return {
      isSignedIn: Boolean(userId),
      venues: [],
    };
  }

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .in('id', ids);

  if (error) {
    throw error;
  }

  return {
    isSignedIn: Boolean(userId),
    venues: normalizeVenueRows(data, language),
  };
}

export async function loadSavedEvents(): Promise<SavedEvent[]> {
  const ids = await loadSavedEventIdsFromStorage();

  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('events')
    .select('*, venues(name)')
    .in('id', ids);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function loadSavedBadges(): Promise<SavedBadge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('badge_key');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function removeSavedVenue(venueId: string): Promise<void> {
  await removeVenueFavoriteForCurrentUser(venueId);
}

export async function removeSavedEvent(eventId: string): Promise<string[]> {
  const ids = await loadSavedEventIdsFromStorage();
  const nextIds = removeSavedEventIdFromList(ids, eventId);

  await saveSavedEventIdsToStorage(nextIds);

  return nextIds;
}
