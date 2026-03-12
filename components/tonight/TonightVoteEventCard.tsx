import React from 'react';

import { TonightEventCard } from '@/components/tonight/TonightEventCard';
import { Event } from '@/utils/tonightScreen';

interface TonightVoteEventCardProps {
  cardColor: string;
  colorsText: string;
  event: Event;
  eventMetaSeparator: string;
  onEventPress: (eventId: string) => void;
  onOpenTicket: (url: string) => void;
  onToggleSelection: (eventId: string) => void;
  renderEventProps: (event: Event) => {
    eventTime: string;
    eventTitle: string;
    isSelected: boolean;
    priceText: string;
    ticketButtonText: string;
    urgencyBadge: { label: string; color: string } | null;
    venueName: string;
  };
  textSecondaryColor: string;
}

export function TonightVoteEventCard({
  cardColor,
  colorsText,
  event,
  eventMetaSeparator,
  onEventPress,
  onOpenTicket,
  onToggleSelection,
  renderEventProps,
  textSecondaryColor,
}: TonightVoteEventCardProps) {
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
}
