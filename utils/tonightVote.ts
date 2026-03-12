import { Event } from '@/utils/tonightScreen';

export interface TonightVoteResult {
  eventId: string;
  title: string;
  voteCount: number;
}

export function canCreateTonightVote(selectedEvents: string[]): boolean {
  return selectedEvents.length >= 2;
}

export function buildTonightVoteResults(
  events: Event[],
  selectedEvents: string[],
  votes: Record<string, number>
): TonightVoteResult[] {
  return selectedEvents.flatMap((eventId) => {
    const event = events.find((entry) => entry.id === eventId);

    if (!event) {
      return [];
    }

    return [{
      eventId,
      title: event.title_bs,
      voteCount: votes[eventId] || 0,
    }];
  });
}
