export const glassTokens = {
  background: 'rgba(142,45,226,0.04)',
  border: 'rgba(142,45,226,0.10)',
  borderWidth: 1,
  moodColors: {
    party:       { primary: '#EF4444', glow: 'rgba(239,68,68,0.2)',   bg: 'rgba(239,68,68,0.25)' },
    chill:       { primary: '#3B82F6', glow: 'rgba(59,130,246,0.2)',  bg: 'rgba(59,130,246,0.25)' },
    girls_night: { primary: '#EC4899', glow: 'rgba(236,72,153,0.2)', bg: 'rgba(236,72,153,0.25)' },
    date_night:  { primary: '#FB923C', glow: 'rgba(251,146,60,0.2)', bg: 'rgba(251,146,60,0.25)' },
    muzika:      { primary: '#A855F7', glow: 'rgba(168,85,247,0.2)', bg: 'rgba(168,85,247,0.25)' },
    romantika:   { primary: '#BE123C', glow: 'rgba(190,18,60,0.2)',  bg: 'rgba(190,18,60,0.25)' },
    kultura:     { primary: '#6366F1', glow: 'rgba(99,102,241,0.2)', bg: 'rgba(99,102,241,0.25)' },
    foodie:      { primary: '#EAB308', glow: 'rgba(234,179,8,0.2)',  bg: 'rgba(234,179,8,0.25)' },
    brunch:      { primary: '#FBD0E8', glow: 'rgba(251,207,232,0.2)', bg: 'rgba(251,207,232,0.2)' },
    after_work:  { primary: '#D97706', glow: 'rgba(217,119,6,0.2)',  bg: 'rgba(217,119,6,0.25)' },
    outdoor:     { primary: '#22C55E', glow: 'rgba(34,197,94,0.2)',  bg: 'rgba(34,197,94,0.25)' },
    turista:     { primary: '#0EA5E9', glow: 'rgba(14,165,233,0.2)', bg: 'rgba(14,165,233,0.25)' },
  },
  shadow: {
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 5,
    },
  },
} as const;

export type MoodId = keyof typeof glassTokens.moodColors;
