import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ProfileThemeOption } from '@/utils/profileScreen';

interface ProfileSettingsSectionProps {
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  colorsText: string;
  textSecondaryColor: string;
  themeMode: 'auto' | 'light' | 'dark';
  themeOptions: ProfileThemeOption[];
  isBosnian: boolean;
  language: string;
  onSelectTheme: (mode: 'auto' | 'light' | 'dark') => void;
  onToggleLanguage: (language: 'bs' | 'en') => void;
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
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colorsText }]}>Postavke</Text>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.cardTitle, { color: colorsText }]}>Jezik / Language</Text>
        <View style={styles.languageToggle}>
          {(['bs', 'en'] as const).map((value) => {
            const isSelected = language === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => onToggleLanguage(value)}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor: isSelected ? accentColor : backgroundColor,
                    borderColor: accentColor,
                  },
                ]}
              >
                <Text style={[styles.languageButtonText, { color: isSelected ? '#FFFFFF' : colorsText }]}>
                  {value.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.cardTitle, { color: colorsText }]}>Tema / Theme</Text>
        <View style={styles.themeOptions}>
          {themeOptions.map((mode) => {
            const isSelected = themeMode === mode.value;
            return (
              <TouchableOpacity
                key={mode.value}
                onPress={() => onSelectTheme(mode.value)}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: isSelected ? accentColor : backgroundColor,
                    borderColor: accentColor,
                  },
                ]}
              >
                <Text style={[styles.themeButtonText, { color: isSelected ? '#FFFFFF' : colorsText }]}>
                  {isBosnian ? mode.label_bs : mode.label_en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.cardTitle, { color: colorsText }]}>O aplikaciji</Text>
        <Text style={[styles.aboutText, { color: textSecondaryColor }]}>
          Hype v1.0 - Digitalni puls grada
        </Text>
      </View>
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
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  languageToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
