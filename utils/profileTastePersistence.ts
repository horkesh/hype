export interface ProfileTasteRow {
  id: string;
  taste_moods: string[];
}

export interface ProfileTasteUpsertOptions {
  onConflict: string;
}

export interface ProfileTasteWriteResult {
  error: unknown | null;
}

export async function persistProfileTasteMoods(
  writeProfile: (
    row: ProfileTasteRow,
    options: ProfileTasteUpsertOptions
  ) => Promise<ProfileTasteWriteResult>,
  userId: string,
  moods: string[]
): Promise<void> {
  const result = await writeProfile(
    {
      id: userId,
      taste_moods: moods,
    },
    {
      onConflict: 'id',
    }
  );

  if (result.error) {
    throw result.error;
  }
}
