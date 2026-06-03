// Telemach BH brand tokens — demo co-branding layer for the funding pitch.
// Faithful recreation of Telemach's violet identity + EON magenta accent.
// Kept isolated so the partnership theme can be lifted out in one place.

export const telemach = {
  // Core violet identity
  purple: '#8E2DE2',
  purpleDeep: '#5B16A8',
  purpleBright: '#A24BFF',
  // EON pop
  magenta: '#E5007E',
  // Surfaces
  ink: '#0F0A17',
  inkCard: '#1B1426',
  onPurple: '#FFFFFF',
  onPurpleDim: 'rgba(255,255,255,0.72)',
  // Signature gradients
  gradient: ['#8E2DE2', '#5B16A8'] as const,
  gradientVivid: ['#A24BFF', '#E5007E'] as const,
} as const;
