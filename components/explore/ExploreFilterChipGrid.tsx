import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ExploreLookupItem } from '@/utils/exploreScreen';

interface ExploreFilterChipGridProps {
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  items: ExploreLookupItem[];
  selectedIds: string[];
  textColor: string;
  title: string;
  translate: (key: string) => string;
  onToggle: (id: string) => void;
}

export function ExploreFilterChipGrid({
  accentColor,
  backgroundColor,
  borderColor,
  items,
  selectedIds,
  textColor,
  title,
  translate,
  onToggle,
}: ExploreFilterChipGridProps) {
  return (
    <>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? accentColor : backgroundColor,
                  borderColor,
                },
              ]}
              onPress={() => onToggle(item.id)}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.label, { color: isSelected ? '#FFFFFF' : textColor }]}>
                {translate(item.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
