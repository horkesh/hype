import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTonightPlanShareText,
  buildTonightSegments,
  buildTonightVoteShareText,
  getTonightPlannerLabels,
  getTonightVoteLabels,
  TONIGHT_MOODS,
} from '@/utils/tonightScreen';

const translate = (key: string): string => key;

test('TONIGHT_MOODS and segments expose clean emojis instead of mojibake', () => {
  assert.equal(TONIGHT_MOODS[0]?.emoji, '\u{1F496}');
  assert.equal(TONIGHT_MOODS[11]?.emoji, '\u{1F379}');

  const segments = buildTonightSegments(translate);
  assert.equal(segments[0]?.emoji, '\u2615');
  assert.equal(segments[3]?.emoji, '\u{1F319}');
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

test('Tonight labels expose clean planner and vote copy', () => {
  const plannerLabels = getTonightPlannerLabels(true, 80, 2);
  const voteLabels = getTonightVoteLabels(false);

  assert.equal(plannerLabels.generate, 'Generisi plan \u2728');
  assert.equal(plannerLabels.nextPlan, '\u{1F504} Daj drugi plan');
  assert.equal(voteLabels.shareLink, '\u{1F4E4} Share link');
  assert.equal(voteLabels.votePrompt, 'Select 2-4 events for voting');
});
