import test from 'node:test';
import assert from 'node:assert/strict';
import { buildParsePreviewCandidate } from '../src/services/parsePreview.js';

test('buildParsePreviewCandidate marks strong rows as candidate with high confidence', () => {
  const preview = buildParsePreviewCandidate({
    id: 'raw-1',
    source_name: 'AllEvents.in Sarajevo',
    source_url: 'https://allevents.in/sarajevo/opera/2001',
    title_raw: 'Opera Mala Floramye',
    description_raw: 'Full-length opera event.',
    date_raw: '2026-03-14T19:30:00+01:00',
    image_url: 'https://allevents.in/images/opera.jpg',
    created_at: null,
    venue_raw: 'Narodno Pozoriste Sarajevo',
    venue_name_raw: 'Narodno Pozoriste Sarajevo',
    parsed: false,
    parse_attempts: 0,
    venue_match_status: 'matched',
  });

  assert.equal(preview.normalizedTitle, 'Opera Mala Floramye');
  assert.equal(preview.normalizedVenueName, 'Narodno Pozoriste Sarajevo');
  assert.equal(preview.parseConfidence, 'high');
  assert.equal(preview.suggestedOutcome, 'candidate');
  assert.equal(preview.suggestedCategory, 'music');
});

test('buildParsePreviewCandidate marks weak rows for review', () => {
  const preview = buildParsePreviewCandidate({
    id: 'raw-2',
    source_name: 'KupiKartu.ba',
    source_url: 'https://www.kupikartu.ba/karte/event/8123/jazz-night',
    title_raw: null,
    description_raw: null,
    date_raw: null,
    image_url: null,
    created_at: null,
    venue_raw: null,
    venue_name_raw: null,
    parsed: false,
    parse_attempts: 0,
    venue_match_status: 'unmatched',
  });

  assert.equal(preview.parseConfidence, 'low');
  assert.equal(preview.suggestedOutcome, 'review');
  assert.ok(preview.reviewReasons.includes('missing_title'));
  assert.ok(preview.reviewReasons.includes('missing_date'));
  assert.ok(preview.reviewReasons.includes('venue_unmatched'));
});
