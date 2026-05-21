import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GlassMoodChip } from '@/components/glass/GlassMoodChip';
import { SectionHeader } from '@/components/SectionHeader';
import { HOME_MOODS, HomeLanguage } from '@/utils/homeScreenContent';
import type { MoodId } from '@/styles/glassTokens';

interface HomeMoodSectionProps {
  language: HomeLanguage;
  selectedMood: string | null;
  title: string;
  onSelectMood: (moodId: string | null) => void;
}

export function HomeMoodSection({
  language,
  selectedMood,
  title,
  onSelectMood,
}: HomeMoodSectionProps) {
  return (
    <>
      <SectionHeader title={title} />
      <View style={styles.moodsContainer}>
        <View style={styles.moodsGrid}>
          {HOME_MOODS.map((mood) => {
            const moodLabel = language === 'bs' ? mood.label_bs : mood.label_en;
            const isSelected = selectedMood === mood.id;

            return (
              <GlassMoodChip
                key={mood.id}
                moodId={mood.id as MoodId}
                label={moodLabel}
                isSelected={isSelected}
                onPress={() => onSelectMood(isSelected ? null : mood.id)}
              />
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  moodsContainer: {
    paddingHorizontal: 20,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
