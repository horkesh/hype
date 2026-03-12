import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { ExploreVenueMoodBadges } from '@/components/explore/ExploreVenueMoodBadges';
import { ExploreLookupItem, Venue } from '@/utils/exploreScreen';

interface ExploreVenueCardProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  getPriceLevelDisplay: (level: number) => string;
  isVenueOpenNow: (openingHours: unknown) => boolean;
  moods: ExploreLookupItem[];
  onPress: (venueId: string) => void;
  openNowLabel: string;
  textColor: string;
  textSecondaryColor: string;
  venue: Venue;
}

export function ExploreVenueCard({
  accentColor,
  backgroundColor,
  cardColor,
  getPriceLevelDisplay,
  isVenueOpenNow,
  moods,
  onPress,
  openNowLabel,
  textColor,
  textSecondaryColor,
  venue,
}: ExploreVenueCardProps) {
  const isOpen = isVenueOpenNow(venue.opening_hours);

  return (
    <TouchableOpacity
      style={[styles.venueCard, { backgroundColor: cardColor }]}
      onPress={() => onPress(venue.id)}
    >
      {venue.cover_image_url ? (
        <ImageWithPlaceholder
          source={venue.cover_image_url}
          style={styles.venueImage}
          categoryEmoji={'\ud83d\udccd'}
        />
      ) : null}
      <View style={styles.venueInfo}>
        <Text style={[styles.venueName, { color: textColor }]}>{venue.name}</Text>
        <View style={styles.venueDetails}>
          <View style={[styles.categoryPill, { backgroundColor: accentColor }]}>
            <Text style={styles.categoryPillText}>{venue.category}</Text>
          </View>
          {venue.neighborhood ? (
            <Text style={[styles.venueNeighborhood, { color: textSecondaryColor }]}>
              {venue.neighborhood}
            </Text>
          ) : null}
        </View>
        <View style={styles.venueFooter}>
          <Text style={[styles.priceLevel, { color: accentColor }]}>
            {getPriceLevelDisplay(venue.price_level)}
          </Text>
          {isOpen ? (
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>{openNowLabel}</Text>
            </View>
          ) : null}
        </View>
        <ExploreVenueMoodBadges backgroundColor={backgroundColor} moods={moods} venue={venue} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  venueCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueImage: {
    width: '100%',
    height: 180,
  },
  venueInfo: {
    padding: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  venueNeighborhood: {
    fontSize: 14,
  },
  venueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  priceLevel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  openBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  openBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
