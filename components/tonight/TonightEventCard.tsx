import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TonightEventActions } from '@/components/tonight/TonightEventActions';
import { TonightEventBadges } from '@/components/tonight/TonightEventBadges';
import { TonightEventImage } from '@/components/tonight/TonightEventImage';
import { TonightEventMeta } from '@/components/tonight/TonightEventMeta';
import { Event } from '@/utils/tonightScreen';

interface TonightEventCardProps {
  cardColor: string;
  event: Event;
  eventMetaSeparator: string;
  eventTime: string;
  eventTitle: string;
  isSelected: boolean;
  onOpenTicket: (url: string) => void;
  onPress: () => void;
  onToggleSelection: (eventId: string) => void;
  priceText: string;
  showSelectionControls: boolean;
  textColor: string;
  textSecondaryColor: string;
  ticketButtonText: string;
  urgencyBadge: { label: string; color: string } | null;
  venueName: string;
}

export function TonightEventCard({
  cardColor,
  event,
  eventMetaSeparator,
  eventTime,
  eventTitle,
  isSelected,
  onOpenTicket,
  onPress,
  onToggleSelection,
  priceText,
  showSelectionControls,
  textColor,
  textSecondaryColor,
  ticketButtonText,
  urgencyBadge,
  venueName,
}: TonightEventCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.eventCard,
        { backgroundColor: cardColor },
        isSelected && styles.selectedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TonightEventImage coverImageUrl={event.cover_image_url} />

      <View style={styles.eventContent}>
        <TonightEventBadges
          priceText={priceText}
          textColor={textColor}
          urgencyBadge={urgencyBadge}
        />

        <Text style={[styles.eventTitle, { color: textColor }]} numberOfLines={2}>
          {eventTitle}
        </Text>

        <TonightEventMeta
          eventMetaSeparator={eventMetaSeparator}
          eventTime={eventTime}
          textSecondaryColor={textSecondaryColor}
          venueName={venueName}
        />

        <TonightEventActions
          cardColor={cardColor}
          eventId={event.id}
          isSelected={isSelected}
          onOpenTicket={onOpenTicket}
          onToggleSelection={onToggleSelection}
          showSelectionControls={showSelectionControls}
          ticketButtonText={ticketButtonText}
          ticketUrl={event.ticket_url}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#D4A056',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
