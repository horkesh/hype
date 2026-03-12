import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/IconSymbol';
import { ExploreFilterActions } from '@/components/explore/ExploreFilterActions';
import { ExploreFilterChipGrid } from '@/components/explore/ExploreFilterChipGrid';
import { ExploreFilterOpenNowRow } from '@/components/explore/ExploreFilterOpenNowRow';
import { ExploreFilterPriceSection } from '@/components/explore/ExploreFilterPriceSection';
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
            <ExploreFilterChipGrid
              accentColor={accentColor}
              backgroundColor={backgroundColor}
              borderColor={borderColor}
              items={moods}
              selectedIds={filterMoods}
              textColor={textColor}
              title="Moods"
              translate={translate}
              onToggle={onToggleFilterMood}
            />

            <ExploreFilterChipGrid
              accentColor={accentColor}
              backgroundColor={backgroundColor}
              borderColor={borderColor}
              items={categories}
              selectedIds={filterCategories}
              textColor={textColor}
              title={categoriesLabel}
              translate={translate}
              onToggle={onToggleFilterCategory}
            />

            <ExploreFilterPriceSection
              accentColor={accentColor}
              borderColor={borderColor}
              priceLevel={filterPriceLevel}
              priceLevelLabel={priceLevelLabel}
              textColor={textColor}
              valueLabel={getPriceLevelDisplay(filterPriceLevel)}
              onSetPriceLevel={onSetFilterPriceLevel}
            />

            <ExploreFilterOpenNowRow
              accentColor={accentColor}
              borderColor={borderColor}
              isEnabled={filterOpenNow}
              label={openNowLabel}
              textColor={textColor}
              onToggle={() => onSetFilterOpenNow(!filterOpenNow)}
            />
          </ScrollView>

          <ExploreFilterActions
            accentColor={accentColor}
            borderColor={borderColor}
            resetLabel={resetLabel}
            applyLabel={applyFiltersLabel}
            textColor={textColor}
            onReset={onReset}
            onApply={onApply}
          />
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
});
