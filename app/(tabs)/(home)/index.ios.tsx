
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from '@/components/IconSymbol';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ImageSourcePropType,
} from 'react-native';
import { MoodChip } from '@/components/MoodChip';
import { AnimatedCard } from '@/components/AnimatedCard';
import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SkeletonList } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { CilimPattern } from '@/components/CilimPattern';

interface Venue {
  id: string;
  name: string;
  cover_image_url: string | null;
  neighborhood: string | null;
  description_bs: string | null;
  description_en: string | null;
}

interface Event {
  id: string;
  title_bs: string;
  title_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  venue_id: string | null;
  moods: string[];
  price_bam: number | null;
  ticket_url: string | null;
  series_id: string | null;
  event_series?: {
    id: string;
    name_bs: string;
    name_en: string;
  } | null;
  venues?: {
    name: string;
  } | null;
  location_name: string | null;
}

interface EventSeries {
  id: string;
  name_bs: string;
  name_en: string;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
}

const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPENWEATHER_API_KEY =
  Constants.expoConfig?.extra?.openWeatherApiKey ??
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ??
  '';

const MOODS = [
  { id: 'party', emoji: '🎉', label_bs: 'Party', label_en: 'Party' },
  { id: 'chill', emoji: '😌', label_bs: 'Chill', label_en: 'Chill' },
  { id: 'girls_night', emoji: '👯', label_bs: 'Girls Night', label_en: 'Girls Night' },
  { id: 'date_night', emoji: '💑', label_bs: 'Date Night', label_en: 'Date Night' },
  { id: 'muzika', emoji: '🎵', label_bs: 'Muzika', label_en: 'Music' },
  { id: 'romantika', emoji: '💕', label_bs: 'Romantika', label_en: 'Romance' },
  { id: 'kultura', emoji: '🎭', label_bs: 'Kultura', label_en: 'Culture' },
  { id: 'foodie', emoji: '🍽️', label_bs: 'Foodie', label_en: 'Foodie' },
  { id: 'brunch', emoji: '🥐', label_bs: 'Brunch', label_en: 'Brunch' },
  { id: 'after_work', emoji: '🍻', label_bs: 'After Work', label_en: 'After Work' },
  { id: 'outdoor', emoji: '🌳', label_bs: 'Outdoor', label_en: 'Outdoor' },
  { id: 'turista', emoji: '📸', label_bs: 'Turista', label_en: 'Tourist' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 180,
  },
  heroGradient: {
    padding: 24,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    fontFamily: 'DMSans_400Regular',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  moodsContainer: {
    paddingHorizontal: 20,
  },
  moodsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cafeCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cafeImage: {
    width: '100%',
    height: 200,
  },
  cafeContent: {
    padding: 16,
  },
  cafeName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'DMSans_700Bold',
  },
  cafeNeighborhood: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'DMSans_400Regular',
  },
  cafeDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'DMSans_400Regular',
  },
  eventsScroll: {
    paddingLeft: 20,
  },
  eventCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 14,
    marginLeft: 4,
    fontFamily: 'DMSans_400Regular',
  },
  seriesCard: {
    width: 300,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  seriesImage: {
    width: '100%',
    height: 180,
  },
  seriesContent: {
    padding: 16,
  },
  seriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
  },
  seriesCountdown: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
});

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { language, setLanguage } = useApp();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [heroMessage, setHeroMessage] = useState('');
  const [randomCafe, setRandomCafe] = useState<Venue | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [eventSeries, setEventSeries] = useState<EventSeries[]>([]);

  const loadRandomCafe = useCallback(async () => {
    console.log('Home: Loading random cafe');
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('category', 'cafe')
      .limit(10);

    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      setRandomCafe(data[randomIndex]);
    }
  }, []);

  const loadUpcomingEvents = useCallback(async () => {
    console.log('Home: Loading upcoming events');
    let query = supabase
      .from('events')
      .select('*, venues(name), event_series(id, name_bs, name_en)')
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
      .limit(10);

    if (selectedMood) {
      query = query.contains('moods', [selectedMood]);
    }

    const { data, error } = await query;

    if (data) {
      setUpcomingEvents(data);
    }
  }, [selectedMood]);

  const loadEventSeries = useCallback(async () => {
    console.log('Home: Loading event series');
    const { data, error } = await supabase
      .from('event_series')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(5);

    if (data) {
      setEventSeries(data);
    }
  }, []);

  const getTimeOfDayHero = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return language === 'bs' ? 'Dobro jutro, Sarajevo! ☕' : 'Good morning, Sarajevo! ☕';
    } else if (hour < 18) {
      return language === 'bs' ? 'Dobar dan! Šta radiš danas? 🌞' : 'Good afternoon! What are you up to? 🌞';
    } else {
      return language === 'bs' ? 'Dobro veče! Vrijeme je za izlazak 🌙' : 'Good evening! Time to go out 🌙';
    }
  }, [language]);

  const loadData = useCallback(async () => {
    console.log('Home: Loading static home data');
    try {
      await Promise.all([
        loadRandomCafe(),
        loadEventSeries(),
      ]);
    } catch (error) {
      console.log('Home: Error loading static home data', error);
    }
  }, [loadRandomCafe, loadEventSeries]);

  const fetchWeather = useCallback(async () => {
    console.log('Home: Fetching weather');
    try {
      if (!OPENWEATHER_API_KEY) {
        setHeroMessage(getTimeOfDayHero());
        return;
      }

      const response = await fetch(
        `${OPENWEATHER_API_URL}?lat=43.8563&lon=18.4131&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const data = await response.json();

      const weatherCondition = data.weather[0].main.toLowerCase();
      const temp = Math.round(data.main.temp);

      let message = '';
      let suggestedMood = null;

      if (weatherCondition.includes('clear') && temp > 20) {
        message = language === 'bs' ? 'Savršen dan za baštu! ☀️' : 'Perfect day for outdoor! ☀️';
        suggestedMood = 'outdoor';
      } else if (weatherCondition.includes('rain')) {
        message = language === 'bs' ? 'Kišovito vrijeme — idealno za kafić 🌧️' : 'Rainy weather — perfect for a café 🌧️';
        suggestedMood = 'chill';
      } else if (temp < 10) {
        message = language === 'bs' ? 'Hladno je — vrijeme za topli napitak ☕' : 'Cold outside — time for a warm drink ☕';
        suggestedMood = 'chill';
      } else {
        message = getTimeOfDayHero();
      }

      setHeroMessage(message);
      if (suggestedMood && suggestedMood !== selectedMood) {
        setSelectedMood(suggestedMood);
      }
    } catch (error) {
      console.log('Home: Weather fetch failed, using time-based message', error);
      setHeroMessage(getTimeOfDayHero());
    }
  }, [language, getTimeOfDayHero, selectedMood]);

  useEffect(() => {
    const initializeHome = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadData(),
          fetchWeather(),
        ]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    initializeHome();
  }, [language, loadData, fetchWeather]);

  useEffect(() => {
    const refreshEvents = async () => {
      setLoading(true);
      try {
        await loadUpcomingEvents();
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    refreshEvents();
  }, [loadUpcomingEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    const refreshHome = async () => {
      try {
        await Promise.all([
          loadData(),
          fetchWeather(),
          loadUpcomingEvents(),
        ]);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    };

    refreshHome();
  }, [loadData, fetchWeather, loadUpcomingEvents]);

  function toggleLanguage() {
    console.log('Home: Toggling language');
    setLanguage(language === 'bs' ? 'en' : 'bs');
  }

  function formatEventDate(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return language === 'bs' ? 'Danas' : 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return language === 'bs' ? 'Sutra' : 'Tomorrow';
    } else {
      return date.toLocaleDateString(language === 'bs' ? 'bs-BA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  function getSeriesCountdown(startDate: string, endDate: string) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysText = language === 'bs' ? 'dana' : 'days';
      return `${language === 'bs' ? 'Počinje za' : 'Starts in'} ${daysUntil} ${daysText}`;
    } else if (now >= start && now <= end) {
      return language === 'bs' ? '🔥 Aktivno sada' : '🔥 Active now';
    } else {
      return language === 'bs' ? 'Završeno' : 'Ended';
    }
  }

  function handleSeriesTap(seriesId: string) {
    console.log('Home: Navigating to series', seriesId);
    router.push(`/series/${seriesId}`);
  }

  function handleEventTap(eventId: string) {
    console.log('Home: Navigating to event', eventId);
    router.push(`/event/${eventId}`);
  }

  function handleVenueTap(venueId: string) {
    console.log('Home: Navigating to venue', venueId);
    router.push(`/venue/${venueId}`);
  }

  const heroTitle = heroMessage || getTimeOfDayHero();
  const heroSubtitleText = language === 'bs'
    ? 'Otkrijte najbolje što Sarajevo nudi danas'
    : 'Discover the best Sarajevo has to offer today';

  const moodsSectionTitle = language === 'bs' ? 'Kako se osjećaš?' : 'How are you feeling?';
  const cafesSectionTitle = language === 'bs' ? 'Kafić dana' : 'Café of the day';
  const eventsSectionTitle = language === 'bs' ? 'Nadolazeći događaji' : 'Upcoming events';
  const seriesSectionTitle = language === 'bs' ? 'Festivali & Serijali' : 'Festivals & Series';
  const seeAllText = language === 'bs' ? 'Vidi sve' : 'See all';

  const emptyEventsMessage = language === 'bs'
    ? 'Ništa za danas — ali sutra je novi dan! 🌅'
    : 'Nothing for today — but tomorrow is a new day! 🌅';

  const langButtonText = language === 'bs' ? 'EN' : 'BS';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <Text style={[styles.logo, { color: colors.accent }]}>Hype</Text>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={[styles.langButton, { backgroundColor: colors.card }]}
              onPress={toggleLanguage}
            >
              <Text style={[styles.langText, { color: colors.text }]}>
                {langButtonText}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <CilimPattern />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          <View style={styles.heroSection}>
            <AnimatedCard style={styles.heroCard}>
              <LinearGradient
                colors={['#D4A056', '#B8894A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <Text style={styles.heroTitle}>{heroTitle}</Text>
                <Text style={styles.heroSubtitle}>{heroSubtitleText}</Text>
              </LinearGradient>
            </AnimatedCard>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {moodsSectionTitle}
              </Text>
            </View>
            <View style={styles.moodsContainer}>
              <View style={styles.moodsScroll}>
                {MOODS.map((mood, index) => {
                  const moodLabel = language === 'bs' ? mood.label_bs : mood.label_en;
                  const isSelected = selectedMood === mood.id;
                  return (
                    <React.Fragment key={index}>
                      <MoodChip
                        emoji={mood.emoji}
                        label={moodLabel}
                        isSelected={isSelected}
                        onPress={() => setSelectedMood(isSelected ? null : mood.id)}
                        moodId={mood.id}
                      />
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          </View>

          {randomCafe && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {cafesSectionTitle}
                </Text>
              </View>
              <AnimatedCard delay={100}>
                <TouchableOpacity
                  style={[styles.cafeCard, { backgroundColor: colors.card }]}
                  onPress={() => handleVenueTap(randomCafe.id)}
                  activeOpacity={0.8}
                >
                  <ImageWithPlaceholder
                    source={randomCafe.cover_image_url}
                    style={styles.cafeImage}
                    categoryEmoji="☕"
                    borderRadius={0}
                  />
                  <View style={styles.cafeContent}>
                    <Text style={[styles.cafeName, { color: colors.text }]}>
                      {randomCafe.name}
                    </Text>
                    {randomCafe.neighborhood && (
                      <Text style={[styles.cafeNeighborhood, { color: colors.textSecondary }]}>
                        {randomCafe.neighborhood}
                      </Text>
                    )}
                    {randomCafe.description_bs && (
                      <Text
                        style={[styles.cafeDescription, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {language === 'bs' ? randomCafe.description_bs : randomCafe.description_en}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </AnimatedCard>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {eventsSectionTitle}
              </Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push('/(tabs)/tonight')}
              >
                <Text style={[styles.seeAllText, { color: colors.accent }]}>
                  {seeAllText}
                </Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={{ paddingHorizontal: 20 }}>
                <SkeletonList count={1} />
              </View>
            ) : upcomingEvents.length === 0 ? (
              <EmptyState emoji="🌅" message={emptyEventsMessage} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventsScroll}
              >
                {upcomingEvents.map((event, index) => {
                  const eventTitle = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
                  const eventDate = formatEventDate(event.start_datetime);
                  const venueName = event.venues?.name || event.location_name || '';
                  const priceText = event.price_bam
                    ? `${event.price_bam} KM`
                    : (language === 'bs' ? 'Besplatno' : 'Free');

                  return (
                    <React.Fragment key={index}>
                      <AnimatedCard delay={index * 50}>
                        <TouchableOpacity
                          style={[styles.eventCard, { backgroundColor: colors.card }]}
                          onPress={() => handleEventTap(event.id)}
                          activeOpacity={0.8}
                        >
                          <ImageWithPlaceholder
                            source={event.cover_image_url}
                            style={styles.eventImage}
                            categoryEmoji="🎉"
                            borderRadius={0}
                          />
                          <View style={styles.eventContent}>
                            <Text
                              style={[styles.eventTitle, { color: colors.text }]}
                              numberOfLines={2}
                            >
                              {eventTitle}
                            </Text>
                            <View style={styles.eventDetails}>
                              <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                                {eventDate}
                              </Text>
                            </View>
                            {venueName && (
                              <View style={styles.eventDetails}>
                                <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                                  {venueName}
                                </Text>
                              </View>
                            )}
                            <View style={styles.eventDetails}>
                              <Text style={[styles.eventDetailText, { color: colors.accent }]}>
                                {priceText}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </AnimatedCard>
                    </React.Fragment>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {eventSeries.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {seriesSectionTitle}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventsScroll}
              >
                {eventSeries.map((series, index) => {
                  const seriesName = language === 'bs' ? series.name_bs : series.name_en;
                  const countdown = getSeriesCountdown(series.start_date, series.end_date);

                  return (
                    <React.Fragment key={index}>
                      <AnimatedCard delay={index * 50}>
                        <TouchableOpacity
                          style={[styles.seriesCard, { backgroundColor: colors.card }]}
                          onPress={() => handleSeriesTap(series.id)}
                          activeOpacity={0.8}
                        >
                          <ImageWithPlaceholder
                            source={series.cover_image_url}
                            style={styles.seriesImage}
                            categoryEmoji="🎭"
                            borderRadius={0}
                          />
                          <View style={styles.seriesContent}>
                            <Text
                              style={[styles.seriesTitle, { color: colors.text }]}
                              numberOfLines={2}
                            >
                              {seriesName}
                            </Text>
                            <Text style={[styles.seriesCountdown, { color: colors.accent }]}>
                              {countdown}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </AnimatedCard>
                    </React.Fragment>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
