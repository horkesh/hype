/** Source types accepted by expo-image */
export type ImageSource = string | number | { uri: string };

const stringSourceCache = new Map<string, { uri: string }>();

export function resolveImageSource(
  source: string | number | { uri: string } | null | undefined
): ImageSource | null {
  if (!source) return null;
  if (typeof source === 'string') {
    const cached = stringSourceCache.get(source);
    if (cached) {
      return cached;
    }

    const resolved = { uri: source };
    stringSourceCache.set(source, resolved);
    return resolved;
  }
  if (typeof source === 'number') return source;
  return source;
}
