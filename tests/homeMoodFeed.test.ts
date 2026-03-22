import test from 'node:test';
import assert from 'node:assert/strict';
import {
  interleaveFeedItems,
  MoodFeedVenue,
  MoodFeedEvent,
} from '../utils/homeMoodFeedUtils';

function makeVenue(id: string): MoodFeedVenue {
  return {
    type: 'venue',
    id,
    name: `Venue ${id}`,
    cover_image_url: null,
    category: 'restaurant',
    neighborhood: null,
    address: null,
    description_bs: null,
    description_en: null,
    moods: [],
    is_hidden_gem: false,
    google_rating: null,
  };
}

function makeEvent(id: string): MoodFeedEvent {
  return {
    type: 'event',
    id,
    title_bs: `Event ${id}`,
    title_en: null,
    cover_image_url: null,
    start_datetime: '2026-04-01T20:00:00Z',
    moods: [],
    price_bam: null,
    location_name: null,
    venues: null,
  };
}

test('interleaveFeedItems with equal venues and events', () => {
  const venues = [makeVenue('v1'), makeVenue('v2'), makeVenue('v3'), makeVenue('v4')];
  const events = [makeEvent('e1'), makeEvent('e2')];
  const result = interleaveFeedItems(venues, events);

  const ids = result.map((item) => item.id);
  assert.deepEqual(ids, ['v1', 'v2', 'e1', 'v3', 'v4', 'e2']);
});

test('interleaveFeedItems with more venues than events', () => {
  const venues = [makeVenue('v1'), makeVenue('v2'), makeVenue('v3'), makeVenue('v4'), makeVenue('v5')];
  const events = [makeEvent('e1')];
  const result = interleaveFeedItems(venues, events);

  const ids = result.map((item) => item.id);
  assert.deepEqual(ids, ['v1', 'v2', 'e1', 'v3', 'v4', 'v5']);
});

test('interleaveFeedItems with more events than venues', () => {
  const venues = [makeVenue('v1')];
  const events = [makeEvent('e1'), makeEvent('e2'), makeEvent('e3')];
  const result = interleaveFeedItems(venues, events);

  const ids = result.map((item) => item.id);
  assert.deepEqual(ids, ['v1', 'e1', 'e2', 'e3']);
});

test('interleaveFeedItems with only venues', () => {
  const venues = [makeVenue('v1'), makeVenue('v2'), makeVenue('v3')];
  const result = interleaveFeedItems(venues, []);

  const ids = result.map((item) => item.id);
  assert.deepEqual(ids, ['v1', 'v2', 'v3']);
  assert.ok(result.every((item) => item.type === 'venue'));
});

test('interleaveFeedItems with only events', () => {
  const events = [makeEvent('e1'), makeEvent('e2')];
  const result = interleaveFeedItems([], events);

  const ids = result.map((item) => item.id);
  assert.deepEqual(ids, ['e1', 'e2']);
  assert.ok(result.every((item) => item.type === 'event'));
});

test('interleaveFeedItems with empty inputs', () => {
  const result = interleaveFeedItems([], []);
  assert.deepEqual(result, []);
});

test('interleaveFeedItems preserves type tags', () => {
  const venues = [makeVenue('v1'), makeVenue('v2')];
  const events = [makeEvent('e1')];
  const result = interleaveFeedItems(venues, events);

  assert.equal(result[0].type, 'venue');
  assert.equal(result[1].type, 'venue');
  assert.equal(result[2].type, 'event');
});

test('interleaveFeedItems 2:1 ratio pattern', () => {
  const venues = Array.from({ length: 6 }, (_, i) => makeVenue(`v${i + 1}`));
  const events = Array.from({ length: 3 }, (_, i) => makeEvent(`e${i + 1}`));
  const result = interleaveFeedItems(venues, events);

  const types = result.map((item) => item.type);
  assert.deepEqual(types, [
    'venue', 'venue', 'event',
    'venue', 'venue', 'event',
    'venue', 'venue', 'event',
  ]);
});
