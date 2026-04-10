import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import { smartSearch } from '@/utils/ai/smartSearch';

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

  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiVenueCount, setAiVenueCount] = useState<number | undefined>(undefined);
  const [showTranslation, setShowTranslation] = useState(false);
  const aiAbortRef = useRef(0);

  const menuFilters = useMemo(
    () => getExploreMenuFilters(translate),
    [translate]
  );

  const isNaturalLanguageQuery = useCallback((query: string) => {
    if (query.length <= 10) return false;
    const nlKeywords = ['?', 'where', 'best', 'good', 'najbol', 'gdje', 'recommend', 'suggest', 'find me', 'looking for'];
    const lowerQuery = query.toLowerCase();
    return nlKeywords.some((kw) => lowerQuery.includes(kw));
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          setSearchResults([]);
          setShowSearchResults(false);
          setSearchLoading(false);
          setAiResponse(null);
          setAiLoading(false);
          setAiVenueCount(undefined);
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

        // Trigger AI smart search for natural language queries
        if (isNaturalLanguageQuery(query)) {
          const requestId = ++aiAbortRef.current;
          setAiLoading(true);
          setAiResponse(null);
          try {
            const aiResult = await smartSearch(query, language);
            if (requestId !== aiAbortRef.current) return; // stale
            if (aiResult) {
              if (aiResult.mode === 'conversation' && aiResult.response) {
                setAiResponse(aiResult.response);
                setAiVenueCount(aiResult.matchedVenues?.length);
              } else if (aiResult.mode === 'search' && aiResult.filters) {
                // Apply AI-returned filters
                if (aiResult.filters.category) setSelectedCategory(aiResult.filters.category);
                if (aiResult.filters.mood) setSelectedMoods([aiResult.filters.mood]);
                if (aiResult.filters.priceLevel != null) setFilterPriceLevel(aiResult.filters.priceLevel);
                if (aiResult.filters.isOpen != null) setFilterOpenNow(aiResult.filters.isOpen);
                setAiResponse(null);
              }
            }
          } catch {
            /* AI search failed silently */
          } finally {
            if (requestId === aiAbortRef.current) setAiLoading(false);
          }
        } else {
          setAiResponse(null);
          setAiLoading(false);
          setAiVenueCount(undefined);
        }
      }, 300),
    [language, isNaturalLanguageQuery]
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
    // loadVenues is triggered by the useEffect that watches filter state — no manual call needed
  }, []);

  const toggleMenuPriceFilter = useCallback((filterId: string) => {
    setMenuPriceFilter((current) => (current === filterId ? null : filterId));
  }, []);

  return {
    activeTab,
    aiLoading,
    aiResponse,
    aiVenueCount,
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
    showTranslation,
    setShowTranslation,
    toggleFilterCategory,
    toggleFilterMood,
    toggleMenuPriceFilter,
    toggleMood,
    venues,
  };
}
