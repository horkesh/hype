export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted';

export const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'rgba(255,255,255,0.15)', text: '#FAFAF8' },
  success: { bg: 'rgba(34,197,94,0.2)', text: '#22C55E' },
  warning: { bg: 'rgba(234,179,8,0.2)', text: '#EAB308' },
  danger:  { bg: 'rgba(239,68,68,0.2)', text: '#EF4444' },
  accent:  { bg: 'rgba(212,160,86,0.5)', text: '#FFF' },
  muted:   { bg: 'rgba(113,113,122,0.2)', text: '#71717A' },
};
