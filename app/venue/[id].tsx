
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
import { useLocalSearchParams, Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeDailySpecialRows, normalizeVenue } from '@/utils/errorLogger';

// Helper to resolve image sources
function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

interface Venue {
  id: string;
  name: string;
  cover_image_url: string | null;
  category: string;
  category_emoji: string;
  price_level: number;
  moods: string[];
  opening_hours: any;
  is_hidden_gem: boolean;
  insider_tip: string | null;
  address: string;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  delivery_korpa_url: string | null;
  delivery_glovo_url: string | null;
  description_bs: string;
  description_en: string;
  latitude: number;
  longitude: number;
}

interface Event {
  id: string;
  title_bs: string;
  title_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  price_bam: number | null;
  ticket_url: string | null;
}

interface DailySpecial {
  id: string;
  menu_title: string;
  price: number;
  valid_times: string;
  description: string | null;
}

const MOODS = [
  { id: 'party', emoji: '🎉', labelKey: 'moodParty' },
  { id: 'chill', emoji: '😎', labelKey: 'moodChill' },
  { id: 'girls_night', emoji: '💃', labelKey: 'moodGirlsNight' },
  { id: 'date_night', emoji: '💑', labelKey: 'moodDateNight' },
  { id: 'music', emoji: '🎵', labelKey: 'moodMusic' },
  { id: 'romance', emoji: '🍷', labelKey: 'moodRomance' },
  { id: 'culture', emoji: '🎭', labelKey: 'moodCulture' },
  { id: 'foodie', emoji: '🍽️', labelKey: 'moodFoodie' },
  { id: 'brunch', emoji: '🍳', labelKey: 'moodBrunch' },
  { id: 'after_work', emoji: '🍻', labelKey: 'moodAfterWork' },
  { id: 'outdoor', emoji: '🌿', labelKey: 'moodOutdoor' },
  { id: 'tourist', emoji: '🧳', labelKey: 'moodTourist' },
];

