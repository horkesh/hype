import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ExploreMenuCard } from '@/components/explore/ExploreMenuCard';
import { ExploreMenuFilterChips } from '@/components/explore/ExploreMenuFilterChips';
import { ExploreResultsState } from '@/components/explore/ExploreResultsState';
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
      <ExploreMenuFilterChips
        accentColor={accentColor}
        borderColor={borderColor}
        cardColor={cardColor}
        filters={filters}
        onToggleFilter={onToggleFilter}
        selectedFilter={selectedFilter}
        textColor={textColor}
      />

      <ExploreResultsState
        accentColor={accentColor}
        hasResults={dailySpecials.length > 0}
        loading={loading}
        noResultsLabel={noResultsLabel}
        textSecondaryColor={textSecondaryColor}
      >
        {dailySpecials.map((special) => (
          <ExploreMenuCard
            key={special.id}
            accentColor={accentColor}
            cardColor={cardColor}
            special={special}
            textColor={textColor}
            textSecondaryColor={textSecondaryColor}
            validUntilLabel={validUntilLabel}
          />
        ))}
      </ExploreResultsState>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
});
