import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';

import { SavedEventCard } from '@/components/saved/SavedEventCard';
import { SavedEventCardModel } from '@/utils/savedContent';

interface SavedEventListProps {
  accentColor: string;
  cardColor: string;
  models: SavedEventCardModel[];
  onPressEvent: (eventId: string) => void;
  onRemoveEvent: (eventId: string) => void;
  textColor: string;
  textSecondaryColor: string;
}

const keyExtractor = (item: SavedEventCardModel) => item.eventId;

export function SavedEventList({
  accentColor,
  cardColor,
  models,
  onPressEvent,
  onRemoveEvent,
  textColor,
  textSecondaryColor,
}: SavedEventListProps) {
  const renderItem = useCallback(
    ({ item: event }: ListRenderItemInfo<SavedEventCardModel>) => (
      <SavedEventCard
        accentColor={accentColor}
        cardColor={cardColor}
        event={event}
        onDelete={onRemoveEvent}
        onPress={onPressEvent}
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
      />
    ),
    [accentColor, cardColor, onRemoveEvent, onPressEvent, textColor, textSecondaryColor],
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
