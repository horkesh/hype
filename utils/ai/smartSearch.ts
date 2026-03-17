import { invokeEdgeFunction } from './edgeFunctionClient';

export interface SmartSearchResult {
  mode: 'search' | 'conversation';
  filters: {
    category?: string;
    neighborhood?: string;
    query: string;
    mood?: string;
    priceLevel?: number | null;
    isOpen?: boolean | null;
  };
  response?: string;
  venueNames?: string[];
  matchedVenues?: any[];
}

export async function smartSearch(
  query: string,
  language: string = 'en',
): Promise<SmartSearchResult | null> {
  const { data, error } = await invokeEdgeFunction<SmartSearchResult>('smart-search', { query, language });
  if (error || !data) return null;
  return data;
}
