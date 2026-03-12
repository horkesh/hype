import React, { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TonightPlannerResults } from '@/components/tonight/TonightPlannerResults';
import { TonightPlannerSetup } from '@/components/tonight/TonightPlannerSetup';
import { buildTonightPlanMarkers } from '@/utils/tonightHelpers';
import { AIPlan, MoodId } from '@/utils/tonightScreen';

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
  onClose: () => void;
  onGeneratePlan: () => void;
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
  onClose,
  onGeneratePlan,
  onNextPlan,
  onSavePlan,
  onSelectGroupSize,
  onSelectMood,
  onSetBudget,
  onSharePlan,
  plannerLabels,
  selectedMood,
  visible,
}: TonightPlannerModalProps) {
  const mapMarkers = useMemo(
    () => (activePlan ? buildTonightPlanMarkers(activePlan) : []),
    [activePlan]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colorsText }]}>{plannerLabels.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.modalClose, { color: colorsText }]}>{closeLabel}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {activePlan ? (
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
                onGeneratePlan={onGeneratePlan}
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 28,
    fontWeight: '300',
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
});
