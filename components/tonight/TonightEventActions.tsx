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
        <TouchableOpacity style={styles.ticketButton} onPress={() => onOpenTicket(ticketUrl)}>
          <Text style={styles.ticketButtonText}>{ticketButtonText}</Text>
        </TouchableOpacity>
      ) : null}

      {showSelectionControls ? (
        <TouchableOpacity
          style={[
            styles.voteSelectButton,
            { backgroundColor: isSelected ? '#D4A056' : cardColor },
          ]}
          onPress={() => onToggleSelection(eventId)}
        >
          <Text style={[styles.voteSelectButtonText, { color: isSelected ? '#FFFFFF' : '#D4A056' }]}>
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
    backgroundColor: '#D4A056',
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
    borderColor: '#D4A056',
  },
  voteSelectButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
