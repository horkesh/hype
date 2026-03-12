import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatSavedBadgeDate,
  formatSavedEventDate,
  getSavedBadgeProgress,
  getSavedEmptyState,
  getSavedPriceLevelDisplay,
  getSavedTabLabels,
  SAVED_MOODS,
} from '@/utils/savedScreen';

test('getSavedPriceLevelDisplay returns euro symbols without mojibake', () => {
  assert.equal(getSavedPriceLevelDisplay(2), '\u20ac\u20ac');
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

test('saved mood icons stay clean and stable', () => {
  assert.equal(SAVED_MOODS.party, '\u{1F389}');
  assert.equal(SAVED_MOODS.foodie, '\u{1F37D}');
});

test('saved tab labels expose clean localized text', () => {
  const bosnianTabs = getSavedTabLabels(true);
  const englishTabs = getSavedTabLabels(false);

  assert.equal(bosnianTabs[0]?.label, '\u2764\uFE0F Favoriti');
  assert.equal(bosnianTabs[1]?.label, '\u{1F39F}\uFE0F Događaji');
  assert.equal(englishTabs[2]?.label, '\u{1F3C6} Badges');
});

test('saved empty state copy changes for signed-out venue favorites', () => {
  const signedOutVenues = getSavedEmptyState('venues', false, true);
  const badges = getSavedEmptyState('badges', true, false);

  assert.equal(signedOutVenues.title, 'Prijavi se da sačuvaš mjesta');
  assert.equal(signedOutVenues.buttonRoute, '/(tabs)/profile');
  assert.equal(badges.subtitle, 'Earn badges through your activity in the app.');
});
