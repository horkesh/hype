import React from 'react';
import type { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { glassTokens } from '@/styles/glassTokens';

function toAlphaBorder(color: string, alpha: number): string {
  // Handle rgba() format
  const rgbaMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`;
  }
  // Handle hex format — append alpha as hex suffix
  const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return color + hex;
}

interface GlassContainerProps {
  children: ReactNode;
  glowColor?: string;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

export function GlassContainer({
  children,
  glowColor,
  style,
  borderRadius = 24,
}: GlassContainerProps) {
  const glowShadow = glowColor
    ? { shadowColor: glowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 5 }
    : glassTokens.shadow.default;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: glassTokens.background,
          borderColor: glowColor ? toAlphaBorder(glowColor, 0.3) : glassTokens.border,
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
