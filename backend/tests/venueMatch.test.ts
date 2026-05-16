import test from 'node:test';
import assert from 'node:assert/strict';
import { matchVenue, type VenueRow } from '../src/services/venueMatch.js';

const VENUES: VenueRow[] = [
  { id: 'v-dom-mladih', name: 'Dom Mladih Skenderija', category: 'concert_hall' },
  { id: 'v-coffee-skenderija', name: 'Coffee Station Skenderija', category: 'restaurant' },
  { id: 'v-euphoria-skenderija', name: 'Euphoria Lounge Bar Skenderija', category: 'bar' },
  { id: 'v-narodno', name: 'Narodno Pozorište Sarajevo', category: 'theatre' },
  { id: 'v-kamerni', name: 'Kamerni Teatar 55', category: 'theatre' },
  { id: 'v-bkc', name: 'BKC (Bosanski Kulturni Centar)', category: 'cultural_center' },
  { id: 'v-hacienda', name: 'Hacienda', category: 'club' },
  { id: 'v-montana-grbavica', name: 'Montana Grbavica', category: 'restaurant' },
  { id: 'v-pekara-grbavica', name: 'Pekara GRBAVICA', category: 'bakery' },
  { id: 'v-stadion-grbavica', name: 'Stadion Grbavica', category: 'outdoor' },
];

test('matchVenue: exact case-insensitive match', () => {
  const result = matchVenue('Hacienda', VENUES);
  assert.equal(result?.strategy, 'exact');
  assert.equal(result?.venue.id, 'v-hacienda');
});

test('matchVenue: forward partial — venue name inside raw signal', () => {
  const result = matchVenue('Concert at Hacienda Sarajevo tonight', VENUES);
  assert.equal(result?.strategy, 'partial');
  assert.equal(result?.venue.id, 'v-hacienda');
});

test('matchVenue: reverse partial — raw signal inside longer canonical name', () => {
  // "Skenderija" alone should resolve to the event-hosting venue, not the cafe or bar
  const result = matchVenue('Skenderija', VENUES);
  assert.equal(result?.strategy, 'partial_reverse');
  assert.equal(result?.venue.id, 'v-dom-mladih', 'must prefer concert_hall over restaurant and bar');
});

test('matchVenue: reverse partial prefers event-category venues over restaurants/bakeries', () => {
  // "Grbavica" appears in: restaurant, bakery, stadium. Stadium is the event venue.
  const result = matchVenue('Grbavica', VENUES);
  assert.equal(result?.strategy, 'partial_reverse');
  assert.equal(result?.venue.id, 'v-stadion-grbavica');
});

test('matchVenue: reverse partial returns null when only non-event categories match', () => {
  // No stadium venue in this set — only restaurant + bakery
  const venuesNoStadium = VENUES.filter((v) => v.id !== 'v-stadion-grbavica');
  const result = matchVenue('Grbavica', venuesNoStadium);
  assert.equal(result, null, 'ambiguous match across non-event categories must NOT auto-pick');
});

test('matchVenue: fuzzy match strips "sarajevo" noise', () => {
  // raw "Narodno Pozorište" → canonical "Narodno Pozorište Sarajevo"
  const result = matchVenue('Narodno Pozorište', VENUES);
  assert.ok(result, 'should find Narodno Pozorište via reverse partial');
  assert.equal(result?.venue.id, 'v-narodno');
});

test('matchVenue: returns null on no signal', () => {
  assert.equal(matchVenue(null, VENUES), null);
  assert.equal(matchVenue('', VENUES), null);
  assert.equal(matchVenue('  ', VENUES), null);
});

test('matchVenue: short raw signals (< 4 chars) do not reverse-match', () => {
  // "BAR" is 3 chars — too short to safely substring-match against many venues
  const result = matchVenue('BAR', VENUES);
  // It can still hit an exact or forward partial, but reverse must not kick in
  assert.notEqual(result?.strategy, 'partial_reverse');
});
