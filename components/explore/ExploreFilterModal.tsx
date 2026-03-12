import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { IconSymbol } from '@/components/IconSymbol';
import { ExploreLookupItem } from '@/utils/exploreScreen';

interface ExploreFilterModalProps {
  accentColor: string;
  applyFiltersLabel: string;
  backgroundColor: string;
  borderColor: string;
  cardColor: string;
  categories: ExploreLookupItem[];
  categoriesLabel: string;
  close: () => void;
  filterCategories: string[];
  filterMoods: string[];
  filterOpenNow: boolean;
  filterPriceLevel: number;
  getPriceLevelDisplay: (level: number) => string;
  moods: ExploreLookupItem[];
  onApply: () => void;
  onReset: () => void;
  onSetFilterOpenNow: (value: boolean) => void;
  onSetFilterPriceLevel: (value: number) => void;
  onToggleFilterCategory: (categoryId: string) => void;
  onToggleFilterMood: (moodId: string) => void;
  openNowLabel: string;
  priceLevelLabel: string;
  resetLabel: string;
  textColor: string;
  title: string;
  translate: (key: string) => string;
  visible: boolean;
}

export function ExploreFilterModal({
  accentColor,
  applyFiltersLabel,
  backgroundColor,
  borderColor,
  cardColor,
  categories,
  categoriesLabel,
  close,
  filterCategories,
  filterMoods,
  filterOpenNow,
  filterPriceLevel,
  getPriceLevelDisplay,
  moods,
  onApply,
  onReset,
  onSetFilterOpenNow,
  onSetFilterPriceLevel,
  onToggleFilterCategory,
  onToggleFilterMood,
  openNowLabel,
  priceLevelLabel,
  resetLabel,
  textColor,
  title,
  translate,
  visible,
}: ExploreFilterModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>{title}</Text>
            <TouchableOpacity onPress={close}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={textColor}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <Text style={[styles.filterSectionTitle, { color: textColor }]}>Moods</Text>
            <View style={styles.filterGrid}>
              {moods.map((mood) => {
                const isSelected = filterMoods.includes(mood.id);

                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? accentColor : backgroundColor,
                        borderColor,
                      },
                    ]}
                    onPress={() => onToggleFilterMood(mood.id)}
                  >
                    <Text style={styles.filterEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.filterLabel, { color: isSelected ? '#FFFFFF' : textColor }]}>
                      {translate(mood.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.filterSectionTitle, { color: textColor }]}>{categoriesLabel}</Text>
            <View style={styles.filterGrid}>
              {categories.map((category) => {
                const isSelected = filterCategories.includes(category.id);

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? accentColor : backgroundColor,
                        borderColor,
                      },
                    ]}
                    onPress={() => onToggleFilterCategory(category.id)}
                  >
                    <Text style={styles.filterEmoji}>{category.emoji}</Text>
                    <Text style={[styles.filterLabel, { color: isSelected ? '#FFFFFF' : textColor }]}>
                      {translate(category.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.filterSectionTitle, { color: textColor }]}>{priceLevelLabel}</Text>
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderValue, { color: accentColor }]}>
                {getPriceLevelDisplay(filterPriceLevel)}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={4}
                step={1}
                value={filterPriceLevel}
                onValueChange={onSetFilterPriceLevel}
                minimumTrackTintColor={accentColor}
                maximumTrackTintColor={borderColor}
                thumbTintColor={accentColor}
              />
            </View>

            <TouchableOpacity
              style={[styles.toggleRow, { borderColor }]}
              onPress={() => onSetFilterOpenNow(!filterOpenNow)}
            >
              <Text style={[styles.toggleLabel, { color: textColor }]}>{openNowLabel}</Text>
              <View style={[styles.toggle, { backgroundColor: filterOpenNow ? accentColor : borderColor }]}>
                <View style={[styles.toggleThumb, filterOpenNow && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.resetButton, { borderColor }]} onPress={onReset}>
              <Text style={[styles.resetButtonText, { color: textColor }]}>{resetLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: accentColor }]}
              onPress={onApply}
            >
              <Text style={styles.applyButtonText}>{applyFiltersLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sliderContainer: {
    marginVertical: 8,
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    marginTop: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
