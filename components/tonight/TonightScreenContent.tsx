import React from 'react';

import { TonightActionButtons } from '@/components/tonight/TonightActionButtons';
import { TonightEventCard } from '@/components/tonight/TonightEventCard';
import { TonightEventList } from '@/components/tonight/TonightEventList';
import { TonightPlannerModal } from '@/components/tonight/TonightPlannerModal';
import { TonightSegmentTabs } from '@/components/tonight/TonightSegmentTabs';
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
      <TonightActionButtons
        cardColor={cardColor}
        plannerButtonText={plannerButtonText}
        secondaryButtonText={secondaryButtonText}
        onOpenPlanner={onOpenPlanner}
        onOpenVote={onOpenVote}
      />

      <TonightSegmentTabs
        activeSegment={activeSegment}
        cardColor={cardColor}
        colorsText={colorsText}
        segments={segments}
        onSelectSegment={onSelectSegment}
      />

      <TonightEventList
        cardColor={cardColor}
        colorsText={colorsText}
        emptyStateMessage={emptyStateMessage}
        eventMetaSeparator={eventMetaSeparator}
        events={events}
        loading={loading}
        refreshing={refreshing}
        showSelectionControls={showVoteModal && !voteLink}
        textSecondaryColor={textSecondaryColor}
        onEventPress={onEventPress}
        onOpenTicket={onOpenTicket}
        onRefresh={onRefresh}
        onToggleSelection={onToggleSelection}
        renderEventProps={renderEventProps}
      />

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
