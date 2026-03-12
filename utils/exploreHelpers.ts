import { DailySpecial, Venue } from '@/utils/exploreScreen';

export function filterDailySpecialsByPrice(
  dailySpecials: DailySpecial[],
  menuPriceFilter: string | null
): DailySpecial[] {
  if (menuPriceFilter === 'up_to_8') {
    return dailySpecials.filter((special) => special.price <= 8);
  }

  if (menuPriceFilter === '8_to_12') {
    return dailySpecials.filter((special) => special.price > 8 && special.price <= 12);
  }

  if (menuPriceFilter === '12_plus') {
    return dailySpecials.filter((special) => special.price > 12);
  }

  return dailySpecials;
}

export function filterVenuesByClientRules(
  venues: Venue[],
  filterPriceLevel: number,
  filterOpenNow: boolean
): Venue[] {
  let filteredVenues = venues;

  if (filterPriceLevel < 4) {
    filteredVenues = filteredVenues.filter((venue) => venue.price_level <= filterPriceLevel);
  }

  if (filterOpenNow) {
    filteredVenues = filteredVenues.filter((venue) => isVenueOpenNow(venue.opening_hours));
  }

  return filteredVenues;
}

export function getPriceLevelDisplay(level: number): string {
  return '€'.repeat(level);
}

export function isVenueOpenNow(openingHours: any): boolean {
  if (!openingHours) {
    return false;
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todaySchedule = openingHours[dayOfWeek];

  if (!todaySchedule || todaySchedule.length === 0) {
    return false;
  }

  for (const period of todaySchedule) {
    const openParts = period.open.split(':');
    const closeParts = period.close.split(':');
    const openMinutes = parseInt(openParts[0], 10) * 60 + parseInt(openParts[1], 10);
    const closeMinutes = parseInt(closeParts[0], 10) * 60 + parseInt(closeParts[1], 10);

    if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
      return true;
    }
  }

  return false;
}

export function toggleSelection(selectedValues: string[], value: string): string[] {
  if (selectedValues.includes(value)) {
    return selectedValues.filter((selectedValue) => selectedValue !== value);
  }

  return [...selectedValues, value];
}

export function toggleSingleSelection(currentValue: string | null, value: string): string | null {
  if (currentValue === value) {
    return null;
  }

  return value;
}
