export interface ProfileMoodOption {
  id: string;
  emoji: string;
  label_bs: string;
  label_en: string;
}

export interface ProfileThemeOption {
  value: 'auto' | 'light' | 'dark';
  label_bs: string;
  label_en: string;
}

export interface ProfileDemoBadge {
  icon: string;
  name_bs: string;
  name_en: string;
}

export const PROFILE_MOODS: ProfileMoodOption[] = [
  { id: 'party', emoji: '🎉', label_bs: 'Party', label_en: 'Party' },
  { id: 'chill', emoji: '😌', label_bs: 'Chill', label_en: 'Chill' },
  { id: 'girls_night', emoji: '👯', label_bs: 'Girls Night', label_en: 'Girls Night' },
  { id: 'date_night', emoji: '💑', label_bs: 'Date Night', label_en: 'Date Night' },
  { id: 'music', emoji: '🎵', label_bs: 'Muzika', label_en: 'Music' },
  { id: 'romance', emoji: '💕', label_bs: 'Romantika', label_en: 'Romance' },
  { id: 'culture', emoji: '🎭', label_bs: 'Kultura', label_en: 'Culture' },
  { id: 'foodie', emoji: '🍽️', label_bs: 'Foodie', label_en: 'Foodie' },
  { id: 'brunch', emoji: '🥐', label_bs: 'Brunch', label_en: 'Brunch' },
  { id: 'after_work', emoji: '🍻', label_bs: 'After Work', label_en: 'After Work' },
  { id: 'outdoor', emoji: '🌳', label_bs: 'Outdoor', label_en: 'Outdoor' },
  { id: 'tourist', emoji: '📸', label_bs: 'Turista', label_en: 'Tourist' },
];

export const PROFILE_THEME_OPTIONS: ProfileThemeOption[] = [
  { value: 'auto', label_bs: 'Automatski', label_en: 'Auto' },
  { value: 'light', label_bs: 'Svijetla', label_en: 'Light' },
  { value: 'dark', label_bs: 'Tamna', label_en: 'Dark' },
];

export const PROFILE_DEMO_BADGES: ProfileDemoBadge[] = [
  { icon: '☕', name_bs: 'Kafedžija', name_en: 'Coffee Lover' },
  { icon: '🕵️', name_bs: 'Explorer', name_en: 'Explorer' },
  { icon: '👑', name_bs: 'Hype OG', name_en: 'Hype OG' },
];

export function toggleProfileMoodSelection(
  selectedMoods: string[],
  moodId: string
): string[] {
  if (selectedMoods.includes(moodId)) {
    return selectedMoods.filter((id) => id !== moodId);
  }

  return [...selectedMoods, moodId];
}
