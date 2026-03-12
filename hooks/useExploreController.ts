import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { loadExploreDailySpecials, loadExploreVenues, searchExplore } from '@/utils/exploreData';
import {
  DailySpecial,
  SearchResult,
  Venue,
} from '@/utils/exploreScreen';
import {
  getExploreMenuFilters,
  toggleSelection,
  toggleSingleSelection,
} from '@/utils/exploreHelpers';

type ExploreTabKey = 'list' | 'menu';

interface UseExploreControllerOptions {
  language: string;
  translate: (key: string) => string;
}

export function useExploreController({
  language,
  translate,
}: UseExploreControllerOptions) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ExploreTabKey>('list');

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
    () => getExploreMenuFilters(translate),
    [translate]
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
      const nextDailySpecials = await loadExploreDailySpecials({
        language,
        menuPriceFilter,
      });
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

  return {
    activeTab,
    applyFilters,
    dailySpecials,
    filterCategories,
    filterMoods,
    filterOpenNow,
    filterPriceLevel,
    handleSearchResultTap,
    handleVenueTap,
    loading,
    menuFilters,
    menuPriceFilter,
    onRefresh,
    refreshing,
    resetFilters,
    searchLoading,
    searchQuery,
    searchResults,
    selectCategory,
    selectedCategory,
    selectedMoods,
    setActiveTab,
    setFilterOpenNow,
    setFilterPriceLevel,
    setSearchQuery,
    setShowFilterModal,
    showFilterModal,
    showSearchResults,
    setShowSearchResults,
    toggleFilterCategory,
    toggleFilterMood,
    toggleMenuPriceFilter,
    toggleMood,
    venues,
  };
}
