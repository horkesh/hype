/**
 * Centralized venue category → display label mapping.
 * All components should use getCategoryLabel() instead of displaying raw DB values.
 */

const CATEGORY_LABELS: Record<string, { bs: string; en: string }> = {
  restaurant:      { bs: 'Restoran',         en: 'Restaurant' },
  bar:             { bs: 'Bar',              en: 'Bar' },
  cafe:            { bs: 'Kafić',            en: 'Cafe' },
  club:            { bs: 'Klub',             en: 'Club' },
  pub:             { bs: 'Pub',              en: 'Pub' },
  bakery:          { bs: 'Pekara',           en: 'Bakery' },
  fast_food:       { bs: 'Brza hrana',       en: 'Fast Food' },
  hookah:          { bs: 'Nargila bar',      en: 'Hookah' },
  ice_cream:       { bs: 'Sladoled',         en: 'Ice Cream' },
  dessert:         { bs: 'Slastičarna',      en: 'Dessert' },
  cinema:          { bs: 'Kino',             en: 'Cinema' },
  theatre:         { bs: 'Pozorište',        en: 'Theater' },
  concert_hall:    { bs: 'Koncertna dvorana', en: 'Concert Hall' },
  museum:          { bs: 'Muzej',            en: 'Museum' },
  gallery:         { bs: 'Galerija',         en: 'Gallery' },
  cultural_center: { bs: 'Kulturni centar',  en: 'Cultural Center' },
  park:            { bs: 'Park',             en: 'Park' },
  outdoor:         { bs: 'Na otvorenom',     en: 'Outdoor' },
  landmark:        { bs: 'Znamenitost',      en: 'Landmark' },
  spa:             { bs: 'Spa',              en: 'Spa' },
};

/**
 * Convert a raw DB category value to a localized display label.
 * Falls back to uppercased, underscore-stripped raw value if unknown.
 */
export function getCategoryLabel(category: string, language: 'bs' | 'en' = 'bs'): string {
  const entry = CATEGORY_LABELS[category.toLowerCase()];
  if (entry) return entry[language];
  // Fallback: "concert_hall" → "Concert Hall"
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
