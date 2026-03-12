import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatSavedBadgeDate,
  formatSavedEventDate,
  getSavedBadgeProgress,
  getSavedPriceLevelDisplay,
} from '@/utils/savedScreen';

test('getSavedPriceLevelDisplay returns euro symbols without mojibake', () => {
  assert.equal(getSavedPriceLevelDisplay(2), '€€');
});

test('formatSavedEventDate returns day month and time with label', () => {
  assert.equal(
    formatSavedEventDate('2026-03-12T08:05:00', 'at'),
    '12.3. at 8:05'
  );
});

test('getSavedBadgeProgress returns configured demo progress', () => {
  assert.deepEqual(getSavedBadgeProgress('explorer'), { current: 3, total: 3 });
  assert.deepEqual(getSavedBadgeProgress('unknown'), { current: 0, total: 10 });
});

test('formatSavedBadgeDate returns a compact date', () => {
  assert.equal(formatSavedBadgeDate('2026-03-12T08:05:00'), '12.3.2026');
});
