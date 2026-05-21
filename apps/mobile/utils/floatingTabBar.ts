import { Href } from 'expo-router';

import type { TabBarItem } from '@/components/FloatingTabBar';

export function getTabRoutePath(route: Href): string {
  return typeof route === 'string' ? route : route.pathname;
}

export function getActiveTabIndex(pathname: string, tabs: TabBarItem[]): number {
  let bestMatch = -1;
  let bestMatchScore = 0;

  tabs.forEach((tab, index) => {
    let score = 0;
    const routePath = getTabRoutePath(tab.route);

    if (pathname === routePath) {
      score = 100;
    } else if (pathname.startsWith(routePath)) {
      score = 80;
    } else if (pathname.includes(tab.name)) {
      score = 60;
    } else if (routePath.includes('/(tabs)/')) {
      const leafPath = routePath.split('/(tabs)/')[1];

      if (leafPath && pathname.includes(leafPath)) {
        score = 40;
      }
    }

    if (score > bestMatchScore) {
      bestMatchScore = score;
      bestMatch = index;
    }
  });

  return bestMatch >= 0 ? bestMatch : 0;
}

export function getTabIndicatorWidthPercent(tabCount: number): `${number}%` {
  const safeTabCount = Math.max(tabCount, 1);
  return `${((100 / safeTabCount) - 1).toFixed(2)}%`;
}

export function getTabIndicatorTranslateRange(containerWidth: number, tabCount: number): [number, number] {
  const safeTabCount = Math.max(tabCount, 1);
  const tabWidth = (containerWidth - 8) / safeTabCount;
  return [0, tabWidth * Math.max(safeTabCount - 1, 0)];
}

export function getTabBarSurfaceColors(): {
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  labelColor: string;
  indicatorColor: string;
} {
  return {
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    iconColor: '#98989D',
    labelColor: '#98989D',
    indicatorColor: 'rgba(255, 255, 255, 0.08)',
  };
}
