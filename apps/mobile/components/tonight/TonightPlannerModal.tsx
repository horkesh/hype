import React, { useCallback, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { TonightModalHeader } from '@/components/tonight/TonightModalHeader';
import { TonightPlanStream } from '@/components/tonight/TonightPlanStream';
import { TonightPlannerResults } from '@/components/tonight/TonightPlannerResults';
import { TonightPlannerSetup } from '@/components/tonight/TonightPlannerSetup';
import { buildTonightPlanMarkers } from '@/utils/tonightHelpers';
import { AIPlan, MoodId } from '@/utils/tonightScreen';

type PlannerPhase = 'setup' | 'ai-streaming' | 'mock-results';

function moodToBudgetTier(budget: number): 'casual' | 'mid' | 'premium' {
  if (budget <= 50) return 'casual';
  if (budget <= 100) return 'mid';
  return 'premium';
}

interface TonightPlannerModalProps {
  activePlan: AIPlan | null;
  backgroundColor: string;
  budget: number;
  cardColor: string;
  closeLabel: string;
  colorsText: string;
  generatingPlan: boolean;
  groupSize: number;
  isBosnian: boolean;
  language: string;
  onClose: () => void;
  onGeneratePlan: () => void;
  onGenerateAIPlan?: () => void;
  onNextPlan: () => void;
  onSavePlan: () => void;
  onSharePlan: () => void;
  onSelectGroupSize: (value: number) => void;
  onSelectMood: (value: MoodId) => void;
  onSetBudget: (value: number) => void;
  plannerLabels: {
    budget: string;
    generate: string;
    group: string;
    mood: string;
    nextPlan: string;
    save: string;
    share: string;
    title: string;
    total: string;
  };
  selectedMood: MoodId | null;
  useAIPlanner?: boolean;
  visible: boolean;
}

export function TonightPlannerModal({
  activePlan,
  backgroundColor,
  budget,
  cardColor,
  closeLabel,
  colorsText,
  generatingPlan,
  groupSize,
  isBosnian,
  language,
  onClose,
  onGeneratePlan,
  onGenerateAIPlan,
  onNextPlan,
  onSavePlan,
  onSelectGroupSize,
  onSelectMood,
  onSetBudget,
  onSharePlan,
  plannerLabels,
  selectedMood,
  useAIPlanner = false,
  visible,
}: TonightPlannerModalProps) {
  const [phase, setPhase] = useState<PlannerPhase>('setup');

  const mapMarkers = useMemo(
    () => (activePlan ? buildTonightPlanMarkers(activePlan) : []),
    [activePlan]
  );

  const handleGenerate = useCallback(() => {
    if (useAIPlanner && selectedMood) {
      setPhase('ai-streaming');
      onGenerateAIPlan?.();
    } else {
      onGeneratePlan();
    }
  }, [useAIPlanner, selectedMood, onGeneratePlan, onGenerateAIPlan]);

  const handleClose = useCallback(() => {
    setPhase('setup');
    onClose();
  }, [onClose]);

  // Determine which view to render
  const showMockResults = activePlan && phase !== 'ai-streaming';
  const showAIStream = phase === 'ai-streaming';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor }]}>
          <TonightModalHeader
            closeLabel={closeLabel}
            color={colorsText}
            onClose={handleClose}
            title={plannerLabels.title}
          />

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {showAIStream ? (
              <TonightPlanStream
                moods={selectedMood ? [selectedMood] : []}
                groupSize={groupSize}
                budget={moodToBudgetTier(budget)}
                language={language}
              />
            ) : showMockResults ? (
              <TonightPlannerResults
                activePlan={activePlan}
                cardColor={cardColor}
                colorsText={colorsText}
                mapMarkers={mapMarkers}
                plannerLabels={plannerLabels}
                onNextPlan={onNextPlan}
                onSavePlan={onSavePlan}
                onSharePlan={onSharePlan}
              />
            ) : (
              <TonightPlannerSetup
                budget={budget}
                cardColor={cardColor}
                colorsText={colorsText}
                generatingPlan={generatingPlan}
                groupSize={groupSize}
                isBosnian={isBosnian}
                plannerLabels={plannerLabels}
                selectedMood={selectedMood}
                onGeneratePlan={handleGenerate}
                onSelectGroupSize={onSelectGroupSize}
                onSelectMood={onSelectMood}
                onSetBudget={onSetBudget}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
});
