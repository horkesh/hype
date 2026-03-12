import React from 'react';

import { TonightEventCards } from '@/components/tonight/TonightEventCards';
import { TonightEventListState } from '@/components/tonight/TonightEventListState';
import { buildTonightEventCardViewModels, RenderedTonightEventProps } from '@/utils/tonightContent';
import { Event } from '@/utils/tonightScreen';

interface TonightEventListProps {
  cardColor: string;
  colorsText: string;
  emptyStateMessage: string;
  eventMetaSeparator: string;
  events: Event[];
  loading: boolean;
  refreshing: boolean;
  showSelectionControls: boolean;
  textSecondaryColor: string;
  onEventPress: (eventId: string) => void;
  onOpenTicket: (url: string) => void;
  onRefresh: () => void;
  onToggleSelection: (eventId: string) => void;
  renderEventProps: (event: Event) => RenderedTonightEventProps;
}

export function TonightEventList({
  cardColor,
  colorsText,
  emptyStateMessage,
  eventMetaSeparator,
  events,
  loading,
  refreshing,
  showSelectionControls,
  textSecondaryColor,
  onEventPress,
  onOpenTicket,
  onRefresh,
  onToggleSelection,
  renderEventProps,
}: TonightEventListProps) {
  const eventCards = buildTonightEventCardViewModels(events, renderEventProps);

  if (loading || eventCards.length === 0) {
    return (
      <TonightEventListState
        emptyStateMessage={emptyStateMessage}
        loading={loading}
        textSecondaryColor={textSecondaryColor}
      />
    );
  }

  return (
    <TonightEventCards
      cardColor={cardColor}
      colorsText={colorsText}
      eventMetaSeparator={eventMetaSeparator}
      eventCards={eventCards}
      refreshing={refreshing}
      showSelectionControls={showSelectionControls}
      textSecondaryColor={textSecondaryColor}
      onEventPress={onEventPress}
      onOpenTicket={onOpenTicket}
      onRefresh={onRefresh}
      onToggleSelection={onToggleSelection}
    />
  );
}
