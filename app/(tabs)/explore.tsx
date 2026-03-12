
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  RefreshControl,
} from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { HypeHeader } from '@/components/HypeHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/integrations/supabase/client';
import { IconSymbol } from '@/components/IconSymbol';
import { normalizeDailySpecialRows, normalizeVenueRows } from '@/utils/errorLogger';
import { DailySpecial, EXPLORE_CATEGORIES, EXPLORE_MOODS, SearchResult, Venue } from '@/utils/exploreScreen';
import { filterDailySpecialsByPrice, filterVenuesByClientRules, getPriceLevelDisplay, isVenueOpenNow, toggleSelection, toggleSingleSelection } from '@/utils/exploreHelpers';
import { resolveImageSource } from '@/utils/imageSource';
import debounce from 'lodash.debounce';
import Slider from '@react-native-community/slider';
import { Stack, useRouter } from 'expo-router';


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

  const debouncedSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (q.length < 2) {
          setSearchResults([]);
          setShowSearchResults(false);
          setSearchLoading(false);
          return;
        }

        setSearchLoading(true);
        console.log('Searching for:', q);

        try {
          const results: SearchResult[] = [];

          const { data: venueData, error: venueError } = await supabase
            .from('venues')
            .select('id, name')
            .ilike('name', `%${q}%`)
            .limit(5);

          if (venueError) {
            console.error('Error searching venues:', venueError);
          } else if (venueData) {
            venueData.forEach((venue) => {
              results.push({ id: venue.id, name: venue.name, type: 'venue' });
            });
          }

          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('id, title_bs, title_en')
            .or(`title_bs.ilike.%${q}%,title_en.ilike.%${q}%`)
            .limit(5);

          if (eventError) {
            console.error('Error searching events:', eventError);
          } else if (eventData) {
            eventData.forEach((event) => {
              const title = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
              results.push({ id: event.id, name: title, type: 'event' });
            });
          }

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
  }, [searchQuery, debouncedSearch]);

  // Load venues
  const loadVenues = useCallback(async () => {
    setLoading(true);
    console.log('Loading venues with filters:', { selectedMoods, selectedCategory, filterMoods, filterCategories, filterPriceLevel, filterOpenNow });

    try {
      let query = supabase.from('venues').select('*');

      // Apply mood filters
      const activeMoods = filterMoods.length > 0 ? filterMoods : selectedMoods;
      if (activeMoods.length > 0) {
        query = query.contains('moods', activeMoods);
      }

      // Apply category filters
      const activeCategories = filterCategories.length > 0 ? filterCategories : (selectedCategory ? [selectedCategory] : []);
      if (activeCategories.length > 0) {
        query = query.in('category', activeCategories);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading venues:', error);
      } else {
        let filteredData = normalizeVenueRows(data, language);

        setVenues(filterVenuesByClientRules(filteredData, filterPriceLevel, filterOpenNow));
      }
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMoods, selectedCategory, filterMoods, filterCategories, filterPriceLevel, filterOpenNow, language]);

  // Load daily specials
  const loadDailySpecials = useCallback(async () => {
    setLoading(true);
    console.log('Loading daily specials with price filter:', menuPriceFilter);

    try {
      let query = supabase
        .from('daily_specials')
        .select('*')
        .eq('is_active', true);

      const { data, error } = await query;

      if (error) {
        console.error('Error loading daily specials:', error);
      } else {
        let filteredData = normalizeDailySpecialRows(data, language);

        const missingVenueIds = Array.from(
          new Set(
            filteredData
              .filter((special) => !special.venue_name && special.venue_id)
              .map((special) => special.venue_id as string)
          )
        );

        if (missingVenueIds.length > 0) {
          const { data: venueData, error: venueError } = await supabase
            .from('venues')
            .select('id, name')
            .in('id', missingVenueIds);

          if (venueError) {
            console.error('Error loading venue names for daily specials:', venueError);
          } else {
            const venueNames = new Map((venueData || []).map((venue) => [venue.id, venue.name]));
            filteredData = filteredData.map((special) => ({
              ...special,
              venue_name: special.venue_name || (special.venue_id ? venueNames.get(special.venue_id) || '' : ''),
            }));
          }
        }

        filteredData = [...filteredData].sort((a, b) => a.price - b.price);
        setDailySpecials(filterDailySpecialsByPrice(filteredData, menuPriceFilter));
      }
    } catch (error) {
      console.error('Error loading daily specials:', error);
    } finally {
      setLoading(false);
    }
  }, [menuPriceFilter, language]);

  useEffect(() => {
    if (activeTab === 'list') {
      loadVenues();
    } else {
      loadDailySpecials();
    }
  }, [activeTab, loadVenues, loadDailySpecials]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'list') {
      await loadVenues();
    } else {
      await loadDailySpecials();
    }
    setRefreshing(false);
  }, [activeTab, loadVenues, loadDailySpecials]);

  // Check if venue is open now
  const toggleMood = (moodId: string) => {
    console.log('Toggling mood:', moodId);
    setSelectedMoods((prev) => toggleSelection(prev, moodId));
  };

  const selectCategory = (categoryId: string) => {
    console.log('Selecting category:', categoryId);
    setSelectedCategory((prev) => toggleSingleSelection(prev, categoryId));
  };

  const toggleFilterMood = (moodId: string) => {
    setFilterMoods((prev) => toggleSelection(prev, moodId));
  };

  const toggleFilterCategory = (categoryId: string) => {
    setFilterCategories((prev) => toggleSelection(prev, categoryId));
  };

  const applyFilters = () => {
    console.log('Applying filters');
    setShowFilterModal(false);
    loadVenues();
  };

  const resetFilters = () => {
    console.log('Resetting filters');
    setFilterMoods([]);
    setFilterCategories([]);
    setFilterPriceLevel(4);
    setFilterOpenNow(false);
  };

  const handleVenueTap = (venueId: string) => {
    console.log('Venue tapped:', venueId);
    router.push(`/venue/${venueId}`);
  };

  const handleSearchResultTap = (result: SearchResult) => {
    console.log('Search result tapped:', result);
    setShowSearchResults(false);
    setSearchQuery('');
    
    if (result.type === 'venue') {
      router.push(`/venue/${result.id}`);
    }
  };

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
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setShowSearchResults(true)}
            />
            {searchLoading && <ActivityIndicator size="small" color={colors.accent} />}
          </View>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={[styles.searchResults, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSearchResultTap(result)}
                >
                  <Text style={[styles.searchResultText, { color: colors.text }]}>{result.name}</Text>
                  <Text style={[styles.searchResultType, { color: colors.textSecondary }]}>
                    {result.type === 'venue' ? '📍' : '🎉'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Mood Filter Chips */}
        <View style={styles.moodSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
            {EXPLORE_MOODS.map((mood) => {
              const isSelected = selectedMoods.includes(mood.id);
              return (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodChip,
                    { backgroundColor: isSelected ? colors.accent : colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => toggleMood(mood.id)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                    {t(mood.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Category Grid */}
        <View style={styles.categorySection}>
          <View style={styles.categoryGrid}>
            {EXPLORE_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: isSelected ? colors.accent : colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => selectCategory(category.id)}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={[styles.categoryLabel, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                    {t(category.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSection}>
          <View style={[styles.tabSwitcher, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'list' && { backgroundColor: colors.accent }]}
              onPress={() => setActiveTab('list')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'list' ? '#FFFFFF' : colors.text }]}>
                {t('list')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'menu' && { backgroundColor: colors.accent }]}
              onPress={() => setActiveTab('menu')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'menu' ? '#FFFFFF' : colors.text }]}>
                🍽️ {t('dailyMenu')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.accent }]}
            onPress={() => setShowFilterModal(true)}
          >
            <IconSymbol
              ios_icon_name="slider.horizontal.3"
              android_material_icon_name="tune"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.filterButtonText}>{t('filters')}</Text>
          </TouchableOpacity>
        </View>

        {/* List View */}
        {activeTab === 'list' && (
          <View style={styles.listSection}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
            ) : venues.length === 0 ? (
              <Text style={[styles.noResults, { color: colors.textSecondary }]}>{t('noResults')}</Text>
            ) : (
              venues.map((venue) => {
                const isOpen = isOpenNow(venue.opening_hours);
                return (
                  <TouchableOpacity
                    key={venue.id}
                    style={[styles.venueCard, { backgroundColor: colors.card }]}
                    onPress={() => handleVenueTap(venue.id)}
                  >
                    {venue.cover_image_url && (
                      <Image
                        source={resolveImageSource(venue.cover_image_url)}
                        style={styles.venueImage}
                      />
                    )}
                    <View style={styles.venueInfo}>
                      <Text style={[styles.venueName, { color: colors.text }]}>{venue.name}</Text>
                      <View style={styles.venueDetails}>
                        <View style={[styles.categoryPill, { backgroundColor: colors.accent }]}>
                          <Text style={styles.categoryPillText}>{venue.category}</Text>
                        </View>
                        {venue.neighborhood && (
                          <Text style={[styles.venueNeighborhood, { color: colors.textSecondary }]}>
                            {venue.neighborhood}
                          </Text>
                        )}
                      </View>
                      <View style={styles.venueFooter}>
                        <Text style={[styles.priceLevel, { color: colors.accent }]}>
                          {getPriceLevelDisplay(venue.price_level)}
                        </Text>
                        {isOpen && (
                          <View style={[styles.openBadge, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.openBadgeText}>{t('openNow')}</Text>
                          </View>
                        )}
                      </View>
                      {venue.moods && venue.moods.length > 0 && (
                        <View style={styles.moodBadges}>
                          {venue.moods.slice(0, 3).map((mood, index) => {
                            const moodData = EXPLORE_MOODS.find((m) => m.id === mood);
                            return moodData ? (
                              <View key={index} style={[styles.moodBadge, { backgroundColor: colors.background }]}>
                                <Text style={styles.moodBadgeEmoji}>{moodData.emoji}</Text>
                              </View>
                            ) : null;
                          })}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Daily Menu View */}
        {activeTab === 'menu' && (
          <View style={styles.menuSection}>
            {/* Price Filter Chips */}
            <View style={styles.menuFilterSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuFilterScroll}>
                <TouchableOpacity
                  style={[
                    styles.menuFilterChip,
                    { backgroundColor: menuPriceFilter === 'up_to_8' ? colors.accent : colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => setMenuPriceFilter(menuPriceFilter === 'up_to_8' ? null : 'up_to_8')}
                >
                  <Text style={[styles.menuFilterText, { color: menuPriceFilter === 'up_to_8' ? '#FFFFFF' : colors.text }]}>
                    {t('menuUpTo8')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.menuFilterChip,
                    { backgroundColor: menuPriceFilter === '8_to_12' ? colors.accent : colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => setMenuPriceFilter(menuPriceFilter === '8_to_12' ? null : '8_to_12')}
                >
                  <Text style={[styles.menuFilterText, { color: menuPriceFilter === '8_to_12' ? '#FFFFFF' : colors.text }]}>
                    {t('menu8to12')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.menuFilterChip,
                    { backgroundColor: menuPriceFilter === '12_plus' ? colors.accent : colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => setMenuPriceFilter(menuPriceFilter === '12_plus' ? null : '12_plus')}
                >
                  <Text style={[styles.menuFilterText, { color: menuPriceFilter === '12_plus' ? '#FFFFFF' : colors.text }]}>
                    {t('menu12Plus')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
            ) : dailySpecials.length === 0 ? (
              <Text style={[styles.noResults, { color: colors.textSecondary }]}>{t('noResults')}</Text>
            ) : (
              dailySpecials.map((special) => (
                <View key={special.id} style={[styles.menuCard, { backgroundColor: colors.card }]}>
                  <View style={styles.menuCardHeader}>
                    <Text style={[styles.menuVenueName, { color: colors.textSecondary }]}>{special.venue_name}</Text>
                    <Text style={[styles.menuPrice, { color: colors.accent }]}>{special.price} KM</Text>
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>{special.menu_title}</Text>
                  <Text style={[styles.menuValidTimes, { color: colors.textSecondary }]}>
                    {t('validUntil')}: {special.valid_times}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('filters')}</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Mood Multi-Select */}
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Moods</Text>
              <View style={styles.filterMoodGrid}>
                {EXPLORE_MOODS.map((mood) => {
                  const isSelected = filterMoods.includes(mood.id);
                  return (
                    <TouchableOpacity
                      key={mood.id}
                      style={[
                        styles.filterMoodChip,
                        { backgroundColor: isSelected ? colors.accent : colors.background, borderColor: colors.border },
                      ]}
                      onPress={() => toggleFilterMood(mood.id)}
                    >
                      <Text style={styles.filterMoodEmoji}>{mood.emoji}</Text>
                      <Text style={[styles.filterMoodLabel, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {t(mood.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Category Multi-Select */}
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>{t('categories')}</Text>
              <View style={styles.filterCategoryGrid}>
                {EXPLORE_CATEGORIES.map((category) => {
                  const isSelected = filterCategories.includes(category.id);
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.filterCategoryChip,
                        { backgroundColor: isSelected ? colors.accent : colors.background, borderColor: colors.border },
                      ]}
                      onPress={() => toggleFilterCategory(category.id)}
                    >
                      <Text style={styles.filterCategoryEmoji}>{category.emoji}</Text>
                      <Text style={[styles.filterCategoryLabel, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {t(category.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Price Level Slider */}
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>{t('priceLevel')}</Text>
              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderValue, { color: colors.accent }]}>
                  {getPriceLevelDisplay(filterPriceLevel)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={4}
                  step={1}
                  value={filterPriceLevel}
                  onValueChange={setFilterPriceLevel}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.accent}
                />
              </View>

              {/* Open Now Toggle */}
              <TouchableOpacity
                style={[styles.toggleRow, { borderColor: colors.border }]}
                onPress={() => setFilterOpenNow(!filterOpenNow)}
              >
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('openNow')}</Text>
                <View style={[styles.toggle, { backgroundColor: filterOpenNow ? colors.accent : colors.border }]}>
                  <View style={[styles.toggleThumb, filterOpenNow && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: colors.border }]}
                onPress={resetFilters}
              >
                <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.accent }]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>{t('applyFilters')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchSection: {
    padding: 16,
    position: 'relative',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchResults: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchResultText: {
    fontSize: 16,
    flex: 1,
  },
  searchResultType: {
    fontSize: 18,
  },
  moodSection: {
    paddingVertical: 8,
  },
  moodScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  categorySection: {
    padding: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  tabSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  tabSwitcher: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listSection: {
    padding: 16,
  },
  loader: {
    marginTop: 40,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  venueCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueImage: {
    width: '100%',
    height: 180,
  },
  venueInfo: {
    padding: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  venueNeighborhood: {
    fontSize: 14,
  },
  venueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  priceLevel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  openBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  moodBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  moodBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBadgeEmoji: {
    fontSize: 16,
  },
  menuSection: {
    padding: 16,
  },
  menuFilterSection: {
    marginBottom: 16,
  },
  menuFilterScroll: {
    gap: 8,
  },
  menuFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  menuFilterText: {
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  filterMoodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterMoodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  filterMoodEmoji: {
    fontSize: 14,
  },
  filterMoodLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  filterCategoryEmoji: {
    fontSize: 14,
  },
  filterCategoryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sliderContainer: {
    marginVertical: 8,
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    marginTop: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
