import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { getCategoryLabel } from '@/utils/categoryLabels';

/** Categories shown in the Home grid — matches CATEGORIES array below */
export type HomeCategoryId =
  | 'restaurant'
  | 'bar'
  | 'cafe'
  | 'club'
  | 'theatre'
  | 'museum'
  | 'gallery'
  | 'landmark';

interface CategoryDef {
  id: HomeCategoryId;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const CATEGORIES: CategoryDef[] = [
  { id: 'restaurant', icon: 'silverware-fork-knife' },
  { id: 'bar', icon: 'glass-cocktail' },
  { id: 'cafe', icon: 'coffee' },
  { id: 'club', icon: 'music-circle' },
  { id: 'theatre', icon: 'drama-masks' },
  { id: 'museum', icon: 'bank' },
  { id: 'gallery', icon: 'palette' },
  { id: 'landmark', icon: 'map-marker-star' },
];

interface HomeCategoryGridProps {
  language: 'bs' | 'en';
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function HomeCategoryGrid({
  language,
  selectedCategory,
  onSelectCategory,
}: HomeCategoryGridProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.cell,
                {
                  backgroundColor: isSelected
                    ? 'rgba(212, 160, 86, 0.15)'
                    : 'rgba(255, 255, 255, 0.06)',
                  borderColor: isSelected
                    ? colors.accent
                    : 'rgba(255, 255, 255, 0.10)',
                },
              ]}
              activeOpacity={0.7}
              onPress={() =>
                onSelectCategory(isSelected ? null : cat.id)
              }
              accessibilityRole="button"
              accessibilityLabel={getCategoryLabel(cat.id, language)}
              accessibilityState={{ selected: isSelected }}
            >
              <MaterialCommunityIcons
                name={cat.icon}
                size={26}
                color={isSelected ? colors.accent : 'rgba(255, 255, 255, 0.7)'}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected ? colors.accent : colors.text,
                    fontFamily: isSelected
                      ? 'DMSans_700Bold'
                      : 'DMSans_500Medium',
                  },
                ]}
                numberOfLines={1}
              >
                {getCategoryLabel(cat.id, language)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  cell: {
    width: '23%',
    height: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
});
