import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
            <TouchableOpacity
              key={mood.id}
              onPress={() => onToggleMood(mood.id)}
              style={[
                styles.moodChip,
                {
                  backgroundColor: isSelected ? accentColor : cardColor,
                  borderColor: accentColor,
                },
              ]}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, { color: isSelected ? '#FFFFFF' : colorsText }]}>
                {isBosnian ? mood.label_bs : mood.label_en}
              </Text>
            </TouchableOpacity>
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
    gap: 12,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
