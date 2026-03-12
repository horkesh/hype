import { Event } from '@/utils/tonightScreen';

export interface RenderedTonightEventProps {
  eventTime: string;
  eventTitle: string;
  isSelected: boolean;
  priceText: string;
  ticketButtonText: string;
  urgencyBadge: { label: string; color: string } | null;
  venueName: string;
}

export interface TonightEventCardViewModel extends RenderedTonightEventProps {
  id: string;
  event: Event;
}

export function buildTonightEventCardViewModels(
  events: Event[],
  renderEventProps: (event: Event) => RenderedTonightEventProps
): TonightEventCardViewModel[] {
  return events.map((event) => ({
    id: event.id,
    event,
    ...renderEventProps(event),
  }));
}
