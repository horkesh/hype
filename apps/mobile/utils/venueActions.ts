export interface VenuePrimaryAction {
  emoji: string;
  id: 'navigate' | 'call' | 'web' | 'instagram' | 'save';
  label: string;
}

export interface VenueDeliveryAction {
  emoji: string;
  id: 'korpa' | 'glovo';
  label: string;
}

interface VenueActionLabels {
  call: string;
  glovo: string;
  instagram: string;
  korpa: string;
  navigate: string;
  save: string;
  web: string;
}

export function buildVenuePrimaryActions({
  hasInstagram,
  hasPhone,
  hasWebsite,
  isSaved,
  labels,
}: {
  hasInstagram: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  isSaved: boolean;
  labels: VenueActionLabels;
}): VenuePrimaryAction[] {
  return [
    { id: 'navigate', label: labels.navigate, emoji: '📍' },
    hasPhone ? { id: 'call', label: labels.call, emoji: '📞' } : null,
    hasWebsite ? { id: 'web', label: labels.web, emoji: '🌐' } : null,
    hasInstagram ? { id: 'instagram', label: labels.instagram, emoji: '📸' } : null,
    { id: 'save', label: labels.save, emoji: isSaved ? '❤️' : '🤍' },
  ].filter((action): action is VenuePrimaryAction => action !== null);
}

export function buildVenueDeliveryActions({
  hasGlovo,
  hasKorpa,
  labels,
}: {
  hasGlovo: boolean;
  hasKorpa: boolean;
  labels: Pick<VenueActionLabels, 'glovo' | 'korpa'>;
}): VenueDeliveryAction[] {
  return [
    hasKorpa ? { id: 'korpa', label: labels.korpa, emoji: '🛍' } : null,
    hasGlovo ? { id: 'glovo', label: labels.glovo, emoji: '🛍' } : null,
  ].filter((action): action is VenueDeliveryAction => action !== null);
}
