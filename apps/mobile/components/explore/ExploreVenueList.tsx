import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';

import { ExploreVenueCard } from '@/components/explore/ExploreVenueCard';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';
import { ExploreLookupItem, Venue } from '@/utils/exploreScreen';

const MAX_CONTENT_WIDTH = 1680;

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

const keyExtractor = (item: Venue) => item.id;

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
  const { columns, gap, contentWidth } = useResponsiveColumns({
    minCardWidth: 300,
    maxColumns: 5,
    maxContentWidth: MAX_CONTENT_WIDTH,
    gap: 16,
    horizontalPadding: 32,
  });
  const isGrid = columns > 1;
  const cardWidth = (contentWidth - gap * (columns - 1)) / columns;

  const renderItem = useCallback(
    ({ item: venue }: ListRenderItemInfo<Venue>) => (
      <View style={isGrid ? { width: cardWidth } : styles.fullWidth}>
        <ExploreVenueCard
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
      </View>
    ),
    [
      accentColor,
      backgroundColor,
      cardColor,
      getPriceLevelDisplay,
      isVenueOpenNow,
      moods,
      onVenuePress,
      openNowLabel,
      textColor,
      textSecondaryColor,
      isGrid,
      cardWidth,
    ],
  );

  if (loading) {
    return (
      <View style={styles.section}>
        <ActivityIndicator size="large" color={accentColor} style={styles.loader} />
      </View>
    );
  }

  return (
    <FlatList
      key={`venues-${columns}`}
      data={venues}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={columns}
      scrollEnabled={false}
      style={styles.section}
      columnWrapperStyle={isGrid ? { gap } : undefined}
      ListEmptyComponent={
        <Text style={[styles.noResults, { color: textSecondaryColor }]}>{noResultsLabel}</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  loader: {
    marginTop: 40,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});
