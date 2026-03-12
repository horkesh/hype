import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { TonightEventCard } from '@/components/tonight/TonightEventCard';
import { TonightPlannerModal } from '@/components/tonight/TonightPlannerModal';
import { TonightVoteModal } from '@/components/tonight/TonightVoteModal';
import { AIPlan, Event, MoodId, TimeSegment, TimeSegmentConfig } from '@/utils/tonightScreen';

interface TonightScreenContentProps {
  activePlan: AIPlan | null;
  activeSegment: TimeSegment;
  budget: number;
  cardColor: string;
  colorsText: string;
  emptyStateMessage: string;
  eventMetaSeparator: string;
  events: Event[];
  generatingPlan: boolean;
  groupSize: number;
  isBosnian: boolean;
  loading: boolean;
  onClosePlanner: () => void;
  onCloseVote: () => void;
  onCreateVote: () => void;
  onEventPress: (eventId: string) => void;
  onGeneratePlan: () => void;
  onNextPlan: () => void;
  onOpenPlanner: () => void;
  onOpenTicket: (url: string) => void;
  onOpenVote: () => void;
  onRefresh: () => void;
  onSavePlan: () => void;
  onSelectGroupSize: (value: number) => void;
  onSelectMood: (value: MoodId) => void;
  onSelectSegment: (segment: TimeSegment) => void;
  onSetBudget: (value: number) => void;
  onSharePlan: () => void;
  onShareVote: () => void;
  onToggleSelection: (eventId: string) => void;
  onVote: (eventId: string) => void;
  plannerButtonText: string;
  plannerLabels: {
    budget: string;
    close: string;
    generate: string;
    group: string;
    mood: string;
    nextPlan: string;
    save: string;
    share: string;
    title: string;
    total: string;
  };
  refreshing: boolean;
  renderEventProps: (event: Event) => {
    eventTime: string;
    eventTitle: string;
    isSelected: boolean;
    priceText: string;
    ticketButtonText: string;
    urgencyBadge: { label: string; color: string } | null;
    venueName: string;
  };
  secondaryButtonText: string;
  selectedEvents: string[];
  selectedMood: MoodId | null;
  segments: TimeSegmentConfig[];
  showPlannerModal: boolean;
  showVoteModal: boolean;
  textSecondaryColor: string;
  voteLabels: {
    close: string;
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
  voteLink: string | null;
  votes: Record<string, number>;
}

export function TonightScreenContent({
  activePlan,
  activeSegment,
  budget,
  cardColor,
  colorsText,
  emptyStateMessage,
  eventMetaSeparator,
  events,
  generatingPlan,
  groupSize,
  isBosnian,
  loading,
  onClosePlanner,
  onCloseVote,
  onCreateVote,
  onEventPress,
  onGeneratePlan,
  onNextPlan,
  onOpenPlanner,
  onOpenTicket,
  onOpenVote,
  onRefresh,
  onSavePlan,
  onSelectGroupSize,
  onSelectMood,
  onSelectSegment,
  onSetBudget,
  onSharePlan,
  onShareVote,
  onToggleSelection,
  onVote,
  plannerButtonText,
  plannerLabels,
  refreshing,
  renderEventProps,
  secondaryButtonText,
  selectedEvents,
  selectedMood,
  segments,
  showPlannerModal,
  showVoteModal,
  textSecondaryColor,
  voteLabels,
  voteLink,
  votes,
}: TonightScreenContentProps) {
  return (
    <>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.primaryAction} onPress={onOpenPlanner}>
          <Text style={styles.primaryActionText}>{plannerButtonText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryAction, { backgroundColor: cardColor }]}
          onPress={onOpenVote}
        >
          <Text style={styles.secondaryActionText}>{secondaryButtonText}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmentTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentTabsContent}>
          {segments.map((segment) => {
            const isActive = activeSegment === segment.key;

            return (
              <TouchableOpacity
                key={segment.key}
                style={[
                  styles.segmentTab,
                  { backgroundColor: isActive ? '#D4A056' : cardColor },
                ]}
                onPress={() => onSelectSegment(segment.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.segmentEmoji}>{segment.emoji}</Text>
                <Text style={[styles.segmentLabel, { color: isActive ? '#FFFFFF' : colorsText }]}>
                  {segment.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4A056" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>{'\uD83C\uDF05'}</Text>
          <Text style={[styles.emptyText, { color: textSecondaryColor }]}>{emptyStateMessage}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4A056"
              colors={['#D4A056']}
            />
          }
        >
          {events.map((event) => {
            const eventProps = renderEventProps(event);

            return (
              <TonightEventCard
                key={event.id}
                cardColor={cardColor}
                event={event}
                eventMetaSeparator={eventMetaSeparator}
                eventTime={eventProps.eventTime}
                eventTitle={eventProps.eventTitle}
                isSelected={eventProps.isSelected}
                onOpenTicket={onOpenTicket}
                onPress={() => onEventPress(event.id)}
                onToggleSelection={onToggleSelection}
                priceText={eventProps.priceText}
                showSelectionControls={showVoteModal && !voteLink}
                textColor={colorsText}
                textSecondaryColor={textSecondaryColor}
                ticketButtonText={eventProps.ticketButtonText}
                urgencyBadge={eventProps.urgencyBadge}
                venueName={eventProps.venueName}
              />
            );
          })}
        </ScrollView>
      )}

      <TonightPlannerModal
        activePlan={activePlan}
        backgroundColor="#FFFFFF"
        budget={budget}
        cardColor={cardColor}
        closeLabel={plannerLabels.close}
        colorsText={colorsText}
        generatingPlan={generatingPlan}
        groupSize={groupSize}
        isBosnian={isBosnian}
        onClose={onClosePlanner}
        onGeneratePlan={onGeneratePlan}
        onNextPlan={onNextPlan}
        onSavePlan={onSavePlan}
        onSelectGroupSize={onSelectGroupSize}
        onSelectMood={onSelectMood}
        onSetBudget={onSetBudget}
        onSharePlan={onSharePlan}
        plannerLabels={plannerLabels}
        selectedMood={selectedMood}
        visible={showPlannerModal}
      />

      <TonightVoteModal
        cardColor={cardColor}
        closeLabel={voteLabels.close}
        colorsText={colorsText}
        events={events}
        labels={voteLabels}
        onClose={onCloseVote}
        onCreateVote={onCreateVote}
        onShareVote={onShareVote}
        onVote={onVote}
        renderEventCard={(event) => {
          const eventProps = renderEventProps(event);

          return (
            <TonightEventCard
              cardColor={cardColor}
              event={event}
              eventMetaSeparator={eventMetaSeparator}
              eventTime={eventProps.eventTime}
              eventTitle={eventProps.eventTitle}
              isSelected={eventProps.isSelected}
              onOpenTicket={onOpenTicket}
              onPress={() => onEventPress(event.id)}
              onToggleSelection={onToggleSelection}
              priceText={eventProps.priceText}
              showSelectionControls
              textColor={colorsText}
              textSecondaryColor={textSecondaryColor}
              ticketButtonText={eventProps.ticketButtonText}
              urgencyBadge={eventProps.urgencyBadge}
              venueName={eventProps.venueName}
            />
          );
        }}
        selectedEvents={selectedEvents}
        textSecondaryColor={textSecondaryColor}
        visible={showVoteModal}
        voteLink={voteLink}
        votes={votes}
      />
    </>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: '#D4A056',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4A056',
  },
  secondaryActionText: {
    color: '#D4A056',
    fontSize: 15,
    fontWeight: '600',
  },
  segmentTabs: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  segmentTabsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  segmentTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  segmentEmoji: {
    fontSize: 18,
  },
  segmentLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
