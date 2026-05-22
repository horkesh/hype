import assert from 'node:assert/strict';
import test from 'node:test';

import { EXPLORE_CATEGORIES, EXPLORE_MOODS } from '@/utils/exploreScreen';

test('EXPLORE_MOODS exposes clean emoji data', () => {
  assert.equal(EXPLORE_MOODS[0]?.emoji, '\u{1F389}');
  assert.equal(EXPLORE_MOODS[7]?.emoji, '\u{1F37D}');
  assert.equal(EXPLORE_MOODS[11]?.emoji, '\u{1F9F3}');
});

test('EXPLORE_CATEGORIES exposes clean emoji data', () => {
  assert.equal(EXPLORE_CATEGORIES[0]?.emoji, '\u{1F37D}');
  assert.equal(EXPLORE_CATEGORIES[4]?.emoji, '\u{1F3AC}');
  assert.equal(EXPLORE_CATEGORIES[7]?.emoji, '\u{1F3AA}');
});
