import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HOME_MOODS,
  formatEventDateLabel,
  getCafeDescription,
  getDefaultHeroSubtitle,
  getEmptyEventsMessage,
  getHomeSectionLabels,
  getSeriesCountdownLabel,
  getTimeOfDayHeroMessage,
} from '@/utils/homeScreenContent';

test('home labels reflect the selected language', () => {
  assert.equal(getHomeSectionLabels('bs').events, 'Nadolazeći događaji');
  assert.equal(getHomeSectionLabels('en').events, 'Upcoming events');
  assert.equal(getHomeSectionLabels('bs').seeAll, 'Vidi sve');
  assert.equal(getHomeSectionLabels('en').seeAll, 'See all');
});

test('time-of-day hero messages are deterministic by hour and language', () => {
  assert.equal(getTimeOfDayHeroMessage('bs', 9), 'Dobro jutro, Sarajevo! ☕');
  assert.equal(getTimeOfDayHeroMessage('en', 15), 'Good afternoon! What are you up to? 🌞');
  assert.equal(getTimeOfDayHeroMessage('bs', 21), 'Dobro veče! Vrijeme je za izlazak 🌙');
});

test('series countdown covers future, active, and ended states', () => {
  const now = new Date('2026-03-12T12:00:00.000Z');

  assert.equal(
    getSeriesCountdownLabel('en', '2026-03-15', '2026-03-20', now),
    'Starts in 3 days'
  );
  assert.equal(
    getSeriesCountdownLabel('bs', '2026-03-10', '2026-03-15', now),
    '🔥 Aktivno sada'
  );
  assert.equal(
    getSeriesCountdownLabel('en', '2026-03-01', '2026-03-05', now),
    'Ended'
  );
});

test('event date label handles today, tomorrow, and later dates', () => {
  const now = new Date('2026-03-12T12:00:00.000Z');

  assert.equal(
    formatEventDateLabel('bs', '2026-03-12T18:00:00.000Z', now),
    'Danas'
  );
  assert.equal(
    formatEventDateLabel('en', '2026-03-13T18:00:00.000Z', now),
    'Tomorrow'
  );
  assert.ok(
    formatEventDateLabel('en', '2026-03-18T18:00:00.000Z', now).length > 0
  );
});

test('cafe description prefers language-specific text with fallback', () => {
  assert.equal(
    getCafeDescription('bs', 'Bosanski opis', 'English description'),
    'Bosanski opis'
  );
  assert.equal(
    getCafeDescription('en', 'Bosanski opis', 'English description'),
    'English description'
  );
  assert.equal(
    getCafeDescription('en', 'Bosanski opis', null),
    'Bosanski opis'
  );
});

test('home copy helpers return stable copy collections', () => {
  assert.equal(getDefaultHeroSubtitle('bs'), 'Otkrijte najbolje što Sarajevo nudi danas');
  assert.equal(getEmptyEventsMessage('en'), 'Nothing for today — but tomorrow is a new day! 🌅');
  assert.equal(HOME_MOODS[0].id, 'party');
});
