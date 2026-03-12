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
