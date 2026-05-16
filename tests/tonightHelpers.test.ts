import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTonightPlanMarkers,
  createMockVoteState,
  formatEventTime,
  getInitialTonightSegment,
  getTicketButtonText,
  getTonightPriceText,
  getTonightSegmentRange,
  getUrgencyBadge,
  toggleTonightSelection,
} from '@/utils/tonightHelpers';
import { buildTonightSegments } from '@/utils/tonightScreen';

const translate = (key: string): string => key;

test('getInitialTonightSegment defaults to "all" so users land on the full upcoming list', () => {
  // Previously this returned a time-of-day segment based on the current hour,
  // which hid all events not happening today. The Tonight tab is the only
  // browse-all-events surface, so "all" is the right entry point.
  assert.equal(getInitialTonightSegment(new Date('2026-03-12T07:00:00')), 'all');
  assert.equal(getInitialTonightSegment(new Date('2026-03-12T23:00:00')), 'all');
});

test('getTonightSegmentRange "all" covers the next year', () => {
  const segments = buildTonightSegments(translate);
  const now = new Date(2026, 4, 16, 12, 0, 0);
  const range = getTonightSegmentRange('all', segments, now);
  assert.ok(range);
  assert.equal(range?.startTime.getTime(), now.getTime());
  assert.equal(range?.endTime.getFullYear(), 2027);
  assert.equal(range?.endTime.getMonth(), 4);
});

test('getTonightSegmentRange rolls night into the next day', () => {
  const segments = buildTonightSegments(translate);
  const range = getTonightSegmentRange('night', segments, new Date(2026, 2, 12, 21, 0, 0));

  assert.ok(range);
  assert.equal(range?.startTime.getFullYear(), 2026);
  assert.equal(range?.startTime.getMonth(), 2);
  assert.equal(range?.startTime.getDate(), 12);
  assert.equal(range?.startTime.getHours(), 22);
  assert.equal(range?.endTime.getDate(), 13);
  assert.equal(range?.endTime.getHours(), 6);
});

test('getTicketButtonText recognizes known ticket providers', () => {
  assert.equal(getTicketButtonText('https://kupikartu.ba/foo', 'bs'), 'KupiKartu');
  assert.equal(getTicketButtonText(null, 'en'), 'Buy');
});

test('formatEventTime returns a zero-padded hour and minute', () => {
  assert.equal(formatEventTime('2026-03-12T08:05:00'), '08:05');
});

test('getTonightPriceText returns localized free and paid labels', () => {
  assert.equal(getTonightPriceText({ price_bam: null } as any, 'bs'), 'Besplatan');
  assert.equal(getTonightPriceText({ price_bam: 12 } as any, 'en'), 'from 12 KM');
});

test('toggleTonightSelection respects the four-item cap', () => {
  assert.deepEqual(toggleTonightSelection(['1', '2'], '3'), ['1', '2', '3']);
  assert.deepEqual(toggleTonightSelection(['1', '2', '3', '4'], '5'), ['1', '2', '3', '4']);
});

test('createMockVoteState seeds selected events with zero votes', () => {
  assert.deepEqual(createMockVoteState(['a', 'b']), { a: 0, b: 0 });
});

test('buildTonightPlanMarkers returns stable marker positions per stop order', () => {
  const markers = buildTonightPlanMarkers({
    total: 60,
    stops: [
      { time: '19:00', venueName: 'Cafe Tito', activity: 'Kafa', price: 10 },
      { time: '21:00', venueName: 'Dveri', activity: 'Ve\u010Dera', price: 50 },
    ],
  });

  assert.deepEqual(markers, [
    {
      id: 'stop-0',
      latitude: 43.8643,
      longitude: 18.4071,
      title: 'Cafe Tito',
    },
    {
      id: 'stop-1',
      latitude: 43.8523,
      longitude: 18.4201,
      title: 'Dveri',
    },
  ]);
});

test('getUrgencyBadge returns today and tomorrow labels correctly', () => {
  const labels = { tonight: 'Tonight', tomorrow: 'Tomorrow' };
  assert.deepEqual(
    getUrgencyBadge('2026-03-12T20:00:00', labels, new Date('2026-03-12T09:00:00')),
    { label: 'Tonight', color: '#EF4444' }
  );
  assert.deepEqual(
    getUrgencyBadge('2026-03-13T20:00:00', labels, new Date('2026-03-12T09:00:00')),
    { label: 'Tomorrow', color: '#F97316' }
  );
});
