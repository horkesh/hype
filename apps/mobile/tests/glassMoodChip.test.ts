import test from 'node:test';
import assert from 'node:assert/strict';
import { glassTokens } from '../styles/glassTokens';
import type { MoodId } from '../styles/glassTokens';

test('GlassMoodChip source file exists', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const chipPath = path.resolve(import.meta.dirname ?? __dirname, '..', 'components', 'glass', 'GlassMoodChip.tsx');
  await assert.doesNotReject(fs.access(chipPath), 'GlassMoodChip.tsx should exist');
});

test('GlassMoodChip.tsx exports a named GlassMoodChip function (source check)', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const filePath = path.resolve(import.meta.dirname ?? __dirname, '..', 'components', 'glass', 'GlassMoodChip.tsx');
  const source = await fs.readFile(filePath, 'utf-8');
  assert.ok(source.includes('export function GlassMoodChip'), 'should export GlassMoodChip function');
});

test('glassTokens moodColors covers all mood ids used by GlassMoodChip', () => {
  const expectedMoods: MoodId[] = ['party', 'chill', 'girls_night', 'date_night', 'muzika', 'romantika', 'kultura', 'foodie', 'brunch', 'after_work', 'outdoor', 'turista'];
  for (const mood of expectedMoods) {
    assert.ok(glassTokens.moodColors[mood], `mood "${mood}" should exist in glassTokens`);
    assert.ok(glassTokens.moodColors[mood].primary, `mood "${mood}" should have primary color`);
  }
});

test('GlassMoodChip has a vector icon mapping for every mood', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const filePath = path.resolve(import.meta.dirname ?? __dirname, '..', 'components', 'glass', 'GlassMoodChip.tsx');
  const source = await fs.readFile(filePath, 'utf-8');
  const expectedMoods: MoodId[] = ['party', 'chill', 'girls_night', 'date_night', 'muzika', 'romantika', 'kultura', 'foodie', 'brunch', 'after_work', 'outdoor', 'turista'];
  for (const mood of expectedMoods) {
    assert.ok(source.includes(`${mood}:`), `MOOD_ICONS should have an entry for "${mood}"`);
  }
  assert.ok(!source.includes('iconSource'), 'should not reference iconSource (replaced by vector icons)');
  assert.ok(!source.includes('iconPlaceholder'), 'should not have iconPlaceholder fallback');
  assert.ok(source.includes('@expo/vector-icons'), 'should use @expo/vector-icons');
});
