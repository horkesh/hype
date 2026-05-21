import { invokeEdgeFunction } from './edgeFunctionClient';

export interface TranslationResult {
  original_text: string;
  translation: string;
  context: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function translateScene(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<TranslationResult | null> {
  const { data, error } = await invokeEdgeFunction<TranslationResult>('translate-scene', {
    image_base64: imageBase64,
    mime_type: mimeType,
  });
  if (error || !data) return null;
  return data;
}
