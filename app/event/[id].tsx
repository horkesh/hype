
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

interface Event {
  id: string;
  title_bs: string;
  title_en: string | null;
  description_bs: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  end_datetime: string | null;
  price_bam: number | null;
  ticket_url: string | null;
  source: string | null;
  moods: string[];
  category: string;
  venue_id: string | null;
  venues?: {
    id: string;
    name: string;
  } | null;
  location_name: string | null;
}

const MOODS: { [key: string]: string } = {
  Party: '🎉',
  Chill: '😎',
  'Girls Night': '💃',
  'Date Night': '💑',
  Muzika: '🎵',
  Romantika: '🍷',
  Kultura: '🎭',
  Foodie: '🍽️',
  Brunch: '🍳',
  'After Work': '🍻',
  Outdoor: '🌿',
  Turista: '🧳',
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

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t, language } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const loadEventData = async () => {
    console.log('Loading event data for ID:', id);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title_bs,
          title_en,
          description_bs,
          description_en,
          cover_image_url,
          start_datetime,
          end_datetime,
          price_bam,
          ticket_url,
          source,
          moods,
          category,
          venue_id,
          location_name,
          venues (id, name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading event:', error);
      } else {
        console.log('Event loaded:', data);
        setEvent(data);
      }
    } catch (error) {
      console.error('Error in loadEventData:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const savedEventsJson = await AsyncStorage.getItem('savedEvents');
      const savedEvents = savedEventsJson ? JSON.parse(savedEventsJson) : [];
      const isEventSaved = savedEvents.includes(id);
      setIsSaved(isEventSaved);
    } catch (error) {
      console.error('Error checking if event is saved:', error);
    }
  };

  const toggleSave = async () => {
    console.log('Toggling save for event:', id);
    try {
      const savedEventsJson = await AsyncStorage.getItem('savedEvents');
      const savedEvents = savedEventsJson ? JSON.parse(savedEventsJson) : [];

      if (isSaved) {
        const updatedEvents = savedEvents.filter((eventId: string) => eventId !== id);
        await AsyncStorage.setItem('savedEvents', JSON.stringify(updatedEvents));
        setIsSaved(false);
        console.log('Event removed from saved');
      } else {
        savedEvents.push(id);
        await AsyncStorage.setItem('savedEvents', JSON.stringify(savedEvents));
        setIsSaved(true);
        console.log('Event added to saved');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleVenueTap = () => {
    if (event?.venue_id) {
      console.log('Navigating to venue:', event.venue_id);
      router.push(`/venue/${event.venue_id}`);
    }
  };

  const handleTicketPress = () => {
    if (event?.ticket_url) {
      console.log('Opening ticket URL:', event.ticket_url);
      Linking.openURL(event.ticket_url);
    }
  };

  const formatEventDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${t('at')} ${hours}:${minutes}`;
  };

  const getTicketButtonText = (ticketUrl: string | null) => {
    if (!ticketUrl) {
      return language === 'bs' ? 'Kupi kartu' : 'Buy Ticket';
    }
    
    const urlLower = ticketUrl.toLowerCase();
    if (urlLower.includes('kupikartu.ba')) return language === 'bs' ? 'Kupi na KupiKartu.ba' : 'Buy on KupiKartu.ba';
    if (urlLower.includes('entrio.ba')) return language === 'bs' ? 'Kupi na Entrio.ba' : 'Buy on Entrio.ba';
    if (urlLower.includes('karter.ba')) return language === 'bs' ? 'Kupi na Karter.ba' : 'Buy on Karter.ba';
    if (urlLower.includes('fiestalama')) return language === 'bs' ? 'Kupi na FiestaLama' : 'Buy on FiestaLama';
    
    return language === 'bs' ? 'Kupi kartu' : 'Buy Ticket';
  };

  useEffect(() => {
    if (id) {
      loadEventData();
      checkIfSaved();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: t('eventDetails'), headerShown: true }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color="#D4A056" />
        </View>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Stack.Screen options={{ title: t('eventDetails'), headerShown: true }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {t('error')}
          </Text>
        </View>
      </>
    );
  }

  const eventTitle = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
  const eventDescription = language === 'bs' ? event.description_bs : (event.description_en || event.description_bs);
  const venueName = event.venues?.name || event.location_name || '';
  const isFree = event.price_bam === null || event.price_bam === 0;
  
  let priceDisplay = '';
  if (isFree) {
    priceDisplay = language === 'bs' ? 'Besplatan' : 'Free';
  } else if (event.price_bam) {
    priceDisplay = `${event.price_bam} KM`;
    if (language === 'en') {
      const eurPrice = (event.price_bam * 0.51).toFixed(2);
      priceDisplay += ` (~${eurPrice} EUR)`;
    }
  }
  
  const categoryEmoji = CATEGORY_EMOJI[event.category] || '📅';
  const ticketButtonText = getTicketButtonText(event.ticket_url);
  const formattedDateTime = formatEventDateTime(event.start_datetime);

  return (
    <>
      <Stack.Screen options={{ title: eventTitle, headerShown: true }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {event.cover_image_url ? (
          <Image
            source={resolveImageSource(event.cover_image_url)}
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
            {eventTitle}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {formattedDateTime}
            </Text>
          </View>

          {venueName && (
            <TouchableOpacity
              style={styles.venueRow}
              onPress={handleVenueTap}
              disabled={!event.venue_id}
              activeOpacity={event.venue_id ? 0.7 : 1}
            >
              <Text style={[styles.venueLabel, { color: colors.textSecondary }]}>
                {t('venue')}
              </Text>
              <Text style={[styles.venueName, { color: event.venue_id ? '#D4A056' : colors.text }]}>
                {venueName}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.badgesSection}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.card }]}>
              <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
              <Text style={[styles.categoryText, { color: colors.text }]}>
                {event.category}
              </Text>
            </View>

            {event.moods && event.moods.length > 0 && (
              <View style={styles.moodBadges}>
                {event.moods.map((mood, index) => {
                  const moodEmoji = MOODS[mood] || '✨';
                  return (
                    <View key={index} style={[styles.moodBadge, { backgroundColor: colors.card }]}>
                      <Text style={styles.moodEmoji}>{moodEmoji}</Text>
                      <Text style={[styles.moodText, { color: colors.text }]}>
                        {mood}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {isFree ? (
            <View style={[styles.freeEntryBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.freeEntryText}>
                ✅ {language === 'bs' ? 'Besplatan ulaz' : 'Free Entry'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.priceSection}>
                <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                  {t('price')}
                </Text>
                <View style={[styles.priceBadge, { backgroundColor: colors.card }]}>
                  <Text style={[styles.priceText, { color: colors.text }]}>
                    {priceDisplay}
                  </Text>
                </View>
              </View>

              {event.ticket_url && (
                <TouchableOpacity
                  style={[styles.ticketButton, { backgroundColor: '#D4A056' }]}
                  onPress={handleTicketPress}
                >
                  <Text style={styles.ticketButtonText}>
                    🎟️ {ticketButtonText}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {eventDescription && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('description')}
              </Text>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {eventDescription}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isSaved ? '#10B981' : colors.card }]}
            onPress={toggleSave}
          >
            <Text style={[styles.saveButtonText, { color: isSaved ? '#FFFFFF' : colors.text }]}>
              ❤️ {isSaved ? t('eventSaved') : t('saveEvent')}
            </Text>
          </TouchableOpacity>
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
    marginBottom: 16,
  },
  metaRow: {
    marginBottom: 16,
  },
  metaText: {
    fontSize: 16,
  },
  venueRow: {
    marginBottom: 20,
  },
  venueLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
  },
  badgesSection: {
    marginBottom: 20,
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
  moodBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  moodEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  moodText: {
    fontSize: 13,
  },
  priceSection: {
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  freeEntryBadge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  freeEntryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  ticketButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
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
});
