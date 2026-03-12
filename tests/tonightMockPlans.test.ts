import assert from 'node:assert/strict';
import test from 'node:test';

import { generateMockTonightPlan } from '@/utils/tonightMockPlans';

const venues = [
  { id: 'r-1', name: 'Dveri', category: 'restaurant', latitude: 43.85, longitude: 18.41 },
  { id: 'r-2', name: 'Karuzo', category: 'restaurant', latitude: 43.86, longitude: 18.42 },
  { id: 'b-1', name: 'Zlatna Ribica', category: 'bar', latitude: 43.87, longitude: 18.43 },
  { id: 'b-2', name: 'Blind Tiger', category: 'bar', latitude: 43.88, longitude: 18.44 },
  { id: 'c-1', name: 'Club Trezor', category: 'club', latitude: 43.89, longitude: 18.45 },
];

test('generateMockTonightPlan stays deterministic even if Math.random changes', () => {
  const originalRandom = Math.random;

  try {
    Math.random = () => 0;
    const firstPlan = generateMockTonightPlan('party', 0, venues);

    Math.random = () => 0.99;
    const secondPlan = generateMockTonightPlan('party', 0, venues);

    assert.deepEqual(secondPlan, firstPlan);
  } finally {
    Math.random = originalRandom;
  }
});
