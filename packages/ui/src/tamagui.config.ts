// Look's design system, expressed as a Tamagui config.
// Sources: apps/mobile/constants/Colors.ts + apps/mobile/styles/designTokens.ts.
// One file → renders to CSS on web (via @tamagui/static compiler) and to native
// StyleSheet on iOS/Android.

import { createTamagui, createTokens, createFont } from '@tamagui/core';
import { shorthands } from '@tamagui/config/v3';

const lookPalette = {
  // Brand
  amber: '#D4A056',
  amberMuted: '#B8893F',

  // Surface (dark theme — Look has always been dark-only)
  bg: '#121212',
  card: '#1E1E1E',
  cardAlt: '#27272A',
  border: '#2A2A2A',
  borderMuted: '#1F1F22',

  // Text
  text: '#F5F5F5',
  textMuted: '#A1A1AA',
  textDim: '#71717A',

  // Status
  success: '#34C759',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#60A5FA',

  // Neutrals (Zinc scale — kept for chips, borders, alt rows)
  z50: '#FAFAFA',
  z100: '#F4F4F5',
  z200: '#E4E4E7',
  z300: '#D4D4D8',
  z400: '#A1A1AA',
  z500: '#71717A',
  z600: '#52525B',
  z700: '#3F3F46',
  z800: '#27272A',
  z900: '#18181B',
  z950: '#09090B',

  // Transparency overlays for blur surfaces (glass cards on iOS)
  whiteAlpha10: 'rgba(255,255,255,0.10)',
  whiteAlpha20: 'rgba(255,255,255,0.20)',
  blackAlpha40: 'rgba(0,0,0,0.40)',
  blackAlpha60: 'rgba(0,0,0,0.60)',
};

const tokens = createTokens({
  color: lookPalette,
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,        // cardGap from designTokens
    4: 16,        // screenPadding
    5: 20,
    6: 24,        // sectionGap
    7: 32,
    8: 40,
    9: 48,
    10: 64,
    true: 16,     // alias for default
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
    7: 40,
    8: 48,
    9: 64,
    10: 96,
    true: 16,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    input: 16,    // designTokens.radius.input
    card: 24,
    chip: 24,
    modal: 28,
    image: 20,
    pill: 9999,
    true: 16,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    modal: 1000,
    toast: 2000,
  },
});

// Two fonts: heading (DM Serif Display, hero/section/cards) and body (DM Sans).
// fontFamily names match what apps/mobile loads via @expo-google-fonts.
const headingFont = createFont({
  family: 'DMSerifDisplay_400Regular, "DM Serif Display", serif',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,    // cardTitle
    5: 22,
    6: 24,    // sectionHeader
    7: 28,
    8: 34,    // heroTitle
    9: 40,
    10: 48,
    true: 18,
  },
  weight: { 4: '400' },
  letterSpacing: { 4: 0 },
  lineHeight: {
    1: 16, 2: 18, 3: 22, 4: 24, 5: 28, 6: 30, 7: 34, 8: 40, 9: 46, 10: 56, true: 24,
  },
});

const bodyFont = createFont({
  family: 'DMSans_400Regular, "DM Sans", system-ui, sans-serif',
  size: {
    1: 11,
    2: 12,    // caption
    3: 13,
    4: 15,    // body
    5: 16,
    6: 18,
    7: 20,
    8: 24,
    true: 15,
  },
  weight: { 4: '400', 5: '500', 6: '600', 7: '700' },
  letterSpacing: { 4: 0 },
  lineHeight: {
    1: 14, 2: 16, 3: 18, 4: 22, 5: 24, 6: 26, 7: 28, 8: 32, true: 22,
  },
});

// Single dark theme — Look has never had a light mode and isn't planning one.
// Tamagui's theme system still expects at least `theme` to exist.
const themes = {
  dark: {
    background: lookPalette.bg,
    backgroundCard: lookPalette.card,
    backgroundHover: lookPalette.cardAlt,
    borderColor: lookPalette.border,
    color: lookPalette.text,
    colorMuted: lookPalette.textMuted,
    colorDim: lookPalette.textDim,
    accent: lookPalette.amber,
    accentMuted: lookPalette.amberMuted,
    success: lookPalette.success,
    warning: lookPalette.warning,
    danger: lookPalette.danger,
  },
};

export const config = createTamagui({
  themes,
  tokens,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  defaultTheme: 'dark',
  defaultFont: 'body',
});

export type Conf = typeof config;

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
