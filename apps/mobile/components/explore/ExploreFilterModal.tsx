import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ExploreFilterActions } from '@/components/explore/ExploreFilterActions';
import { ExploreFilterContent } from '@/components/explore/ExploreFilterContent';
import { ExploreModalHeader } from '@/components/explore/ExploreModalHeader';
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
          <ExploreModalHeader
            borderColor={borderColor}
            onClose={close}
            textColor={textColor}
            title={title}
          />

          <ScrollView style={styles.modalScroll}>
            <ExploreFilterContent
              accentColor={accentColor}
              backgroundColor={backgroundColor}
              borderColor={borderColor}
              categories={categories}
              categoriesLabel={categoriesLabel}
              filterCategories={filterCategories}
              filterMoods={filterMoods}
              filterOpenNow={filterOpenNow}
              filterPriceLevel={filterPriceLevel}
              getPriceLevelDisplay={getPriceLevelDisplay}
              moods={moods}
              onSetFilterOpenNow={onSetFilterOpenNow}
              onSetFilterPriceLevel={onSetFilterPriceLevel}
              onToggleFilterCategory={onToggleFilterCategory}
              onToggleFilterMood={onToggleFilterMood}
              openNowLabel={openNowLabel}
              priceLevelLabel={priceLevelLabel}
              textColor={textColor}
              translate={translate}
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
  modalScroll: {
    padding: 20,
  },
});
