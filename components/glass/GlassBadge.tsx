import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { VARIANT_COLORS } from './badgeVariants';
import type { BadgeVariant } from './badgeVariants';

export { VARIANT_COLORS } from './badgeVariants';
export type { BadgeVariant } from './badgeVariants';

interface GlassBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export function GlassBadge({ label, variant = 'default', size = 'sm' }: GlassBadgeProps) {
  const colors = VARIANT_COLORS[variant];

  return (
    <View style={[
      styles.badge,
      size === 'md' && styles.badgeMd,
      { backgroundColor: colors.bg, borderColor: colors.text + '33' },
    ]}>
      <Text style={[
        styles.label,
        size === 'md' && styles.labelMd,
        { color: colors.text },
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelMd: {
    fontSize: 13,
  },
});
