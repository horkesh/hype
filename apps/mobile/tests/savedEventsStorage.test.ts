import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasSavedEventId,
  LEGACY_SAVED_EVENT_KEYS,
  parseSavedEventIds,
  removeSavedEventIdFromList,
  toggleSavedEventIdInList,
} from '@/utils/savedEventsStorage';

test('parseSavedEventIds reads string arrays safely', () => {
  assert.deepEqual(parseSavedEventIds('["a","b",3]'), ['a', 'b']);
  assert.deepEqual(parseSavedEventIds(null), []);
  assert.deepEqual(parseSavedEventIds('{bad json'), []);
});

test('removeSavedEventIdFromList removes only the requested event', () => {
  assert.deepEqual(removeSavedEventIdFromList(['a', 'b', 'c'], 'b'), ['a', 'c']);
});

test('saved event list helpers detect and toggle membership predictably', () => {
  assert.equal(hasSavedEventId(['a', 'b'], 'b'), true);
  assert.equal(hasSavedEventId(['a', 'b'], 'c'), false);
  assert.deepEqual(toggleSavedEventIdInList(['a', 'b'], 'b'), ['a']);
  assert.deepEqual(toggleSavedEventIdInList(['a', 'b'], 'c'), ['a', 'b', 'c']);
});

test('saved event storage keeps both legacy keys in sync', () => {
  assert.deepEqual(LEGACY_SAVED_EVENT_KEYS, ['saved_events', 'savedEvents']);
});
