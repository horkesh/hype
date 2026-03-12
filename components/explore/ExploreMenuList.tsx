import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DailySpecial } from '@/utils/exploreScreen';

interface ExploreMenuListProps {
  accentColor: string;
  borderColor: string;
  cardColor: string;
  dailySpecials: DailySpecial[];
  filters: Array<{ id: string; label: string }>;
  loading: boolean;
  noResultsLabel: string;
  onToggleFilter: (filterId: string) => void;
  selectedFilter: string | null;
  textColor: string;
  textSecondaryColor: string;
  validUntilLabel: string;
}

export function ExploreMenuList({
  accentColor,
  borderColor,
  cardColor,
  dailySpecials,
  filters,
  loading,
  noResultsLabel,
  onToggleFilter,
  selectedFilter,
  textColor,
  textSecondaryColor,
  validUntilLabel,
}: ExploreMenuListProps) {
  return (
    <View style={styles.section}>
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter.id;

            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: isSelected ? accentColor : cardColor, borderColor },
                ]}
                onPress={() => onToggleFilter(filter.id)}
              >
                <Text style={[styles.filterText, { color: isSelected ? '#FFFFFF' : textColor }]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={accentColor} style={styles.loader} />
      ) : dailySpecials.length === 0 ? (
        <Text style={[styles.noResults, { color: textSecondaryColor }]}>{noResultsLabel}</Text>
      ) : (
        dailySpecials.map((special) => (
          <View key={special.id} style={[styles.menuCard, { backgroundColor: cardColor }]}>
            <View style={styles.menuCardHeader}>
              <Text style={[styles.menuVenueName, { color: textSecondaryColor }]}>
                {special.venue_name}
              </Text>
              <Text style={[styles.menuPrice, { color: accentColor }]}>{special.price} KM</Text>
            </View>
            <Text style={[styles.menuTitle, { color: textColor }]}>{special.menu_title}</Text>
            <Text style={[styles.menuValidTimes, { color: textSecondaryColor }]}>
              {validUntilLabel}: {special.valid_times}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  menuCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuVenueName: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuValidTimes: {
    fontSize: 14,
  },
});
