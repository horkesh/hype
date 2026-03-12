import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SwipeDeleteAction } from '@/components/saved/SwipeDeleteAction';
import { SavedEventCardModel } from '@/utils/savedContent';

interface SavedEventCardProps {
  accentColor: string;
  cardColor: string;
  event: SavedEventCardModel;
  onDelete: (eventId: string) => void;
  onPress: (eventId: string) => void;
  textColor: string;
  textSecondaryColor: string;
}

export function SavedEventCard({
  accentColor,
  cardColor,
  event,
  onDelete,
  onPress,
  textColor,
  textSecondaryColor,
}: SavedEventCardProps) {
  return (
    <ReanimatedSwipeable
      renderRightActions={(_, drag) => (
        <SwipeDeleteAction drag={drag} onDelete={() => onDelete(event.eventId)} />
      )}
      overshootRight={false}
    >
      <TouchableOpacity
        onPress={() => onPress(event.eventId)}
        style={[styles.card, { backgroundColor: cardColor }]}
      >
        <ImageWithPlaceholder
          source={event.imageSource}
          style={styles.cardImage}
          categoryEmoji="\u{1F39F}\uFE0F"
        />
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
            {event.title}
          </Text>
          {event.venueName ? (
            <Text style={[styles.metaText, { color: textSecondaryColor }]}>
              {event.venueName}
            </Text>
          ) : null}
          <View style={styles.eventMeta}>
            <Text style={[styles.metaText, { color: textSecondaryColor }]}>
              {event.dateDisplay}
            </Text>
            <View style={[styles.priceBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.priceText}>{event.priceDisplay}</Text>
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
