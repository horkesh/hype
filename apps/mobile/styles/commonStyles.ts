
import { StyleSheet } from 'react-native';

// Look dark color scheme (Spotify-inspired charcoal)
export const colors = {
  background: '#0F0A17',
  card: '#1B1426',
  text: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textTertiary: '#6B6B6B',
  accent: '#8E2DE2',
  border: '#2E2440',
  shadow: 'rgba(0, 0, 0, 0.4)',
  surface: '#150F1F',
  surfaceHover: '#2A1F3A',
};

export type ThemeColors = typeof colors;

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
