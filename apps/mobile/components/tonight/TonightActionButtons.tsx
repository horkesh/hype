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
      <TouchableOpacity
        style={styles.primaryAction}
        onPress={onOpenPlanner}
        accessibilityRole="button"
        accessibilityLabel={plannerButtonText}
      >
        <Text style={styles.primaryActionText}>{plannerButtonText}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryAction, { backgroundColor: cardColor }]}
        onPress={onOpenVote}
        accessibilityRole="button"
        accessibilityLabel={secondaryButtonText}
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
    backgroundColor: '#8E2DE2',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8E2DE2',
  },
  secondaryActionText: {
    color: '#8E2DE2',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
});
