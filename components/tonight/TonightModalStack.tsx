import React from 'react';

import { TonightPlannerModal } from '@/components/tonight/TonightPlannerModal';
import { TonightVoteEventCard } from '@/components/tonight/TonightVoteEventCard';
import { TonightVoteModal } from '@/components/tonight/TonightVoteModal';
import { AIPlan, Event, MoodId } from '@/utils/tonightScreen';

interface TonightModalStackProps {
  activePlan: AIPlan | null;
  budget: number;
  cardColor: string;
  colorsText: string;
  eventMetaSeparator: string;
  events: Event[];
  generatingPlan: boolean;
  groupSize: number;
  isBosnian: boolean;
  onClosePlanner: () => void;
  onCloseVote: () => void;
  onCreateVote: () => void;
  onEventPress: (eventId: string) => void;
  onGeneratePlan: () => void;
  onNextPlan: () => void;
  onOpenTicket: (url: string) => void;
  onSavePlan: () => void;
  onSelectGroupSize: (value: number) => void;
  onSelectMood: (value: MoodId) => void;
  onSetBudget: (value: number) => void;
  onSharePlan: () => void;
  onShareVote: () => void;
  onToggleSelection: (eventId: string) => void;
  onVote: (eventId: string) => void;
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
  renderEventProps: (event: Event) => {
    eventTime: string;
    eventTitle: string;
    isSelected: boolean;
    priceText: string;
    ticketButtonText: string;
    urgencyBadge: { label: string; color: string } | null;
    venueName: string;
  };
  selectedEvents: string[];
  selectedMood: MoodId | null;
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

export function TonightModalStack({
  activePlan,
  budget,
  cardColor,
  colorsText,
  eventMetaSeparator,
  events,
  generatingPlan,
  groupSize,
  isBosnian,
  onClosePlanner,
  onCloseVote,
  onCreateVote,
  onEventPress,
  onGeneratePlan,
  onNextPlan,
  onOpenTicket,
  onSavePlan,
  onSelectGroupSize,
  onSelectMood,
  onSetBudget,
  onSharePlan,
  onShareVote,
  onToggleSelection,
  onVote,
  plannerLabels,
  renderEventProps,
  selectedEvents,
  selectedMood,
  showPlannerModal,
  showVoteModal,
  textSecondaryColor,
  voteLabels,
  voteLink,
  votes,
}: TonightModalStackProps) {
  return (
    <>
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
        renderEventCard={(event) => (
          <TonightVoteEventCard
            cardColor={cardColor}
            colorsText={colorsText}
            event={event}
            eventMetaSeparator={eventMetaSeparator}
            onEventPress={onEventPress}
            onOpenTicket={onOpenTicket}
            onToggleSelection={onToggleSelection}
            renderEventProps={renderEventProps}
            textSecondaryColor={textSecondaryColor}
          />
        )}
        selectedEvents={selectedEvents}
        textSecondaryColor={textSecondaryColor}
        visible={showVoteModal}
        voteLink={voteLink}
        votes={votes}
      />
    </>
  );
}
