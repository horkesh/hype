import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/IconSymbol';
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
          {moods.map((mood) => {
            const isSelected = selectedMoods.includes(mood.id);
            return (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodChip,
                  { backgroundColor: isSelected ? accentColor : cardColor, borderColor },
                ]}
                onPress={() => onToggleMood(mood.id)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, { color: isSelected ? '#FFFFFF' : textColor }]}>
                  {translate(mood.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.categorySection}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>{categoriesLabel}</Text>
        <View style={styles.categoryGrid}>
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: isSelected ? accentColor : cardColor, borderColor },
                ]}
                onPress={() => onSelectCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: isSelected ? '#FFFFFF' : textColor }]}>
                  {translate(category.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.tabSection}>
        <View style={[styles.tabSwitcher, { backgroundColor: cardColor }]}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'list' && { backgroundColor: accentColor }]}
            onPress={() => onSetActiveTab('list')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'list' ? '#FFFFFF' : textColor }]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'menu' && { backgroundColor: accentColor }]}
            onPress={() => onSetActiveTab('menu')}
          >
            <View style={styles.menuTabLabel}>
              <IconSymbol
                ios_icon_name="fork.knife"
                android_material_icon_name="restaurant"
                size={16}
                color={activeTab === 'menu' ? '#FFFFFF' : textColor}
              />
              <Text style={[styles.tabText, { color: activeTab === 'menu' ? '#FFFFFF' : textColor }]}>
                {dailyMenuLabel}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

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
  moodScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  categorySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  tabSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  tabSwitcher: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  menuTabLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
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
