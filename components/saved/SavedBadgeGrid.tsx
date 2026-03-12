import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SavedBadgeCard } from '@/components/saved/SavedBadgeCard';
import { SavedBadgeCardModel } from '@/utils/savedContent';

interface SavedBadgeGridProps {
  accentColor: string;
  backgroundColor: string;
  models: SavedBadgeCardModel[];
  textColor: string;
  textSecondaryColor: string;
}

export function SavedBadgeGrid({
  accentColor,
  backgroundColor,
  models,
  textColor,
  textSecondaryColor,
}: SavedBadgeGridProps) {
  return (
    <ScrollView style={styles.content}>
      <View style={styles.badgesGrid}>
        {models.map((badge) => (
          <SavedBadgeCard
            key={badge.badgeId}
            accentColor={accentColor}
            backgroundColor={backgroundColor}
            badge={badge}
            textColor={textColor}
            textSecondaryColor={textSecondaryColor}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  badgesGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
