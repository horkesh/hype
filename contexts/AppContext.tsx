
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    // Tab labels
    home: 'Početna',
    explore: 'Istraži',
    tonight: 'Večeras',
    saved: 'Sačuvano',
    profile: 'Profil',
    
    // Common
    loading: 'Učitavanje...',
    error: 'Greška',
    retry: 'Pokušaj ponovo',
    free: 'Besplatan',
    from: 'od',
    
    // Home
    welcomeToHype: 'Dobrodošli u Hype',
    discoverSarajevo: 'Otkrijte najbolje od Sarajeva',
    
    // Hero cards
    morningHero: 'Savršen dan za brunch! 🍳',
    afternoonHero: 'Dnevni meni u blizini 🍽️',
    eveningHero: 'Šta radimo večeras? 🌆',
    nightHero: 'Kako si raspoložen/a? 🌙',
    exploreMoods: 'Istraži raspoloženja',
    findDailySpecials: 'Pronađi dnevne menije',
    
    // Moods
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
    
    // Coffee section
    whereForCoffee: 'Gdje na kafu?',
    letsGo: 'Hajmo!',
    tryAnother: 'Daj drugo',
    
    // Events
    tonightInSarajevo: 'Večeras u Sarajevu',
    upcomingEvents: 'Nadolazeći događaji',
    buyTicket: 'Kupi kartu',
    today: 'Danas',
    tomorrow: 'Sutra',
    
    // Settings
    settings: 'Postavke',
    language: 'Jezik',
    theme: 'Tema',
    auto: 'Automatski',
    light: 'Svijetla',
    dark: 'Tamna',
    bosnian: 'Bosanski',
    english: 'English',
    
    // Explore screen
    searchPlaceholder: 'Pretraži mjesta i događaje...',
    list: 'Lista',
    dailyMenu: 'Dnevni meni',
    filters: 'Filteri',
    applyFilters: 'Primijeni',
    openNow: 'Otvoreno sada',
    priceLevel: 'Cijena',
    categories: 'Kategorije',
    noResults: 'Nema rezultata',
    
    // Categories
    categoryRestaurants: 'Restorani',
    categoryBars: 'Barovi & Kafići',
    categoryClubs: 'Klubovi',
    categoryTheater: 'Pozorište',
    categoryCinema: 'Kino',
    categoryExhibitions: 'Izložbe',
    categoryConcerts: 'Koncerti',
    categoryFestivals: 'Festivali',
    
    // Daily menu filters
    menuUpTo8: 'do 8 KM',
    menu8to12: '8-12 KM',
    menu12Plus: '12+ KM',
    validUntil: 'Vrijedi do',
    
    // Tonight screen
    morning: 'Jutro',
    lunch: 'Ručak',
    evening: 'Večer',
    night: 'Noć',
    tonightLabel: 'Večeras!',
    tomorrowLabel: 'Sutra',
    noEventsInSegment: 'Nema događaja u ovom terminu',
    
    // Event detail
    eventDetails: 'Detalji događaja',
    venue: 'Mjesto',
    dateAndTime: 'Datum i vrijeme',
    price: 'Cijena',
    description: 'Opis',
    saveEvent: 'Sačuvaj',
    eventSaved: 'Događaj sačuvan',
    at: 'u',
  },
  en: {
    // Tab labels
    home: 'Home',
    explore: 'Explore',
    tonight: 'Tonight',
    saved: 'Saved',
    profile: 'Profile',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    free: 'Free',
    from: 'from',
    
    // Home
    welcomeToHype: 'Welcome to Hype',
    discoverSarajevo: 'Discover the best of Sarajevo',
    
    // Hero cards
    morningHero: 'Perfect day for brunch! 🍳',
    afternoonHero: 'Daily specials nearby 🍽️',
    eveningHero: 'What are we doing tonight? 🌆',
    nightHero: 'How are you feeling? 🌙',
    exploreMoods: 'Explore moods',
    findDailySpecials: 'Find daily specials',
    
    // Moods
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
    
    // Coffee section
    whereForCoffee: 'Where for coffee?',
    letsGo: 'Let\'s go!',
    tryAnother: 'Try another',
    
    // Events
    tonightInSarajevo: 'Tonight in Sarajevo',
    upcomingEvents: 'Upcoming Events',
    buyTicket: 'Buy Ticket',
    today: 'Today',
    tomorrow: 'Tomorrow',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    auto: 'Auto',
    light: 'Light',
    dark: 'Dark',
    bosnian: 'Bosanski',
    english: 'English',
    
    // Explore screen
    searchPlaceholder: 'Search venues and events...',
    list: 'List',
    dailyMenu: 'Daily Menu',
    filters: 'Filters',
    applyFilters: 'Apply',
    openNow: 'Open now',
    priceLevel: 'Price',
    categories: 'Categories',
    noResults: 'No results',
    
    // Categories
    categoryRestaurants: 'Restaurants',
    categoryBars: 'Bars & Cafés',
    categoryClubs: 'Clubs',
    categoryTheater: 'Theater',
    categoryCinema: 'Cinema',
    categoryExhibitions: 'Exhibitions',
    categoryConcerts: 'Concerts',
    categoryFestivals: 'Festivals',
    
    // Daily menu filters
    menuUpTo8: 'up to 8 KM',
    menu8to12: '8-12 KM',
    menu12Plus: '12+ KM',
    validUntil: 'Valid until',
    
    // Tonight screen
    morning: 'Morning',
    lunch: 'Lunch',
    evening: 'Evening',
    night: 'Night',
    tonightLabel: 'Tonight!',
    tomorrowLabel: 'Tomorrow',
    noEventsInSegment: 'No events in this time slot',
    
    // Event detail
    eventDetails: 'Event Details',
    venue: 'Venue',
    dateAndTime: 'Date & Time',
    price: 'Price',
    description: 'Description',
    saveEvent: 'Save',
    eventSaved: 'Event saved',
    at: 'at',
  },
};

// Storage helper that works on all platforms
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.log('Error reading from localStorage:', error);
        return null;
      }
    } else {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.log('Error reading from AsyncStorage:', error);
        return null;
      }
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.log('Error writing to localStorage:', error);
      }
    } else {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.log('Error writing to AsyncStorage:', error);
      }
    }
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bs');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPreferences();
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
    console.log('Setting language to:', lang);
    setLanguageState(lang);
    try {
      await storage.setItem('hype_language', lang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    console.log('Setting theme mode to:', mode);
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
