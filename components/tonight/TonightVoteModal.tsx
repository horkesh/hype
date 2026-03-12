import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
              <>
                <Text style={[styles.voteInstructions, { color: textSecondaryColor }]}>
                  {labels.votePrompt}
                </Text>
                <Text style={[styles.voteCount, { color: colorsText }]}>
                  {labels.selectedCount} {selectedEvents.length}/4
                </Text>

                {events.map((event) => renderEventCard(event))}

                {selectedEvents.length >= 2 ? (
                  <TouchableOpacity style={styles.primaryButton} onPress={onCreateVote}>
                    <Text style={styles.primaryButtonText}>{labels.createVote}</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
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

                {selectedEvents.map((eventId) => {
                  const event = events.find((entry) => entry.id === eventId);

                  if (!event) {
                    return null;
                  }

                  const title = event.title_bs;
                  const voteCount = votes[eventId] || 0;

                  return (
                    <View key={eventId} style={[styles.voteResultCard, { backgroundColor: cardColor }]}>
                      <View style={styles.voteResultInfo}>
                        <Text style={[styles.voteResultTitle, { color: colorsText }]} numberOfLines={2}>
                          {title}
                        </Text>
                        <Text style={styles.voteResultCount}>
                          {voteCount} {labels.voteWord}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.voteButton} onPress={() => onVote(eventId)}>
                        <Text style={styles.voteButtonText}>{labels.vote}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
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
    marginBottom: 16,
  },
  voteResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  voteResultInfo: {
    flex: 1,
    marginRight: 12,
  },
  voteResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  voteResultCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D4A056',
  },
  voteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#D4A056',
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
