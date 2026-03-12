import test from 'node:test';
import assert from 'node:assert/strict';
import { isSourceReadyToRun, mapScrapeSourceRow } from '../src/services/ingestionSources.js';

test('isSourceReadyToRun returns false for inactive sources', () => {
  assert.equal(isSourceReadyToRun(null, 24, false), false);
});

test('isSourceReadyToRun returns true when an active source has never been scraped', () => {
  assert.equal(isSourceReadyToRun(null, 24, true), true);
});

test('mapScrapeSourceRow derives readyToRun from frequency and last_scraped_at', () => {
  const source = mapScrapeSourceRow(
    {
      id: 'source-1',
      name: 'Test source',
      source_url: 'https://example.com/source',
      tier: 2,
      scrape_config: null,
      frequency_hours: 24,
      is_active: true,
      last_scraped_at: '2026-03-10T00:00:00Z',
    },
    new Date('2026-03-11T12:30:00Z'),
  );

  assert.equal(source.readyToRun, true);
  assert.deepEqual(source.scrapeConfig, {});
});
