import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseSavedEventIds,
  removeSavedEventIdFromList,
} from '@/utils/savedEventsStorage';

test('parseSavedEventIds reads string arrays safely', () => {
  assert.deepEqual(parseSavedEventIds('["a","b",3]'), ['a', 'b']);
  assert.deepEqual(parseSavedEventIds(null), []);
  assert.deepEqual(parseSavedEventIds('{bad json'), []);
});

test('removeSavedEventIdFromList removes only the requested event', () => {
  assert.deepEqual(removeSavedEventIdFromList(['a', 'b', 'c'], 'b'), ['a', 'c']);
});
