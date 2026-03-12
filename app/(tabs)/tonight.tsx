import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HypeHeader } from '@/components/HypeHeader';
import { TonightScreenContent } from '@/components/tonight/TonightScreenContent';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { useTonightController } from '@/hooks/useTonightController';

export default function TonightScreen() {
  const { t, language } = useApp();
  const { colors } = useTheme();
  const isBosnian = language === 'bs';
  const controller = useTonightController({
    isBosnian,
    language,
    translate: t,
  });

  const content = (
    <TonightScreenContent
      activePlan={controller.currentPlan}
      activeSegment={controller.activeSegment}
      budget={controller.budget}
      cardColor={colors.card}
      colorsText={colors.text}
      emptyStateMessage={t('noEventsInSegment')}
      eventMetaSeparator={' \u2022 '}
      events={controller.events}
      generatingPlan={controller.generatingPlan}
      groupSize={controller.groupSize}
      isBosnian={isBosnian}
      loading={controller.loading}
      onClosePlanner={controller.closePlanner}
      onCloseVote={controller.closeVote}
      onCreateVote={controller.handleCreateVote}
      onEventPress={controller.handleEventTap}
      onGeneratePlan={controller.handleGeneratePlan}
      onNextPlan={controller.handleNextPlan}
      onOpenPlanner={() => controller.setShowPlannerModal(true)}
      onOpenTicket={controller.handleTicketPress}
      onOpenVote={controller.handleOpenVoteModal}
      onRefresh={controller.onRefresh}
      onSavePlan={controller.handleSavePlan}
      onSelectGroupSize={controller.setGroupSize}
      onSelectMood={controller.setSelectedMood}
      onSelectSegment={controller.setActiveSegment}
      onSetBudget={controller.setBudget}
      onSharePlan={controller.handleSharePlan}
      onShareVote={controller.handleShareVote}
      onToggleSelection={controller.toggleEventSelection}
      onVote={controller.handleVote}
      plannerButtonText={isBosnian ? 'Predlozi mi plan \u2728' : 'Suggest a plan \u2728'}
      plannerLabels={controller.plannerLabels}
      refreshing={controller.refreshing}
      renderEventProps={controller.renderEventProps}
      secondaryButtonText={isBosnian ? 'Predlozi ekipi \u{1F5F3}' : 'Suggest to group \u{1F5F3}'}
      selectedEvents={controller.selectedEvents}
      selectedMood={controller.selectedMood}
      segments={controller.segments}
      showPlannerModal={controller.showPlannerModal}
      showVoteModal={controller.showVoteModal}
      textSecondaryColor={colors.textSecondary}
      voteLabels={controller.voteLabels}
      voteLink={controller.voteLink}
      votes={controller.votes}
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
