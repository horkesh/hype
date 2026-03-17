import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
const cardsDir = path.resolve(dir, '..', 'components', 'cards');

test('FlippableCard source file exists', () => {
  assert.ok(fs.existsSync(path.join(cardsDir, 'FlippableCard.tsx')));
});

test('VenueCardFront source file exists', () => {
  assert.ok(fs.existsSync(path.join(cardsDir, 'VenueCardFront.tsx')));
});

test('VenueCardBack source file exists', () => {
  assert.ok(fs.existsSync(path.join(cardsDir, 'VenueCardBack.tsx')));
});

test('FlippableCard exports FlippableCard function', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'FlippableCard.tsx'), 'utf8');
  assert.ok(src.includes('export function FlippableCard'));
});

test('VenueCardFront uses GlassBadge', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'VenueCardFront.tsx'), 'utf8');
  assert.ok(src.includes('GlassBadge'));
});
