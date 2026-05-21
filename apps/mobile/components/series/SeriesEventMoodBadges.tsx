import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getSeriesMoodEmoji } from '@/utils/seriesDetailScreen';

interface SeriesEventMoodBadgesProps {
  backgroundColor: string;
  eventId: string;
  moods: string[];
}

export function SeriesEventMoodBadges({
  backgroundColor,
  eventId,
  moods,
}: SeriesEventMoodBadgesProps) {
  if (moods.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {moods.slice(0, 3).map((mood) => (
        <View
          key={`${eventId}-${mood}`}
          style={[styles.badge, { backgroundColor }]}
        >
          <Text style={styles.badgeText}>{getSeriesMoodEmoji(mood)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
  },
});
