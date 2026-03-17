import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassContainer } from '@/components/glass/GlassContainer';

interface EventVenueAndBadgesProps {
  venueName: string;
  venueEnabled: boolean;
  onVenuePress: () => void;
  venueLabel: string;
  category: string;
  categoryEmoji: string;
  moods: string[];
  getMoodEmoji: (mood: string) => string;
  colors: {
    card: string;
    text: string;
    textSecondary: string;
  };
}

export function EventVenueAndBadges({
  venueName,
  venueEnabled,
  onVenuePress,
  venueLabel,
  category,
  categoryEmoji,
  moods,
  getMoodEmoji,
  colors,
}: EventVenueAndBadgesProps) {
  return (
    <>
      {venueName ? (
        <TouchableOpacity
          style={styles.venueRow}
          onPress={onVenuePress}
          disabled={!venueEnabled}
          activeOpacity={venueEnabled ? 0.7 : 1}
        >
          <Text style={[styles.venueLabel, { color: colors.textSecondary }]}>{venueLabel}</Text>
          <Text style={[styles.venueName, { color: venueEnabled ? '#D4A056' : colors.text }]}>
            {venueName}
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.badgesSection}>
        <GlassBadge label={`${categoryEmoji} ${category}`} variant="accent" size="md" />

        {moods.length > 0 ? (
          <GlassContainer borderRadius={16} style={styles.moodBadgesContainer}>
            <View style={styles.moodBadges}>
              {moods.map((mood) => (
                <View key={mood} style={styles.moodBadge}>
                  <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
                  <Text style={[styles.moodText, { color: colors.text }]}>{mood}</Text>
                </View>
              ))}
            </View>
          </GlassContainer>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  venueRow: {
    marginBottom: 20,
  },
  venueLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
  },
  badgesSection: {
    marginBottom: 20,
  },
  moodBadgesContainer: {
    padding: 10,
    marginTop: 12,
  },
  moodBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  moodText: {
    fontSize: 13,
  },
});
