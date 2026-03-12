import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PROFILE_DEMO_BADGES,
  PROFILE_MOODS,
  PROFILE_THEME_OPTIONS,
  toggleProfileMoodSelection,
} from '@/utils/profileScreen';

test('toggleProfileMoodSelection adds and removes moods predictably', () => {
  assert.deepEqual(toggleProfileMoodSelection(['party'], 'music'), ['party', 'music']);
  assert.deepEqual(toggleProfileMoodSelection(['party', 'music'], 'party'), ['music']);
});

test('profile mood config keeps clean emoji values', () => {
  assert.equal(PROFILE_MOODS[0]?.emoji, '🎉');
  assert.equal(PROFILE_MOODS[7]?.emoji, '🍽️');
});

test('profile theme config exposes the expected choices', () => {
  assert.deepEqual(
    PROFILE_THEME_OPTIONS.map((option) => option.value),
    ['auto', 'light', 'dark']
  );
});

test('profile demo badges keep their visible icons', () => {
  assert.equal(PROFILE_DEMO_BADGES[0]?.icon, '☕');
  assert.equal(PROFILE_DEMO_BADGES[2]?.icon, '👑');
});
