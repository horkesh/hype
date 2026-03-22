import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassBadge } from '@/components/glass/GlassBadge';
import { useEventCountdown } from '@/hooks/useEventCountdown';

interface TonightEventBadgesProps {
  language: string;
  priceText: string;
  startDatetime: string;
  textColor: string;
  urgencyBadge: { label: string; color: string } | null;
}

export function TonightEventBadges({
  language,
  priceText,
  startDatetime,
  textColor,
  urgencyBadge,
}: TonightEventBadgesProps) {
  const countdown = useEventCountdown(startDatetime, language);

  return (
    <View style={styles.row}>
      {countdown.label ? (
        <GlassBadge
          label={countdown.label}
          variant={countdown.isHappeningNow ? 'danger' : 'accent'}
          size="sm"
        />
      ) : null}
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
    backgroundColor: '#121212',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
});
