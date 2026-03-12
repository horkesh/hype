import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TonightPlannerMoodOption } from '@/utils/tonightPlanner';
import { MoodId } from '@/utils/tonightScreen';

interface TonightPlannerMoodGridProps {
  cardColor: string;
  colorsText: string;
  options: TonightPlannerMoodOption[];
  selectedMood: MoodId | null;
  title: string;
  onSelectMood: (value: MoodId) => void;
}

export function TonightPlannerMoodGrid({
  cardColor,
  colorsText,
  options,
  selectedMood,
  title,
  onSelectMood,
}: TonightPlannerMoodGridProps) {
  return (
    <>
      <Text style={[styles.sectionLabel, { color: colorsText }]}>{title}</Text>
      <View style={styles.grid}>
        {options.map((option) => {
          const isSelected = selectedMood === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.chip, { backgroundColor: isSelected ? '#D4A056' : cardColor }]}
              onPress={() => onSelectMood(option.id)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={[styles.label, { color: isSelected ? '#FFFFFF' : colorsText }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
