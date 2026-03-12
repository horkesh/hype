import { supabase } from '@/integrations/supabase/client';
import { normalizeDailySpecialRows, normalizeVenueRows } from '@/utils/dataAdapters';
import { filterDailySpecialsByPrice, filterVenuesByClientRules } from '@/utils/exploreHelpers';
import { DailySpecial, SearchResult, Venue } from '@/utils/exploreScreen';

interface LoadExploreVenuesOptions {
  filterCategories: string[];
  filterMoods: string[];
  filterOpenNow: boolean;
  filterPriceLevel: number;
  language: string;
  selectedCategory: string | null;
  selectedMoods: string[];
}

interface LoadExploreDailySpecialsOptions {
  language: string;
  menuPriceFilter: string | null;
}

function getActiveCategories(
  filterCategories: string[],
  selectedCategory: string | null
): string[] {
  if (filterCategories.length > 0) {
    return filterCategories;
  }

  if (selectedCategory) {
    return [selectedCategory];
  }

  return [];
}

function getActiveMoods(filterMoods: string[], selectedMoods: string[]): string[] {
  if (filterMoods.length > 0) {
    return filterMoods;
  }

  return selectedMoods;
}

async function fillMissingVenueNames(dailySpecials: DailySpecial[]): Promise<DailySpecial[]> {
  const missingVenueIds = Array.from(
    new Set(
      dailySpecials
        .filter((special) => !special.venue_name && special.venue_id)
        .map((special) => special.venue_id as string)
    )
  );

  if (missingVenueIds.length === 0) {
    return dailySpecials;
  }

  const { data: venueData, error: venueError } = await supabase
    .from('venues')
    .select('id, name')
    .in('id', missingVenueIds);

  if (venueError) {
    console.error('Error loading venue names for daily specials:', venueError);
    return dailySpecials;
  }

  const venueNames = new Map((venueData || []).map((venue) => [venue.id, venue.name]));

  return dailySpecials.map((special) => ({
    ...special,
    venue_name: special.venue_name || (special.venue_id ? venueNames.get(special.venue_id) || '' : ''),
  }));
}

export async function searchExplore(query: string, language: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  const { data: venueData, error: venueError } = await supabase
    .from('venues')
    .select('id, name')
    .ilike('name', `%${query}%`)
    .limit(5);

  if (venueError) {
    console.error('Error searching venues:', venueError);
  } else if (venueData) {
    venueData.forEach((venue) => {
      results.push({ id: venue.id, name: venue.name, type: 'venue' });
    });
  }

  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('id, title_bs, title_en')
    .or(`title_bs.ilike.%${query}%,title_en.ilike.%${query}%`)
    .limit(5);

  if (eventError) {
    console.error('Error searching events:', eventError);
  } else if (eventData) {
    eventData.forEach((event) => {
      const title = language === 'bs' ? event.title_bs : event.title_en || event.title_bs;
      results.push({ id: event.id, name: title, type: 'event' });
    });
  }

  return results;
}

export async function loadExploreVenues(options: LoadExploreVenuesOptions): Promise<Venue[]> {
  const {
    filterCategories,
    filterMoods,
    filterOpenNow,
    filterPriceLevel,
    language,
    selectedCategory,
    selectedMoods,
  } = options;

  let query = supabase.from('venues').select('*');
  const activeMoods = getActiveMoods(filterMoods, selectedMoods);
  const activeCategories = getActiveCategories(filterCategories, selectedCategory);

  if (activeMoods.length > 0) {
    query = query.contains('moods', activeMoods);
  }

  if (activeCategories.length > 0) {
    query = query.in('category', activeCategories);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading venues:', error);
    return [];
  }

  const normalizedVenues = normalizeVenueRows(data, language);
  return filterVenuesByClientRules(normalizedVenues, filterPriceLevel, filterOpenNow);
}

export async function loadExploreDailySpecials(
  options: LoadExploreDailySpecialsOptions
): Promise<DailySpecial[]> {
  const { language, menuPriceFilter } = options;

  const { data, error } = await supabase
    .from('daily_specials')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error loading daily specials:', error);
    return [];
  }

  let normalizedDailySpecials = normalizeDailySpecialRows(data, language);
  normalizedDailySpecials = await fillMissingVenueNames(normalizedDailySpecials);
  normalizedDailySpecials = [...normalizedDailySpecials].sort((a, b) => a.price - b.price);

  return filterDailySpecialsByPrice(normalizedDailySpecials, menuPriceFilter);
}
