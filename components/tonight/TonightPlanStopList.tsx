import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TonightPlannerStopRow } from '@/utils/tonightPlanner';

interface TonightPlanStopListProps {
  cardColor: string;
  colorsText: string;
  rows: TonightPlannerStopRow[];
}

export function TonightPlanStopList({
  cardColor,
  colorsText,
  rows,
}: TonightPlanStopListProps) {
  return (
    <View style={styles.list}>
      {rows.map((row) => (
        <View key={row.id} style={[styles.stop, { backgroundColor: cardColor }]}>
          <Text style={styles.stopTime}>{row.time}</Text>
          <Text style={[styles.stopVenue, { color: colorsText }]}>{row.venueName}</Text>
          <Text style={styles.stopActivity}>{row.activity}</Text>
          <Text style={[styles.stopPrice, { color: colorsText }]}>{row.priceText}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  stop: {
    padding: 16,
    borderRadius: 16,
  },
  stopTime: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#D4A056',
  },
  stopVenue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stopActivity: {
    fontSize: 14,
    marginBottom: 4,
    color: '#6B7280',
  },
  stopPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
});
