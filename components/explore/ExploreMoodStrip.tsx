import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ExploreLookupItem } from '@/utils/exploreScreen';

interface ExploreMoodStripProps {
  accentColor: string;
  borderColor: string;
  cardColor: string;
  moods: ExploreLookupItem[];
  selectedMoodIds: string[];
  textColor: string;
  translate: (key: string) => string;
  onToggleMood: (moodId: string) => void;
}

export function ExploreMoodStrip({
  accentColor,
  borderColor,
  cardColor,
  moods,
  selectedMoodIds,
  textColor,
  translate,
  onToggleMood,
}: ExploreMoodStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {moods.map((mood) => {
        const isSelected = selectedMoodIds.includes(mood.id);

        return (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.chip,
              { backgroundColor: isSelected ? accentColor : cardColor, borderColor },
            ]}
            onPress={() => onToggleMood(mood.id)}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text style={[styles.label, { color: isSelected ? '#FFFFFF' : textColor }]}>
              {translate(mood.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
