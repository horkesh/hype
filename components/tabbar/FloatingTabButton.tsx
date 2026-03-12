import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/IconSymbol';
import type { TabBarItem } from '@/components/FloatingTabBar';

interface FloatingTabButtonProps {
  iconColor: string;
  isActive: boolean;
  labelColor: string;
  tab: TabBarItem;
  onPress: () => void;
}

export function FloatingTabButton({
  iconColor,
  isActive,
  labelColor,
  tab,
  onPress,
}: FloatingTabButtonProps) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.tabContent}>
        <IconSymbol
          android_material_icon_name={tab.icon}
          ios_icon_name={tab.icon}
          size={24}
          color={iconColor}
        />
        <Text style={[styles.tabLabel, { color: labelColor }, isActive && styles.activeLabel]}>
          {tab.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'DMSans_500Medium',
  },
  activeLabel: {
    color: '#D4A056',
    fontWeight: '600',
  },
});
