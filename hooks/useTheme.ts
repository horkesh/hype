// hooks/useTheme.ts

import { useColorScheme } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/styles/commonStyles';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useApp();

  // Determine if it's daytime (6 AM - 7 PM)
  const isDaytime = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 19;
  };

  // Calculate effective theme
  const getEffectiveTheme = () => {
    if (themeMode === 'light') return 'light';
    if (themeMode === 'dark') return 'dark';

    // Auto mode: use time-based logic
    return isDaytime() ? 'light' : 'dark';
  };

  const effectiveTheme = getEffectiveTheme();
  const themeColors = effectiveTheme === 'dark' ? colors.dark : colors.light;

  return {
    theme: effectiveTheme,
    colors: themeColors,
    isDark: effectiveTheme === 'dark',
  };
}