import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { VenueDetailVenue, VENUE_MOODS, getVenuePriceLevelDisplay } from '@/utils/venueDetailScreen';

interface VenueDetailHeaderProps {
  venue: VenueDetailVenue;
  colors: {
    card: string;
    text: string;
    accent: string;
  };
  t: (key: string) => string;
}

export function VenueDetailHeader({ venue, colors, t }: VenueDetailHeaderProps) {
  return (
    <>
      <ImageWithPlaceholder
        source={venue.cover_image_url}
        style={styles.heroImage}
        borderRadius={0}
        categoryEmoji={venue.category_emoji}
      />

      <View style={styles.header}>
        <Text style={[styles.venueName, { color: colors.text }]}>{venue.name}</Text>

        <View style={styles.badgeRow}>
          <GlassBadge label={venue.category} variant="accent" size="md" />
          <GlassBadge label={getVenuePriceLevelDisplay(venue.price_level)} variant="default" size="md" />
        </View>

        {venue.moods && venue.moods.length > 0 ? (
          <GlassContainer style={styles.moodBadgesContainer} borderRadius={16}>
            <View style={styles.moodBadges}>
              {venue.moods.map((moodId) => {
                const mood = VENUE_MOODS.find((entry) => entry.id === moodId);
                if (!mood) {
                  return null;
                }

                return (
                  <View
                    key={moodId}
                    style={styles.moodBadge}
                  >
                    <Text style={styles.moodBadgeEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodBadgeText, { color: colors.text }]}>
                      {t(mood.labelKey)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </GlassContainer>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: 300,
  },
  header: {
    padding: 20,
    gap: 12,
  },
  venueName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodBadgesContainer: {
    padding: 12,
  },
  moodBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moodBadgeEmoji: {
    fontSize: 14,
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
