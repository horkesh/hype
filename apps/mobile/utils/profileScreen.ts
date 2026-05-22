export interface ProfileMoodOption {
  id: string;
  emoji: string;
  label_bs: string;
  label_en: string;
}

export interface ProfileDemoBadge {
  icon: string;
  name_bs: string;
  name_en: string;
}

export const PROFILE_MOODS: ProfileMoodOption[] = [
  { id: 'party', emoji: '\u{1F389}', label_bs: 'Party', label_en: 'Party' },
  { id: 'chill', emoji: '\u{1F60C}', label_bs: 'Chill', label_en: 'Chill' },
  { id: 'girls_night', emoji: '\u{1F46F}', label_bs: 'Girls Night', label_en: 'Girls Night' },
  { id: 'date_night', emoji: '\u{1F491}', label_bs: 'Date Night', label_en: 'Date Night' },
  { id: 'music', emoji: '\u{1F3B5}', label_bs: 'Muzika', label_en: 'Music' },
  { id: 'romance', emoji: '\u{1F495}', label_bs: 'Romantika', label_en: 'Romance' },
  { id: 'culture', emoji: '\u{1F3AD}', label_bs: 'Kultura', label_en: 'Culture' },
  { id: 'foodie', emoji: '\u{1F37D}\uFE0F', label_bs: 'Foodie', label_en: 'Foodie' },
  { id: 'brunch', emoji: '\u{1F950}', label_bs: 'Brunch', label_en: 'Brunch' },
  { id: 'after_work', emoji: '\u{1F37B}', label_bs: 'After Work', label_en: 'After Work' },
  { id: 'outdoor', emoji: '\u{1F333}', label_bs: 'Outdoor', label_en: 'Outdoor' },
  { id: 'tourist', emoji: '\u{1F4F8}', label_bs: 'Turista', label_en: 'Tourist' },
];

export const PROFILE_DEMO_BADGES: ProfileDemoBadge[] = [
  { icon: '\u2615', name_bs: 'Kafedzija', name_en: 'Coffee Lover' },
  { icon: '\u{1F575}\uFE0F', name_bs: 'Explorer', name_en: 'Explorer' },
  { icon: '\u{1F451}', name_bs: 'Look OG', name_en: 'Look OG' },
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
