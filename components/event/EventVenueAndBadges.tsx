import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        <View style={[styles.categoryBadge, { backgroundColor: colors.card }]}>
          <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
          <Text style={[styles.categoryText, { color: colors.text }]}>{category}</Text>
        </View>

        {moods.length > 0 ? (
          <View style={styles.moodBadges}>
            {moods.map((mood) => (
              <View key={mood} style={[styles.moodBadge, { backgroundColor: colors.card }]}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
                <Text style={[styles.moodText, { color: colors.text }]}>{mood}</Text>
              </View>
            ))}
          </View>
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  moodBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  moodEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  moodText: {
    fontSize: 13,
  },
});
