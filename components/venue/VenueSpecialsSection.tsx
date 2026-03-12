import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { VenueDetailSpecial } from '@/utils/venueDetailScreen';

interface VenueSpecialsSectionProps {
  specials: VenueDetailSpecial[];
  colors: {
    card: string;
    text: string;
    textSecondary: string;
    accent: string;
    shadow: string;
  };
  emptyLabel: string;
  validLabel: string;
}

export function VenueSpecialsSection({
  specials,
  colors,
  emptyLabel,
  validLabel,
}: VenueSpecialsSectionProps) {
  if (specials.length === 0) {
    return <Text style={[styles.noResults, { color: colors.textSecondary }]}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.specialsTab}>
      {specials.map((special) => (
        <View
          key={special.id}
          style={[
            styles.specialCard,
            {
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.specialHeader}>
            <Text style={[styles.specialTitle, { color: colors.text }]}>
              {special.menu_title}
            </Text>
            <Text style={[styles.specialPrice, { color: colors.accent }]}>
              {special.price} KM
            </Text>
          </View>
          {special.description ? (
            <Text style={[styles.specialDescription, { color: colors.textSecondary }]}>
              {special.description}
            </Text>
          ) : null}
          <Text style={[styles.specialValidTimes, { color: colors.textSecondary }]}>
            {validLabel}: {special.valid_times}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  specialsTab: {
    gap: 12,
  },
  noResults: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  specialCard: {
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  specialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  specialTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  specialDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  specialValidTimes: {
    fontSize: 12,
  },
});
