export const LEGACY_FAVORITE_VENUE_KEYS = ['saved_venues', 'savedVenues'] as const;

function parseStoredFavoriteIds(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function getLegacyFavoriteVenueIdsFromStoredValues(...values: Array<string | null>): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const value of values) {
    for (const id of parseStoredFavoriteIds(value)) {
      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
      merged.push(id);
    }
  }

  return merged;
}

export function shouldSeedRemoteFavorites(localIds: string[], remoteIds: string[]): boolean {
  return localIds.length > 0 && remoteIds.length === 0;
}
