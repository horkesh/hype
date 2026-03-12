import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { ExploreControls } from '@/components/explore/ExploreControls';
import { ExploreFilterModal } from '@/components/explore/ExploreFilterModal';
import { ExploreMenuList } from '@/components/explore/ExploreMenuList';
import { ExploreSearchSection } from '@/components/explore/ExploreSearchSection';
import { ExploreVenueList } from '@/components/explore/ExploreVenueList';
import { DailySpecial, ExploreLookupItem, SearchResult, Venue } from '@/utils/exploreScreen';
import { ExploreMenuFilterOption, getPriceLevelDisplay, isVenueOpenNow } from '@/utils/exploreHelpers';

type ExploreTabKey = 'list' | 'menu';

interface ExploreScreenBodyProps {
  accentColor: string;
  activeTab: ExploreTabKey;
  backgroundColor: string;
  borderColor: string;
  cardColor: string;
  categories: ExploreLookupItem[];
  categoriesLabel: string;
  dailyMenuLabel: string;
  dailySpecials: DailySpecial[];
  filterButtonLabel: string;
  filterCategories: string[];
  filterMoods: string[];
  filterOpenNow: boolean;
  filterPriceLevel: number;
  filters: ExploreMenuFilterOption[];
  loading: boolean;
  moods: ExploreLookupItem[];
  noResultsLabel: string;
  onApplyFilters: () => void;
  onChangeSearchQuery: (value: string) => void;
  onCloseFilters: () => void;
  onOpenFilters: () => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  onResultPress: (result: SearchResult) => void;
  onSearchFocus: () => void;
  onSelectCategory: (categoryId: string) => void;
  onSetActiveTab: (tab: ExploreTabKey) => void;
  onSetFilterOpenNow: (value: boolean) => void;
  onSetFilterPriceLevel: (value: number) => void;
  onToggleFilter: (filterId: string) => void;
  onToggleFilterCategory: (categoryId: string) => void;
  onToggleFilterMood: (moodId: string) => void;
  onToggleMood: (moodId: string) => void;
  onVenuePress: (venueId: string) => void;
  openNowLabel: string;
  placeholder: string;
  priceLevelLabel: string;
  refreshColor: string;
  refreshing: boolean;
  resetLabel: string;
  searchLoading: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  selectedCategory: string | null;
  selectedFilter: string | null;
  selectedMoods: string[];
  showFilterModal: boolean;
  showSearchResults: boolean;
  textColor: string;
  textSecondaryColor: string;
  translate: (key: string) => string;
  validUntilLabel: string;
  venues: Venue[];
}

export function ExploreScreenBody({
  accentColor,
  activeTab,
  backgroundColor,
  borderColor,
  cardColor,
  categories,
  categoriesLabel,
  dailyMenuLabel,
  dailySpecials,
  filterButtonLabel,
  filterCategories,
  filterMoods,
  filterOpenNow,
  filterPriceLevel,
  filters,
  loading,
  moods,
  noResultsLabel,
  onApplyFilters,
  onChangeSearchQuery,
  onCloseFilters,
  onOpenFilters,
  onRefresh,
  onResetFilters,
  onResultPress,
  onSearchFocus,
  onSelectCategory,
  onSetActiveTab,
  onSetFilterOpenNow,
  onSetFilterPriceLevel,
  onToggleFilter,
  onToggleFilterCategory,
  onToggleFilterMood,
  onToggleMood,
  onVenuePress,
  openNowLabel,
  placeholder,
  priceLevelLabel,
  refreshColor,
  refreshing,
  resetLabel,
  searchLoading,
  searchQuery,
  searchResults,
  selectedCategory,
  selectedFilter,
  selectedMoods,
  showFilterModal,
  showSearchResults,
  textColor,
  textSecondaryColor,
  translate,
  validUntilLabel,
  venues,
}: ExploreScreenBodyProps) {
  return (
    <>
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={refreshColor}
            colors={[refreshColor]}
          />
        }
      >
        <ExploreSearchSection
          accentColor={accentColor}
          borderColor={borderColor}
          cardColor={cardColor}
          onChangeText={onChangeSearchQuery}
          onFocus={onSearchFocus}
          onResultPress={onResultPress}
          placeholder={placeholder}
          results={searchResults}
          searchLoading={searchLoading}
          showResults={showSearchResults}
          textColor={textColor}
          textSecondaryColor={textSecondaryColor}
          value={searchQuery}
        />

        <ExploreControls
          accentColor={accentColor}
          activeTab={activeTab}
          borderColor={borderColor}
          cardColor={cardColor}
          categories={categories}
          categoriesLabel={categoriesLabel}
          dailyMenuLabel={dailyMenuLabel}
          filterButtonLabel={filterButtonLabel}
          moods={moods}
          onOpenFilters={onOpenFilters}
          onSelectCategory={onSelectCategory}
          onSetActiveTab={onSetActiveTab}
          onToggleMood={onToggleMood}
          selectedCategory={selectedCategory}
          selectedMoods={selectedMoods}
          textColor={textColor}
          translate={translate}
        />

        {activeTab === 'list' ? (
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
        ) : (
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
        )}
      </ScrollView>

      <ExploreFilterModal
        accentColor={accentColor}
        applyFiltersLabel={translate('applyFilters')}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        cardColor={cardColor}
        categories={categories}
        categoriesLabel={categoriesLabel}
        close={onCloseFilters}
        filterCategories={filterCategories}
        filterMoods={filterMoods}
        filterOpenNow={filterOpenNow}
        filterPriceLevel={filterPriceLevel}
        getPriceLevelDisplay={getPriceLevelDisplay}
        moods={moods}
        onApply={onApplyFilters}
        onReset={onResetFilters}
        onSetFilterOpenNow={onSetFilterOpenNow}
        onSetFilterPriceLevel={onSetFilterPriceLevel}
        onToggleFilterCategory={onToggleFilterCategory}
        onToggleFilterMood={onToggleFilterMood}
        openNowLabel={openNowLabel}
        priceLevelLabel={priceLevelLabel}
        resetLabel={resetLabel}
        textColor={textColor}
        title={translate('filters')}
        translate={translate}
        visible={showFilterModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
