import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      <View style={[styles.freeEntryBadge, { backgroundColor: '#10B981' }]}>
        <Text style={styles.freeEntryText}>
          {'\u2705'} {freeEntryLabel}
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.priceSection}>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>{priceLabel}</Text>
        <View style={[styles.priceBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.priceText, { color: colors.text }]}>{priceDisplay}</Text>
        </View>
      </View>

      {showTicketButton ? (
        <TouchableOpacity
          style={[styles.ticketButton, { backgroundColor: '#D4A056' }]}
          onPress={onTicketPress}
        >
          <Text style={styles.ticketButtonText}>
            {'\ud83c\udf9f\ufe0f'} {ticketButtonText}
          </Text>
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
  priceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  freeEntryBadge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
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
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  ticketButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
