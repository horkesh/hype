import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HypeHeader } from '@/components/HypeHeader';
import { ExploreScreenBody } from '@/components/explore/ExploreScreenBody';
import { useApp } from '@/contexts/AppContext';
import { useExploreController } from '@/hooks/useExploreController';
import { useTheme } from '@/hooks/useTheme';
import { EXPLORE_CATEGORIES, EXPLORE_MOODS } from '@/utils/exploreScreen';

export default function ExploreScreen() {
  const { t, language } = useApp();
  const { colors } = useTheme();
  const controller = useExploreController({ language, translate: t });

  const content = (
    <ExploreScreenBody
      accentColor={colors.accent}
      activeTab={controller.activeTab}
      backgroundColor={colors.background}
      borderColor={colors.border}
      cardColor={colors.card}
      categories={EXPLORE_CATEGORIES}
      categoriesLabel={t('categories')}
      dailyMenuLabel={t('dailyMenu')}
      dailySpecials={controller.dailySpecials}
      filterButtonLabel={t('filters')}
      filterCategories={controller.filterCategories}
      filterMoods={controller.filterMoods}
      filterOpenNow={controller.filterOpenNow}
      filterPriceLevel={controller.filterPriceLevel}
      filters={controller.menuFilters}
      loading={controller.loading}
      moods={EXPLORE_MOODS}
      noResultsLabel={t('noResults')}
      onApplyFilters={controller.applyFilters}
      onChangeSearchQuery={controller.setSearchQuery}
      onCloseFilters={() => controller.setShowFilterModal(false)}
      onOpenFilters={() => controller.setShowFilterModal(true)}
      onRefresh={controller.onRefresh}
      onResetFilters={controller.resetFilters}
      onResultPress={controller.handleSearchResultTap}
      onSearchFocus={() => controller.setShowSearchResults(true)}
      onSelectCategory={controller.selectCategory}
      onSetActiveTab={controller.setActiveTab}
      onSetFilterOpenNow={controller.setFilterOpenNow}
      onSetFilterPriceLevel={controller.setFilterPriceLevel}
      onToggleFilter={controller.toggleMenuPriceFilter}
      onToggleFilterCategory={controller.toggleFilterCategory}
      onToggleFilterMood={controller.toggleFilterMood}
      onToggleMood={controller.toggleMood}
      onVenuePress={controller.handleVenueTap}
      openNowLabel={t('openNow')}
      placeholder={t('searchPlaceholder')}
      priceLevelLabel={t('priceLevel')}
      refreshColor={colors.accent}
      refreshing={controller.refreshing}
      resetLabel={t('reset')}
      searchLoading={controller.searchLoading}
      searchQuery={controller.searchQuery}
      searchResults={controller.searchResults}
      selectedCategory={controller.selectedCategory}
      selectedFilter={controller.menuPriceFilter}
      selectedMoods={controller.selectedMoods}
      showFilterModal={controller.showFilterModal}
      showSearchResults={controller.showSearchResults}
      textColor={colors.text}
      textSecondaryColor={colors.textSecondary}
      translate={t}
      validUntilLabel={t('validUntil')}
      venues={controller.venues}
    />
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
});
