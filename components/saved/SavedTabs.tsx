import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassContainer } from '@/components/glass/GlassContainer';
import { SavedTabKey, SavedTabLabel } from '@/utils/savedScreen';

interface SavedTabsProps {
  activeTab: SavedTabKey;
  accentColor: string;
  onSelectTab: (tab: SavedTabKey) => void;
  tabs: SavedTabLabel[];
  textSecondaryColor: string;
}

export function SavedTabs({
  activeTab,
  accentColor,
  onSelectTab,
  tabs,
  textSecondaryColor,
}: SavedTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.8}
            style={styles.tabTouchable}
          >
            <GlassContainer
              borderRadius={20}
              glowColor={isActive ? accentColor : undefined}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? accentColor : textSecondaryColor },
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </GlassContainer>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  tabTouchable: {
    flex: 1,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '700',
  },
});
