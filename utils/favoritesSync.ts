export interface FavoriteVenueRow {
  user_id: string;
  venue_id: string;
}

export interface FavoriteVenueUpsertOptions {
  onConflict: string;
}

export interface FavoriteVenueWriteResult {
  error: unknown | null;
}

export async function syncRemoteFavoriteVenueIds(
  writeFavorites: (
    rows: FavoriteVenueRow[],
    options: FavoriteVenueUpsertOptions
  ) => Promise<FavoriteVenueWriteResult>,
  userId: string,
  venueIds: string[]
): Promise<void> {
  if (venueIds.length === 0) {
    return;
  }

  const result = await writeFavorites(
    venueIds.map((venueId) => ({
      user_id: userId,
      venue_id: venueId,
    })),
    {
      onConflict: 'user_id,venue_id',
    }
  );

  if (result.error) {
    throw result.error;
  }
}
