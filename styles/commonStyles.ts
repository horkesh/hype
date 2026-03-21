
import { StyleSheet } from 'react-native';

// Hype dark color scheme (Spotify-inspired charcoal)
export const colors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textTertiary: '#6B6B6B',
  accent: '#D4A056',
  border: '#2A2A2A',
  shadow: 'rgba(0, 0, 0, 0.4)',
  surface: '#181818',
  surfaceHover: '#282828',
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
