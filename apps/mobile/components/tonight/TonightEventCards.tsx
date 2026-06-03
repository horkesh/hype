import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet } from 'react-native';

import { TonightEventCard } from '@/components/tonight/TonightEventCard';
import { TonightEventCardViewModel } from '@/utils/tonightContent';

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
  const renderItem = useCallback(
    ({ item: eventCard }: ListRenderItemInfo<TonightEventCardViewModel>) => (
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
    ],
  );

  return (
    <FlatList
      data={eventCards}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
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
  },
});
