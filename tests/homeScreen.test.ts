import test from 'node:test';
import assert from 'node:assert/strict';

import { getHomeHeroState } from '@/utils/homeHeroState';

test('getHomeHeroState falls back to time-of-day copy when weather is unavailable', () => {
  const state = getHomeHeroState('en', null, 9);

  assert.equal(state.heroMessage, 'Good morning, Sarajevo! ☕');
  assert.equal(state.suggestedMood, null);
});

test('getHomeHeroState returns weather-driven mood suggestions', () => {
  assert.deepEqual(
    getHomeHeroState('bs', { temp: 24, weatherCondition: 'clear sky' }, 14),
    { heroMessage: 'Savrsen dan za bastu! ☀️', suggestedMood: 'outdoor' }
  );

  assert.deepEqual(
    getHomeHeroState('en', { temp: 6, weatherCondition: 'mist' }, 14),
    { heroMessage: 'Cold outside, time for a warm drink ☕', suggestedMood: 'chill' }
  );
});
