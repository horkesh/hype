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
