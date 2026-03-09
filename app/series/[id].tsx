
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Linking,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EventSeries {
  id: string;
  name_bs: string;
  name_en: string;
  description_bs: string | null;
  description_en: string | null;
  start_date: string;
  end_date: string;
  category: string;
  cover_image_url: string | null;
  website_url: string | null;
  ticket_url: string | null;
  is_active: boolean;
}

interface Event {
  id: string;
  title_bs: string;
  title_en: string | null;
  start_datetime: string;
  price_bam: number | null;
  ticket_url: string | null;
  moods: string[];
  venues?: {
    name: string;
  } | null;
  location_name: string | null;
}

const MOODS: { [key: string]: string } = {
  party: '🎉',
  chill: '😎',
  girls_night: '💃',
  date_night: '💑',
  music: '🎵',
  romance: '🍷',
  culture: '🎭',
  foodie: '🍽️',
  brunch: '🍳',
  after_work: '🍻',
  outdoor: '🌿',
  tourist: '🧳',
};

const CATEGORY_EMOJI: { [key: string]: string } = {
  music: '🎵',
  food: '🍽️',
  culture: '🎭',
  sport: '⚽',
  nightlife: '🌙',
  art: '🎨',
  film: '🎬',
  theatre: '🎭',
  festival: '🎪',
  market: '🛍️',
  workshop: '🔨',
  charity: '❤️',
  other: '📅',
};

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t, language } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const [series, setSeries] = useState<EventSeries | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const loadSeriesData = async () => {
    console.log('Loading series data for ID:', id);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('event_series')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading series:', error);
      } else {
        console.log('Series loaded:', data);
        setSeries(data);
      }
    } catch (error) {
      console.error('Error in loadSeriesData:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeriesEvents = async () => {
    console.log('Loading events for series:', id);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title_bs, title_en, start_datetime, price_bam, ticket_url, moods, venues(name), location_name')
        .eq('series_id', id)
        .eq('is_active', true)
        .order('start_datetime', { ascending: true });

      if (error) {
        console.error('Error loading series events:', error);
      } else {
        console.log('Series events loaded:', data?.length || 0);
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error in loadSeriesEvents:', error);
    }
  };

  const checkIfSaved = async () => {
    try {
      const savedSeriesJson = await AsyncStorage.getItem('savedSeries');
      const savedSeries = savedSeriesJson ? JSON.parse(savedSeriesJson) : [];
      const isSeriesSaved = savedSeries.includes(id);
      setIsSaved(isSeriesSaved);
    } catch (error) {
      console.error('Error checking if series is saved:', error);
    }
  };

  const toggleSave = async () => {
    console.log('Toggling save for series:', id);
    try {
      const savedSeriesJson = await AsyncStorage.getItem('savedSeries');
      const savedSeries = savedSeriesJson ? JSON.parse(savedSeriesJson) : [];

      if (isSaved) {
        const updatedSeries = savedSeries.filter((seriesId: string) => seriesId !== id);
        await AsyncStorage.setItem('savedSeries', JSON.stringify(updatedSeries));
        setIsSaved(false);
        console.log('Series removed from saved');
      } else {
        savedSeries.push(id);
        await AsyncStorage.setItem('savedSeries', JSON.stringify(savedSeries));
        setIsSaved(true);
        console.log('Series added to saved');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const getCountdownStatus = () => {
    if (!series) return '';

    const now = new Date();
    const start = new Date(series.start_date);
    const end = new Date(series.end_date);

    if (now < start) {
      const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysText = language === 'bs' ? 'dana' : 'days';
      const startsText = language === 'bs' ? 'Počinje za' : 'Starts in';
      return `${startsText} ${diffDays} ${daysText}`;
    } else if (now >= start && now <= end) {
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysText = language === 'bs' ? 'dana' : 'days';
      const ongoingText = language === 'bs' ? 'U toku — još' : 'Ongoing — ';
      return `${ongoingText} ${diffDays} ${daysText}`;
    } else {
      return language === 'bs' ? 'Završeno' : 'Ended';
    }
  };

  const formatDateRange = () => {
    if (!series) return '';

    const start = new Date(series.start_date);
    const end = new Date(series.end_date);

    const startDay = start.getDate();
    const endDay = end.getDate();
    const monthNames = language === 'bs' 
      ? ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[start.getMonth()];
    const year = start.getFullYear();

    return `${startDay}. — ${endDay}. ${month} ${year}`;
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = language === 'bs'
      ? ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = language === 'bs'
      ? ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];

    return `${dayName}, ${day}. ${month}`;
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const groupEventsByDate = () => {
    const grouped: { [key: string]: Event[] } = {};
    
    events.forEach(event => {
      const dateKey = formatEventDate(event.start_datetime);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  };

  const handleEventTap = (eventId: string) => {
    console.log('Navigating to event:', eventId);
    router.push(`/event/${eventId}`);
  };

  const handleWebsitePress = () => {
    if (series?.website_url) {
      console.log('Opening website:', series.website_url);
      Linking.openURL(series.website_url);
    }
  };

  const handleTicketPress = () => {
    if (series?.ticket_url) {
      console.log('Opening ticket URL:', series.ticket_url);
      Linking.openURL(series.ticket_url);
    }
  };

  useEffect(() => {
    if (id) {
      loadSeriesData();
      loadSeriesEvents();
      checkIfSaved();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: t('loading'), headerShown: true }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color="#D4A056" />
        </View>
      </>
    );
  }

  if (!series) {
    return (
      <>
        <Stack.Screen options={{ title: t('error'), headerShown: true }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {t('error')}
          </Text>
        </View>
      </>
    );
  }

  const seriesName = language === 'bs' ? series.name_bs : (series.name_en || series.name_bs);
  const seriesDescription = language === 'bs' ? series.description_bs : (series.description_en || series.description_bs);
  const categoryEmoji = CATEGORY_EMOJI[series.category] || '🎪';
  const dateRange = formatDateRange();
  const countdownStatus = getCountdownStatus();
  const groupedEvents = groupEventsByDate();

  return (
    <>
      <Stack.Screen options={{ title: seriesName, headerShown: true }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {series.cover_image_url ? (
          <Image
            source={resolveImageSource(series.cover_image_url)}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#D4A056', '#B8894A']}
            style={styles.coverImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {seriesName}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.dateRange, { color: colors.textSecondary }]}>
              {dateRange}
            </Text>
          </View>

          <View style={[styles.categoryBadge, { backgroundColor: colors.card }]}>
            <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
            <Text style={[styles.categoryText, { color: colors.text }]}>
              {series.category}
            </Text>
          </View>

          <View style={[styles.countdownBadge, { backgroundColor: '#D4A056' }]}>
            <Text style={styles.countdownText}>
              {countdownStatus}
            </Text>
          </View>

          {seriesDescription && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {seriesDescription}
              </Text>
            </View>
          )}

          <View style={styles.linksRow}>
            {series.website_url && (
              <TouchableOpacity
                style={[styles.linkButton, { backgroundColor: colors.card, borderColor: colors.accent }]}
                onPress={handleWebsitePress}
              >
                <Text style={[styles.linkButtonText, { color: colors.accent }]}>
                  🌐 {language === 'bs' ? 'Web' : 'Website'}
                </Text>
              </TouchableOpacity>
            )}

            {series.ticket_url && (
              <TouchableOpacity
                style={[styles.linkButton, { backgroundColor: colors.accent }]}
                onPress={handleTicketPress}
              >
                <Text style={styles.linkButtonTextWhite}>
                  🎟️ {language === 'bs' ? 'Karte' : 'Tickets'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isSaved ? '#10B981' : colors.card }]}
            onPress={toggleSave}
          >
            <Text style={[styles.saveButtonText, { color: isSaved ? '#FFFFFF' : colors.text }]}>
              ❤️ {isSaved ? (language === 'bs' ? 'Serija sačuvana' : 'Series saved') : (language === 'bs' ? 'Sačuvaj seriju' : 'Save series')}
            </Text>
          </TouchableOpacity>

          {events.length > 0 && (
            <View style={styles.eventsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {language === 'bs' ? 'Događaji' : 'Events'}
              </Text>

              {Object.entries(groupedEvents).map(([dateHeader, dateEvents]) => (
                <View key={dateHeader} style={styles.dateGroup}>
                  <Text style={[styles.dateHeader, { color: colors.text }]}>
                    {dateHeader}
                  </Text>

                  {dateEvents.map((event) => {
                    const eventTitle = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
                    const venueName = event.venues?.name || event.location_name || '';
                    const eventTime = formatEventTime(event.start_datetime);
                    const isFree = !event.price_bam || event.price_bam === 0;

                    return (
                      <TouchableOpacity
                        key={event.id}
                        style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => handleEventTap(event.id)}
                      >
                        <View style={styles.eventTimeColumn}>
                          <Text style={[styles.eventTime, { color: colors.accent }]}>
                            {eventTime}
                          </Text>
                        </View>

                        <View style={styles.eventContent}>
                          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
                            {eventTitle}
                          </Text>
                          <Text style={[styles.eventVenue, { color: colors.textSecondary }]} numberOfLines={1}>
                            {venueName}
                          </Text>

                          {event.moods && event.moods.length > 0 && (
                            <View style={styles.eventMoodBadges}>
                              {event.moods.slice(0, 3).map((mood, idx) => {
                                const moodEmoji = MOODS[mood] || '✨';
                                return (
                                  <View key={idx} style={[styles.eventMoodBadge, { backgroundColor: colors.background }]}>
                                    <Text style={styles.eventMoodBadgeText}>{moodEmoji}</Text>
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </View>

                        {event.ticket_url && (
                          <TouchableOpacity
                            style={[styles.eventTicketButton, { backgroundColor: colors.accent }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              console.log('Opening ticket URL:', event.ticket_url);
                              Linking.openURL(event.ticket_url!);
                            }}
                          >
                            <Text style={styles.eventTicketButtonText}>
                              {language === 'bs' ? 'Karta' : 'Ticket'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metaRow: {
    marginBottom: 16,
  },
  dateRange: {
    fontSize: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  countdownBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  linksRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  linkButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkButtonTextWhite: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  eventTimeColumn: {
    marginRight: 12,
    minWidth: 50,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 14,
    marginBottom: 6,
  },
  eventMoodBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  eventMoodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  eventMoodBadgeText: {
    fontSize: 12,
  },
  eventTicketButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  eventTicketButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
