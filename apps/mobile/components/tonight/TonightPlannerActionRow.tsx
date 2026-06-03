import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TonightPlannerActionRowProps {
  cardColor: string;
  labels: {
    nextPlan: string;
    save: string;
    share: string;
  };
  onNextPlan: () => void;
  onSavePlan: () => void;
  onSharePlan: () => void;
}

export function TonightPlannerActionRow({
  cardColor,
  labels,
  onNextPlan,
  onSavePlan,
  onSharePlan,
}: TonightPlannerActionRowProps) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.button, styles.secondary, { backgroundColor: cardColor }]}
        onPress={onNextPlan}
      >
        <Text style={styles.secondaryText}>{labels.nextPlan}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondary, { backgroundColor: cardColor }]}
        onPress={onSavePlan}
      >
        <Text style={styles.secondaryText}>{labels.save}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.primary]} onPress={onSharePlan}>
        <Text style={styles.primaryText}>{labels.share}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  secondary: {
    borderWidth: 1,
    borderColor: '#8E2DE2',
  },
  primary: {
    backgroundColor: '#8E2DE2',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
    color: '#8E2DE2',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
    color: '#FFFFFF',
  },
});
