import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TonightEventCard } from '@/components/tonight/TonightEventCard';
import { Event } from '@/utils/tonightScreen';

interface RenderedTonightEventProps {
  eventTime: string;
  eventTitle: string;
  isSelected: boolean;
  priceText: string;
  ticketButtonText: string;
  urgencyBadge: { label: string; color: string } | null;
  venueName: string;
}

interface TonightEventListProps {
  cardColor: string;
  colorsText: string;
  emptyStateMessage: string;
  eventMetaSeparator: string;
  events: Event[];
  loading: boolean;
  refreshing: boolean;
  showSelectionControls: boolean;
  textSecondaryColor: string;
  onEventPress: (eventId: string) => void;
  onOpenTicket: (url: string) => void;
  onRefresh: () => void;
  onToggleSelection: (eventId: string) => void;
  renderEventProps: (event: Event) => RenderedTonightEventProps;
}

export function TonightEventList({
  cardColor,
  colorsText,
  emptyStateMessage,
  eventMetaSeparator,
  events,
  loading,
  refreshing,
  showSelectionControls,
  textSecondaryColor,
  onEventPress,
  onOpenTicket,
  onRefresh,
  onToggleSelection,
  renderEventProps,
}: TonightEventListProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A056" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>{'\uD83C\uDF05'}</Text>
        <Text style={[styles.emptyText, { color: textSecondaryColor }]}>{emptyStateMessage}</Text>
      </View>
    );
  }

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
      {events.map((event) => {
        const eventProps = renderEventProps(event);

        return (
          <TonightEventCard
            key={event.id}
            cardColor={cardColor}
            event={event}
            eventMetaSeparator={eventMetaSeparator}
            eventTime={eventProps.eventTime}
            eventTitle={eventProps.eventTitle}
            isSelected={eventProps.isSelected}
            onOpenTicket={onOpenTicket}
            onPress={() => onEventPress(event.id)}
            onToggleSelection={onToggleSelection}
            priceText={eventProps.priceText}
            showSelectionControls={showSelectionControls}
            textColor={colorsText}
            textSecondaryColor={textSecondaryColor}
            ticketButtonText={eventProps.ticketButtonText}
            urgencyBadge={eventProps.urgencyBadge}
            venueName={eventProps.venueName}
          />
        );
      })}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
