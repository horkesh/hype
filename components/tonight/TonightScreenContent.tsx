import React from 'react';

import { TonightActionButtons } from '@/components/tonight/TonightActionButtons';
import { TonightEventList } from '@/components/tonight/TonightEventList';
import { TonightModalStack } from '@/components/tonight/TonightModalStack';
import { TonightSegmentTabs } from '@/components/tonight/TonightSegmentTabs';
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
  language: string;
  loading: boolean;
  onClosePlanner: () => void;
  onCloseVote: () => void;
  onCreateVote: () => void;
  onEventPress: (eventId: string) => void;
  onGenerateAIPlan?: () => void;
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
  useAIPlanner?: boolean;
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
  language,
  loading,
  onClosePlanner,
  onCloseVote,
  onCreateVote,
  onEventPress,
  onGenerateAIPlan,
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
  useAIPlanner,
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

      <TonightModalStack
        activePlan={activePlan}
        budget={budget}
        cardColor={cardColor}
        colorsText={colorsText}
        eventMetaSeparator={eventMetaSeparator}
        events={events}
        generatingPlan={generatingPlan}
        groupSize={groupSize}
        isBosnian={isBosnian}
        language={language}
        onClosePlanner={onClosePlanner}
        onCloseVote={onCloseVote}
        onCreateVote={onCreateVote}
        onEventPress={onEventPress}
        onGenerateAIPlan={onGenerateAIPlan}
        onGeneratePlan={onGeneratePlan}
        onNextPlan={onNextPlan}
        onOpenTicket={onOpenTicket}
        onSavePlan={onSavePlan}
        onSelectGroupSize={onSelectGroupSize}
        onSelectMood={onSelectMood}
        onSetBudget={onSetBudget}
        onSharePlan={onSharePlan}
        onShareVote={onShareVote}
        onToggleSelection={onToggleSelection}
        onVote={onVote}
        plannerLabels={plannerLabels}
        renderEventProps={renderEventProps}
        selectedEvents={selectedEvents}
        selectedMood={selectedMood}
        showPlannerModal={showPlannerModal}
        showVoteModal={showVoteModal}
        textSecondaryColor={textSecondaryColor}
        useAIPlanner={useAIPlanner}
        voteLabels={voteLabels}
        voteLink={voteLink}
        votes={votes}
      />
    </>
  );
}
