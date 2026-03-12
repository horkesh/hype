import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import debounce from 'lodash.debounce';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HypeHeader } from '@/components/HypeHeader';
import { ExploreControls } from '@/components/explore/ExploreControls';
import { ExploreFilterModal } from '@/components/explore/ExploreFilterModal';
import { ExploreMenuList } from '@/components/explore/ExploreMenuList';
import { ExploreSearchSection } from '@/components/explore/ExploreSearchSection';
import { ExploreVenueList } from '@/components/explore/ExploreVenueList';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { loadExploreDailySpecials, loadExploreVenues, searchExplore } from '@/utils/exploreData';
import {
  DailySpecial,
  EXPLORE_CATEGORIES,
  EXPLORE_MOODS,
  SearchResult,
  Venue,
} from '@/utils/exploreScreen';
import {
  getPriceLevelDisplay,
  isVenueOpenNow,
  toggleSelection,
  toggleSingleSelection,
} from '@/utils/exploreHelpers';

const MENU_PRICE_FILTERS = [
  { id: 'up_to_8', labelKey: 'menuUpTo8' },
  { id: '8_to_12', labelKey: 'menu8to12' },
  { id: '12_plus', labelKey: 'menu12Plus' },
] as const;

export default function ExploreScreen() {
  const { t, language } = useApp();
  const { colors } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'menu'>('list');

  const [venues, setVenues] = useState<Venue[]>([]);
  const [dailySpecials, setDailySpecials] = useState<DailySpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterMoods, setFilterMoods] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterPriceLevel, setFilterPriceLevel] = useState(4);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [menuPriceFilter, setMenuPriceFilter] = useState<string | null>(null);

  const menuFilters = useMemo(
    () =>
      MENU_PRICE_FILTERS.map((filter) => ({
        id: filter.id,
        label: t(filter.labelKey),
      })),
    [t]
  );

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          setSearchResults([]);
          setShowSearchResults(false);
          setSearchLoading(false);
          return;
        }

        setSearchLoading(true);

        try {
          const results = await searchExplore(query, language);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setSearchLoading(false);
        }
      }, 300),
    [language]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);

    return () => debouncedSearch.cancel();
  }, [debouncedSearch, searchQuery]);

  const loadVenues = useCallback(async () => {
    setLoading(true);

    try {
      const nextVenues = await loadExploreVenues({
        filterCategories,
        filterMoods,
        filterOpenNow,
        filterPriceLevel,
        language,
        selectedCategory,
        selectedMoods,
      });
      setVenues(nextVenues);
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
    }
  }, [
    filterCategories,
    filterMoods,
    filterOpenNow,
    filterPriceLevel,
    language,
    selectedCategory,
    selectedMoods,
  ]);

  const loadDailySpecials = useCallback(async () => {
    setLoading(true);

    try {
      const nextDailySpecials = await loadExploreDailySpecials({ language, menuPriceFilter });
      setDailySpecials(nextDailySpecials);
    } catch (error) {
      console.error('Error loading daily specials:', error);
    } finally {
      setLoading(false);
    }
  }, [language, menuPriceFilter]);

  useEffect(() => {
    if (activeTab === 'list') {
      void loadVenues();
      return;
    }

    void loadDailySpecials();
  }, [activeTab, loadDailySpecials, loadVenues]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    if (activeTab === 'list') {
      await loadVenues();
    } else {
      await loadDailySpecials();
    }

    setRefreshing(false);
  }, [activeTab, loadDailySpecials, loadVenues]);

  const handleSearchResultTap = useCallback(
    (result: SearchResult) => {
      setShowSearchResults(false);
      setSearchQuery('');

      if (result.type === 'venue') {
        router.push(`/venue/${result.id}`);
      }
    },
    [router]
  );

  const handleVenueTap = useCallback(
    (venueId: string) => {
      router.push(`/venue/${venueId}`);
    },
    [router]
  );

  const toggleMood = useCallback((moodId: string) => {
    setSelectedMoods((current) => toggleSelection(current, moodId));
  }, []);

  const selectCategory = useCallback((categoryId: string) => {
    setSelectedCategory((current) => toggleSingleSelection(current, categoryId));
  }, []);

  const toggleFilterMood = useCallback((moodId: string) => {
    setFilterMoods((current) => toggleSelection(current, moodId));
  }, []);

  const toggleFilterCategory = useCallback((categoryId: string) => {
    setFilterCategories((current) => toggleSelection(current, categoryId));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterMoods([]);
    setFilterCategories([]);
    setFilterPriceLevel(4);
    setFilterOpenNow(false);
  }, []);

  const applyFilters = useCallback(() => {
    setShowFilterModal(false);
    void loadVenues();
  }, [loadVenues]);

  const toggleMenuPriceFilter = useCallback((filterId: string) => {
    setMenuPriceFilter((current) => (current === filterId ? null : filterId));
  }, []);

  const content = (
    <>
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <ExploreSearchSection
          accentColor={colors.accent}
          borderColor={colors.border}
          cardColor={colors.card}
          onChangeText={setSearchQuery}
          onFocus={() => setShowSearchResults(true)}
          onResultPress={handleSearchResultTap}
          placeholder={t('searchPlaceholder')}
          results={searchResults}
          searchLoading={searchLoading}
          showResults={showSearchResults}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
          value={searchQuery}
        />

        <ExploreControls
          accentColor={colors.accent}
          activeTab={activeTab}
          borderColor={colors.border}
          cardColor={colors.card}
          categories={EXPLORE_CATEGORIES}
          categoriesLabel={t('categories')}
          dailyMenuLabel={t('dailyMenu')}
          filterButtonLabel={t('filters')}
          moods={EXPLORE_MOODS}
          onOpenFilters={() => setShowFilterModal(true)}
          onSelectCategory={selectCategory}
          onSetActiveTab={setActiveTab}
          onToggleMood={toggleMood}
          selectedCategory={selectedCategory}
          selectedMoods={selectedMoods}
          textColor={colors.text}
          translate={t}
        />

        {activeTab === 'list' ? (
          <ExploreVenueList
            accentColor={colors.accent}
            backgroundColor={colors.background}
            cardColor={colors.card}
            getPriceLevelDisplay={getPriceLevelDisplay}
            isVenueOpenNow={isVenueOpenNow}
            loading={loading}
            moods={EXPLORE_MOODS}
            noResultsLabel={t('noResults')}
            onVenuePress={handleVenueTap}
            openNowLabel={t('openNow')}
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
            venues={venues}
          />
        ) : (
          <ExploreMenuList
            accentColor={colors.accent}
            borderColor={colors.border}
            cardColor={colors.card}
            dailySpecials={dailySpecials}
            filters={menuFilters}
            loading={loading}
            noResultsLabel={t('noResults')}
            onToggleFilter={toggleMenuPriceFilter}
            selectedFilter={menuPriceFilter}
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
            validUntilLabel={t('validUntil')}
          />
        )}
      </ScrollView>

      <ExploreFilterModal
        accentColor={colors.accent}
        applyFiltersLabel={t('applyFilters')}
        backgroundColor={colors.background}
        borderColor={colors.border}
        cardColor={colors.card}
        categories={EXPLORE_CATEGORIES}
        categoriesLabel={t('categories')}
        close={() => setShowFilterModal(false)}
        filterCategories={filterCategories}
        filterMoods={filterMoods}
        filterOpenNow={filterOpenNow}
        filterPriceLevel={filterPriceLevel}
        getPriceLevelDisplay={getPriceLevelDisplay}
        moods={EXPLORE_MOODS}
        onApply={applyFilters}
        onReset={resetFilters}
        onSetFilterOpenNow={setFilterOpenNow}
        onSetFilterPriceLevel={setFilterPriceLevel}
        onToggleFilterCategory={toggleFilterCategory}
        onToggleFilterMood={toggleFilterMood}
        openNowLabel={t('openNow')}
        priceLevelLabel={t('priceLevel')}
        resetLabel="Reset"
        textColor={colors.text}
        title={t('filters')}
        translate={t}
        visible={showFilterModal}
      />
    </>
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, styles.iosContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        {content}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <HypeHeader />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iosContainer: {
    paddingTop: 48,
  },
  content: {
    flex: 1,
  },
});
