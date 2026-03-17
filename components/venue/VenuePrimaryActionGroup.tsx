import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassContainer } from '@/components/glass/GlassContainer';
import { VenuePrimaryAction } from '@/utils/venueActions';

interface VenuePrimaryActionGroupProps {
  actions: VenuePrimaryAction[];
  cardColor: string;
  textColor: string;
  onPressAction: (actionId: VenuePrimaryAction['id']) => void;
}

export function VenuePrimaryActionGroup({
  actions,
  cardColor,
  textColor,
  onPressAction,
}: VenuePrimaryActionGroupProps) {
  return (
    <View style={styles.actions}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          onPress={() => onPressAction(action.id)}
          activeOpacity={0.8}
        >
          <GlassContainer borderRadius={20} style={styles.button}>
            <Text style={styles.emoji}>{action.emoji}</Text>
            <Text style={[styles.label, { color: textColor }]}>{action.label}</Text>
          </GlassContainer>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
