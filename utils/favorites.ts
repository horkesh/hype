import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/integrations/supabase/client';
import { FavoritesAuthRequiredError } from '@/utils/favoritesErrors';
import {
  getLegacyFavoriteVenueIdsFromStoredValues,
  LEGACY_FAVORITE_VENUE_KEYS,
  shouldSeedRemoteFavorites,
} from '@/utils/favoritesLegacy';
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
  const storedValues = await Promise.all(
    [...LEGACY_FAVORITE_VENUE_KEYS].map((key) => AsyncStorage.getItem(key)),
  );

  return getLegacyFavoriteVenueIdsFromStoredValues(...storedValues);
}

async function persistLegacyFavoriteVenueIds(ids: string[]): Promise<void> {
  const serialized = JSON.stringify(ids);

  await Promise.all(
    LEGACY_FAVORITE_VENUE_KEYS.map((key) => AsyncStorage.setItem(key, serialized)),
  );
}

function mergeUniqueIds(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const group of groups) {
    for (const id of group) {
      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
      merged.push(id);
    }
  }

  return merged;
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

  const mergedIds = mergeUniqueIds(remoteIds, legacyIds);

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
    const missingRemoteIds = legacyIds.filter((venueId) => !remoteIds.includes(venueId));
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
  await persistLegacyFavoriteVenueIds(mergeUniqueIds([venueId], legacyIds));
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
