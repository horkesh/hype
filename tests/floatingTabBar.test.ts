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

test('getTabBarSurfaceColors returns theme-safe colors', () => {
  assert.deepEqual(getTabBarSurfaceColors(false), {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: 'rgba(255, 255, 255, 1)',
    iconColor: '#8E8E93',
    labelColor: '#8E8E93',
    indicatorColor: 'rgba(0, 0, 0, 0.04)',
  });
  assert.equal(getTabBarSurfaceColors(true).backgroundColor, 'rgba(28, 28, 30, 0.95)');
});
