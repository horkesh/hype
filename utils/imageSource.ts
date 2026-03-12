import { ImageSourcePropType } from 'react-native';

const stringSourceCache = new Map<string, ImageSourcePropType>();

export function resolveImageSource(
  source: string | number | ImageSourcePropType | null | undefined
): ImageSourcePropType | null {
  if (!source) return null;
  if (typeof source === 'string') {
    const cached = stringSourceCache.get(source);
    if (cached) {
      return cached;
    }

    const resolved = { uri: source } as ImageSourcePropType;
    stringSourceCache.set(source, resolved);
    return resolved;
  }
  if (typeof source === 'number') return source as ImageSourcePropType;
  return source as ImageSourcePropType;
}
