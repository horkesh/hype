import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProfileOptionToggleGroup } from '@/components/profile/ProfileOptionToggleGroup';
import { ProfileSettingsCard } from '@/components/profile/ProfileSettingsCard';
import {
  getProfileSettingsCopy,
  PROFILE_LANGUAGE_OPTIONS,
  ProfileLanguage,
} from '@/utils/profileSettings';

interface ProfileSettingsSectionProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  colorsText: string;
  isBosnian: boolean;
  language: ProfileLanguage;
  onToggleLanguage: (language: ProfileLanguage) => void;
  textSecondaryColor: string;
}

export function ProfileSettingsSection({
  accentColor,
  backgroundColor,
  cardColor,
  colorsText,
  isBosnian,
  language,
  onToggleLanguage,
  textSecondaryColor,
}: ProfileSettingsSectionProps) {
  const copy = getProfileSettingsCopy(isBosnian);

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
