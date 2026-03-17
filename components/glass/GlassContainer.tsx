import React from 'react';
import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { glassTokens } from '@/styles/glassTokens';

interface GlassContainerProps {
  children: ReactNode;
  glowColor?: string;
  style?: any;
  borderRadius?: number;
}

export function GlassContainer({
  children,
  glowColor,
  style,
  borderRadius = 24,
}: GlassContainerProps) {
  const { isDark } = useTheme();
  const tokens = isDark ? glassTokens.dark : glassTokens.light;

  const glowShadow = glowColor
    ? { shadowColor: glowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 5 }
    : glassTokens.shadow.default;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.background,
          borderColor: glowColor ? glowColor + '4D' : tokens.border,
          borderRadius,
          ...glowShadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
