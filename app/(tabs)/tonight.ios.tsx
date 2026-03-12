import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Share,
  Platform,
  RefreshControl,
} from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/integrations/supabase/client';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { Map } from '@/components/Map';
import { resolveImageSource } from '@/utils/imageSource';
import {
  AIPlan,
  buildTonightPlanShareText,
  buildTonightSegments,
  buildTonightVoteShareText,
  Event,
  generateMockTonightPlan,
  isFreeEvent,
  MoodId,
  TONIGHT_MOODS,
  TimeSegment,
  TimeSegmentConfig,
  Venue,
} from '@/utils/tonightScreen';

export default function TonightScreen() {
  const { t, language } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState<TimeSegment>('evening');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [budget, setBudget] = useState(80);
  const [groupSize, setGroupSize] = useState(2);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AIPlan | null>(null);
  const [planIndex, setPlanIndex] = useState(0);
  const [venues, setVenues] = useState<Venue[]>([]);
  
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [voteLink, setVoteLink] = useState<string | null>(null);
  const [votes, setVotes] = useState<{ [eventId: string]: number }>({});

  const segments: TimeSegmentConfig[] = buildTonightSegments(t);

  const loadVenues = async () => {
    console.log('Loading venues for AI planner');
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, category, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error loading venues:', error);
      } else {
        console.log('Loaded venues:', data?.length || 0);
        setVenues(data || []);
      }
    } catch (error) {
      console.error('Error in loadVenues:', error);
    }
  };

  const loadEventsForSegment = async () => {
    console.log('Loading events for segment:', activeSegment);
    setLoading(true);
    
    try {
      const segment = segments.find(s => s.key === activeSegment);
      if (!segment) return;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let startTime = new Date(today);
      startTime.setHours(segment.startHour, 0, 0, 0);
      
      let endTime = new Date(today);
      endTime.setHours(segment.endHour, 0, 0, 0);
      
      if (segment.key === 'night' && segment.endHour < segment.startHour) {
        endTime.setDate(endTime.getDate() + 1);
      }

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
          price_bam,
          ticket_url,
          source,
          moods,
          category,
          location_name,
          venues (name)
        `)
        .gte('start_datetime', startTime.toISOString())
        .lt('start_datetime', endTime.toISOString())
        .eq('is_active', true)
        .eq('status', 'approved')
        .order('start_datetime', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } else {
        console.log('Loaded events:', data?.length || 0);
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error in loadEventsForSegment:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentHour = new Date().getHours();
    let currentSegment: TimeSegment = 'evening';
    
    if (currentHour >= 6 && currentHour < 12) {
      currentSegment = 'morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      currentSegment = 'lunch';
    } else if (currentHour >= 17 && currentHour < 22) {
      currentSegment = 'evening';
    } else {
      currentSegment = 'night';
    }
    
    setActiveSegment(currentSegment);
  }, []);

  useEffect(() => {
    loadEventsForSegment();
  }, [activeSegment]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEventsForSegment();
    setRefreshing(false);
  }, [activeSegment]);

  useEffect(() => {
    loadVenues();
  }, []);

  const handleGeneratePlan = async () => {
    if (!selectedMood) return;
    
    console.log('Generating AI plan for mood:', selectedMood, 'budget:', budget, 'group:', groupSize);
    setGeneratingPlan(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const plan = generateMockTonightPlan(selectedMood, 0, venues);
    setCurrentPlan(plan);
    setPlanIndex(0);
    setGeneratingPlan(false);
  };

  const handleNextPlan = () => {
    if (!selectedMood) return;
    const nextIndex = planIndex + 1;
    const plan = generateMockTonightPlan(selectedMood, nextIndex, venues);
    setCurrentPlan(plan);
    setPlanIndex(nextIndex);
  };

  const handleSavePlan = () => {
    console.log('Saving plan:', currentPlan);
    alert(language === 'bs' ? 'Plan sačuvan!' : 'Plan saved!');
    setShowPlannerModal(false);
    setCurrentPlan(null);
  };

  const handleSharePlan = async () => {
    if (!currentPlan) return;

    const shareText = buildTonightPlanShareText(language, currentPlan);

    try {
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      console.error('Error sharing plan:', error);
    }
  };
  const handleOpenVoteModal = () => {
    console.log('Opening vote modal');
    setSelectedEvents([]);
    setVoteLink(null);
    setVotes({});
    setShowVoteModal(true);
  };

  const toggleEventSelection = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId));
    } else {
      if (selectedEvents.length < 4) {
        setSelectedEvents([...selectedEvents, eventId]);
      }
    }
  };

  const handleCreateVote = () => {
    if (selectedEvents.length < 2) return;
    
    const mockLink = `hype.ba/vote/${Math.random().toString(36).substring(7)}`;
    setVoteLink(mockLink);
    
    const initialVotes: { [key: string]: number } = {};
    selectedEvents.forEach(id => {
      initialVotes[id] = 0;
    });
    setVotes(initialVotes);
    
    console.log('Created vote with link:', mockLink);
  };

  const handleVote = (eventId: string) => {
    setVotes(prev => ({
      ...prev,
      [eventId]: (prev[eventId] || 0) + 1,
    }));
  };

  const handleShareVote = async () => {
    if (!voteLink) return;

    const shareText = buildTonightVoteShareText(language, voteLink);

    try {
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      console.error('Error sharing vote:', error);
    }
  };
  const getUrgencyBadge = (eventDate: string) => {
    const eventDateTime = new Date(eventDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventDateStr = eventDateTime.toDateString();
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();

    if (eventDateStr === todayStr) {
      return { label: t('tonightLabel'), color: '#EF4444' };
    }
    if (eventDateStr === tomorrowStr) {
      return { label: t('tomorrowLabel'), color: '#F97316' };
    }
    return null;
  };

  const getTicketButtonText = (ticketUrl: string | null) => {
    if (!ticketUrl) {
      return language === 'bs' ? 'Kupi' : 'Buy';
    }
    
    const urlLower = ticketUrl.toLowerCase();
    if (urlLower.includes('kupikartu.ba')) return 'KupiKartu';
    if (urlLower.includes('entrio.ba')) return 'Entrio';
    if (urlLower.includes('karter.ba')) return 'Karter';
    if (urlLower.includes('fiestalama')) return 'FiestaLama';
    
    return language === 'bs' ? 'Kupi' : 'Buy';
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleEventTap = (eventId: string) => {
    console.log('Tapping event:', eventId);
    router.push(`/event/${eventId}`);
  };

  const handleTicketPress = (url: string) => {
    console.log('Opening ticket URL:', url);
    Linking.openURL(url);
  };

  const renderEventCard = (event: Event) => {
    const eventTitle = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
    const venueName = event.venues?.name || event.location_name || '';
    const urgencyBadge = getUrgencyBadge(event.start_datetime);
    const eventTime = formatEventTime(event.start_datetime);
    const isFree = event.price_bam === null || event.price_bam === 0;
    const freeText = language === 'bs' ? 'Besplatan' : 'Free';
    const fromText = language === 'bs' ? 'od' : 'from';
    const priceText = isFree ? freeText : `${fromText} ${event.price_bam} KM`;
    const ticketButtonText = getTicketButtonText(event.ticket_url);
    const isSelected = selectedEvents.includes(event.id);

    return (
      <TouchableOpacity
        key={event.id}
        style={[
          styles.eventCard,
          { backgroundColor: colors.card },
          isSelected && { borderWidth: 3, borderColor: '#D4A056' },
        ]}
        onPress={() => handleEventTap(event.id)}
        activeOpacity={0.7}
      >
        {event.cover_image_url ? (
          <Image
            source={resolveImageSource(event.cover_image_url)}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#D4A056', '#B8894A']}
            style={styles.eventImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        <View style={styles.eventContent}>
          <View style={styles.badgeRow}>
            {urgencyBadge && (
              <View style={[styles.badge, { backgroundColor: urgencyBadge.color }]}>
                <Text style={styles.badgeText}>{urgencyBadge.label}</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: isFree ? '#10B981' : colors.card }]}>
              <Text style={[styles.badgeText, { color: isFree ? '#FFFFFF' : colors.text }]}>{priceText}</Text>
            </View>
          </View>

          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
            {eventTitle}
          </Text>

          <View style={styles.eventMeta}>
            <Text style={[styles.eventMetaText, { color: colors.textSecondary }]}>
              {eventTime}
            </Text>
            {venueName && (
              <>
                <Text style={[styles.eventMetaText, { color: colors.textSecondary }]}>
                  {' • '}
                </Text>
                <Text style={[styles.eventMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {venueName}
                </Text>
              </>
            )}
          </View>

          <View style={styles.eventActions}>
            {event.ticket_url && (
              <TouchableOpacity
                style={[styles.ticketButton, { backgroundColor: '#D4A056' }]}
                onPress={() => handleTicketPress(event.ticket_url!)}
              >
                <Text style={styles.ticketButtonText}>{ticketButtonText}</Text>
              </TouchableOpacity>
            )}
            
            {showVoteModal && !voteLink && (
              <TouchableOpacity
                style={[
                  styles.voteSelectButton,
                  { backgroundColor: isSelected ? '#D4A056' : colors.card, borderWidth: 1, borderColor: '#D4A056' },
                ]}
                onPress={() => toggleEventSelection(event.id)}
              >
                <Text style={[styles.voteSelectButtonText, { color: isSelected ? '#FFFFFF' : '#D4A056' }]}>
                  {isSelected ? '✓' : '+'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const emptyStateMessage = t('noEventsInSegment');
  const plannerButtonText = language === 'bs' ? 'Predloži mi plan ✨' : 'Suggest a plan ✨';
  const voteButtonText = language === 'bs' ? 'Predloži ekipi 🗳️' : 'Suggest to group 🗳️';

  return (
    <>
      <Stack.Screen
        options={{
          title: t('tonight'),
          headerLargeTitle: true,
        }}
      />
      
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#D4A056' }]}
            onPress={() => setShowPlannerModal(true)}
          >
            <Text style={styles.actionButtonText}>{plannerButtonText}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: '#D4A056' }]}
            onPress={handleOpenVoteModal}
          >
            <Text style={[styles.actionButtonText, { color: '#D4A056' }]}>{voteButtonText}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.segmentTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentTabsContent}>
            {segments.map((segment) => {
              const isActive = activeSegment === segment.key;
              const segmentLabel = segment.label;
              const segmentEmoji = segment.emoji;
              
              return (
                <TouchableOpacity
                  key={segment.key}
                  style={[
                    styles.segmentTab,
                    isActive && { backgroundColor: '#D4A056' },
                    !isActive && { backgroundColor: colors.card },
                  ]}
                  onPress={() => setActiveSegment(segment.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.segmentEmoji}>{segmentEmoji}</Text>
                  <Text
                    style={[
                      styles.segmentLabel,
                      isActive && { color: '#FFFFFF' },
                      !isActive && { color: colors.text },
                    ]}
                  >
                    {segmentLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4A056" />
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🌅</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {emptyStateMessage}
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#D4A056"
                colors={['#D4A056']}
              />
            }
          >
            {events.map(event => renderEventCard(event))}
          </ScrollView>
        )}

        <Modal
          visible={showPlannerModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowPlannerModal(false);
            setCurrentPlan(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                {language === 'bs' ? 'AI Planer večeri' : 'AI Evening Planner'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowPlannerModal(false);
                  setCurrentPlan(null);
                }}>
                  <Text style={[styles.modalClose, { color: colors.text }]}>X</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {!currentPlan ? (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>
                    {language === 'bs' ? 'Raspoloženje' : 'Mood'}
                    </Text>
                    <View style={styles.moodGrid}>
                      {TONIGHT_MOODS.map(mood => {
                        const isSelected = selectedMood === mood.id;
                        const moodLabel = language === 'bs' ? mood.label_bs : mood.label_en;
                        
                        return (
                          <TouchableOpacity
                            key={mood.id}
                            style={[
                              styles.moodChip,
                              { backgroundColor: isSelected ? '#D4A056' : colors.card },
                            ]}
                            onPress={() => setSelectedMood(mood.id)}
                          >
                            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                            <Text style={[styles.moodLabel, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                              {moodLabel}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={[styles.sectionLabel, { color: colors.text }]}>
                    {language === 'bs' ? `Budžet: ${budget} KM` : `Budget: ${budget} KM`}
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={30}
                      maximumValue={150}
                      step={10}
                      value={budget}
                      onValueChange={setBudget}
                      minimumTrackTintColor="#D4A056"
                      maximumTrackTintColor={colors.card}
                      thumbTintColor="#D4A056"
                    />

                    <Text style={[styles.sectionLabel, { color: colors.text }]}>
                      {language === 'bs' ? `Grupa: ${groupSize} osoba` : `Group: ${groupSize} people`}
                    </Text>
                    <View style={styles.groupSizeButtons}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(size => {
                        const isSelected = groupSize === size;
                        
                        return (
                          <TouchableOpacity
                            key={size}
                            style={[
                              styles.groupSizeButton,
                              { backgroundColor: isSelected ? '#D4A056' : colors.card },
                            ]}
                            onPress={() => setGroupSize(size)}
                          >
                            <Text style={[styles.groupSizeText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                              {size}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.generateButton,
                        { backgroundColor: selectedMood ? '#D4A056' : colors.card },
                      ]}
                      onPress={handleGeneratePlan}
                      disabled={!selectedMood || generatingPlan}
                    >
                      {generatingPlan ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.generateButtonText}>
                          {language === 'bs' ? 'Generiši plan ✨' : 'Generate plan ✨'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.planStops}>
                      {currentPlan.stops.map((stop, index) => (
                        <View key={index} style={[styles.planStop, { backgroundColor: colors.card }]}>
                          <Text style={[styles.planStopTime, { color: '#D4A056' }]}>{stop.time}</Text>
                          <Text style={[styles.planStopVenue, { color: colors.text }]}>{stop.venueName}</Text>
                          <Text style={[styles.planStopActivity, { color: colors.textSecondary }]}>
                            {stop.activity}
                          </Text>
                          <Text style={[styles.planStopPrice, { color: colors.text }]}>
                            {language === 'bs' ? '~' : '~'}{stop.price} KM
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={[styles.planTotal, { backgroundColor: colors.card }]}>
                      <Text style={[styles.planTotalLabel, { color: colors.text }]}>
                        {language === 'bs' ? 'Ukupno:' : 'Total:'}
                      </Text>
                      <Text style={[styles.planTotalAmount, { color: '#D4A056' }]}>
                        ~{currentPlan.total} KM
                      </Text>
                    </View>

                    {currentPlan.stops.length > 0 && currentPlan.stops[0].venueName && (
                      <View style={styles.planMap}>
                        <Map
                          markers={currentPlan.stops.map((stop, i) => ({
                            id: `stop-${i}`,
                            latitude: 43.8563 + (Math.random() - 0.5) * 0.02,
                            longitude: 18.4131 + (Math.random() - 0.5) * 0.02,
                            title: stop.venueName,
                          }))}
                          initialRegion={{
                            latitude: 43.8563,
                            longitude: 18.4131,
                            latitudeDelta: 0.03,
                            longitudeDelta: 0.03,
                          }}
                        />
                      </View>
                    )}

                    <View style={styles.planActions}>
                      <TouchableOpacity
                        style={[styles.planActionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: '#D4A056' }]}
                        onPress={handleNextPlan}
                      >
                        <Text style={[styles.planActionButtonText, { color: '#D4A056' }]}>
                          {language === 'bs' ? '🔄 Daj drugi plan' : '🔄 Another plan'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.planActionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: '#D4A056' }]}
                        onPress={handleSavePlan}
                      >
                        <Text style={[styles.planActionButtonText, { color: '#D4A056' }]}>
                          {language === 'bs' ? '💾 Sačuvaj' : '💾 Save'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.planActionButton, { backgroundColor: '#D4A056' }]}
                        onPress={handleSharePlan}
                      >
                        <Text style={[styles.planActionButtonText, { color: '#FFFFFF' }]}>
                          {language === 'bs' ? '📤 Podijeli' : '📤 Share'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showVoteModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowVoteModal(false);
            setSelectedEvents([]);
            setVoteLink(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {language === 'bs' ? 'Grupno glasanje' : 'Group Voting'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowVoteModal(false);
                  setSelectedEvents([]);
                  setVoteLink(null);
                }}>
                  <Text style={[styles.modalClose, { color: colors.text }]}>X</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {!voteLink ? (
                  <>
                    <Text style={[styles.voteInstructions, { color: colors.textSecondary }]}>
                      {language === 'bs' 
                        ? 'Izaberi 2-4 događaja za glasanje' 
                        : 'Select 2-4 events for voting'}
                    </Text>
                    <Text style={[styles.voteCount, { color: colors.text }]}>
                      {language === 'bs' ? 'Izabrano:' : 'Selected:'} {selectedEvents.length}/4
                    </Text>

                    {events.map(event => renderEventCard(event))}

                    {selectedEvents.length >= 2 && (
                      <TouchableOpacity
                        style={[styles.createVoteButton, { backgroundColor: '#D4A056' }]}
                        onPress={handleCreateVote}
                      >
                        <Text style={styles.createVoteButtonText}>
                          {language === 'bs' ? 'Kreiraj glasanje' : 'Create vote'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    <View style={[styles.voteLinkContainer, { backgroundColor: colors.card }]}>
                      <Text style={[styles.voteLinkLabel, { color: colors.textSecondary }]}>
                        {language === 'bs' ? 'Link za glasanje:' : 'Voting link:'}
                      </Text>
                      <Text style={[styles.voteLink, { color: '#D4A056' }]}>{voteLink}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.shareVoteButton, { backgroundColor: '#D4A056' }]}
                      onPress={handleShareVote}
                    >
                      <Text style={styles.shareVoteButtonText}>
                        {language === 'bs' ? '📤 Podijeli link' : '📤 Share link'}
                      </Text>
                    </TouchableOpacity>

                    <Text style={[styles.voteResultsTitle, { color: colors.text }]}>
                      {language === 'bs' ? 'Rezultati:' : 'Results:'}
                    </Text>

                    {selectedEvents.map(eventId => {
                      const event = events.find(e => e.id === eventId);
                      if (!event) return null;

                      const eventTitle = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
                      const voteCount = votes[eventId] || 0;

                      return (
                        <View key={eventId} style={[styles.voteResultCard, { backgroundColor: colors.card }]}>
                          <View style={styles.voteResultInfo}>
                            <Text style={[styles.voteResultTitle, { color: colors.text }]} numberOfLines={2}>
                              {eventTitle}
                            </Text>
                            <Text style={[styles.voteResultCount, { color: '#D4A056' }]}>
                              {voteCount} {language === 'bs' ? 'glasova' : 'votes'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[styles.voteButton, { backgroundColor: '#D4A056' }]}
                            onPress={() => handleVote(eventId)}
                          >
                            <Text style={styles.voteButtonText}>
                              {language === 'bs' ? 'Glasaj' : 'Vote'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  segmentTabs: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  segmentTabsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  segmentTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  segmentEmoji: {
    fontSize: 18,
  },
  segmentLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventContent: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventMetaText: {
    fontSize: 14,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    alignItems: 'center',
  },
  ticketButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voteSelectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteSelectButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 28,
    fontWeight: '300',
  },
  modalScroll: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  groupSizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  groupSizeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupSizeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  planStops: {
    gap: 12,
  },
  planStop: {
    padding: 16,
    borderRadius: 16,
  },
  planStopTime: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planStopVenue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planStopActivity: {
    fontSize: 14,
    marginBottom: 4,
  },
  planStopPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  planTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  planTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planMap: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  planActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  planActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  planActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  voteInstructions: {
    fontSize: 14,
    marginBottom: 12,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  createVoteButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  createVoteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  voteLinkContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  voteLinkLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  voteLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareVoteButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  shareVoteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  voteResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  voteResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  voteResultInfo: {
    flex: 1,
    marginRight: 12,
  },
  voteResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  voteResultCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  voteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
