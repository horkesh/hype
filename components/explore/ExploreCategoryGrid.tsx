import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ExploreLookupItem } from '@/utils/exploreScreen';

interface ExploreCategoryGridProps {
  accentColor: string;
  borderColor: string;
  cardColor: string;
  categories: ExploreLookupItem[];
  selectedCategory: string | null;
  textColor: string;
  title: string;
  translate: (key: string) => string;
  onSelectCategory: (categoryId: string) => void;
}

export function ExploreCategoryGrid({
  accentColor,
  borderColor,
  cardColor,
  categories,
  selectedCategory,
  textColor,
  title,
  translate,
  onSelectCategory,
}: ExploreCategoryGridProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <View style={styles.grid}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.button,
                { backgroundColor: isSelected ? accentColor : cardColor, borderColor },
              ]}
              onPress={() => onSelectCategory(category.id)}
            >
              <Text style={styles.emoji}>{category.emoji}</Text>
              <Text style={[styles.label, { color: isSelected ? '#FFFFFF' : textColor }]}>
                {translate(category.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
