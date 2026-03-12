import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveImageSource } from '../utils/imageSource';

test('resolveImageSource returns a stable object for the same string url', () => {
  const first = resolveImageSource('https://example.com/photo.jpg');
  const second = resolveImageSource('https://example.com/photo.jpg');

  assert.ok(first && typeof first === 'object' && 'uri' in first);
  assert.equal(first, second);
});

test('resolveImageSource preserves nullish values', () => {
  assert.equal(resolveImageSource(null), null);
  assert.equal(resolveImageSource(undefined), null);
});
