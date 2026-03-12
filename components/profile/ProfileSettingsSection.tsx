import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProfileOptionToggleGroup } from '@/components/profile/ProfileOptionToggleGroup';
import { ProfileSettingsCard } from '@/components/profile/ProfileSettingsCard';
import {
  getProfileSettingsCopy,
  PROFILE_LANGUAGE_OPTIONS,
  ProfileLanguage,
  ProfileThemeMode,
} from '@/utils/profileSettings';
import { ProfileThemeOption } from '@/utils/profileScreen';

interface ProfileSettingsSectionProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  colorsText: string;
  isBosnian: boolean;
  language: ProfileLanguage;
  onSelectTheme: (mode: ProfileThemeMode) => void;
  onToggleLanguage: (language: ProfileLanguage) => void;
  textSecondaryColor: string;
  themeMode: ProfileThemeMode;
  themeOptions: ProfileThemeOption[];
}

export function ProfileSettingsSection({
  accentColor,
  backgroundColor,
  cardColor,
  colorsText,
  isBosnian,
  language,
  onSelectTheme,
  onToggleLanguage,
  textSecondaryColor,
  themeMode,
  themeOptions,
}: ProfileSettingsSectionProps) {
  const copy = getProfileSettingsCopy(isBosnian);
  const localizedThemeOptions = themeOptions.map((option) => ({
    value: option.value,
    label: isBosnian ? option.label_bs : option.label_en,
  }));

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colorsText }]}>{copy.sectionTitle}</Text>

      <ProfileSettingsCard cardColor={cardColor} textColor={colorsText} title={copy.languageTitle}>
        <ProfileOptionToggleGroup
          accentColor={accentColor}
          backgroundColor={backgroundColor}
          options={PROFILE_LANGUAGE_OPTIONS}
          selectedValue={language}
          textColor={colorsText}
          onSelect={onToggleLanguage}
        />
      </ProfileSettingsCard>

      <ProfileSettingsCard cardColor={cardColor} textColor={colorsText} title={copy.themeTitle}>
        <ProfileOptionToggleGroup
          accentColor={accentColor}
          backgroundColor={backgroundColor}
          options={localizedThemeOptions}
          selectedValue={themeMode}
          textColor={colorsText}
          onSelect={onSelectTheme}
        />
      </ProfileSettingsCard>

      <ProfileSettingsCard cardColor={cardColor} textColor={colorsText} title={copy.aboutTitle}>
        <Text style={[styles.aboutText, { color: textSecondaryColor }]}>{copy.aboutBody}</Text>
      </ProfileSettingsCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
