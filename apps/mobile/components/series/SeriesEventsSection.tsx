import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SeriesEventDateGroup } from '@/components/series/SeriesEventDateGroup';
import {
  SeriesDetailEvent,
  SeriesDetailLanguage,
  getSeriesDetailCopy,
} from '@/utils/seriesDetailScreen';

interface SeriesEventsSectionProps {
  groupedEvents: Record<string, SeriesDetailEvent[]>;
  language: SeriesDetailLanguage;
  colors: {
    accent: string;
    background: string;
    border: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  onEventPress: (eventId: string) => void;
  onEventTicketPress: (ticketUrl: string) => void;
}

export function SeriesEventsSection({
  groupedEvents,
  language,
  colors,
  onEventPress,
  onEventTicketPress,
}: SeriesEventsSectionProps) {
  const copy = getSeriesDetailCopy(language);
  const dateGroups = Object.entries(groupedEvents);

  if (dateGroups.length === 0) {
    return null;
  }

  return (
    <View style={styles.eventsSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{copy.events}</Text>

      {dateGroups.map(([dateHeader, dateEvents]) => (
        <SeriesEventDateGroup
          key={dateHeader}
          colors={colors}
          dateEvents={dateEvents}
          dateHeader={dateHeader}
          language={language}
          onEventPress={onEventPress}
          onEventTicketPress={onEventTicketPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  eventsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
