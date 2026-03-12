import React from 'react';
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  SeriesDetailEvent,
  SeriesDetailLanguage,
  formatSeriesEventTime,
  getSeriesDetailCopy,
  getSeriesEventTitle,
  getSeriesEventVenueName,
  getSeriesMoodEmoji,
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
        <View key={dateHeader} style={styles.dateGroup}>
          <Text style={[styles.dateHeader, { color: colors.text }]}>{dateHeader}</Text>

          {dateEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => onEventPress(event.id)}
            >
              <View style={styles.eventTimeColumn}>
                <Text style={[styles.eventTime, { color: colors.accent }]}>
                  {formatSeriesEventTime(event.start_datetime)}
                </Text>
              </View>

              <View style={styles.eventContent}>
                <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
                  {getSeriesEventTitle(event, language)}
                </Text>
                <Text style={[styles.eventVenue, { color: colors.textSecondary }]} numberOfLines={1}>
                  {getSeriesEventVenueName(event)}
                </Text>

                {event.moods && event.moods.length > 0 ? (
                  <View style={styles.eventMoodBadges}>
                    {event.moods.slice(0, 3).map((mood) => (
                      <View
                        key={`${event.id}-${mood}`}
                        style={[styles.eventMoodBadge, { backgroundColor: colors.background }]}
                      >
                        <Text style={styles.eventMoodBadgeText}>{getSeriesMoodEmoji(mood)}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              {event.ticket_url ? (
                <TouchableOpacity
                  style={[styles.eventTicketButton, { backgroundColor: colors.accent }]}
                  onPress={(eventPress) => {
                    stopPropagation(eventPress);
                    onEventTicketPress(event.ticket_url!);
                  }}
                >
                  <Text style={styles.eventTicketButtonText}>{copy.ticket}</Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

function stopPropagation(event: GestureResponderEvent) {
  event.stopPropagation();
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
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  eventTimeColumn: {
    marginRight: 12,
    minWidth: 50,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 14,
    marginBottom: 6,
  },
  eventMoodBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  eventMoodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  eventMoodBadgeText: {
    fontSize: 12,
  },
  eventTicketButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  eventTicketButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
