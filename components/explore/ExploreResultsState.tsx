import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

interface ExploreResultsStateProps {
  accentColor: string;
  children: React.ReactNode;
  hasResults: boolean;
  loading: boolean;
  noResultsLabel: string;
  textSecondaryColor: string;
}

export function ExploreResultsState({
  accentColor,
  children,
  hasResults,
  loading,
  noResultsLabel,
  textSecondaryColor,
}: ExploreResultsStateProps) {
  if (loading) {
    return <ActivityIndicator size="large" color={accentColor} style={styles.loader} />;
  }

  if (!hasResults) {
    return <Text style={[styles.noResults, { color: textSecondaryColor }]}>{noResultsLabel}</Text>;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 40,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});
