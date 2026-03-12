import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface TonightEventListStateProps {
  emptyStateMessage: string;
  loading: boolean;
  textSecondaryColor: string;
}

export function TonightEventListState({
  emptyStateMessage,
  loading,
  textSecondaryColor,
}: TonightEventListStateProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A056" />
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>{"\uD83C\uDF05"}</Text>
      <Text style={[styles.emptyText, { color: textSecondaryColor }]}>{emptyStateMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
