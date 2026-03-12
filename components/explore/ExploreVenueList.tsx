import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { ExploreLookupItem, Venue } from '@/utils/exploreScreen';

interface ExploreVenueListProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  getPriceLevelDisplay: (level: number) => string;
  isVenueOpenNow: (openingHours: unknown) => boolean;
  loading: boolean;
  moods: ExploreLookupItem[];
  noResultsLabel: string;
  onVenuePress: (venueId: string) => void;
  openNowLabel: string;
  textColor: string;
  textSecondaryColor: string;
  venues: Venue[];
}

export function ExploreVenueList({
  accentColor,
  backgroundColor,
  cardColor,
  getPriceLevelDisplay,
  isVenueOpenNow,
  loading,
  moods,
  noResultsLabel,
  onVenuePress,
  openNowLabel,
  textColor,
  textSecondaryColor,
  venues,
}: ExploreVenueListProps) {
  if (loading) {
    return <ActivityIndicator size="large" color={accentColor} style={styles.loader} />;
  }

  if (venues.length === 0) {
    return <Text style={[styles.noResults, { color: textSecondaryColor }]}>{noResultsLabel}</Text>;
  }

  return (
    <View style={styles.section}>
      {venues.map((venue) => {
        const isOpen = isVenueOpenNow(venue.opening_hours);

        return (
          <TouchableOpacity
            key={venue.id}
            style={[styles.venueCard, { backgroundColor: cardColor }]}
            onPress={() => onVenuePress(venue.id)}
          >
            {venue.cover_image_url ? (
              <ImageWithPlaceholder
                source={venue.cover_image_url}
                style={styles.venueImage}
                categoryEmoji="📍"
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
              {venue.moods && venue.moods.length > 0 ? (
                <View style={styles.moodBadges}>
                  {venue.moods.slice(0, 3).map((mood, index) => {
                    const moodData = moods.find((entry) => entry.id === mood);

                    return moodData ? (
                      <View
                        key={`${venue.id}-${mood}-${index}`}
                        style={[styles.moodBadge, { backgroundColor }]}
                      >
                        <Text style={styles.moodBadgeEmoji}>{moodData.emoji}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  loader: {
    marginTop: 40,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
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
  moodBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  moodBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBadgeEmoji: {
    fontSize: 16,
  },
});
