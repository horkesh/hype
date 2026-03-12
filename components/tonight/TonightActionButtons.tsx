import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TonightActionButtonsProps {
  cardColor: string;
  plannerButtonText: string;
  secondaryButtonText: string;
  onOpenPlanner: () => void;
  onOpenVote: () => void;
}

export function TonightActionButtons({
  cardColor,
  plannerButtonText,
  secondaryButtonText,
  onOpenPlanner,
  onOpenVote,
}: TonightActionButtonsProps) {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.primaryAction} onPress={onOpenPlanner}>
        <Text style={styles.primaryActionText}>{plannerButtonText}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryAction, { backgroundColor: cardColor }]}
        onPress={onOpenVote}
      >
        <Text style={styles.secondaryActionText}>{secondaryButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: '#D4A056',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4A056',
  },
  secondaryActionText: {
    color: '#D4A056',
    fontSize: 15,
    fontWeight: '600',
  },
});
