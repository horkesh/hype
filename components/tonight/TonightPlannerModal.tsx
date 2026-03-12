import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';

import { Map } from '@/components/Map';
import { AIPlan, MoodId, TONIGHT_MOODS } from '@/utils/tonightScreen';

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

          <ScrollView style={styles.modalScroll}>
            {!activePlan ? (
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
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => {
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
            ) : (
              <>
                <View style={styles.planStops}>
                  {activePlan.stops.map((stop, index) => (
                    <View key={`${stop.venueName}-${stop.time}-${index}`} style={[styles.planStop, { backgroundColor: cardColor }]}>
                      <Text style={styles.planStopTime}>{stop.time}</Text>
                      <Text style={[styles.planStopVenue, { color: colorsText }]}>{stop.venueName}</Text>
                      <Text style={styles.planStopActivity}>{stop.activity}</Text>
                      <Text style={[styles.planStopPrice, { color: colorsText }]}>~{stop.price} KM</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.planTotal, { backgroundColor: cardColor }]}>
                  <Text style={[styles.planTotalLabel, { color: colorsText }]}>{plannerLabels.total}</Text>
                  <Text style={styles.planTotalAmount}>~{activePlan.total} KM</Text>
                </View>

                {activePlan.stops.length > 0 && activePlan.stops[0]?.venueName ? (
                  <View style={styles.planMap}>
                    <Map
                      markers={activePlan.stops.map((stop, index) => ({
                        id: `stop-${index}`,
                        latitude: 43.8563 + (Math.random() - 0.5) * 0.02,
                        longitude: 18.4131 + (Math.random() - 0.5) * 0.02,
                        title: stop.venueName,
                      }))}
                      initialRegion={{
                        latitude: 43.8563,
                        longitude: 18.4131,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03,
                      }}
                    />
                  </View>
                ) : null}

                <View style={styles.planActions}>
                  <TouchableOpacity
                    style={[styles.planActionButton, styles.secondaryAction, { backgroundColor: cardColor }]}
                    onPress={onNextPlan}
                  >
                    <Text style={styles.secondaryActionText}>{plannerLabels.nextPlan}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.planActionButton, styles.secondaryAction, { backgroundColor: cardColor }]}
                    onPress={onSavePlan}
                  >
                    <Text style={styles.secondaryActionText}>{plannerLabels.save}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.planActionButton, { backgroundColor: '#D4A056' }]}
                    onPress={onSharePlan}
                  >
                    <Text style={styles.primaryActionText}>{plannerLabels.share}</Text>
                  </TouchableOpacity>
                </View>
              </>
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
    padding: 20,
  },
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
  planStops: {
    gap: 12,
  },
  planStop: {
    padding: 16,
    borderRadius: 16,
  },
  planStopTime: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#D4A056',
  },
  planStopVenue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planStopActivity: {
    fontSize: 14,
    marginBottom: 4,
    color: '#6B7280',
  },
  planStopPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  planTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  planTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4A056',
  },
  planMap: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  planActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  planActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: '#D4A056',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4A056',
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
