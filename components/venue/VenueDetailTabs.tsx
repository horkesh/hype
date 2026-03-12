import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { VenueDetailTabKey } from '@/utils/venueDetailScreen';

interface VenueDetailTabsProps {
  activeTab: VenueDetailTabKey;
  colors: {
    textSecondary: string;
    accent: string;
    border: string;
  };
  labels: {
    info: string;
    events: string;
    specials: string;
  };
  onSelectTab: (tab: VenueDetailTabKey) => void;
}

const TAB_META: { key: VenueDetailTabKey; icon: string; labelKey: keyof VenueDetailTabsProps['labels'] }[] = [
  { key: 'info', icon: '\u2139\ufe0f', labelKey: 'info' },
  { key: 'events', icon: '\ud83d\udcc5', labelKey: 'events' },
  { key: 'specials', icon: '\ud83c\udf7d\ufe0f', labelKey: 'specials' },
];

export function VenueDetailTabs({
  activeTab,
  colors,
  labels,
  onSelectTab,
}: VenueDetailTabsProps) {
  return (
    <View style={[styles.tabSection, { borderBottomColor: colors.border }]}>
      {TAB_META.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && {
                borderBottomColor: colors.accent,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => onSelectTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? colors.accent : colors.textSecondary },
              ]}
            >
              {tab.icon} {labels[tab.labelKey]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabSection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 20,
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
