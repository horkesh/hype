import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeSuggestedMood } from '../utils/homeWeather';

test('mergeSuggestedMood applies the weather suggestion when no mood is selected', () => {
  assert.equal(mergeSuggestedMood(null, 'outdoor'), 'outdoor');
});

test('mergeSuggestedMood updates the current mood when the weather suggests a different one', () => {
  assert.equal(mergeSuggestedMood('party', 'chill'), 'chill');
});

test('mergeSuggestedMood preserves the current mood when there is no suggestion', () => {
  assert.equal(mergeSuggestedMood('party', null), 'party');
});
