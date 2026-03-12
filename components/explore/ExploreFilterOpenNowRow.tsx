import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExploreFilterOpenNowRowProps {
  accentColor: string;
  borderColor: string;
  isEnabled: boolean;
  label: string;
  textColor: string;
  onToggle: () => void;
}

export function ExploreFilterOpenNowRow({
  accentColor,
  borderColor,
  isEnabled,
  label,
  textColor,
  onToggle,
}: ExploreFilterOpenNowRowProps) {
  return (
    <TouchableOpacity style={[styles.row, { borderColor }]} onPress={onToggle}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={[styles.toggle, { backgroundColor: isEnabled ? accentColor : borderColor }]}>
        <View style={[styles.thumb, isEnabled && styles.thumbActive]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
});
