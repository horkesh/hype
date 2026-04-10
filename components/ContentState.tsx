import React from 'react';
import { StyleSheet, View } from 'react-native';
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

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingBlock: {
    paddingHorizontal: 20,
  },
});
