import test from 'node:test';
import assert from 'node:assert/strict';
import { glassTokens } from '../styles/glassTokens';
import { designTokens } from '../styles/designTokens';

const ALL_MOODS = [
  'party', 'chill', 'girls_night', 'date_night', 'muzika', 'romantika',
  'kultura', 'foodie', 'brunch', 'after_work', 'outdoor', 'turista',
] as const;

test('glassTokens exports background and border', () => {
  assert.ok(glassTokens.background, 'background should be defined');
  assert.ok(glassTokens.border, 'border should be defined');
});

test('glassTokens exports moodColors for all 12 moods, each with a primary color', () => {
  assert.strictEqual(
    Object.keys(glassTokens.moodColors).length,
    12,
    'should have exactly 12 moods',
  );
  for (const mood of ALL_MOODS) {
    assert.ok(
      glassTokens.moodColors[mood],
      `mood '${mood}' should exist`,
    );
    assert.ok(
      glassTokens.moodColors[mood].primary,
      `mood '${mood}' should have a primary color`,
    );
  }
});

test('designTokens exports radius.card = 24, radius.modal = 28, radius.chip = 24', () => {
  assert.strictEqual(designTokens.radius.card, 24);
  assert.strictEqual(designTokens.radius.modal, 28);
  assert.strictEqual(designTokens.radius.chip, 24);
});
