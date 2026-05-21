import { invokeEdgeFunction } from './edgeFunctionClient';

export interface AskSarajevoResult {
  answer_bs: string;
  answer_en: string;
  mentioned_venues: Array<{ venue_id: string; name: string }>;
  source_pages: string[];
}

export async function askSarajevo(
  question: string,
  language: string = 'bs'
): Promise<AskSarajevoResult | null> {
  const result = await invokeEdgeFunction<AskSarajevoResult>('ask-sarajevo', {
    question,
    language,
  });
  return result.data;
}
