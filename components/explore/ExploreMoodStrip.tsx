import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { GlassMoodChip } from '@/components/glass/GlassMoodChip';
import type { MoodId } from '@/styles/glassTokens';
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
  moods,
  selectedMoodIds,
  translate,
  onToggleMood,
}: ExploreMoodStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {moods.map((mood) => {
        const isSelected = selectedMoodIds.includes(mood.id);

        return (
          <GlassMoodChip
            key={mood.id}
            moodId={mood.id as MoodId}
            label={translate(mood.labelKey)}
            isSelected={isSelected}
            onPress={() => onToggleMood(mood.id)}
          />
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
});
