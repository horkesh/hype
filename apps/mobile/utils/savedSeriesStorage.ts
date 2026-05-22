import AsyncStorage from '@react-native-async-storage/async-storage';

export const LEGACY_SAVED_SERIES_KEYS = ['savedSeries'] as const;

export function parseSavedSeriesIds(rawValue: string | null): string[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

export function hasSavedSeriesId(ids: string[], seriesId: string): boolean {
  return ids.includes(seriesId);
}

export function toggleSavedSeriesIdInList(ids: string[], seriesId: string): string[] {
  if (hasSavedSeriesId(ids, seriesId)) {
    return ids.filter((id) => id !== seriesId);
  }

  return [...ids, seriesId];
}

export async function loadSavedSeriesIdsFromStorage(): Promise<string[]> {
  const values = await Promise.all(LEGACY_SAVED_SERIES_KEYS.map((key) => AsyncStorage.getItem(key)));
  return values.flatMap((value) => parseSavedSeriesIds(value));
}

export async function saveSavedSeriesIdsToStorage(ids: string[]): Promise<void> {
  const serialized = JSON.stringify(ids);
  await Promise.all(LEGACY_SAVED_SERIES_KEYS.map((key) => AsyncStorage.setItem(key, serialized)));
}
