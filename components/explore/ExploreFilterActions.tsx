import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExploreFilterActionsProps {
  accentColor: string;
  borderColor: string;
  resetLabel: string;
  applyLabel: string;
  textColor: string;
  onReset: () => void;
  onApply: () => void;
}

export function ExploreFilterActions({
  accentColor,
  borderColor,
  resetLabel,
  applyLabel,
  textColor,
  onReset,
  onApply,
}: ExploreFilterActionsProps) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={[styles.resetButton, { borderColor }]} onPress={onReset}>
        <Text style={[styles.resetText, { color: textColor }]}>{resetLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.applyButton, { backgroundColor: accentColor }]} onPress={onApply}>
        <Text style={styles.applyText}>{applyLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
