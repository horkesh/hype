import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Event } from '@/utils/tonightScreen';
import { canCreateTonightVote } from '@/utils/tonightVote';

interface TonightVoteSetupProps {
  colorsText: string;
  events: Event[];
  labels: {
    createVote: string;
    selectedCount: string;
    votePrompt: string;
  };
  onCreateVote: () => void;
  renderEventCard: (event: Event) => React.ReactNode;
  selectedEvents: string[];
  textSecondaryColor: string;
}

export function TonightVoteSetup({
  colorsText,
  events,
  labels,
  onCreateVote,
  renderEventCard,
  selectedEvents,
  textSecondaryColor,
}: TonightVoteSetupProps) {
  return (
    <>
      <Text style={[styles.voteInstructions, { color: textSecondaryColor }]}>
        {labels.votePrompt}
      </Text>
      <Text style={[styles.voteCount, { color: colorsText }]}>
        {labels.selectedCount} {selectedEvents.length}/4
      </Text>

      {events.map((event) => renderEventCard(event))}

      {canCreateTonightVote(selectedEvents) ? (
        <TouchableOpacity style={styles.primaryButton} onPress={onCreateVote}>
          <Text style={styles.primaryButtonText}>{labels.createVote}</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  voteInstructions: {
    fontSize: 14,
    marginBottom: 12,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  primaryButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: '#D4A056',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
