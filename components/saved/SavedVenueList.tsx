import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SavedVenueCard } from '@/components/saved/SavedVenueCard';
import { SavedVenueCardModel } from '@/utils/savedContent';

interface SavedVenueListProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  models: SavedVenueCardModel[];
  onPressVenue: (venueId: string) => void;
  onRemoveVenue: (venueId: string) => void;
  textColor: string;
  textSecondaryColor: string;
}

export function SavedVenueList({
  accentColor,
  backgroundColor,
  cardColor,
  models,
  onPressVenue,
  onRemoveVenue,
  textColor,
  textSecondaryColor,
}: SavedVenueListProps) {
  return (
    <ScrollView style={styles.content}>
      <View style={styles.cardsContainer}>
        {models.map((venue) => (
          <SavedVenueCard
            key={venue.id}
            accentColor={accentColor}
            backgroundColor={backgroundColor}
            cardColor={cardColor}
            onDelete={onRemoveVenue}
            onPress={onPressVenue}
            textColor={textColor}
            textSecondaryColor={textSecondaryColor}
            venue={venue}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  cardsContainer: {
    padding: 16,
  },
});
