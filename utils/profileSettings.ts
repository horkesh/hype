export type ProfileLanguage = 'bs' | 'en';
export type ProfileThemeMode = 'auto' | 'light' | 'dark';

export interface ProfileLanguageOption {
  label: string;
  value: ProfileLanguage;
}

export interface ProfileSettingsCopy {
  aboutBody: string;
  aboutTitle: string;
  badgeCountLabel: string;
  languageTitle: string;
  moodTitle: string;
  sectionTitle: string;
  signOutLabel: string;
  themeTitle: string;
}

export const PROFILE_LANGUAGE_OPTIONS: ProfileLanguageOption[] = [
  { value: 'bs', label: 'BS' },
  { value: 'en', label: 'EN' },
];

export function getProfileSettingsCopy(isBosnian: boolean): ProfileSettingsCopy {
  return {
    aboutBody: isBosnian ? 'Hype v1.0 - Digitalni puls grada' : 'Hype v1.0 - The city pulse',
    aboutTitle: isBosnian ? 'O aplikaciji' : 'About',
    badgeCountLabel: isBosnian ? 'Bedzeva' : 'Badges',
    languageTitle: isBosnian ? 'Jezik / Language' : 'Language / Jezik',
    moodTitle: isBosnian ? 'Sta te zanima?' : 'What are you into?',
    sectionTitle: isBosnian ? 'Postavke' : 'Settings',
    signOutLabel: isBosnian ? 'Odjavi se' : 'Sign out',
    themeTitle: isBosnian ? 'Tema / Theme' : 'Theme / Tema',
  };
}
