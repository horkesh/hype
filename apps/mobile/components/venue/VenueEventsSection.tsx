import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import {
  VenueDetailEvent,
  VenueDetailLanguage,
  formatVenueEventDate,
  getVenueEventTitle,
} from '@/utils/venueDetailScreen';

interface VenueEventsSectionProps {
  events: VenueDetailEvent[];
  language: VenueDetailLanguage;
  colors: {
    card: string;
    text: string;
    textSecondary: string;
    accent: string;
    shadow: string;
  };
  emptyLabel: string;
  freeLabel: string;
}

export function VenueEventsSection({
  events,
  language,
  colors,
  emptyLabel,
  freeLabel,
}: VenueEventsSectionProps) {
  if (events.length === 0) {
    return <Text style={[styles.noResults, { color: colors.textSecondary }]}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.eventsTab}>
      {events.map((event) => (
        <View
          key={event.id}
          style={[
            styles.eventCard,
            {
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <ImageWithPlaceholder
            source={event.cover_image_url}
            style={styles.eventImage}
            categoryEmoji={'\ud83d\udcc5'}
          />
          <View style={styles.eventInfo}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>
              {getVenueEventTitle(event, language)}
            </Text>
            <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
              {formatVenueEventDate(event.start_datetime)}
            </Text>
            {event.price_bam !== null ? (
              <Text style={[styles.eventPrice, { color: colors.accent }]}>
                {event.price_bam === 0 ? freeLabel : `${event.price_bam} KM`}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  eventsTab: {
    gap: 16,
  },
  noResults: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  eventCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
});
