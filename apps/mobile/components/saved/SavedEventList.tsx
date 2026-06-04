import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import { SavedEventCard } from '@/components/saved/SavedEventCard';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';
import { SavedEventCardModel } from '@/utils/savedContent';

const MAX_CONTENT_WIDTH = 1680;

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
  const { columns, gap, contentWidth } = useResponsiveColumns({
    minCardWidth: 300,
    maxColumns: 5,
    maxContentWidth: MAX_CONTENT_WIDTH,
    gap: 16,
    horizontalPadding: 32,
  });
  const isGrid = columns > 1;
  const cardWidth = (contentWidth - gap * (columns - 1)) / columns;

  const renderItem = useCallback(
    ({ item: event }: ListRenderItemInfo<SavedEventCardModel>) => (
      <View style={isGrid ? { width: cardWidth } : styles.fullWidth}>
        <SavedEventCard
          accentColor={accentColor}
          cardColor={cardColor}
          event={event}
          onDelete={onRemoveEvent}
          onPress={onPressEvent}
          textColor={textColor}
          textSecondaryColor={textSecondaryColor}
        />
      </View>
    ),
    [accentColor, cardColor, onRemoveEvent, onPressEvent, textColor, textSecondaryColor, isGrid, cardWidth],
  );

  return (
    <FlatList
      key={`saved-events-${columns}`}
      data={models}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={columns}
      style={styles.content}
      contentContainerStyle={styles.cardsContainer}
      columnWrapperStyle={isGrid ? { gap } : undefined}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  cardsContainer: {
    padding: 16,
    gap: 16,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
