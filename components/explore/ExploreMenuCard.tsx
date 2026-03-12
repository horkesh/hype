import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DailySpecial } from '@/utils/exploreScreen';
import { getDailySpecialPriceLabel } from '@/utils/exploreLists';

interface ExploreMenuCardProps {
  accentColor: string;
  cardColor: string;
  special: DailySpecial;
  textColor: string;
  textSecondaryColor: string;
  validUntilLabel: string;
}

export function ExploreMenuCard({
  accentColor,
  cardColor,
  special,
  textColor,
  textSecondaryColor,
  validUntilLabel,
}: ExploreMenuCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <View style={styles.header}>
        <Text style={[styles.venueName, { color: textSecondaryColor }]}>
          {special.venue_name}
        </Text>
        <Text style={[styles.price, { color: accentColor }]}>{getDailySpecialPriceLabel(special)}</Text>
      </View>
      <Text style={[styles.title, { color: textColor }]}>{special.menu_title}</Text>
      <Text style={[styles.validTimes, { color: textSecondaryColor }]}>
        {validUntilLabel}: {special.valid_times}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueName: {
    fontSize: 14,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  validTimes: {
    fontSize: 14,
  },
});
