import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SavedEventCard } from '@/components/saved/SavedEventCard';
import { SavedEventCardModel } from '@/utils/savedContent';

interface SavedEventListProps {
  accentColor: string;
  cardColor: string;
  models: SavedEventCardModel[];
  onPressEvent: (eventId: string) => void;
  onRemoveEvent: (eventId: string) => void;
  textColor: string;
  textSecondaryColor: string;
}

export function SavedEventList({
  accentColor,
  cardColor,
  models,
  onPressEvent,
  onRemoveEvent,
  textColor,
  textSecondaryColor,
}: SavedEventListProps) {
  return (
    <ScrollView style={styles.content}>
      <View style={styles.cardsContainer}>
        {models.map((event) => (
          <SavedEventCard
            key={event.eventId}
            accentColor={accentColor}
            cardColor={cardColor}
            event={event}
            onDelete={onRemoveEvent}
            onPress={onPressEvent}
            textColor={textColor}
            textSecondaryColor={textSecondaryColor}
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
