export type ProfileLanguage = 'bs' | 'en';
export type ProfileThemeMode = 'auto' | 'light' | 'dark';

export interface ProfileLanguageOption {
  label: string;
  value: ProfileLanguage;
}

export interface ProfileSettingsCopy {
  aboutBody: string;
  aboutTitle: string;
  authCheckEmailBody: string;
  authCheckEmailTitle: string;
  authRequiredBody: string;
  authRequiredSaveBody: string;
  authRequiredTitle: string;
  badgeCountLabel: string;
  languageTitle: string;
  moodTitle: string;
  sectionTitle: string;
  signInFailedBody: string;
  signInFailedTitle: string;
  signOutLabel: string;
  signOutModalBody: string;
  signOutModalCancel: string;
  signOutModalConfirm: string;
  signOutModalTitle: string;
  signUpFailedBody: string;
  signUpFailedTitle: string;
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
    authCheckEmailBody: isBosnian
      ? 'Provjeri email za potvrdni link.'
      : 'Check your email for the confirmation link.',
    authCheckEmailTitle: isBosnian ? 'Provjeri email' : 'Check your email',
    authRequiredBody: isBosnian
      ? 'Prijavi se da personalizujes svoj ukus.'
      : 'Please sign in to personalize your taste profile.',
    authRequiredSaveBody: isBosnian
      ? 'Prijavi se da sacuvas svoj profil ukusa.'
      : 'Please sign in to save your taste profile.',
    authRequiredTitle: isBosnian ? 'Potrebna je prijava' : 'Sign in required',
    badgeCountLabel: isBosnian ? 'Bedzeva' : 'Badges',
    languageTitle: isBosnian ? 'Jezik / Language' : 'Language / Jezik',
    moodTitle: isBosnian ? 'Sta te zanima?' : 'What are you into?',
    sectionTitle: isBosnian ? 'Postavke' : 'Settings',
    signInFailedBody: isBosnian ? 'Prijava nije uspjela' : 'Failed to sign in',
    signInFailedTitle: isBosnian ? 'Prijava nije uspjela' : 'Sign in failed',
    signOutLabel: isBosnian ? 'Odjavi se' : 'Sign out',
    signOutModalBody: isBosnian
      ? 'Da li si siguran/na da zelis da se odjavis?'
      : 'Are you sure you want to sign out?',
    signOutModalCancel: isBosnian ? 'Otkazi' : 'Cancel',
    signOutModalConfirm: isBosnian ? 'Odjavi se' : 'Sign out',
    signOutModalTitle: isBosnian ? 'Odjavi se?' : 'Sign out?',
    signUpFailedBody: isBosnian ? 'Registracija nije uspjela' : 'Failed to sign up',
    signUpFailedTitle: isBosnian ? 'Registracija nije uspjela' : 'Sign up failed',
    themeTitle: isBosnian ? 'Tema / Theme' : 'Theme / Tema',
  };
}
