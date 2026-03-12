import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TonightVoteResultCard } from '@/components/tonight/TonightVoteResultCard';
import { Event } from '@/utils/tonightScreen';
import { buildTonightVoteResults } from '@/utils/tonightVote';

interface TonightVoteResultsProps {
  cardColor: string;
  colorsText: string;
  events: Event[];
  labels: {
    results: string;
    shareLink: string;
    vote: string;
    voteLink: string;
    voteWord: string;
  };
  onShareVote: () => void;
  onVote: (eventId: string) => void;
  selectedEvents: string[];
  textSecondaryColor: string;
  voteLink: string;
  votes: Record<string, number>;
}

export function TonightVoteResults({
  cardColor,
  colorsText,
  events,
  labels,
  onShareVote,
  onVote,
  selectedEvents,
  textSecondaryColor,
  voteLink,
  votes,
}: TonightVoteResultsProps) {
  const results = buildTonightVoteResults(events, selectedEvents, votes);

  return (
    <>
      <View style={[styles.voteLinkContainer, { backgroundColor: cardColor }]}>
        <Text style={[styles.voteLinkLabel, { color: textSecondaryColor }]}>
          {labels.voteLink}
        </Text>
        <Text style={styles.voteLink}>{voteLink}</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onShareVote}>
        <Text style={styles.primaryButtonText}>{labels.shareLink}</Text>
      </TouchableOpacity>

      <Text style={[styles.voteResultsTitle, { color: colorsText }]}>{labels.results}</Text>

      {results.map((result) => (
        <TonightVoteResultCard
          key={result.eventId}
          cardColor={cardColor}
          colorsText={colorsText}
          labels={{ vote: labels.vote, voteWord: labels.voteWord }}
          onVote={onVote}
          result={result}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
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
  voteLinkContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  voteLinkLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  voteLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A056',
  },
  voteResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
});
