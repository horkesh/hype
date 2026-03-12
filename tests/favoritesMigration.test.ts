import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLegacyFavoriteVenueIdsFromStoredValues,
  shouldSeedRemoteFavorites,
} from '../utils/favoritesLegacy';

test('getLegacyFavoriteVenueIdsFromStoredValues merges both legacy keys and removes duplicates', () => {
  const ids = getLegacyFavoriteVenueIdsFromStoredValues(
    '["venue-1","venue-2"]',
    '["venue-2","venue-3"]',
  );

  assert.deepEqual(ids, ['venue-1', 'venue-2', 'venue-3']);
});

test('getLegacyFavoriteVenueIdsFromStoredValues ignores malformed payloads', () => {
  const ids = getLegacyFavoriteVenueIdsFromStoredValues(
    '{"not":"an-array"}',
    'not-json',
  );

  assert.deepEqual(ids, []);
});

test('shouldSeedRemoteFavorites only seeds when remote favorites are empty and local favorites exist', () => {
  assert.equal(shouldSeedRemoteFavorites(['venue-1'], []), true);
  assert.equal(shouldSeedRemoteFavorites(['venue-1'], ['venue-1']), false);
  assert.equal(shouldSeedRemoteFavorites([], []), false);
});
