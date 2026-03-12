import {
  getLegacyFavoriteVenueIdsFromStoredValues,
  LEGACY_FAVORITE_VENUE_KEYS,
} from '@/utils/favoritesLegacy';

export interface FavoriteVenueStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

export function mergeFavoriteVenueIds(...groups: string[][]): string[] {
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

export function buildMissingRemoteFavoriteVenueIds(
  localIds: string[],
  remoteIds: string[]
): string[] {
  return localIds.filter((venueId) => !remoteIds.includes(venueId));
}

export async function getStoredFavoriteVenueIds(
  storage: FavoriteVenueStorage,
  keys: readonly string[] = LEGACY_FAVORITE_VENUE_KEYS
): Promise<string[]> {
  const storedValues = await Promise.all(keys.map((key) => storage.getItem(key)));
  return getLegacyFavoriteVenueIdsFromStoredValues(...storedValues);
}

export async function persistStoredFavoriteVenueIds(
  storage: FavoriteVenueStorage,
  keys: readonly string[] = LEGACY_FAVORITE_VENUE_KEYS,
  ids: string[]
): Promise<void> {
  const serialized = JSON.stringify(ids);

  await Promise.all(keys.map((key) => storage.setItem(key, serialized)));
}
