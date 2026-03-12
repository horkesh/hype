import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SwipeDeleteAction } from '@/components/saved/SwipeDeleteAction';
import { SavedVenue, SAVED_MOODS } from '@/utils/savedScreen';

interface SavedVenueCardProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  getPriceLevelDisplay: (level: number) => string;
  onDelete: (venueId: string) => void;
  onPress: (venueId: string) => void;
  textColor: string;
  textSecondaryColor: string;
  venue: SavedVenue;
}

export function SavedVenueCard({
  accentColor,
  backgroundColor,
  cardColor,
  getPriceLevelDisplay,
  onDelete,
  onPress,
  textColor,
  textSecondaryColor,
  venue,
}: SavedVenueCardProps) {
  return (
    <ReanimatedSwipeable
      renderRightActions={(_, drag) => (
        <SwipeDeleteAction drag={drag} onDelete={() => onDelete(venue.id)} />
      )}
      overshootRight={false}
    >
      <TouchableOpacity
        onPress={() => onPress(venue.id)}
        style={[styles.card, { backgroundColor: cardColor }]}
      >
        <ImageWithPlaceholder source={venue.cover_image_url} style={styles.cardImage} categoryEmoji="📍" />
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>
            {venue.name}
          </Text>
          <View style={styles.cardMeta}>
            <View style={[styles.categoryPill, { backgroundColor: accentColor }]}>
              <Text style={styles.categoryText}>{venue.category}</Text>
            </View>
            {venue.neighborhood ? (
              <Text style={[styles.metaText, { color: textSecondaryColor }]}>
                {venue.neighborhood}
              </Text>
            ) : null}
            <Text style={[styles.metaText, { color: textSecondaryColor }]}>
              {getPriceLevelDisplay(venue.price_level)}
            </Text>
          </View>
          {venue.moods && venue.moods.length > 0 ? (
            <View style={styles.moodBadges}>
              {venue.moods.slice(0, 3).map((mood, index) => (
                <View key={`${venue.id}-${mood}-${index}`} style={[styles.moodBadge, { backgroundColor }]}>
                  <Text style={styles.moodEmoji}>{SAVED_MOODS[mood] || '✨'}</Text>
                </View>
              ))}
            </View>
          ) : null}
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
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metaText: {
    fontSize: 14,
  },
  moodBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  moodBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 16,
  },
});
