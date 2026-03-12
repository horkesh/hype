import {
  Event,
  TimeSegment,
  TimeSegmentConfig,
} from '@/utils/tonightScreen';

export interface TonightUrgencyBadge {
  color: string;
  label: string;
}

export function getInitialTonightSegment(date: Date): TimeSegment {
  const currentHour = date.getHours();

  if (currentHour >= 6 && currentHour < 12) {
    return 'morning';
  }

  if (currentHour >= 12 && currentHour < 17) {
    return 'lunch';
  }

  if (currentHour >= 17 && currentHour < 22) {
    return 'evening';
  }

  return 'night';
}

export function getTonightSegmentRange(
  activeSegment: TimeSegment,
  segments: TimeSegmentConfig[],
  now: Date = new Date()
): { startTime: Date; endTime: Date } | null {
  const segment = segments.find((entry) => entry.key === activeSegment);

  if (!segment) {
    return null;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTime = new Date(today);
  const endTime = new Date(today);

  startTime.setHours(segment.startHour, 0, 0, 0);
  endTime.setHours(segment.endHour, 0, 0, 0);

  if (segment.key === 'night' && segment.endHour < segment.startHour) {
    endTime.setDate(endTime.getDate() + 1);
  }

  return { startTime, endTime };
}

export function getUrgencyBadge(
  eventDate: string,
  labels: { tonight: string; tomorrow: string },
  now: Date = new Date()
): TonightUrgencyBadge | null {
  const eventDateTime = new Date(eventDate);
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (eventDateTime.toDateString() === today.toDateString()) {
    return { label: labels.tonight, color: '#EF4444' };
  }

  if (eventDateTime.toDateString() === tomorrow.toDateString()) {
    return { label: labels.tomorrow, color: '#F97316' };
  }

  return null;
}

export function getTicketButtonText(ticketUrl: string | null, language: string): string {
  if (!ticketUrl) {
    return language === 'bs' ? 'Kupi' : 'Buy';
  }

  const urlLower = ticketUrl.toLowerCase();

  if (urlLower.includes('kupikartu.ba')) {
    return 'KupiKartu';
  }

  if (urlLower.includes('entrio.ba')) {
    return 'Entrio';
  }

  if (urlLower.includes('karter.ba')) {
    return 'Karter';
  }

  if (urlLower.includes('fiestalama')) {
    return 'FiestaLama';
  }

  return language === 'bs' ? 'Kupi' : 'Buy';
}

export function formatEventTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function getTonightPriceText(event: Event, language: string): string {
  const isFree = event.price_bam === null || event.price_bam === 0;

  if (isFree) {
    return language === 'bs' ? 'Besplatan' : 'Free';
  }

  const fromText = language === 'bs' ? 'od' : 'from';
  return `${fromText} ${event.price_bam} KM`;
}

export function toggleTonightSelection(selectedEvents: string[], eventId: string): string[] {
  if (selectedEvents.includes(eventId)) {
    return selectedEvents.filter((id) => id !== eventId);
  }

  if (selectedEvents.length >= 4) {
    return selectedEvents;
  }

  return [...selectedEvents, eventId];
}

export function createMockVoteState(selectedEvents: string[]): Record<string, number> {
  return selectedEvents.reduce<Record<string, number>>((accumulator, eventId) => {
    accumulator[eventId] = 0;
    return accumulator;
  }, {});
}
