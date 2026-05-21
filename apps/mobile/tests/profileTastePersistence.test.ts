import assert from 'node:assert/strict';
import test from 'node:test';

import { persistProfileTasteMoods } from '@/utils/profileTastePersistence';

test('persistProfileTasteMoods upserts the profile row keyed by user id', async () => {
  let receivedRow:
    | { id: string; taste_moods: string[] }
    | undefined;
  let receivedOptions: { onConflict: string } | undefined;

  await persistProfileTasteMoods(
    async (row, options) => {
      receivedRow = row;
      receivedOptions = options;
      return { error: null };
    },
    'user-1',
    ['coffee', 'brunch'],
  );

  assert.deepEqual(receivedRow, {
    id: 'user-1',
    taste_moods: ['coffee', 'brunch'],
  });
  assert.deepEqual(receivedOptions, { onConflict: 'id' });
});

test('persistProfileTasteMoods throws when the profile upsert fails', async () => {
  await assert.rejects(
    () =>
      persistProfileTasteMoods(
        async () => ({ error: new Error('profile write failed') }),
        'user-1',
        ['coffee'],
      ),
    /profile write failed/,
  );
});