const DAYS_OF_WEEK_BS = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
const DAYS_OF_WEEK_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useApp();
  const { colors } = useTheme();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [dailySpecials, setDailySpecials] = useState<DailySpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'events' | 'specials'>('info');
  const [showAllHours, setShowAllHours] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const loadVenueData = async () => {
    setLoading(true);
    console.log('Loading venue data for ID:', id);

    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading venue:', error);
      } else {
        setVenue(normalizeVenue(data, language));
      }
    } catch (error) {
      console.error('Error loading venue:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    console.log('Loading events for venue:', id);

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('venue_id', id)
        .gte('start_datetime', now)
        .order('start_datetime', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadDailySpecials = async () => {
    console.log('Loading daily specials for venue:', id);

    try {
      const { data, error } = await supabase
        .from('daily_specials')
        .select('*')
        .eq('venue_id', id)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading daily specials:', error);
      } else {
        setDailySpecials(normalizeDailySpecialRows(data, language));
      }
    } catch (error) {
      console.error('Error loading daily specials:', error);
    }
  };

  const checkIfSaved = async () => {
    try {
      const savedVenues = JSON.parse(await AsyncStorage.getItem('savedVenues') || '[]');
      setIsSaved(savedVenues.includes(id));
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleSave = async () => {
    console.log('Toggling save for venue:', id);

    try {
      const savedVenues = JSON.parse(await AsyncStorage.getItem('savedVenues') || '[]');
      
      if (isSaved) {
        const filtered = savedVenues.filter((venueId: string) => venueId !== id);
        await AsyncStorage.setItem('savedVenues', JSON.stringify(filtered));
        setIsSaved(false);
      } else {
        savedVenues.push(id);
        await AsyncStorage.setItem('savedVenues', JSON.stringify(savedVenues));
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const openNavigation = async () => {
    if (!venue) return;

    console.log('Opening navigation to:', venue.latitude, venue.longitude);
    const url = `https://maps.google.com/?q=${venue.latitude},${venue.longitude}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening navigation:', error);
    }
  };

  const openPhone = async () => {
    if (!venue?.phone) return;

    console.log('Opening phone:', venue.phone);
    const url = `tel:${venue.phone}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening phone:', error);
    }
  };

  const openWebsite = async () => {
    if (!venue?.website) return;

    console.log('Opening website:', venue.website);
    
    try {
      const canOpen = await Linking.canOpenURL(venue.website);
      if (canOpen) {
        await Linking.openURL(venue.website);
      }
    } catch (error) {
      console.error('Error opening website:', error);
    }
  };

  const openInstagram = async () => {
    if (!venue?.instagram) return;

    console.log('Opening Instagram:', venue.instagram);
    
    try {
      const canOpen = await Linking.canOpenURL(venue.instagram);
      if (canOpen) {
        await Linking.openURL(venue.instagram);
      }
    } catch (error) {
      console.error('Error opening Instagram:', error);
    }
  };

  const openDelivery = async (url: string) => {
    console.log('Opening delivery URL:', url);
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening delivery:', error);
    }
  };

  const isOpenNow = (): boolean => {
    if (!venue?.opening_hours) return false;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todaySchedule = venue.opening_hours[dayOfWeek];
    if (!todaySchedule || todaySchedule.length === 0) return false;

    for (const period of todaySchedule) {
      const openParts = period.open.split(':');
      const closeParts = period.close.split(':');
      const openMinutes = parseInt(openParts[0]) * 60 + parseInt(openParts[1]);
      const closeMinutes = parseInt(closeParts[0]) * 60 + parseInt(closeParts[1]);

      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return true;
      }
    }

    return false;
  };

  const getTodayHours = (): string => {
    if (!venue?.opening_hours) {
      const unknownText = language === 'bs' ? 'Nepoznato' : 'Unknown';
      return unknownText;
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const todaySchedule = venue.opening_hours[dayOfWeek];

    if (!todaySchedule || todaySchedule.length === 0) {
      const closedText = language === 'bs' ? 'Zatvoreno' : 'Closed';
      return closedText;
    }

    const periods = todaySchedule.map((period: any) => `${period.open} - ${period.close}`).join(', ');
    return periods;
  };

  const getPriceLevelDisplay = (level: number): string => {
    return '€'.repeat(level);
  };

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}. ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (id) {
      loadVenueData();
      checkIfSaved();
    }
  }, [id, language]);

  useEffect(() => {
    if (venue && activeTab === 'events') {
      loadEvents();
    } else if (venue && activeTab === 'specials') {
      loadDailySpecials();
    }
  }, [activeTab, venue?.id, language]);

  if (loading) {
    const backText = language === 'bs' ? 'Nazad' : 'Back';
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: true, title: '', headerBackTitle: backText }} />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!venue) {
    const backText = language === 'bs' ? 'Nazad' : 'Back';
    const notFoundText = language === 'bs' ? 'Mjesto nije pronađeno' : 'Venue not found';
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: true, title: '', headerBackTitle: backText }} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {notFoundText}
        </Text>
      </View>
    );
  }

  const isOpen = isOpenNow();
  const todayHours = getTodayHours();
  const description = language === 'bs' ? venue.description_bs : venue.description_en;
  const daysOfWeek = language === 'bs' ? DAYS_OF_WEEK_BS : DAYS_OF_WEEK_EN;
  const backText = language === 'bs' ? 'Nazad' : 'Back';
  const openText = language === 'bs' ? 'Otvoreno' : 'Open';
  const closedText = language === 'bs' ? 'Zatvoreno' : 'Closed';
  const hideText = language === 'bs' ? 'Sakrij' : 'Hide';
  const showAllText = language === 'bs' ? 'Prikaži sve' : 'Show all';
  const navigateText = language === 'bs' ? 'Navigacija' : 'Navigate';
  const callText = language === 'bs' ? 'Pozovi' : 'Call';
  const saveText = language === 'bs' ? 'Sačuvaj' : 'Save';
  const hiddenGemText = language === 'bs' ? 'Skriveni dragulj' : 'Hidden Gem';
  const infoText = language === 'bs' ? 'Info' : 'Info';
  const eventsText = language === 'bs' ? 'Događaji' : 'Events';
  const specialsText = language === 'bs' ? 'Ponude' : 'Specials';
  const noEventsText = language === 'bs' ? 'Nema nadolazećih događaja' : 'No upcoming events';
  const noSpecialsText = language === 'bs' ? 'Nema aktivnih ponuda' : 'No active specials';
  const validText = language === 'bs' ? 'Vrijedi' : 'Valid';
  const freeText = language === 'bs' ? 'Besplatan' : 'Free';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: '', headerBackTitle: backText }} />
      
      <ScrollView style={styles.scrollView}>
        {venue.cover_image_url ? (
          <Image source={resolveImageSource(venue.cover_image_url)} style={styles.heroImage} />
        ) : (
          <LinearGradient
            colors={['#D4A056', '#B8894A']}
            style={styles.heroPlaceholder}
          >
            <Text style={styles.heroEmoji}>{venue.category_emoji}</Text>
          </LinearGradient>
        )}

        <View style={styles.header}>
          <Text style={[styles.venueName, { color: colors.text }]}>{venue.name}</Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.categoryBadgeText}>{venue.category}</Text>
            </View>
            <Text style={[styles.priceLevel, { color: colors.accent }]}>
              {getPriceLevelDisplay(venue.price_level)}
            </Text>
          </View>

          {venue.moods && venue.moods.length > 0 && (
            <View style={styles.moodBadges}>
              {venue.moods.map((moodId, index) => {
                const mood = MOODS.find((m) => m.id === moodId);
                return mood ? (
                  <View key={index} style={[styles.moodBadge, { backgroundColor: colors.card }]}>
                    <Text style={styles.moodBadgeEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodBadgeText, { color: colors.text }]}>{t(mood.labelKey)}</Text>
                  </View>
                ) : null;
              })}
            </View>
          )}
        </View>

        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusBadgeText}>
              {isOpen ? openText : closedText}
            </Text>
          </View>
          <Text style={[styles.todayHours, { color: colors.textSecondary }]}>{todayHours}</Text>
          
          {venue.opening_hours && (
            <TouchableOpacity onPress={() => setShowAllHours(!showAllHours)}>
              <Text style={[styles.expandHours, { color: colors.accent }]}>
                {showAllHours ? hideText : showAllText}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showAllHours && venue.opening_hours && (
          <View style={[styles.fullHoursSection, { backgroundColor: colors.card }]}>
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const schedule = venue.opening_hours[day];
              const dayName = daysOfWeek[day];
              const hoursText = schedule && schedule.length > 0
                ? schedule.map((period: any) => `${period.open} - ${period.close}`).join(', ')
                : closedText;

              return (
                <View key={day} style={styles.hoursRow}>
                  <Text style={[styles.dayName, { color: colors.text }]}>{dayName}</Text>
                  <Text style={[styles.dayHours, { color: colors.textSecondary }]}>{hoursText}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={openNavigation}>
            <Text style={styles.actionButtonEmoji}>📍</Text>
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {navigateText}
            </Text>
          </TouchableOpacity>

          {venue.phone && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={openPhone}>
              <Text style={styles.actionButtonEmoji}>📞</Text>
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                {callText}
              </Text>
            </TouchableOpacity>
          )}

          {venue.website && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={openWebsite}>
              <Text style={styles.actionButtonEmoji}>🌐</Text>
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Web</Text>
            </TouchableOpacity>
          )}

          {venue.instagram && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={openInstagram}>
              <Text style={styles.actionButtonEmoji}>📸</Text>
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Instagram</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={toggleSave}>
            <Text style={styles.actionButtonEmoji}>{isSaved ? '❤️' : '🤍'}</Text>
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {saveText}
            </Text>
          </TouchableOpacity>
        </View>

        {(venue.delivery_korpa_url || venue.delivery_glovo_url) && (
          <View style={styles.deliveryButtons}>
            {venue.delivery_korpa_url && (
              <TouchableOpacity
                style={[styles.deliveryButton, { backgroundColor: colors.accent }]}
                onPress={() => openDelivery(venue.delivery_korpa_url!)}
              >
                <Text style={styles.deliveryButtonText}>🛵 Korpa</Text>
              </TouchableOpacity>
            )}
            {venue.delivery_glovo_url && (
              <TouchableOpacity
                style={[styles.deliveryButton, { backgroundColor: colors.accent }]}
                onPress={() => openDelivery(venue.delivery_glovo_url!)}
              >
                <Text style={styles.deliveryButtonText}>🛵 Glovo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {venue.is_hidden_gem && venue.insider_tip && (
          <View style={styles.hiddenGemSection}>
            <View style={[styles.hiddenGemBadge, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.hiddenGemEmoji}>🕵️</Text>
              <Text style={styles.hiddenGemText}>
                {hiddenGemText}
              </Text>
            </View>
            <View style={styles.insiderTipCard}>
              <Text style={[styles.insiderTip, { color: colors.text }]}>{venue.insider_tip}</Text>
            </View>
          </View>
        )}

        <View style={styles.tabSection}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'info' ? colors.accent : colors.textSecondary }]}>
              ℹ️ {infoText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'events' ? colors.accent : colors.textSecondary }]}>
              📅 {eventsText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'specials' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('specials')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'specials' ? colors.accent : colors.textSecondary }]}>
              🍽️ {specialsText}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'info' && (
            <View style={styles.infoTab}>
              <Text style={[styles.description, { color: colors.text }]}>{description}</Text>
              
              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <IconSymbol
                    ios_icon_name="location.fill"
                    android_material_icon_name="location-on"
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={[styles.contactText, { color: colors.text }]}>{venue.address}</Text>
                </View>
                
                {venue.phone && (
                  <View style={styles.contactRow}>
                    <IconSymbol
                      ios_icon_name="phone.fill"
                      android_material_icon_name="phone"
                      size={20}
                      color={colors.accent}
                    />
                    <Text style={[styles.contactText, { color: colors.text }]}>{venue.phone}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeTab === 'events' && (
            <View style={styles.eventsTab}>
              {events.length === 0 ? (
                <Text style={[styles.noResults, { color: colors.textSecondary }]}>
                  {noEventsText}
                </Text>
              ) : (
                events.map((event) => {
                  const title = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
                  const formattedDate = formatEventDate(event.start_datetime);
                  const priceText = event.price_bam === 0 ? freeText : `${event.price_bam} KM`;
                  
                  return (
                    <View key={event.id} style={[styles.eventCard, { backgroundColor: colors.card }]}>
                      {event.cover_image_url && (
                        <Image source={resolveImageSource(event.cover_image_url)} style={styles.eventImage} />
                      )}
                      <View style={styles.eventInfo}>
                        <Text style={[styles.eventTitle, { color: colors.text }]}>{title}</Text>
                        <Text style={[styles.eventDate, { color: colors.textSecondary }]}>{formattedDate}</Text>
                        {event.price_bam !== null && (
                          <Text style={[styles.eventPrice, { color: colors.accent }]}>
                            {priceText}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {activeTab === 'specials' && (
            <View style={styles.specialsTab}>
              {dailySpecials.length === 0 ? (
                <Text style={[styles.noResults, { color: colors.textSecondary }]}>
                  {noSpecialsText}
                </Text>
              ) : (
                dailySpecials.map((special) => (
                  <View key={special.id} style={[styles.specialCard, { backgroundColor: colors.card }]}>
                    <View style={styles.specialHeader}>
                      <Text style={[styles.specialTitle, { color: colors.text }]}>{special.menu_title}</Text>
                      <Text style={[styles.specialPrice, { color: colors.accent }]}>{special.price} KM</Text>
                    </View>
                    {special.description && (
                      <Text style={[styles.specialDescription, { color: colors.textSecondary }]}>
                        {special.description}
                      </Text>
                    )}
                    <Text style={[styles.specialValidTimes, { color: colors.textSecondary }]}>
                      {validText}: {special.valid_times}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  heroPlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 80,
  },
  header: {
    padding: 20,
  },
  venueName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  priceLevel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  moodBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  moodBadgeEmoji: {
    fontSize: 14,
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  todayHours: {
    fontSize: 16,
    marginBottom: 4,
  },
  expandHours: {
    fontSize: 14,
    fontWeight: '600',
  },
  fullHoursSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayHours: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonEmoji: {
    fontSize: 18,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  deliveryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deliveryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hiddenGemSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  hiddenGemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  hiddenGemEmoji: {
    fontSize: 16,
  },
  hiddenGemText: {
    color: '#F57C00',
    fontSize: 14,
    fontWeight: '600',
  },
  insiderTipCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    paddingLeft: 12,
    paddingVertical: 8,
  },
  insiderTip: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  tabSection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  infoTab: {
    gap: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactInfo: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    flex: 1,
  },
  eventsTab: {
    gap: 16,
  },
  noResults: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  eventCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  specialsTab: {
    gap: 12,
  },
  specialCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  specialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  specialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  specialPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  specialDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  specialValidTimes: {
    fontSize: 12,
  },
});
