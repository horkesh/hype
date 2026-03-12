import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/IconSymbol';
import { ExploreCategoryGrid } from '@/components/explore/ExploreCategoryGrid';
import { ExploreMoodStrip } from '@/components/explore/ExploreMoodStrip';
import { ExploreTabSwitcher } from '@/components/explore/ExploreTabSwitcher';
import { ExploreLookupItem } from '@/utils/exploreScreen';

interface ExploreControlsProps {
  accentColor: string;
  activeTab: 'list' | 'menu';
  borderColor: string;
  cardColor: string;
  categories: ExploreLookupItem[];
  categoriesLabel: string;
  dailyMenuLabel: string;
  filterButtonLabel: string;
  moods: ExploreLookupItem[];
  onOpenFilters: () => void;
  onSelectCategory: (categoryId: string) => void;
  onSetActiveTab: (tab: 'list' | 'menu') => void;
  onToggleMood: (moodId: string) => void;
  selectedCategory: string | null;
  selectedMoods: string[];
  textColor: string;
  translate: (key: string) => string;
}

export function ExploreControls({
  accentColor,
  activeTab,
  borderColor,
  cardColor,
  categories,
  categoriesLabel,
  dailyMenuLabel,
  filterButtonLabel,
  moods,
  onOpenFilters,
  onSelectCategory,
  onSetActiveTab,
  onToggleMood,
  selectedCategory,
  selectedMoods,
  textColor,
  translate,
}: ExploreControlsProps) {
  return (
    <>
      <View style={styles.moodSection}>
        <ExploreMoodStrip
          accentColor={accentColor}
          borderColor={borderColor}
          cardColor={cardColor}
          moods={moods}
          selectedMoodIds={selectedMoods}
          textColor={textColor}
          translate={translate}
          onToggleMood={onToggleMood}
        />
      </View>

      <ExploreCategoryGrid
        accentColor={accentColor}
        borderColor={borderColor}
        cardColor={cardColor}
        categories={categories}
        selectedCategory={selectedCategory}
        textColor={textColor}
        title={categoriesLabel}
        translate={translate}
        onSelectCategory={onSelectCategory}
      />

      <View style={styles.tabSection}>
        <ExploreTabSwitcher
          accentColor={accentColor}
          activeTab={activeTab}
          cardColor={cardColor}
          dailyMenuLabel={dailyMenuLabel}
          textColor={textColor}
          onSetActiveTab={onSetActiveTab}
        />

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: accentColor }]}
          onPress={onOpenFilters}
        >
          <IconSymbol
            ios_icon_name="slider.horizontal.3"
            android_material_icon_name="tune"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.filterButtonText}>{filterButtonLabel}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  moodSection: {
    paddingVertical: 8,
  },
  tabSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
