import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasSavedSeriesId,
  parseSavedSeriesIds,
  toggleSavedSeriesIdInList,
} from '@/utils/savedSeriesStorage';

test('saved series storage parses only string ids', () => {
  assert.deepEqual(parseSavedSeriesIds('["a","b",3]'), ['a', 'b']);
  assert.deepEqual(parseSavedSeriesIds(null), []);
  assert.deepEqual(parseSavedSeriesIds('{bad json'), []);
});

test('saved series storage membership and toggle stay predictable', () => {
  assert.equal(hasSavedSeriesId(['s1', 's2'], 's2'), true);
  assert.equal(hasSavedSeriesId(['s1', 's2'], 's3'), false);
  assert.deepEqual(toggleSavedSeriesIdInList(['s1', 's2'], 's2'), ['s1']);
  assert.deepEqual(toggleSavedSeriesIdInList(['s1', 's2'], 's3'), ['s1', 's2', 's3']);
});
