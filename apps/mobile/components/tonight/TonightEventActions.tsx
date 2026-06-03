import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TonightEventActionsProps {
  cardColor: string;
  eventId: string;
  isSelected: boolean;
  onOpenTicket: (url: string) => void;
  onToggleSelection: (eventId: string) => void;
  showSelectionControls: boolean;
  ticketButtonText: string;
  ticketUrl: string | null;
}

export function TonightEventActions({
  cardColor,
  eventId,
  isSelected,
  onOpenTicket,
  onToggleSelection,
  showSelectionControls,
  ticketButtonText,
  ticketUrl,
}: TonightEventActionsProps) {
  return (
    <View style={styles.actions}>
      {ticketUrl ? (
        <TouchableOpacity
          style={styles.ticketButton}
          onPress={() => onOpenTicket(ticketUrl)}
          accessibilityRole="link"
          accessibilityLabel={ticketButtonText}
        >
          <Text style={styles.ticketButtonText}>{ticketButtonText}</Text>
        </TouchableOpacity>
      ) : null}

      {showSelectionControls ? (
        <TouchableOpacity
          style={[
            styles.voteSelectButton,
            { backgroundColor: isSelected ? '#8E2DE2' : cardColor },
          ]}
          onPress={() => onToggleSelection(eventId)}
          accessibilityRole="button"
          accessibilityLabel={isSelected ? 'Deselect event' : 'Select event'}
          accessibilityState={{ selected: isSelected }}
        >
          <Text style={[styles.voteSelectButtonText, { color: isSelected ? '#FFFFFF' : '#8E2DE2' }]}>
            {isSelected ? '\u2713' : '+'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketButton: {
    backgroundColor: '#8E2DE2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    alignItems: 'center',
  },
  ticketButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voteSelectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8E2DE2',
  },
  voteSelectButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
