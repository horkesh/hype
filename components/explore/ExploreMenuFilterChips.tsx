import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExploreMenuFilterChipsProps {
  accentColor: string;
  borderColor: string;
  cardColor: string;
  filters: Array<{ id: string; label: string }>;
  onToggleFilter: (filterId: string) => void;
  selectedFilter: string | null;
  textColor: string;
}

export function ExploreMenuFilterChips({
  accentColor,
  borderColor,
  cardColor,
  filters,
  onToggleFilter,
  selectedFilter,
  textColor,
}: ExploreMenuFilterChipsProps) {
  return (
    <View style={styles.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter.id;

          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.chip,
                { backgroundColor: isSelected ? accentColor : cardColor, borderColor },
              ]}
              onPress={() => onToggleFilter(filter.id)}
            >
              <Text style={[styles.text, { color: isSelected ? '#FFFFFF' : textColor }]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  scroll: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
