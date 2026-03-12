import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'bs' | 'en';
type ThemeMode = 'auto' | 'light' | 'dark';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations = {
  bs: {
    home: 'Po\u010detna',
    explore: 'Istra\u017ei',
    tonight: 'Ve\u010deras',
    saved: 'Sa\u010duvano',
    profile: 'Profil',
    loading: 'U\u010ditavanje...',
    error: 'Gre\u0161ka',
    retry: 'Poku\u0161aj ponovo',
    free: 'Besplatan',
    from: 'od',
    welcomeToHype: 'Dobrodo\u0161li u Hype',
    discoverSarajevo: 'Otkrijte najbolje od Sarajeva',
    morningHero: 'Savr\u0161en dan za brunch! \u{1F373}',
    afternoonHero: 'Dnevni meni u blizini \u{1F37D}',
    eveningHero: '\u0160ta radimo ve\u010deras? \u{1F306}',
    nightHero: 'Kako si raspolo\u017een/a? \u{1F319}',
    exploreMoods: 'Istra\u017ei raspolo\u017eenja',
    findDailySpecials: 'Prona\u0111i dnevne menije',
    moodParty: 'Party',
    moodChill: 'Chill',
    moodGirlsNight: 'Girls Night',
    moodDateNight: 'Date Night',
    moodMusic: 'Muzika',
    moodRomance: 'Romantika',
    moodCulture: 'Kultura',
    moodFoodie: 'Foodie',
    moodBrunch: 'Brunch',
    moodAfterWork: 'After Work',
    moodOutdoor: 'Outdoor',
    moodTourist: 'Turista',
    whereForCoffee: 'Gdje na kafu?',
    letsGo: 'Hajmo!',
    tryAnother: 'Daj drugo',
    tonightInSarajevo: 'Ve\u010deras u Sarajevu',
    upcomingEvents: 'Nadolaze\u0107i doga\u0111aji',
    buyTicket: 'Kupi kartu',
    today: 'Danas',
    tomorrow: 'Sutra',
    settings: 'Postavke',
    language: 'Jezik',
    theme: 'Tema',
    auto: 'Automatski',
    light: 'Svijetla',
    dark: 'Tamna',
    bosnian: 'Bosanski',
    english: 'English',
    searchPlaceholder: 'Pretra\u017ei mjesta i doga\u0111aje...',
    list: 'Lista',
    dailyMenu: 'Dnevni meni',
    filters: 'Filteri',
    applyFilters: 'Primijeni',
    openNow: 'Otvoreno sada',
    priceLevel: 'Cijena',
    categories: 'Kategorije',
    noResults: 'Nema rezultata',
    categoryRestaurants: 'Restorani',
    categoryBars: 'Barovi & Kafi\u0107i',
    categoryClubs: 'Klubovi',
    categoryTheater: 'Pozori\u0161te',
    categoryCinema: 'Kino',
    categoryExhibitions: 'Izlo\u017ebe',
    categoryConcerts: 'Koncerti',
    categoryFestivals: 'Festivali',
    menuUpTo8: 'do 8 KM',
    menu8to12: '8-12 KM',
    menu12Plus: '12+ KM',
    validUntil: 'Vrijedi do',
    morning: 'Jutro',
    lunch: 'Ru\u010dak',
    evening: 'Ve\u010der',
    night: 'No\u0107',
    tonightLabel: 'Ve\u010deras!',
    tomorrowLabel: 'Sutra',
    noEventsInSegment: 'Nema doga\u0111aja u ovom terminu',
    eventDetails: 'Detalji doga\u0111aja',
    venue: 'Mjesto',
    dateAndTime: 'Datum i vrijeme',
    price: 'Cijena',
    description: 'Opis',
    saveEvent: 'Sa\u010duvaj',
    eventSaved: 'Doga\u0111aj sa\u010duvan',
    at: 'u',
  },
  en: {
    home: 'Home',
    explore: 'Explore',
    tonight: 'Tonight',
    saved: 'Saved',
    profile: 'Profile',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    free: 'Free',
    from: 'from',
    welcomeToHype: 'Welcome to Hype',
    discoverSarajevo: 'Discover the best of Sarajevo',
    morningHero: 'Perfect day for brunch! \u{1F373}',
    afternoonHero: 'Daily specials nearby \u{1F37D}',
    eveningHero: 'What are we doing tonight? \u{1F306}',
    nightHero: 'How are you feeling? \u{1F319}',
    exploreMoods: 'Explore moods',
    findDailySpecials: 'Find daily specials',
    moodParty: 'Party',
    moodChill: 'Chill',
    moodGirlsNight: 'Girls Night',
    moodDateNight: 'Date Night',
    moodMusic: 'Music',
    moodRomance: 'Romance',
    moodCulture: 'Culture',
    moodFoodie: 'Foodie',
    moodBrunch: 'Brunch',
    moodAfterWork: 'After Work',
    moodOutdoor: 'Outdoor',
    moodTourist: 'Tourist',
    whereForCoffee: 'Where for coffee?',
    letsGo: "Let's go!",
    tryAnother: 'Try another',
    tonightInSarajevo: 'Tonight in Sarajevo',
    upcomingEvents: 'Upcoming Events',
    buyTicket: 'Buy Ticket',
    today: 'Today',
    tomorrow: 'Tomorrow',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    auto: 'Auto',
    light: 'Light',
    dark: 'Dark',
    bosnian: 'Bosanski',
    english: 'English',
    searchPlaceholder: 'Search venues and events...',
    list: 'List',
    dailyMenu: 'Daily Menu',
    filters: 'Filters',
    applyFilters: 'Apply',
    openNow: 'Open now',
    priceLevel: 'Price',
    categories: 'Categories',
    noResults: 'No results',
    categoryRestaurants: 'Restaurants',
    categoryBars: 'Bars & Cafes',
    categoryClubs: 'Clubs',
    categoryTheater: 'Theater',
    categoryCinema: 'Cinema',
    categoryExhibitions: 'Exhibitions',
    categoryConcerts: 'Concerts',
    categoryFestivals: 'Festivals',
    menuUpTo8: 'up to 8 KM',
    menu8to12: '8-12 KM',
    menu12Plus: '12+ KM',
    validUntil: 'Valid until',
    morning: 'Morning',
    lunch: 'Lunch',
    evening: 'Evening',
    night: 'Night',
    tonightLabel: 'Tonight!',
    tomorrowLabel: 'Tomorrow',
    noEventsInSegment: 'No events in this time slot',
    eventDetails: 'Event Details',
    venue: 'Venue',
    dateAndTime: 'Date & Time',
    price: 'Price',
    description: 'Description',
    saveEvent: 'Save',
    eventSaved: 'Event saved',
    at: 'at',
  },
} as const;

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.log('Error reading from localStorage:', error);
        return null;
      }
    }

    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.log('Error reading from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.log('Error writing to localStorage:', error);
      }
      return;
    }

    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log('Error writing to AsyncStorage:', error);
    }
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bs');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    void loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedLanguage = await storage.getItem('hype_language');
      const savedTheme = await storage.getItem('hype_theme');

      if (savedLanguage) {
        setLanguageState(savedLanguage as Language);
      }

      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await storage.setItem('hype_language', lang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await storage.setItem('hype_theme', mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations.bs];
    return translation || key;
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AppContext.Provider value={{ language, setLanguage, themeMode, setThemeMode, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
