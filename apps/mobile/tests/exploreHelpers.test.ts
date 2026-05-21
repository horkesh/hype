import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterDailySpecialsByPrice,
  filterVenuesByClientRules,
  getExploreMenuFilters,
  getPriceLevelDisplay,
  toggleSelection,
  toggleSingleSelection,
} from '@/utils/exploreHelpers';

test('getPriceLevelDisplay returns euro signs without mojibake', () => {
  assert.equal(getPriceLevelDisplay(3), '\u20ac\u20ac\u20ac');
});

test('toggleSelection adds and removes values predictably', () => {
  assert.deepEqual(toggleSelection(['coffee'], 'quiet'), ['coffee', 'quiet']);
  assert.deepEqual(toggleSelection(['coffee', 'quiet'], 'coffee'), ['quiet']);
});

test('toggleSingleSelection toggles to null when selecting the active value', () => {
  assert.equal(toggleSingleSelection('cafe', 'cafe'), null);
  assert.equal(toggleSingleSelection(null, 'bar'), 'bar');
});

test('filterDailySpecialsByPrice applies the selected price bucket', () => {
  const specials = [
    { id: 'a', price: 7 },
    { id: 'b', price: 10 },
    { id: 'c', price: 14 },
  ] as Array<any>;

  assert.deepEqual(
    filterDailySpecialsByPrice(specials, '8_to_12').map((special) => special.id),
    ['b']
  );
});

test('filterVenuesByClientRules applies price-level filtering before open-now filtering', () => {
  const venues = [
    { id: '1', price_level: 2, opening_hours: null },
    { id: '2', price_level: 4, opening_hours: null },
  ] as Array<any>;

  assert.deepEqual(
    filterVenuesByClientRules(venues, 2, false).map((venue) => venue.id),
    ['1']
  );
});

test('getExploreMenuFilters localizes the price buckets', () => {
  const filters = getExploreMenuFilters((key) => `label:${key}`);

  assert.deepEqual(filters, [
    { id: 'up_to_8', label: 'label:menuUpTo8' },
    { id: '8_to_12', label: 'label:menu8to12' },
    { id: '12_plus', label: 'label:menu12Plus' },
  ]);
});
