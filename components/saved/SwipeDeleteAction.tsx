import React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/IconSymbol';

interface SwipeDeleteActionProps {
  drag: SharedValue<number>;
  onDelete: () => void;
}

export function SwipeDeleteAction({ drag, onDelete }: SwipeDeleteActionProps) {
  const styleAnimation = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + 80 }],
  }));

  return (
    <Animated.View style={[styles.swipeAction, styleAnimation]}>
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          onDelete();
        }}
        style={styles.deleteButton}
      >
        <IconSymbol
          ios_icon_name="trash"
          android_material_icon_name="delete"
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});
