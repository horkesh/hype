
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { HypeHeader } from '@/components/HypeHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';
import { normalizeVenueRows } from '@/utils/errorLogger';

interface Venue {
  id: string;
  name: string;
  category: string;
  neighborhood: string | null;
  price_level: number;
  moods: string[];
  cover_image_url: string | null;
}

interface Event {
  id: string;
  title_bs: string;
  title_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  price_bam: number | null;
  venues?: {
    name: string;
  } | null;
  location_name: string | null;
}

interface Badge {
  id: string;
  badge_key: string;
  name_bs: string;
  name_en: string;
  description_bs: string;
  description_en: string;
  icon: string;
  criteria: any;
  is_active: boolean;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

const MOODS: { [key: string]: string } = {
  party: '🎉',
  chill: '😌',
  girls_night: '👯',
  date_night: '💑',
  music: '🎵',
  romance: '💕',
  culture: '🎭',
  foodie: '🍽️',
  brunch: '🥐',
  after_work: '🍻',
  outdoor: '🌳',
  tourist: '📸',
};

// Demo earned badges (for demo purposes)
const DEMO_EARNED_BADGES = ['kafedzija', 'explorer', 'hype_og'];

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

export default function SavedScreen() {
  const { t, language } = useApp();
  const { colors } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'venues' | 'events' | 'badges'>('venues');
  const [savedVenues, setSavedVenues] = useState<Venue[]>([]);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedItems = useCallback(async () => {
    console.log('Loading saved items for tab:', activeTab);
    setIsLoading(true);
    try {
      if (activeTab === 'venues') {
        await loadSavedVenues();
      } else if (activeTab === 'events') {
        await loadSavedEvents();
      } else {
        await loadBadges();
      }
    } catch (error) {
      console.error('Error loading saved items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, language]);

  useEffect(() => {
    loadSavedItems();
  }, [loadSavedItems]);

  const loadSavedVenues = async () => {
    try {
      const savedIds = await AsyncStorage.getItem('saved_venues');
      if (!savedIds) {
        setSavedVenues([]);
        return;
      }

      const ids = JSON.parse(savedIds);
      if (ids.length === 0) {
        setSavedVenues([]);
        return;
      }

      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .in('id', ids);

      if (error) {
        console.error('Error fetching saved venues:', error);
        setSavedVenues([]);
        return;
      }

      setSavedVenues(normalizeVenueRows(data, language));
    } catch (error) {
      console.error('Error loading saved venues:', error);
      setSavedVenues([]);
    }
  };

  const loadSavedEvents = async () => {
    try {
      const savedIds = await AsyncStorage.getItem('saved_events');
      if (!savedIds) {
        setSavedEvents([]);
        return;
      }

      const ids = JSON.parse(savedIds);
      if (ids.length === 0) {
        setSavedEvents([]);
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*, venues(name)')
        .in('id', ids);

      if (error) {
        console.error('Error fetching saved events:', error);
        setSavedEvents([]);
        return;
      }

      setSavedEvents(data || []);
    } catch (error) {
      console.error('Error loading saved events:', error);
      setSavedEvents([]);
    }
  };

  const loadBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('badge_key');

      if (error) {
        console.error('Error fetching badges:', error);
        setBadges([]);
        return;
      }

      setBadges(data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
      setBadges([]);
    }
  };

  const removeVenue = async (venueId: string) => {
    console.log('Removing venue:', venueId);
    try {
      const savedIds = await AsyncStorage.getItem('saved_venues');
      if (savedIds) {
        let ids = JSON.parse(savedIds);
        ids = ids.filter((id: string) => id !== venueId);
        await AsyncStorage.setItem('saved_venues', JSON.stringify(ids));
        setSavedVenues(prev => prev.filter(v => v.id !== venueId));
      }
    } catch (error) {
      console.error('Error removing venue:', error);
    }
  };

  const removeEvent = async (eventId: string) => {
    console.log('Removing event:', eventId);
    try {
      const savedIds = await AsyncStorage.getItem('saved_events');
      if (savedIds) {
        let ids = JSON.parse(savedIds);
        ids = ids.filter((id: string) => id !== eventId);
        await AsyncStorage.setItem('saved_events', JSON.stringify(ids));
        setSavedEvents(prev => prev.filter(e => e.id !== eventId));
      }
    } catch (error) {
      console.error('Error removing event:', error);
    }
  };

  const handleVenueTap = (venueId: string) => {
    console.log('Navigating to venue:', venueId);
    router.push(`/venue/${venueId}`);
  };

  const handleEventTap = (eventId: string) => {
    console.log('Navigating to event:', eventId);
    router.push(`/event/${eventId}`);
  };

  const getPriceLevelDisplay = (level: number): string => {
    return '€'.repeat(level);
  };

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${day}.${month}. ${t('at')} ${hours}:${formattedMinutes}`;
  };

  const getBadgeProgress = (badge: Badge): { current: number; total: number } => {
    // Mock progress for demo
    const mockProgress: { [key: string]: { current: number; total: number } } = {
      kafedzija: { current: 10, total: 10 },
      nocna_ptica: { current: 2, total: 5 },
      kulturnjak: { current: 1, total: 5 },
      gurman: { current: 4, total: 10 },
      explorer: { current: 3, total: 3 },
      svaki_mood: { current: 8, total: 12 },
      storyteller: { current: 3, total: 10 },
      mahala_local: { current: 15, total: 30 },
      hype_og: { current: 1, total: 1 },
      underground_vip: { current: 1, total: 5 },
    };

    return mockProgress[badge.badge_key] || { current: 0, total: 10 };
  };

  const formatBadgeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>, onDelete: () => void) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 80 }],
      };
    });

    return (
      <Animated.View style={[styles.swipeAction, styleAnimation]}>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            onDelete();
          }}
          style={styles.deleteButton}
        >
          <IconSymbol
            ios_icon_name="trash"
            android_material_icon_name="delete"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderVenueCard = (venue: Venue) => {
    const imageSource = resolveImageSource(venue.cover_image_url);
    const priceDisplay = getPriceLevelDisplay(venue.price_level);

    return (
      <ReanimatedSwipeable
        key={venue.id}
        renderRightActions={(prog, drag) => RightAction(prog, drag, () => removeVenue(venue.id))}
        overshootRight={false}
      >
        <TouchableOpacity
          onPress={() => handleVenueTap(venue.id)}
          style={[styles.card, { backgroundColor: colors.cardBackground }]}
        >
          <Image source={imageSource} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {venue.name}
            </Text>
            <View style={styles.cardMeta}>
              <View style={[styles.categoryPill, { backgroundColor: colors.accent }]}>
                <Text style={styles.categoryText}>{venue.category}</Text>
              </View>
              {venue.neighborhood && (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {venue.neighborhood}
                </Text>
              )}
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {priceDisplay}
              </Text>
            </View>
            {venue.moods && venue.moods.length > 0 && (
              <View style={styles.moodBadges}>
                {venue.moods.slice(0, 3).map((mood, index) => (
                  <View key={index} style={[styles.moodBadge, { backgroundColor: colors.background }]}>
                    <Text style={styles.moodEmoji}>{MOODS[mood] || '✨'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  const renderEventCard = (event: Event) => {
    const imageSource = resolveImageSource(event.cover_image_url);
    const eventTitle = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
    const venueName = event.venues?.name || event.location_name || '';
    const dateDisplay = formatEventDate(event.start_datetime);
    const priceDisplay = event.price_bam ? `${event.price_bam} KM` : t('free');

    return (
      <ReanimatedSwipeable
        key={event.id}
        renderRightActions={(prog, drag) => RightAction(prog, drag, () => removeEvent(event.id))}
        overshootRight={false}
      >
        <TouchableOpacity
          onPress={() => handleEventTap(event.id)}
          style={[styles.card, { backgroundColor: colors.cardBackground }]}
        >
          <Image source={imageSource} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {eventTitle}
            </Text>
            {venueName && (
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {venueName}
              </Text>
            )}
            <View style={styles.eventMeta}>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {dateDisplay}
              </Text>
              <View style={[styles.priceBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.priceText}>{priceDisplay}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  const renderBadgeCard = (badge: Badge) => {
    const isEarned = DEMO_EARNED_BADGES.includes(badge.badge_key);
    const progress = getBadgeProgress(badge);
    const progressPercent = (progress.current / progress.total) * 100;
    const badgeName = language === 'bs' ? badge.name_bs : badge.name_en;
    const badgeDescription = language === 'bs' ? badge.description_bs : badge.description_en;

    return (
      <View
        key={badge.id}
        style={[
          styles.badgeCard,
          {
            backgroundColor: isEarned ? colors.cardBackground : colors.background,
            opacity: isEarned ? 1 : 0.6,
          }
        ]}
      >
        <Text style={styles.badgeIcon}>{badge.icon}</Text>
        <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={1}>
          {badgeName}
        </Text>
        {isEarned ? (
          <View style={styles.earnedBadge}>
            <Text style={[styles.earnedText, { color: colors.accent }]}>
              {language === 'bs' ? 'Osvojeno' : 'Earned'}
            </Text>
            <Text style={[styles.earnedDate, { color: colors.textSecondary }]}>
              {formatBadgeDate(new Date().toISOString())}
            </Text>
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.cardBackground }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.accent, width: `${progressPercent}%` }
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {progress.current}
              <Text style={styles.progressSeparator}>/</Text>
              {progress.total}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    const isVenuesTab = activeTab === 'venues';
    const isEventsTab = activeTab === 'events';
    const emoji = isVenuesTab ? '❤️' : isEventsTab ? '🎟️' : '🏅';
    const title = isVenuesTab 
      ? 'Nema sačuvanih mjesta' 
      : isEventsTab 
      ? 'Nema sačuvanih događaja'
      : 'Nema bedževa';
    const subtitle = isVenuesTab 
      ? 'Sačuvaj svoja omiljena mjesta da ih lako pronađeš kasnije'
      : isEventsTab
      ? 'Sačuvaj događaje koji te zanimaju'
      : 'Osvoji bedževe kroz aktivnost u aplikaciji';
    const buttonText = isVenuesTab ? 'Istraži mjesta' : isEventsTab ? 'Pogledaj događaje' : 'Istraži grad';
    const buttonRoute = isVenuesTab ? '/(tabs)/explore' : isEventsTab ? '/(tabs)/tonight' : '/(tabs)/explore';

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>{emoji}</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        <TouchableOpacity
          onPress={() => router.push(buttonRoute as any)}
          style={[styles.emptyButton, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.emptyButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <HypeHeader />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('venues')}
          style={[
            styles.tab,
            activeTab === 'venues' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }
          ]}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'venues' ? colors.accent : colors.textSecondary }
          ]}>
            ❤️ Favoriti
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('events')}
          style={[
            styles.tab,
            activeTab === 'events' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }
          ]}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'events' ? colors.accent : colors.textSecondary }
          ]}>
            🎟️ Događaji
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('badges')}
          style={[
            styles.tab,
            activeTab === 'badges' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }
          ]}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'badges' ? colors.accent : colors.textSecondary }
          ]}>
            🏅 Bedževi
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {activeTab === 'venues' ? (
            savedVenues.length > 0 ? (
              <View style={styles.cardsContainer}>
                {savedVenues.map(venue => renderVenueCard(venue))}
              </View>
            ) : (
              renderEmptyState()
            )
          ) : activeTab === 'events' ? (
            savedEvents.length > 0 ? (
              <View style={styles.cardsContainer}>
                {savedEvents.map(event => renderEventCard(event))}
              </View>
            ) : (
              renderEmptyState()
            )
          ) : (
            badges.length > 0 ? (
              <View style={styles.badgesGrid}>
                {badges.map(badge => renderBadgeCard(badge))}
              </View>
            ) : (
              renderEmptyState()
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metaText: {
    fontSize: 14,
  },
  moodBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  moodBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 16,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  badgesGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  earnedBadge: {
    alignItems: 'center',
  },
  earnedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  earnedDate: {
    fontSize: 10,
    marginTop: 2,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressSeparator: {
    fontWeight: '400',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
