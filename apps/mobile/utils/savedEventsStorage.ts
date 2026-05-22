import AsyncStorage from '@react-native-async-storage/async-storage';

export const LEGACY_SAVED_EVENT_KEYS = ['saved_events', 'savedEvents'] as const;

export function parseSavedEventIds(rawValue: string | null): string[] {
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

export function removeSavedEventIdFromList(ids: string[], eventId: string): string[] {
  return ids.filter((id) => id !== eventId);
}

export function hasSavedEventId(ids: string[], eventId: string): boolean {
  return ids.includes(eventId);
}

export function toggleSavedEventIdInList(ids: string[], eventId: string): string[] {
  if (hasSavedEventId(ids, eventId)) {
    return removeSavedEventIdFromList(ids, eventId);
  }

  return [...ids, eventId];
}

export async function loadSavedEventIdsFromStorage(): Promise<string[]> {
  const values = await Promise.all(LEGACY_SAVED_EVENT_KEYS.map((key) => AsyncStorage.getItem(key)));
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    for (const id of parseSavedEventIds(value)) {
      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
      merged.push(id);
    }
  }

  return merged;
}

export async function saveSavedEventIdsToStorage(ids: string[]): Promise<void> {
  const serialized = JSON.stringify(ids);
  await Promise.all(LEGACY_SAVED_EVENT_KEYS.map((key) => AsyncStorage.setItem(key, serialized)));
}
