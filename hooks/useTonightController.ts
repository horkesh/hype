import { useRouter } from 'expo-router';
import { Alert, Linking, Share } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { loadTonightEvents, loadTonightVenues } from '@/utils/tonightData';
import {
  AIPlan,
  buildTonightPlanShareText,
  buildTonightSegments,
  buildTonightVoteShareText,
  Event,
  getTonightActionLabels,
  getTonightPlannerLabels,
  getTonightVoteLabels,
  MoodId,
  TimeSegment,
  Venue,
} from '@/utils/tonightScreen';
import {
  createMockVoteState,
  formatEventTime,
  getInitialTonightSegment,
  getTicketButtonText,
  getTonightPriceText,
  getUrgencyBadge,
  toggleTonightSelection,
} from '@/utils/tonightHelpers';
import { generateMockTonightPlan } from '@/utils/tonightMockPlans';
import { buildMockTonightVoteLink } from '@/utils/tonightVote';

interface UseTonightControllerOptions {
  isBosnian: boolean;
  language: string;
  translate: (key: string) => string;
}

export function useTonightController({
  isBosnian,
  language,
  translate,
}: UseTonightControllerOptions) {
  const router = useRouter();

  const [activeSegment, setActiveSegment] = useState<TimeSegment>(() =>
    getInitialTonightSegment(new Date())
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [budget, setBudget] = useState(80);
  const [groupSize, setGroupSize] = useState(2);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AIPlan | null>(null);
  const [planIndex, setPlanIndex] = useState(0);

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [voteLink, setVoteLink] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});

  const segments = useMemo(() => buildTonightSegments(translate), [translate]);
  const plannerLabels = useMemo(
    () => getTonightPlannerLabels(isBosnian, budget, groupSize),
    [budget, groupSize, isBosnian]
  );
  const voteLabels = useMemo(() => getTonightVoteLabels(isBosnian), [isBosnian]);
  const actionLabels = useMemo(() => getTonightActionLabels(isBosnian), [isBosnian]);

  const loadEventsForSegment = useCallback(async () => {
    setLoading(true);

    try {
      const nextEvents = await loadTonightEvents(activeSegment, segments);
      setEvents(nextEvents);
    } catch (error) {
      console.error('Error loading tonight events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [activeSegment, segments]);

  const loadPlannerVenues = useCallback(async () => {
    try {
      const nextVenues = await loadTonightVenues();
      setVenues(nextVenues);
    } catch (error) {
      console.error('Error loading tonight venues:', error);
      setVenues([]);
    }
  }, []);

  useEffect(() => {
    void loadEventsForSegment();
  }, [loadEventsForSegment]);

  useEffect(() => {
    void loadPlannerVenues();
  }, [loadPlannerVenues]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEventsForSegment();
    setRefreshing(false);
  }, [loadEventsForSegment]);

  const closePlanner = useCallback(() => {
    setShowPlannerModal(false);
    setCurrentPlan(null);
  }, []);

  const closeVote = useCallback(() => {
    setShowVoteModal(false);
    setSelectedEvents([]);
    setVoteLink(null);
  }, []);

  const handleGeneratePlan = useCallback(async () => {
    if (!selectedMood) {
      return;
    }

    setGeneratingPlan(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCurrentPlan(generateMockTonightPlan(selectedMood, 0, venues));
    setPlanIndex(0);
    setGeneratingPlan(false);
  }, [selectedMood, venues]);

  const handleNextPlan = useCallback(() => {
    if (!selectedMood) {
      return;
    }

    const nextIndex = planIndex + 1;
    setCurrentPlan(generateMockTonightPlan(selectedMood, nextIndex, venues));
    setPlanIndex(nextIndex);
  }, [planIndex, selectedMood, venues]);

  const handleSavePlan = useCallback(() => {
    Alert.alert(actionLabels.planSaved);
    closePlanner();
  }, [actionLabels.planSaved, closePlanner]);

  const handleSharePlan = useCallback(async () => {
    if (!currentPlan) {
      return;
    }

    try {
      await Share.share({
        message: buildTonightPlanShareText(language, currentPlan),
      });
    } catch (error) {
      console.error('Error sharing plan:', error);
    }
  }, [currentPlan, language]);

  const handleOpenVoteModal = useCallback(() => {
    setSelectedEvents([]);
    setVoteLink(null);
    setVotes({});
    setShowVoteModal(true);
  }, []);

  const toggleEventSelection = useCallback((eventId: string) => {
    setSelectedEvents((current) => toggleTonightSelection(current, eventId));
  }, []);

  const handleCreateVote = useCallback(() => {
    if (selectedEvents.length < 2) {
      return;
    }

    setVoteLink(buildMockTonightVoteLink(selectedEvents));
    setVotes(createMockVoteState(selectedEvents));
  }, [selectedEvents]);

  const handleVote = useCallback((eventId: string) => {
    setVotes((current) => ({
      ...current,
      [eventId]: (current[eventId] || 0) + 1,
    }));
  }, []);

  const handleShareVote = useCallback(async () => {
    if (!voteLink) {
      return;
    }

    try {
      await Share.share({
        message: buildTonightVoteShareText(language, voteLink),
      });
    } catch (error) {
      console.error('Error sharing vote:', error);
    }
  }, [language, voteLink]);

  const handleEventTap = useCallback(
    (eventId: string) => {
      router.push(`/event/${eventId}`);
    },
    [router]
  );

  const handleTicketPress = useCallback((url: string) => {
    void Linking.openURL(url);
  }, []);

  const renderEventProps = useCallback(
    (event: Event) => ({
      eventTime: formatEventTime(event.start_datetime),
      eventTitle: isBosnian ? event.title_bs : event.title_en || event.title_bs,
      isSelected: selectedEvents.includes(event.id),
      priceText: getTonightPriceText(event, language),
      ticketButtonText: getTicketButtonText(event.ticket_url, language),
      urgencyBadge: getUrgencyBadge(event.start_datetime, {
        tonight: translate('tonightLabel'),
        tomorrow: translate('tomorrowLabel'),
      }),
      venueName: event.venues?.name || event.location_name || '',
    }),
    [isBosnian, language, selectedEvents, translate]
  );

  return {
    actionLabels,
    activeSegment,
    budget,
    closePlanner,
    closeVote,
    currentPlan,
    events,
    generatingPlan,
    groupSize,
    handleCreateVote,
    handleEventTap,
    handleGeneratePlan,
    handleNextPlan,
    handleOpenVoteModal,
    handleSavePlan,
    handleSharePlan,
    handleShareVote,
    handleTicketPress,
    handleVote,
    loading,
    onRefresh,
    plannerLabels,
    refreshing,
    renderEventProps,
    selectedEvents,
    selectedMood,
    segments,
    setActiveSegment,
    setBudget,
    setGroupSize,
    setSelectedMood,
    setShowPlannerModal,
    showPlannerModal,
    showVoteModal,
    toggleEventSelection,
    voteLabels,
    voteLink,
    votes,
  };
}
