import React from 'react';

import { ExploreMenuList } from '@/components/explore/ExploreMenuList';
import { ExploreVenueList } from '@/components/explore/ExploreVenueList';
import { ExploreMenuFilterOption, getPriceLevelDisplay, isVenueOpenNow } from '@/utils/exploreHelpers';
import { DailySpecial, ExploreLookupItem, Venue } from '@/utils/exploreScreen';

type ExploreTabKey = 'list' | 'menu';

interface ExploreResultsSectionProps {
  accentColor: string;
  activeTab: ExploreTabKey;
  backgroundColor: string;
  borderColor: string;
  cardColor: string;
  dailySpecials: DailySpecial[];
  filters: ExploreMenuFilterOption[];
  loading: boolean;
  moods: ExploreLookupItem[];
  noResultsLabel: string;
  onToggleFilter: (filterId: string) => void;
  onVenuePress: (venueId: string) => void;
  openNowLabel: string;
  selectedFilter: string | null;
  textColor: string;
  textSecondaryColor: string;
  validUntilLabel: string;
  venues: Venue[];
}

export function ExploreResultsSection({
  accentColor,
  activeTab,
  backgroundColor,
  borderColor,
  cardColor,
  dailySpecials,
  filters,
  loading,
  moods,
  noResultsLabel,
  onToggleFilter,
  onVenuePress,
  openNowLabel,
  selectedFilter,
  textColor,
  textSecondaryColor,
  validUntilLabel,
  venues,
}: ExploreResultsSectionProps) {
  if (activeTab === 'list') {
    return (
      <ExploreVenueList
        accentColor={accentColor}
        backgroundColor={backgroundColor}
        cardColor={cardColor}
        getPriceLevelDisplay={getPriceLevelDisplay}
        isVenueOpenNow={isVenueOpenNow}
        loading={loading}
        moods={moods}
        noResultsLabel={noResultsLabel}
        onVenuePress={onVenuePress}
        openNowLabel={openNowLabel}
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
        venues={venues}
      />
    );
  }

  return (
    <ExploreMenuList
      accentColor={accentColor}
      borderColor={borderColor}
      cardColor={cardColor}
      dailySpecials={dailySpecials}
      filters={filters}
      loading={loading}
      noResultsLabel={noResultsLabel}
      onToggleFilter={onToggleFilter}
      selectedFilter={selectedFilter}
      textColor={textColor}
      textSecondaryColor={textSecondaryColor}
      validUntilLabel={validUntilLabel}
    />
  );
}
