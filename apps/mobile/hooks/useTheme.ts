// hooks/useTheme.ts

import { colors, ThemeColors } from '@/styles/commonStyles';

const THEME = {
  theme: 'dark' as const,
  colors,
  isDark: true as const,
};

export function useTheme(): { theme: 'dark'; colors: ThemeColors; isDark: true } {
  return THEME;
}
