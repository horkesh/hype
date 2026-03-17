import React, { useCallback } from 'react';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { designTokens } from '@/styles/designTokens';

interface FlippableCardProps {
  front: ReactNode;
  back: ReactNode;
  onPress?: () => void;
  width?: number;
  height?: number;
  style?: any;
}

export function FlippableCard({
  front,
  back,
  onPress,
  width,
  height = 280,
  style,
}: FlippableCardProps) {
  const flipProgress = useSharedValue(0);
  const isFlipped = useSharedValue(false);

  const handleFlip = useCallback(() => {
    isFlipped.value = !isFlipped.value;
    flipProgress.value = withSpring(isFlipped.value ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      zIndex: flipProgress.value < 0.5 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      zIndex: flipProgress.value >= 0.5 ? 1 : 0,
    };
  });

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Animated.View style={[styles.face, frontAnimatedStyle]}>
        <Pressable onPress={onPress} onLongPress={handleFlip} style={styles.pressable}>
          {front}
          <Pressable onPress={handleFlip} style={styles.flipButton} hitSlop={8}>
            <View style={styles.flipIcon}>
              <Animated.Text style={styles.flipIconText}>ℹ</Animated.Text>
            </View>
          </Pressable>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.face, styles.backFace, backAnimatedStyle]}>
        <Pressable onPress={handleFlip} style={styles.pressable}>
          {back}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: designTokens.radius.card,
    overflow: 'hidden',
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: designTokens.radius.card,
    overflow: 'hidden',
  },
  backFace: {},
  pressable: {
    flex: 1,
  },
  flipButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  flipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipIconText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
