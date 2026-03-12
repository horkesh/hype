import assert from 'node:assert/strict';
import test from 'node:test';

import { EXPLORE_CATEGORIES, EXPLORE_MOODS } from '@/utils/exploreScreen';

test('EXPLORE_MOODS exposes clean emoji data', () => {
  assert.equal(EXPLORE_MOODS[0]?.emoji, '🎉');
  assert.equal(EXPLORE_MOODS[7]?.emoji, '🍽');
  assert.equal(EXPLORE_MOODS[11]?.emoji, '🧳');
});

test('EXPLORE_CATEGORIES exposes clean emoji data', () => {
  assert.equal(EXPLORE_CATEGORIES[0]?.emoji, '🍽');
  assert.equal(EXPLORE_CATEGORIES[4]?.emoji, '🎬');
  assert.equal(EXPLORE_CATEGORIES[7]?.emoji, '🎪');
});
