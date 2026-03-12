import React from 'react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';

import { TonightEventCard } from '@/components/tonight/TonightEventCard';
import { TonightEventCardViewModel } from '@/utils/tonightContent';

interface TonightEventCardsProps {
  cardColor: string;
  colorsText: string;
  eventMetaSeparator: string;
  eventCards: TonightEventCardViewModel[];
  refreshing: boolean;
  showSelectionControls: boolean;
  textSecondaryColor: string;
  onEventPress: (eventId: string) => void;
  onOpenTicket: (url: string) => void;
  onRefresh: () => void;
  onToggleSelection: (eventId: string) => void;
}

export function TonightEventCards({
  cardColor,
  colorsText,
  eventMetaSeparator,
  eventCards,
  refreshing,
  showSelectionControls,
  textSecondaryColor,
  onEventPress,
  onOpenTicket,
  onRefresh,
  onToggleSelection,
}: TonightEventCardsProps) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#D4A056"
          colors={['#D4A056']}
        />
      }
    >
      {eventCards.map((eventCard) => (
        <TonightEventCard
          key={eventCard.id}
          cardColor={cardColor}
          event={eventCard.event}
          eventMetaSeparator={eventMetaSeparator}
          eventTime={eventCard.eventTime}
          eventTitle={eventCard.eventTitle}
          isSelected={eventCard.isSelected}
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
      ))}
    </ScrollView>
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
