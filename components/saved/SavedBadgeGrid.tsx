import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';

import { SavedBadgeCard } from '@/components/saved/SavedBadgeCard';
import { SavedBadgeCardModel } from '@/utils/savedContent';

interface SavedBadgeGridProps {
  accentColor: string;
  backgroundColor: string;
  models: SavedBadgeCardModel[];
  textColor: string;
  textSecondaryColor: string;
}

const keyExtractor = (item: SavedBadgeCardModel) => item.badgeId;

export function SavedBadgeGrid({
  accentColor,
  backgroundColor,
  models,
  textColor,
  textSecondaryColor,
}: SavedBadgeGridProps) {
  const renderItem = useCallback(
    ({ item: badge }: ListRenderItemInfo<SavedBadgeCardModel>) => (
      <SavedBadgeCard
        accentColor={accentColor}
        backgroundColor={backgroundColor}
        badge={badge}
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
      />
    ),
    [accentColor, backgroundColor, textColor, textSecondaryColor],
  );

  return (
    <FlatList
      data={models}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={3}
      style={styles.content}
      contentContainerStyle={styles.badgesGrid}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  badgesGrid: {
    padding: 16,
    gap: 12,
  },
  columnWrapper: {
    gap: 12,
  },
});
