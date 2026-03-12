export function mergeSuggestedMood(
  currentMood: string | null,
  suggestedMood: string | null
): string | null {
  if (!suggestedMood) {
    return currentMood;
  }

  if (suggestedMood === currentMood) {
    return currentMood;
  }

  return suggestedMood;
}
