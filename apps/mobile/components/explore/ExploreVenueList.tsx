import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';

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
  const renderItem = useCallback(
    ({ item: venue }: ListRenderItemInfo<Venue>) => (
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
      data={venues}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      scrollEnabled={false}
      style={styles.section}
      ListEmptyComponent={
        <Text style={[styles.noResults, { color: textSecondaryColor }]}>{noResultsLabel}</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  section: {
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
});
