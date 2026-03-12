import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TonightEventBadgesProps {
  priceText: string;
  textColor: string;
  urgencyBadge: { label: string; color: string } | null;
}

export function TonightEventBadges({
  priceText,
  textColor,
  urgencyBadge,
}: TonightEventBadgesProps) {
  return (
    <View style={styles.row}>
      {urgencyBadge ? (
        <View style={[styles.badge, { backgroundColor: urgencyBadge.color }]}>
          <Text style={styles.badgeText}>{urgencyBadge.label}</Text>
        </View>
      ) : null}
      <View style={[styles.badge, styles.priceBadge]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{priceText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceBadge: {
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
