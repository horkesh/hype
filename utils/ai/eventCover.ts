import { invokeEdgeFunction } from './edgeFunctionClient';

interface EventCoverResult {
  image_url: string;
  event_id: string;
}

/**
 * Generate an AI cover image for an event and update its cover_image_url.
 * Uses Imagen / Gemini multi-model fallback (same as hero image).
 */
export async function generateEventCover(eventId: string): Promise<string | null> {
  const { data, error } = await invokeEdgeFunction<EventCoverResult>('generate-event-cover', {
    event_id: eventId,
  });

  if (error || !data?.image_url) {
    console.warn('generateEventCover failed:', error);
    return null;
  }

  return data.image_url;
}
