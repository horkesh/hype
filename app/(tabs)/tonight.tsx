import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, Share, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HypeHeader } from '@/components/HypeHeader';
import { TonightScreenContent } from '@/components/tonight/TonightScreenContent';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { loadTonightEvents, loadTonightVenues } from '@/utils/tonightData';
import {
  AIPlan,
  buildTonightPlanShareText,
  buildTonightSegments,
  buildTonightVoteShareText,
  Event,
  generateMockTonightPlan,
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

export default function TonightScreen() {
  const { t, language } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const isBosnian = language === 'bs';

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

  const segments = useMemo(() => buildTonightSegments(t), [t]);

  const plannerLabels = useMemo(
    () => ({
      budget: isBosnian ? `Budzet: ${budget} KM` : `Budget: ${budget} KM`,
      close: 'X',
      generate: isBosnian ? 'Generisi plan \u2728' : 'Generate plan \u2728',
      group: isBosnian ? `Grupa: ${groupSize} osoba` : `Group: ${groupSize} people`,
      mood: isBosnian ? 'Raspolozenje' : 'Mood',
      nextPlan: isBosnian ? '\u{1F504} Daj drugi plan' : '\u{1F504} Another plan',
      save: isBosnian ? '\u{1F4BE} Sacuvaj' : '\u{1F4BE} Save',
      share: isBosnian ? '\u{1F4E4} Podijeli' : '\u{1F4E4} Share',
      title: isBosnian ? 'AI Planer veceri' : 'AI Evening Planner',
      total: isBosnian ? 'Ukupno:' : 'Total:',
    }),
    [budget, groupSize, isBosnian]
  );

  const voteLabels = useMemo(
    () => ({
      close: 'X',
      createVote: isBosnian ? 'Kreiraj glasanje' : 'Create vote',
      results: isBosnian ? 'Rezultati:' : 'Results:',
      selectedCount: isBosnian ? 'Izabrano:' : 'Selected:',
      shareLink: isBosnian ? '\u{1F4E4} Podijeli link' : '\u{1F4E4} Share link',
      title: isBosnian ? 'Grupno glasanje' : 'Group Voting',
      vote: isBosnian ? 'Glasaj' : 'Vote',
      voteLink: isBosnian ? 'Link za glasanje:' : 'Voting link:',
      votePrompt: isBosnian
        ? 'Izaberi 2-4 dogadaja za glasanje'
        : 'Select 2-4 events for voting',
      voteWord: isBosnian ? 'glasova' : 'votes',
    }),
    [isBosnian]
  );

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
    Alert.alert(isBosnian ? 'Plan sacuvan!' : 'Plan saved!');
    closePlanner();
  }, [closePlanner, isBosnian]);

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

    const mockLink = `hype.ba/vote/${Math.random().toString(36).substring(7)}`;
    setVoteLink(mockLink);
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
        tonight: t('tonightLabel'),
        tomorrow: t('tomorrowLabel'),
      }),
      venueName: event.venues?.name || event.location_name || '',
    }),
    [isBosnian, language, selectedEvents, t]
  );

  const content = (
    <TonightScreenContent
      activePlan={currentPlan}
      activeSegment={activeSegment}
      budget={budget}
      cardColor={colors.card}
      colorsText={colors.text}
      emptyStateMessage={t('noEventsInSegment')}
      eventMetaSeparator={' • '}
      events={events}
      generatingPlan={generatingPlan}
      groupSize={groupSize}
      isBosnian={isBosnian}
      loading={loading}
      onClosePlanner={closePlanner}
      onCloseVote={closeVote}
      onCreateVote={handleCreateVote}
      onEventPress={handleEventTap}
      onGeneratePlan={handleGeneratePlan}
      onNextPlan={handleNextPlan}
      onOpenPlanner={() => setShowPlannerModal(true)}
      onOpenTicket={handleTicketPress}
      onOpenVote={handleOpenVoteModal}
      onRefresh={onRefresh}
      onSavePlan={handleSavePlan}
      onSelectGroupSize={setGroupSize}
      onSelectMood={setSelectedMood}
      onSelectSegment={setActiveSegment}
      onSetBudget={setBudget}
      onSharePlan={handleSharePlan}
      onShareVote={handleShareVote}
      onToggleSelection={toggleEventSelection}
      onVote={handleVote}
      plannerButtonText={isBosnian ? 'Predlozi mi plan \u2728' : 'Suggest a plan \u2728'}
      plannerLabels={plannerLabels}
      refreshing={refreshing}
      renderEventProps={renderEventProps}
      secondaryButtonText={isBosnian ? 'Predlozi ekipi \u{1F5F3}' : 'Suggest to group \u{1F5F3}'}
      selectedEvents={selectedEvents}
      selectedMood={selectedMood}
      segments={segments}
      showPlannerModal={showPlannerModal}
      showVoteModal={showVoteModal}
      textSecondaryColor={colors.textSecondary}
      voteLabels={voteLabels}
      voteLink={voteLink}
      votes={votes}
    />
  );

  if (Platform.OS === 'ios') {
    return (
      <>
        <Stack.Screen
          options={{
            title: t('tonight'),
            headerLargeTitle: true,
          }}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}>{content}</View>
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <HypeHeader />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
