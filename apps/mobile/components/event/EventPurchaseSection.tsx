import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassContainer } from '@/components/glass/GlassContainer';

interface EventPurchaseSectionProps {
  isFree: boolean;
  freeEntryLabel: string;
  priceLabel: string;
  priceDisplay: string;
  ticketButtonText: string;
  showTicketButton: boolean;
  onTicketPress: () => void;
  colors: {
    card: string;
    text: string;
    textSecondary: string;
  };
}

export function EventPurchaseSection({
  isFree,
  freeEntryLabel,
  priceLabel,
  priceDisplay,
  ticketButtonText,
  showTicketButton,
  onTicketPress,
  colors,
}: EventPurchaseSectionProps) {
  if (isFree) {
    return (
      <GlassContainer borderRadius={28} glowColor="#10B981" style={styles.freeEntryBadge}>
        <Text style={styles.freeEntryText}>
          {'\u2705'} {freeEntryLabel}
        </Text>
      </GlassContainer>
    );
  }

  return (
    <>
      <View style={styles.priceSection}>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>{priceLabel}</Text>
        <GlassBadge label={priceDisplay} variant="accent" size="md" />
      </View>

      {showTicketButton ? (
        <TouchableOpacity
          onPress={onTicketPress}
          activeOpacity={0.8}
        >
          <GlassContainer borderRadius={28} glowColor="#8E2DE2" style={styles.ticketButton}>
            <Text style={styles.ticketButtonText}>
              {'\ud83c\udf9f\ufe0f'} {ticketButtonText}
            </Text>
          </GlassContainer>
        </TouchableOpacity>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  priceSection: {
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  freeEntryBadge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  freeEntryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  ticketButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
