import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WEB_APP_MAX_WIDTH,
  getEffectiveAppWidth,
  getResponsiveColumnLayout,
} from '@/utils/webLayout';

test('web app width is capped to the mobile app frame on desktop browsers', () => {
  assert.equal(getEffectiveAppWidth(1440, 'web'), WEB_APP_MAX_WIDTH);
  assert.equal(getEffectiveAppWidth(390, 'web'), 390);
  assert.equal(getEffectiveAppWidth(1440, 'ios'), 1440);
});

test('responsive card grids stay single-column inside the capped web frame', () => {
  const layout = getResponsiveColumnLayout({
    viewportWidth: 1440,
    platform: 'web',
    minCardWidth: 300,
    maxColumns: 5,
    maxContentWidth: 1680,
    gap: 16,
    horizontalPadding: 32,
  });

  assert.equal(layout.columns, 1);
  assert.equal(layout.contentWidth, WEB_APP_MAX_WIDTH - 32);
});
