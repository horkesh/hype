import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassMoodChip } from '@/components/glass/GlassMoodChip';
import type { MoodId } from '@/styles/glassTokens';
import { ProfileMoodOption } from '@/utils/profileScreen';

interface ProfileMoodSectionProps {
  accentColor: string;
  cardColor: string;
  colorsText: string;
  moods: ProfileMoodOption[];
  onToggleMood: (moodId: string) => void;
  selectedMoods: string[];
  title: string;
  isBosnian: boolean;
}

export function ProfileMoodSection({
  accentColor,
  cardColor,
  colorsText,
  isBosnian,
  moods,
  onToggleMood,
  selectedMoods,
  title,
}: ProfileMoodSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colorsText }]}>{title}</Text>
      <View style={styles.moodGrid}>
        {moods.map((mood) => {
          const isSelected = selectedMoods.includes(mood.id);

          return (
            <GlassMoodChip
              key={mood.id}
              moodId={mood.id as MoodId}
              label={isBosnian ? mood.label_bs : mood.label_en}
              isSelected={isSelected}
              onPress={() => onToggleMood(mood.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
