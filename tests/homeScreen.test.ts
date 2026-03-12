import test from 'node:test';
import assert from 'node:assert/strict';

import { getHomeHeroState } from '@/utils/homeHeroState';

test('getHomeHeroState falls back to time-of-day copy when weather is unavailable', () => {
  const state = getHomeHeroState('en', null, 9);

  assert.equal(state.heroMessage, 'Good morning, Sarajevo! \u2615');
  assert.equal(state.suggestedMood, null);
});

test('getHomeHeroState returns weather-driven mood suggestions', () => {
  assert.deepEqual(
    getHomeHeroState('bs', { temp: 24, weatherCondition: 'clear sky' }, 14),
    { heroMessage: 'Savr\u0161en dan za ba\u0161tu! \u2600\uFE0F', suggestedMood: 'outdoor' }
  );

  assert.deepEqual(
    getHomeHeroState('bs', { temp: 14, weatherCondition: 'light rain' }, 14),
    { heroMessage: 'Ki\u0161ovito vrijeme, idealno za kafi\u0107 \ud83c\udf27\ufe0f', suggestedMood: 'chill' }
  );

  assert.deepEqual(
    getHomeHeroState('en', { temp: 6, weatherCondition: 'mist' }, 14),
    { heroMessage: 'Cold outside, time for a warm drink \u2615', suggestedMood: 'chill' }
  );
});
