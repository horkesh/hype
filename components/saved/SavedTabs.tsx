import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SavedTabKey } from '@/utils/savedScreen';

interface SavedTabsProps {
  activeTab: SavedTabKey;
  accentColor: string;
  onSelectTab: (tab: SavedTabKey) => void;
  textSecondaryColor: string;
}

const TAB_LABELS: Array<{ key: SavedTabKey; label: string }> = [
  { key: 'venues', label: '❤️ Favoriti' },
  { key: 'events', label: '🎟️ Događaji' },
  { key: 'badges', label: '🏆 Bedževi' },
];

export function SavedTabs({
  activeTab,
  accentColor,
  onSelectTab,
  textSecondaryColor,
}: SavedTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {TAB_LABELS.map((tab) => {
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
