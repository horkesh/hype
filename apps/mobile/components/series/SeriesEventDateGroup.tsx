import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SeriesEventCard } from '@/components/series/SeriesEventCard';
import { SeriesDetailEvent, SeriesDetailLanguage } from '@/utils/seriesDetailScreen';

interface SeriesEventDateGroupProps {
  colors: {
    accent: string;
    background: string;
    border: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  dateEvents: SeriesDetailEvent[];
  dateHeader: string;
  language: SeriesDetailLanguage;
  onEventPress: (eventId: string) => void;
  onEventTicketPress: (ticketUrl: string) => void;
}

export function SeriesEventDateGroup({
  colors,
  dateEvents,
  dateHeader,
  language,
  onEventPress,
  onEventTicketPress,
}: SeriesEventDateGroupProps) {
  return (
    <View style={styles.group}>
      <Text style={[styles.header, { color: colors.text }]}>{dateHeader}</Text>

      {dateEvents.map((event) => (
        <SeriesEventCard
          key={event.id}
          colors={colors}
          event={event}
          language={language}
          onEventPress={onEventPress}
          onEventTicketPress={onEventTicketPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 24,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
