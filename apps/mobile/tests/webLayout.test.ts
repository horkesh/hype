import test from 'node:test';
import assert from 'node:assert/strict';

import { getEffectiveAppWidth, getResponsiveColumnLayout } from '@/utils/webLayout';

test('web app width uses the full browser viewport on desktop browsers', () => {
  assert.equal(getEffectiveAppWidth(1440, 'web'), 1440);
  assert.equal(getEffectiveAppWidth(390, 'web'), 390);
  assert.equal(getEffectiveAppWidth(1440, 'ios'), 1440);
});

test('responsive card grids can use desktop columns on wide web viewports', () => {
  const layout = getResponsiveColumnLayout({
    viewportWidth: 1440,
    platform: 'web',
    minCardWidth: 300,
    maxColumns: 5,
    maxContentWidth: 1680,
    gap: 16,
    horizontalPadding: 32,
  });

  assert.equal(layout.columns, 4);
  assert.equal(layout.contentWidth, 1408);
});
