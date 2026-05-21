import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ExploreLookupItem, Venue } from '@/utils/exploreScreen';
import { getExploreVenueMoodItems } from '@/utils/exploreLists';

interface ExploreVenueMoodBadgesProps {
  backgroundColor: string;
  moods: ExploreLookupItem[];
  venue: Venue;
}

export function ExploreVenueMoodBadges({
  backgroundColor,
  moods,
  venue,
}: ExploreVenueMoodBadgesProps) {
  const moodItems = getExploreVenueMoodItems(venue, moods);

  if (moodItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {moodItems.map((mood) => (
        <View key={`${venue.id}-${mood.id}`} style={[styles.badge, { backgroundColor }]}>
          <Text style={styles.emoji}>{mood.emoji}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 16,
  },
});
