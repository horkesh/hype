
import { StyleSheet } from 'react-native';

// Hype color scheme
export const colors = {
  // Light mode
  light: {
    background: '#FAFAF8',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    accent: '#D4A056',
    border: '#E5E5E5',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  // Dark mode
  dark: {
    background: '#1A1A2E',
    card: '#252538',
    text: '#FAFAF8',
    textSecondary: '#A0A0A0',
    accent: '#D4A056',
    border: '#3A3A4E',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

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
