import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatEventDetailDateTime,
  getEventCategoryEmoji,
  getEventDetailDescription,
  getEventDetailTitle,
  getEventMoodEmoji,
  getEventPriceDisplay,
  getEventTicketButtonText,
  getEventVenueName,
  isEventFree,
} from '@/utils/eventDetailScreen';

test('event detail title and description respect language fallback', () => {
  assert.equal(getEventDetailTitle({ title_bs: 'Naslov', title_en: 'Title' }, 'bs'), 'Naslov');
  assert.equal(getEventDetailTitle({ title_bs: 'Naslov', title_en: null }, 'en'), 'Naslov');
  assert.equal(
    getEventDetailDescription({ description_bs: null, description_en: 'English copy' }, 'bs'),
    'English copy'
  );
});

test('event detail date formatting includes year and at label', () => {
  assert.equal(
    formatEventDetailDateTime('2026-03-12T08:05:00', 'at'),
    '12.3.2026 at 08:05'
  );
});

test('event detail price helpers return localized free and paid text', () => {
  assert.equal(isEventFree(null), true);
  assert.equal(isEventFree(0), true);
  assert.equal(isEventFree(12), false);
  assert.equal(getEventPriceDisplay(null, 'bs'), 'Besplatan');
  assert.equal(getEventPriceDisplay(20, 'bs'), '20 KM');
  assert.match(getEventPriceDisplay(20, 'en'), /20 KM/);
  assert.match(getEventPriceDisplay(20, 'en'), /EUR/);
});

test('event detail ticket label recognizes supported providers', () => {
  assert.equal(
    getEventTicketButtonText('https://kupikartu.ba/foo', 'en'),
    'Buy on KupiKartu.ba'
  );
  assert.equal(
    getEventTicketButtonText('https://example.com/foo', 'bs'),
    'Kupi kartu'
  );
});

test('event detail venue and emoji helpers return stable fallback values', () => {
  assert.equal(getEventVenueName({ venues: { id: '1', name: 'Dom' }, location_name: null }), 'Dom');
  assert.equal(getEventVenueName({ venues: null, location_name: 'SCCA' }), 'SCCA');
  assert.equal(getEventCategoryEmoji('music'), '\ud83c\udfb5');
  assert.equal(getEventCategoryEmoji('unknown'), '\ud83d\udcc5');
  assert.equal(getEventMoodEmoji('Party'), '\ud83c\udf89');
  assert.equal(getEventMoodEmoji('Unknown'), '\u2728');
});
