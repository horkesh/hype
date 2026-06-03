import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TonightVoteResult } from '@/utils/tonightVote';

interface TonightVoteResultCardProps {
  cardColor: string;
  colorsText: string;
  labels: {
    vote: string;
    voteWord: string;
  };
  onVote: (eventId: string) => void;
  result: TonightVoteResult;
}

export function TonightVoteResultCard({
  cardColor,
  colorsText,
  labels,
  onVote,
  result,
}: TonightVoteResultCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colorsText }]} numberOfLines={2}>
          {result.title}
        </Text>
        <Text style={styles.count}>
          {result.voteCount} {labels.voteWord}
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => onVote(result.eventId)}>
        <Text style={styles.buttonText}>{labels.vote}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'DMSans_500Medium',
    color: '#8E2DE2',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#8E2DE2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
});
