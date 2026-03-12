import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonList } from '@/components/SkeletonLoader';

interface ContentStateProps {
  loading?: boolean;
  empty?: boolean;
  emptyEmoji?: string;
  emptyMessage?: string;
  skeletonCount?: number;
  children: React.ReactNode;
}

export function ContentState({
  loading = false,
  empty = false,
  emptyEmoji = '🌅',
  emptyMessage = '',
  skeletonCount = 1,
  children,
}: ContentStateProps) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.loadingBlock}>
        <SkeletonList count={skeletonCount} />
      </View>
    );
  }

  if (empty) {
    return <EmptyState emoji={emptyEmoji} message={emptyMessage} />;
  }

  if (!children) {
    return (
      <View style={styles.spinnerBlock}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingBlock: {
    paddingHorizontal: 20,
  },
  spinnerBlock: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
