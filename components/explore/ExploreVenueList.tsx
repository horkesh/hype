import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ExploreResultsState } from '@/components/explore/ExploreResultsState';
import { ExploreVenueCard } from '@/components/explore/ExploreVenueCard';
import { ExploreLookupItem, Venue } from '@/utils/exploreScreen';

interface ExploreVenueListProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  getPriceLevelDisplay: (level: number) => string;
  isVenueOpenNow: (openingHours: unknown) => boolean;
  loading: boolean;
  moods: ExploreLookupItem[];
  noResultsLabel: string;
  onVenuePress: (venueId: string) => void;
  openNowLabel: string;
  textColor: string;
  textSecondaryColor: string;
  venues: Venue[];
}

export function ExploreVenueList({
  accentColor,
  backgroundColor,
  cardColor,
  getPriceLevelDisplay,
  isVenueOpenNow,
  loading,
  moods,
  noResultsLabel,
  onVenuePress,
  openNowLabel,
  textColor,
  textSecondaryColor,
  venues,
}: ExploreVenueListProps) {
  return (
    <View style={styles.section}>
      <ExploreResultsState
        accentColor={accentColor}
        hasResults={venues.length > 0}
        loading={loading}
        noResultsLabel={noResultsLabel}
        textSecondaryColor={textSecondaryColor}
      >
        {venues.map((venue) => (
          <ExploreVenueCard
            key={venue.id}
            accentColor={accentColor}
            backgroundColor={backgroundColor}
            cardColor={cardColor}
            getPriceLevelDisplay={getPriceLevelDisplay}
            isVenueOpenNow={isVenueOpenNow}
            moods={moods}
            onPress={onVenuePress}
            openNowLabel={openNowLabel}
            textColor={textColor}
            textSecondaryColor={textSecondaryColor}
            venue={venue}
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
