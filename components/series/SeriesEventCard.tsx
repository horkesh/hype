import React from 'react';
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SeriesEventMoodBadges } from '@/components/series/SeriesEventMoodBadges';
import {
  SeriesDetailEvent,
  SeriesDetailLanguage,
  formatSeriesEventTime,
  getSeriesDetailCopy,
  getSeriesEventTitle,
  getSeriesEventVenueName,
} from '@/utils/seriesDetailScreen';

interface SeriesEventCardProps {
  colors: {
    accent: string;
    background: string;
    border: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  event: SeriesDetailEvent;
  language: SeriesDetailLanguage;
  onEventPress: (eventId: string) => void;
  onEventTicketPress: (ticketUrl: string) => void;
}

export function SeriesEventCard({
  colors,
  event,
  language,
  onEventPress,
  onEventTicketPress,
}: SeriesEventCardProps) {
  const copy = getSeriesDetailCopy(language);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onEventPress(event.id)}
    >
      <View style={styles.timeColumn}>
        <Text style={[styles.time, { color: colors.accent }]}>
          {formatSeriesEventTime(event.start_datetime)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {getSeriesEventTitle(event, language)}
        </Text>
        <Text style={[styles.venue, { color: colors.textSecondary }]} numberOfLines={1}>
          {getSeriesEventVenueName(event)}
        </Text>

        <SeriesEventMoodBadges
          backgroundColor={colors.background}
          eventId={event.id}
          moods={event.moods ?? []}
        />
      </View>

      {event.ticket_url ? (
        <TouchableOpacity
          style={[styles.ticketButton, { backgroundColor: colors.accent }]}
          onPress={(eventPress) => {
            stopPropagation(eventPress);
            onEventTicketPress(event.ticket_url!);
          }}
        >
          <Text style={styles.ticketButtonText}>{copy.ticket}</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

function stopPropagation(event: GestureResponderEvent) {
  event.stopPropagation();
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeColumn: {
    marginRight: 12,
    minWidth: 50,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  venue: {
    fontSize: 14,
    marginBottom: 6,
  },
  ticketButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  ticketButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
