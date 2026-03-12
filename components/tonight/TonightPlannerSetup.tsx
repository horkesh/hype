import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { TonightPlannerGroupSizePicker } from '@/components/tonight/TonightPlannerGroupSizePicker';
import { TonightPlannerMoodGrid } from '@/components/tonight/TonightPlannerMoodGrid';
import {
  buildTonightPlannerMoodOptions,
  TONIGHT_GROUP_SIZES,
} from '@/utils/tonightPlanner';
import { MoodId } from '@/utils/tonightScreen';

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
  const moodOptions = buildTonightPlannerMoodOptions(isBosnian);

  return (
    <>
      <TonightPlannerMoodGrid
        cardColor={cardColor}
        colorsText={colorsText}
        options={moodOptions}
        selectedMood={selectedMood}
        title={plannerLabels.mood}
        onSelectMood={onSelectMood}
      />

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

      <TonightPlannerGroupSizePicker
        cardColor={cardColor}
        colorsText={colorsText}
        groupSize={groupSize}
        options={TONIGHT_GROUP_SIZES}
        title={plannerLabels.group}
        onSelectGroupSize={onSelectGroupSize}
      />

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
  slider: {
    width: '100%',
    height: 40,
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
