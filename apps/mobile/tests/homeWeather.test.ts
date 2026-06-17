import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeSuggestedMood } from '../utils/homeWeather';

test('mergeSuggestedMood keeps the default Home feed when weather suggests a mood', () => {
  assert.equal(mergeSuggestedMood(null, 'outdoor'), null);
});

test('mergeSuggestedMood does not override a user-selected mood', () => {
  assert.equal(mergeSuggestedMood('party', 'chill'), 'party');
});

test('mergeSuggestedMood preserves the current mood when there is no suggestion', () => {
  assert.equal(mergeSuggestedMood('party', null), 'party');
});
