import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TonightVoteResults } from '@/components/tonight/TonightVoteResults';
import { TonightVoteSetup } from '@/components/tonight/TonightVoteSetup';
import { Event } from '@/utils/tonightScreen';

interface TonightVoteModalProps {
  cardColor: string;
  closeLabel: string;
  colorsText: string;
  events: Event[];
  labels: {
    createVote: string;
    results: string;
    selectedCount: string;
    shareLink: string;
    title: string;
    vote: string;
    voteLink: string;
    votePrompt: string;
    voteWord: string;
  };
  onClose: () => void;
  onCreateVote: () => void;
  onShareVote: () => void;
  onVote: (eventId: string) => void;
  renderEventCard: (event: Event) => React.ReactNode;
  selectedEvents: string[];
  textSecondaryColor: string;
  visible: boolean;
  voteLink: string | null;
  votes: Record<string, number>;
}

export function TonightVoteModal({
  cardColor,
  closeLabel,
  colorsText,
  events,
  labels,
  onClose,
  onCreateVote,
  onShareVote,
  onVote,
  renderEventCard,
  selectedEvents,
  textSecondaryColor,
  visible,
  voteLink,
  votes,
}: TonightVoteModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colorsText }]}>{labels.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.modalClose, { color: colorsText }]}>{closeLabel}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {!voteLink ? (
              <TonightVoteSetup
                colorsText={colorsText}
                events={events}
                labels={labels}
                onCreateVote={onCreateVote}
                renderEventCard={renderEventCard}
                selectedEvents={selectedEvents}
                textSecondaryColor={textSecondaryColor}
              />
            ) : (
              <TonightVoteResults
                cardColor={cardColor}
                colorsText={colorsText}
                events={events}
                labels={labels}
                onShareVote={onShareVote}
                onVote={onVote}
                selectedEvents={selectedEvents}
                textSecondaryColor={textSecondaryColor}
                voteLink={voteLink}
                votes={votes}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 28,
    fontWeight: '300',
  },
  modalScroll: {
    padding: 20,
  },
});
