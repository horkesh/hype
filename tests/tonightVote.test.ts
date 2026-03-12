import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMockTonightVoteLink,
  buildTonightVoteResults,
  canCreateTonightVote,
} from '@/utils/tonightVote';

const EVENTS = [
  {
    id: 'event-1',
    title_bs: 'Svirka',
    title_en: null,
    description_bs: null,
    description_en: null,
    cover_image_url: null,
    start_datetime: '2026-03-12T20:00:00.000Z',
    price_bam: null,
    ticket_url: null,
    source: null,
    moods: [],
    category: 'music',
    venues: null,
    location_name: 'Kino Bosna',
  },
  {
    id: 'event-2',
    title_bs: 'Predstava',
    title_en: null,
    description_bs: null,
    description_en: null,
    cover_image_url: null,
    start_datetime: '2026-03-12T21:00:00.000Z',
    price_bam: 20,
    ticket_url: null,
    source: null,
    moods: [],
    category: 'theatre',
    venues: null,
    location_name: 'Narodno pozoriste',
  },
];

test('canCreateTonightVote requires at least two selected events', () => {
  assert.equal(canCreateTonightVote([]), false);
  assert.equal(canCreateTonightVote(['event-1']), false);
  assert.equal(canCreateTonightVote(['event-1', 'event-2']), true);
});

test('buildTonightVoteResults returns only selected events that still exist', () => {
  const results = buildTonightVoteResults(EVENTS, ['event-1', 'missing', 'event-2'], {
    'event-1': 3,
    'event-2': 1,
  });

  assert.deepEqual(results, [
    { eventId: 'event-1', title: 'Svirka', voteCount: 3 },
    { eventId: 'event-2', title: 'Predstava', voteCount: 1 },
  ]);
});

test('buildMockTonightVoteLink is deterministic for the selected ids', () => {
  assert.equal(
    buildMockTonightVoteLink(['event-2', 'event-1']),
    'hype.ba/vote/event-1-event-2'
  );
});
