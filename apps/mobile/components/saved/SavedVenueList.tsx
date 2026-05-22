import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';

import { SavedVenueCard } from '@/components/saved/SavedVenueCard';
import { SavedVenueCardModel } from '@/utils/savedContent';

interface SavedVenueListProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  models: SavedVenueCardModel[];
  onPressVenue: (venueId: string) => void;
  onRemoveVenue: (venueId: string) => void;
  textColor: string;
  textSecondaryColor: string;
}

const keyExtractor = (item: SavedVenueCardModel) => item.id;

export function SavedVenueList({
  accentColor,
  backgroundColor,
  cardColor,
  models,
  onPressVenue,
  onRemoveVenue,
  textColor,
  textSecondaryColor,
}: SavedVenueListProps) {
  const renderItem = useCallback(
    ({ item: venue }: ListRenderItemInfo<SavedVenueCardModel>) => (
      <SavedVenueCard
        accentColor={accentColor}
        backgroundColor={backgroundColor}
        cardColor={cardColor}
        onDelete={onRemoveVenue}
        onPress={onPressVenue}
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
        venue={venue}
      />
    ),
    [accentColor, backgroundColor, cardColor, onRemoveVenue, onPressVenue, textColor, textSecondaryColor],
  );

  return (
    <FlatList
      data={models}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.content}
      contentContainerStyle={styles.cardsContainer}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  cardsContainer: {
    padding: 16,
  },
});
