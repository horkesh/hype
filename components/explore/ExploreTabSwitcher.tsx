import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/IconSymbol';

interface ExploreTabSwitcherProps {
  accentColor: string;
  activeTab: 'list' | 'menu';
  cardColor: string;
  dailyMenuLabel: string;
  textColor: string;
  onSetActiveTab: (tab: 'list' | 'menu') => void;
}

export function ExploreTabSwitcher({
  accentColor,
  activeTab,
  cardColor,
  dailyMenuLabel,
  textColor,
  onSetActiveTab,
}: ExploreTabSwitcherProps) {
  return (
    <View style={[styles.switcher, { backgroundColor: cardColor }]}>
      <TouchableOpacity
        style={[styles.button, activeTab === 'list' && { backgroundColor: accentColor }]}
        onPress={() => onSetActiveTab('list')}
      >
        <Text style={[styles.text, { color: activeTab === 'list' ? '#FFFFFF' : textColor }]}>
          List
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, activeTab === 'menu' && { backgroundColor: accentColor }]}
        onPress={() => onSetActiveTab('menu')}
      >
        <View style={styles.menuLabel}>
          <IconSymbol
            ios_icon_name="fork.knife"
            android_material_icon_name="restaurant"
            size={16}
            color={activeTab === 'menu' ? '#FFFFFF' : textColor}
          />
          <Text style={[styles.text, { color: activeTab === 'menu' ? '#FFFFFF' : textColor }]}>
            {dailyMenuLabel}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  menuLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
