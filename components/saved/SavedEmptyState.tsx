import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassContainer } from '@/components/glass/GlassContainer';

interface SavedEmptyStateProps {
  buttonText: string;
  emoji: string;
  onPress: () => void;
  subtitle: string;
  textColor: string;
  textSecondaryColor: string;
  title: string;
  accentColor: string;
}

export function SavedEmptyState({
  accentColor,
  buttonText,
  emoji,
  onPress,
  subtitle,
  textColor,
  textSecondaryColor,
  title,
}: SavedEmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <GlassContainer borderRadius={24} style={styles.emptyCard}>
        <Text style={styles.emptyEmoji}>{emoji}</Text>
        <Text style={[styles.emptyTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.emptySubtitle, { color: textSecondaryColor }]}>{subtitle}</Text>
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <GlassContainer borderRadius={24} glowColor={accentColor} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>{buttonText}</Text>
          </GlassContainer>
        </TouchableOpacity>
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
