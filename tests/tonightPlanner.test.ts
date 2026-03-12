import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTonightPlannerMoodOptions,
  buildTonightPlannerStopRows,
  TONIGHT_GROUP_SIZES,
  TONIGHT_PLAN_REGION,
} from '@/utils/tonightPlanner';

test('Tonight planner exposes stable group-size and map defaults', () => {
  assert.deepEqual(TONIGHT_GROUP_SIZES, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(TONIGHT_PLAN_REGION, {
    latitude: 43.8563,
    longitude: 18.4131,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });
});

test('buildTonightPlannerMoodOptions localizes labels without changing ids', () => {
  const options = buildTonightPlannerMoodOptions(true);

  assert.equal(options[0]?.id, 'date_night');
  assert.equal(options[0]?.label, 'Romantika');
  assert.equal(options[0]?.emoji.length > 0, true);
});

test('buildTonightPlannerStopRows shapes plan stops for the results list', () => {
  const rows = buildTonightPlannerStopRows({
    total: 55,
    stops: [{ time: '19:00', venueName: 'Dveri', activity: 'Vecera', price: 55 }],
  });

  assert.deepEqual(rows, [
    {
      id: 'Dveri-19:00-0',
      activity: 'Vecera',
      priceText: '~55 KM',
      time: '19:00',
      venueName: 'Dveri',
    },
  ]);
});
