import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/integrations/supabase/client';
import { FavoritesAuthRequiredError } from '@/utils/favoritesErrors';
import {
  LEGACY_FAVORITE_VENUE_KEYS,
  shouldSeedRemoteFavorites,
} from '@/utils/favoritesLegacy';
import {
  buildMissingRemoteFavoriteVenueIds,
  getStoredFavoriteVenueIds,
  mergeFavoriteVenueIds,
  persistStoredFavoriteVenueIds,
} from '@/utils/favoritesStorage';
import { isAuthSessionMissingError } from '@/utils/supabaseErrors';

export {
  FAVORITES_AUTH_REQUIRED,
  FavoritesAuthRequiredError,
  isFavoritesAuthRequiredError,
} from '@/utils/favoritesErrors';

export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isAuthSessionMissingError(error)) {
      return null;
    }

    throw error;
  }

  return user?.id ?? null;
}

async function getLegacyFavoriteVenueIds(): Promise<string[]> {
  return getStoredFavoriteVenueIds(
    {
      getItem: (key) => AsyncStorage.getItem(key),
      setItem: (key, value) => AsyncStorage.setItem(key, value),
    },
    LEGACY_FAVORITE_VENUE_KEYS,
  );
}

async function persistLegacyFavoriteVenueIds(ids: string[]): Promise<void> {
  await persistStoredFavoriteVenueIds(
    {
      getItem: (key) => AsyncStorage.getItem(key),
      setItem: (key, value) => AsyncStorage.setItem(key, value),
    },
    LEGACY_FAVORITE_VENUE_KEYS,
    ids,
  );
}

export async function requireCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new FavoritesAuthRequiredError();
  }

  return userId;
}

export async function getFavoriteVenueIdsForCurrentUser(): Promise<string[]> {
  const userId = await getCurrentUserId();
  const legacyIds = await getLegacyFavoriteVenueIds();

  if (!userId) {
    return legacyIds;
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('venue_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const remoteIds = (data || [])
    .map((favorite) => favorite.venue_id)
    .filter((venueId): venueId is string => typeof venueId === 'string');

  const mergedIds = mergeFavoriteVenueIds(remoteIds, legacyIds);

  if (shouldSeedRemoteFavorites(legacyIds, remoteIds)) {
    await supabase
      .from('favorites')
      .upsert(
        legacyIds.map((venueId) => ({
          user_id: userId,
          venue_id: venueId,
        })),
        {
          onConflict: 'user_id,venue_id',
        },
      );
  } else {
    const missingRemoteIds = buildMissingRemoteFavoriteVenueIds(legacyIds, remoteIds);
    if (missingRemoteIds.length > 0) {
      await supabase
        .from('favorites')
        .upsert(
          missingRemoteIds.map((venueId) => ({
            user_id: userId,
            venue_id: venueId,
          })),
          {
            onConflict: 'user_id,venue_id',
          },
        );
    }
  }

  await persistLegacyFavoriteVenueIds(mergedIds);

  return mergedIds;
}

export async function isVenueFavoritedByCurrentUser(venueId: string): Promise<boolean> {
  const ids = await getFavoriteVenueIdsForCurrentUser();
  return ids.includes(venueId);
}

export async function addVenueFavoriteForCurrentUser(venueId: string): Promise<void> {
  const userId = await requireCurrentUserId();

  const { error } = await supabase
    .from('favorites')
    .upsert(
      {
        user_id: userId,
        venue_id: venueId,
      },
      {
        onConflict: 'user_id,venue_id',
      },
    );

  if (error) {
    throw error;
  }

  const legacyIds = await getLegacyFavoriteVenueIds();
  await persistLegacyFavoriteVenueIds(mergeFavoriteVenueIds([venueId], legacyIds));
}

export async function removeVenueFavoriteForCurrentUser(venueId: string): Promise<void> {
  const userId = await requireCurrentUserId();

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('venue_id', venueId);

  if (error) {
    throw error;
  }

  const legacyIds = await getLegacyFavoriteVenueIds();
  await persistLegacyFavoriteVenueIds(legacyIds.filter((id) => id !== venueId));
}
