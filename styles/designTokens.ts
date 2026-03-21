export const designTokens = {
  radius: {
    card: 24,
    modal: 28,
    chip: 24,
    input: 16,
    imageFrame: 20,
  },
  typography: {
    heroTitle:     { fontSize: 34, fontWeight: '400' as const, fontFamily: 'DMSerifDisplay_400Regular' },
    sectionHeader: { fontSize: 24, fontWeight: '400' as const, fontFamily: 'DMSerifDisplay_400Regular' },
    cardTitle:     { fontSize: 18, fontWeight: '400' as const, fontFamily: 'DMSerifDisplay_400Regular' },
    body:          { fontSize: 15, fontWeight: '400' as const, fontFamily: 'DMSans_400Regular' },
    caption:       { fontSize: 12, fontWeight: '500' as const, fontFamily: 'DMSans_500Medium' },
  },
  spacing: {
    screenPadding: 16,
    cardGap: 12,
    sectionGap: 24,
  },
} as const;
