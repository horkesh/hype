import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildMissingRemoteFavoriteVenueIds,
  getStoredFavoriteVenueIds,
  mergeFavoriteVenueIds,
  persistStoredFavoriteVenueIds,
} from '@/utils/favoritesStorage';

test('mergeFavoriteVenueIds keeps remote-first ordering while removing duplicates', () => {
  const ids = mergeFavoriteVenueIds(['venue-3', 'venue-2'], ['venue-2', 'venue-1']);

  assert.deepEqual(ids, ['venue-3', 'venue-2', 'venue-1']);
});

test('buildMissingRemoteFavoriteVenueIds returns only local ids missing from remote state', () => {
  const ids = buildMissingRemoteFavoriteVenueIds(['venue-1', 'venue-2', 'venue-3'], ['venue-2']);

  assert.deepEqual(ids, ['venue-1', 'venue-3']);
});

test('getStoredFavoriteVenueIds reads and merges all configured storage keys', async () => {
  const values = new Map<string, string | null>([
    ['saved_venues', '["venue-1","venue-2"]'],
    ['savedVenues', '["venue-2","venue-3"]'],
  ]);

  const ids = await getStoredFavoriteVenueIds(
    {
      getItem: async (key) => values.get(key) ?? null,
      setItem: async () => undefined,
    },
    ['saved_venues', 'savedVenues']
  );

  assert.deepEqual(ids, ['venue-1', 'venue-2', 'venue-3']);
});

test('persistStoredFavoriteVenueIds mirrors one serialized payload across all keys', async () => {
  const writes: Array<[string, string]> = [];

  await persistStoredFavoriteVenueIds(
    {
      getItem: async () => null,
      setItem: async (key, value) => {
        writes.push([key, value]);
      },
    },
    ['saved_venues', 'savedVenues'],
    ['venue-1', 'venue-2']
  );

  assert.deepEqual(writes, [
    ['saved_venues', '["venue-1","venue-2"]'],
    ['savedVenues', '["venue-1","venue-2"]'],
  ]);
});
