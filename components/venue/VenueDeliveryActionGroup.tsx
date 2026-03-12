import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { VenueDeliveryAction } from '@/utils/venueActions';

interface VenueDeliveryActionGroupProps {
  accentColor: string;
  actions: VenueDeliveryAction[];
  onPressAction: (actionId: VenueDeliveryAction['id']) => void;
}

export function VenueDeliveryActionGroup({
  accentColor,
  actions,
  onPressAction,
}: VenueDeliveryActionGroupProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={styles.actions}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.button, { backgroundColor: accentColor }]}
          onPress={() => onPressAction(action.id)}
        >
          <Text style={styles.text}>
            {action.emoji} {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
