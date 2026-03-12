import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SwipeDeleteAction } from '@/components/saved/SwipeDeleteAction';
import { SavedVenueCardModel } from '@/utils/savedContent';

interface SavedVenueCardProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  onDelete: (venueId: string) => void;
  onPress: (venueId: string) => void;
  textColor: string;
  textSecondaryColor: string;
  venue: SavedVenueCardModel;
}

export function SavedVenueCard({
  accentColor,
  backgroundColor,
  cardColor,
  onDelete,
  onPress,
  textColor,
  textSecondaryColor,
  venue,
}: SavedVenueCardProps) {
  return (
    <ReanimatedSwipeable
      renderRightActions={(_, drag) => (
        <SwipeDeleteAction drag={drag} onDelete={() => onDelete(venue.venueId)} />
      )}
      overshootRight={false}
    >
      <TouchableOpacity
        onPress={() => onPress(venue.venueId)}
        style={[styles.card, { backgroundColor: cardColor }]}
      >
        <ImageWithPlaceholder
          source={venue.imageSource}
          style={styles.cardImage}
          categoryEmoji="\u{1F4CD}"
        />
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
              {venue.priceDisplay}
            </Text>
          </View>
          {venue.moodBadges.length > 0 ? (
            <View style={styles.moodBadges}>
              {venue.moodBadges.map((moodBadge, index) => (
                <View
                  key={`${venue.id}-${moodBadge}-${index}`}
                  style={[styles.moodBadge, { backgroundColor }]}
                >
                  <Text style={styles.moodEmoji}>{moodBadge}</Text>
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
