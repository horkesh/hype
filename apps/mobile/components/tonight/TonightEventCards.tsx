import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native';

import { TonightEventCard } from '@/components/tonight/TonightEventCard';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';
import { TonightEventCardViewModel } from '@/utils/tonightContent';

const MAX_CONTENT_WIDTH = 1680;

interface TonightEventCardsProps {
  cardColor: string;
  colorsText: string;
  eventMetaSeparator: string;
  eventCards: TonightEventCardViewModel[];
  language: string;
  refreshing: boolean;
  showSelectionControls: boolean;
  textSecondaryColor: string;
  onEventPress: (eventId: string) => void;
  onOpenTicket: (url: string) => void;
  onRefresh: () => void;
  onToggleSelection: (eventId: string) => void;
}

const keyExtractor = (item: TonightEventCardViewModel) => item.id;

export function TonightEventCards({
  cardColor,
  colorsText,
  eventMetaSeparator,
  eventCards,
  language,
  refreshing,
  showSelectionControls,
  textSecondaryColor,
  onEventPress,
  onOpenTicket,
  onRefresh,
  onToggleSelection,
}: TonightEventCardsProps) {
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
    ({ item: eventCard }: ListRenderItemInfo<TonightEventCardViewModel>) => (
      <View style={isGrid ? { width: cardWidth } : styles.fullWidth}>
        <TonightEventCard
          cardColor={cardColor}
          event={eventCard.event}
          eventMetaSeparator={eventMetaSeparator}
          eventTime={eventCard.eventTime}
          eventTitle={eventCard.eventTitle}
          isSelected={eventCard.isSelected}
          language={language}
          onOpenTicket={onOpenTicket}
          onPress={() => onEventPress(eventCard.id)}
          onToggleSelection={onToggleSelection}
          priceText={eventCard.priceText}
          showSelectionControls={showSelectionControls}
          textColor={colorsText}
          textSecondaryColor={textSecondaryColor}
          ticketButtonText={eventCard.ticketButtonText}
          urgencyBadge={eventCard.urgencyBadge}
          venueName={eventCard.venueName}
        />
      </View>
    ),
    [
      cardColor,
      colorsText,
      eventMetaSeparator,
      language,
      onEventPress,
      onOpenTicket,
      onToggleSelection,
      showSelectionControls,
      textSecondaryColor,
      isGrid,
      cardWidth,
    ],
  );

  return (
    <FlatList
      key={`tonight-${columns}`}
      data={eventCards}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={columns}
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      columnWrapperStyle={isGrid ? { gap } : undefined}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#8E2DE2"
          colors={['#8E2DE2']}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
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
