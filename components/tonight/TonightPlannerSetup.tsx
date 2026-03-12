import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { MoodId, TONIGHT_MOODS } from '@/utils/tonightScreen';

interface TonightPlannerSetupProps {
  budget: number;
  cardColor: string;
  colorsText: string;
  generatingPlan: boolean;
  groupSize: number;
  isBosnian: boolean;
  plannerLabels: {
    budget: string;
    generate: string;
    group: string;
    mood: string;
  };
  selectedMood: MoodId | null;
  onGeneratePlan: () => void;
  onSelectGroupSize: (value: number) => void;
  onSelectMood: (value: MoodId) => void;
  onSetBudget: (value: number) => void;
}

const GROUP_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

export function TonightPlannerSetup({
  budget,
  cardColor,
  colorsText,
  generatingPlan,
  groupSize,
  isBosnian,
  plannerLabels,
  selectedMood,
  onGeneratePlan,
  onSelectGroupSize,
  onSelectMood,
  onSetBudget,
}: TonightPlannerSetupProps) {
  return (
    <>
      <Text style={[styles.sectionLabel, { color: colorsText }]}>{plannerLabels.mood}</Text>
      <View style={styles.moodGrid}>
        {TONIGHT_MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;

          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodChip,
                { backgroundColor: isSelected ? '#D4A056' : cardColor },
              ]}
              onPress={() => onSelectMood(mood.id)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, { color: isSelected ? '#FFFFFF' : colorsText }]}>
                {isBosnian ? mood.label_bs : mood.label_en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: colorsText }]}>{plannerLabels.budget}</Text>
      <Slider
        style={styles.slider}
        minimumValue={30}
        maximumValue={150}
        step={10}
        value={budget}
        onValueChange={onSetBudget}
        minimumTrackTintColor="#D4A056"
        maximumTrackTintColor={cardColor}
        thumbTintColor="#D4A056"
      />

      <Text style={[styles.sectionLabel, { color: colorsText }]}>{plannerLabels.group}</Text>
      <View style={styles.groupSizeButtons}>
        {GROUP_SIZES.map((size) => {
          const isSelected = groupSize === size;

          return (
            <TouchableOpacity
              key={size}
              style={[
                styles.groupSizeButton,
                { backgroundColor: isSelected ? '#D4A056' : cardColor },
              ]}
              onPress={() => onSelectGroupSize(size)}
            >
              <Text style={[styles.groupSizeText, { color: isSelected ? '#FFFFFF' : colorsText }]}>
                {size}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.generateButton,
          { backgroundColor: selectedMood ? '#D4A056' : cardColor },
        ]}
        onPress={onGeneratePlan}
        disabled={!selectedMood || generatingPlan}
      >
        {generatingPlan ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.generateButtonText}>{plannerLabels.generate}</Text>
        )}
      </TouchableOpacity>
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
    gap: 8,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  groupSizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  groupSizeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupSizeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
