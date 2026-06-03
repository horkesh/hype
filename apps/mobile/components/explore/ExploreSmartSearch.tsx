import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { useTheme } from '@/hooks/useTheme';

interface ExploreSmartSearchProps {
  response: string | null;
  isLoading: boolean;
  venueCount?: number;
}

export function ExploreSmartSearch({ response, isLoading, venueCount }: ExploreSmartSearchProps) {
  const { colors } = useTheme();
  if (!isLoading && !response) return null;
  return (
    <GlassContainer style={styles.container} glowColor="#8E2DE2">
      <View style={styles.header}>
        <GlassBadge label="AI Concierge" variant="accent" size="sm" />
      </View>
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#8E2DE2" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Thinking...</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.responseText, { color: colors.text }]}>{response}</Text>
          {venueCount !== undefined && venueCount > 0 && (
            <Text style={[styles.attribution, { color: colors.textSecondary }]}>
              Based on {venueCount} venues
            </Text>
          )}
        </>
      )}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, marginHorizontal: 16, marginBottom: 12 },
  header: { marginBottom: 8 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, fontFamily: 'DMSans_400Regular' },
  responseText: { fontSize: 14, lineHeight: 20, fontFamily: 'DMSans_400Regular' },
  attribution: { fontSize: 11, marginTop: 8, fontFamily: 'DMSans_500Medium' },
});
