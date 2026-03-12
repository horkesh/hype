import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Href } from 'expo-router';

import { FloatingTabButton } from '@/components/tabbar/FloatingTabButton';
import type { TabBarItem } from '@/components/FloatingTabBar';

interface FloatingTabButtonsProps {
  activeTabIndex: number;
  iconColor: string;
  labelColor: string;
  tabs: TabBarItem[];
  onPressTab: (route: Href) => void;
}

export function FloatingTabButtons({
  activeTabIndex,
  iconColor,
  labelColor,
  tabs,
  onPressTab,
}: FloatingTabButtonsProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <FloatingTabButton
          key={typeof tab.route === 'string' ? tab.route : `${tab.name}-${index}`}
          tab={tab}
          isActive={activeTabIndex === index}
          iconColor={activeTabIndex === index ? '#D4A056' : iconColor}
          labelColor={activeTabIndex === index ? '#D4A056' : labelColor}
          onPress={() => onPressTab(tab.route)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
});
