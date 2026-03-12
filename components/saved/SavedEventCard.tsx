import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SwipeDeleteAction } from '@/components/saved/SwipeDeleteAction';
import { SavedEvent } from '@/utils/savedScreen';

interface SavedEventCardProps {
  accentColor: string;
  cardColor: string;
  dateDisplay: string;
  event: SavedEvent;
  eventTitle: string;
  onDelete: (eventId: string) => void;
  onPress: (eventId: string) => void;
  priceDisplay: string;
  textColor: string;
  textSecondaryColor: string;
  venueName: string;
}

export function SavedEventCard({
  accentColor,
  cardColor,
  dateDisplay,
  event,
  eventTitle,
  onDelete,
  onPress,
  priceDisplay,
  textColor,
  textSecondaryColor,
  venueName,
}: SavedEventCardProps) {
  return (
    <ReanimatedSwipeable
      renderRightActions={(_, drag) => (
        <SwipeDeleteAction drag={drag} onDelete={() => onDelete(event.id)} />
      )}
      overshootRight={false}
    >
      <TouchableOpacity
        onPress={() => onPress(event.id)}
        style={[styles.card, { backgroundColor: cardColor }]}
      >
        <ImageWithPlaceholder source={event.cover_image_url} style={styles.cardImage} categoryEmoji="🎟️" />
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
            {eventTitle}
          </Text>
          {venueName ? (
            <Text style={[styles.metaText, { color: textSecondaryColor }]}>{venueName}</Text>
          ) : null}
          <View style={styles.eventMeta}>
            <Text style={[styles.metaText, { color: textSecondaryColor }]}>{dateDisplay}</Text>
            <View style={[styles.priceBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.priceText}>{priceDisplay}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
