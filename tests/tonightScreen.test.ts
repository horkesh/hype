import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTonightPlanShareText,
  buildTonightSegments,
  buildTonightVoteShareText,
  TONIGHT_MOODS,
} from '@/utils/tonightScreen';

const translate = (key: string): string => key;

test('TONIGHT_MOODS and segments expose clean emojis instead of mojibake', () => {
  assert.equal(TONIGHT_MOODS[0]?.emoji, '💖');
  assert.equal(TONIGHT_MOODS[11]?.emoji, '🍹');

  const segments = buildTonightSegments(translate);
  assert.equal(segments[0]?.emoji, '☕');
  assert.equal(segments[3]?.emoji, '🌙');
});

test('Tonight share text uses cleaned Bosnian copy', () => {
  const planText = buildTonightPlanShareText('bs', {
    total: 60,
    stops: [{ time: '19:00', venueName: 'Dveri', activity: 'Vecera', price: 60 }],
  });

  assert.match(planText, /Moj plan za veceras/);
  assert.match(planText, /Kreirano sa Hype app/);

  const voteText = buildTonightVoteShareText('bs', 'https://hype.ba/vote/demo');
  assert.match(voteText, /Glasaj za veceras!/);
});
