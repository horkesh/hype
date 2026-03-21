import assert from 'node:assert/strict';
import test from 'node:test';

import type { TabBarItem } from '@/components/FloatingTabBar';
import {
  getActiveTabIndex,
  getTabBarSurfaceColors,
  getTabIndicatorTranslateRange,
  getTabIndicatorWidthPercent,
  getTabRoutePath,
} from '@/utils/floatingTabBar';

const tabs: TabBarItem[] = [
  { name: '(home)', route: '/(tabs)/(home)', icon: 'home', label: 'Home' },
  { name: 'explore', route: '/(tabs)/explore', icon: 'search', label: 'Explore' },
  { name: 'tonight', route: '/(tabs)/tonight', icon: 'event', label: 'Tonight' },
];

test('getTabRoutePath handles string routes and object routes', () => {
  assert.equal(getTabRoutePath('/(tabs)/explore'), '/(tabs)/explore');
  assert.equal(getTabRoutePath({ pathname: '/(tabs)/saved', params: {} } as any), '/(tabs)/saved');
});

test('getActiveTabIndex chooses the best matching tab path', () => {
  assert.equal(getActiveTabIndex('/(tabs)/explore', tabs), 1);
  assert.equal(getActiveTabIndex('/(tabs)/tonight/details', tabs), 2);
  assert.equal(getActiveTabIndex('/unknown', tabs), 0);
});

test('tab indicator helpers return stable layout values', () => {
  assert.equal(getTabIndicatorWidthPercent(5), '19.00%');
  assert.deepEqual(getTabIndicatorTranslateRange(300, 5), [0, 233.6]);
});

test('getTabBarSurfaceColors returns dark surface colors', () => {
  const surface = getTabBarSurfaceColors();
  assert.equal(surface.backgroundColor, 'rgba(18, 18, 18, 0.95)');
  assert.equal(surface.borderColor, 'rgba(255, 255, 255, 0.08)');
  assert.equal(surface.iconColor, '#98989D');
});
