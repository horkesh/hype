// components/SkeletonLoader.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const { theme } = useTheme(); // ✅ useTheme() returns { theme, colors, isDark }
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(opacity.value, [0.3, 1], [0.3, 0.6]),
    };
  });

  const skeletonColor = theme === 'dark' ? '#3A3A4E' : '#E5E5E5';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: skeletonColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonLoader height={200} borderRadius={12} style={styles.image} />
      <View style={styles.content}>
        <SkeletonLoader height={24} width="80%" style={styles.title} />
        <SkeletonLoader height={16} width="60%" style={styles.subtitle} />
        <View style={styles.footer}>
          <SkeletonLoader height={16} width={80} />
          <SkeletonLoader height={16} width={60} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  const safeCount =
    Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;

  return (
    <View>
      {Array.from({ length: safeCount }, (_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    marginBottom: 12,
  },
  content: {
    padding: 12,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
