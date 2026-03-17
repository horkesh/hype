import assert from 'node:assert/strict';
import test from 'node:test';

import { syncRemoteFavoriteVenueIds } from '@/utils/favoritesSync';

test('syncRemoteFavoriteVenueIds writes composite favorite rows for each venue id', async () => {
  let receivedRows:
    | Array<{ user_id: string; venue_id: string }>
    | undefined;
  let receivedOptions: { onConflict: string } | undefined;

  await syncRemoteFavoriteVenueIds(
    async (rows, options) => {
      receivedRows = rows;
      receivedOptions = options;
      return { error: null };
    },
    'user-1',
    ['venue-1', 'venue-2'],
  );

  assert.deepEqual(receivedRows, [
    { user_id: 'user-1', venue_id: 'venue-1' },
    { user_id: 'user-1', venue_id: 'venue-2' },
  ]);
  assert.deepEqual(receivedOptions, { onConflict: 'user_id,venue_id' });
});

test('syncRemoteFavoriteVenueIds throws when the remote write fails', async () => {
  await assert.rejects(
    () =>
      syncRemoteFavoriteVenueIds(
        async () => ({ error: new Error('favorite sync failed') }),
        'user-1',
        ['venue-1'],
      ),
    /favorite sync failed/,
  );
});

test('syncRemoteFavoriteVenueIds skips the remote write when there are no ids to sync', async () => {
  let called = false;

  await syncRemoteFavoriteVenueIds(
    async () => {
      called = true;
      return { error: null };
    },
    'user-1',
    [],
  );

  assert.equal(called, false);
});
