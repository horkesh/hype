import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
            style={[
              styles.tab,
              isActive && { borderBottomColor: accentColor, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? accentColor : textSecondaryColor },
              ]}
            >
              {tab.label}
            </Text>
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
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
