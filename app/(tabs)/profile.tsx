import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HypeHeader } from '@/components/HypeHeader';
import { ProfileAccountCard } from '@/components/profile/ProfileAccountCard';
import { ProfileAuthCard } from '@/components/profile/ProfileAuthCard';
import { ProfileMoodSection } from '@/components/profile/ProfileMoodSection';
import { ProfileSettingsSection } from '@/components/profile/ProfileSettingsSection';
import { ProfileSignOutModal } from '@/components/profile/ProfileSignOutModal';
import { useApp } from '@/contexts/AppContext';
import { useProfileController } from '@/hooks/useProfileController';
import { useTheme } from '@/hooks/useTheme';
import {
  PROFILE_DEMO_BADGES,
  PROFILE_MOODS,
  PROFILE_THEME_OPTIONS,
} from '@/utils/profileScreen';

export default function ProfileScreen() {
  const { language, setLanguage, setThemeMode, themeMode } = useApp();
  const { colors } = useTheme();
  const isBosnian = language === 'bs';
  const controller = useProfileController({ isBosnian });

  if (controller.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <HypeHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <HypeHeader />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {!controller.user ? (
            <ProfileAuthCard
              accentColor={colors.accent}
              authLoading={controller.authLoading}
              backgroundColor={colors.background}
              cardColor={colors.card}
              email={controller.email}
              isSignUp={controller.isSignUp}
              onChangeEmail={controller.setEmail}
              onChangePassword={controller.setPassword}
              onSubmit={controller.isSignUp ? controller.handleSignUp : controller.handleSignIn}
              onToggleMode={() => controller.setIsSignUp((current) => !current)}
              password={controller.password}
              placeholderTextColor={colors.textSecondary}
              textColor={colors.text}
            />
          ) : (
            <ProfileAccountCard
              accentColor={colors.accent}
              backgroundColor={colors.background}
              badgeCountLabel={controller.settingsCopy.badgeCountLabel}
              badgeCountNumber={PROFILE_DEMO_BADGES.length}
              badges={PROFILE_DEMO_BADGES}
              cardColor={colors.card}
              email={controller.user.email || ''}
              onSignOut={() => controller.setShowSignOutModal(true)}
              signOutLabel={controller.settingsCopy.signOutLabel}
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
            />
          )}
        </View>

        <ProfileMoodSection
          accentColor={colors.accent}
          cardColor={colors.card}
          colorsText={colors.text}
          isBosnian={isBosnian}
          moods={PROFILE_MOODS}
          onToggleMood={controller.handleToggleMood}
          selectedMoods={controller.selectedMoods}
          title={controller.settingsCopy.moodTitle}
        />

        <ProfileSettingsSection
          accentColor={colors.accent}
          backgroundColor={colors.background}
          cardColor={colors.card}
          colorsText={colors.text}
          isBosnian={isBosnian}
          language={language}
          onSelectTheme={setThemeMode}
          onToggleLanguage={setLanguage}
          textSecondaryColor={colors.textSecondary}
          themeMode={themeMode}
          themeOptions={PROFILE_THEME_OPTIONS}
        />
      </ScrollView>

      <ProfileSignOutModal
        accentColor={colors.accent}
        backgroundColor={colors.background}
        body={controller.settingsCopy.signOutModalBody}
        cancelLabel={controller.settingsCopy.signOutModalCancel}
        confirmLabel={controller.settingsCopy.signOutModalConfirm}
        onCancel={() => controller.setShowSignOutModal(false)}
        onConfirm={controller.handleSignOut}
        textColor={colors.text}
        textSecondaryColor={colors.textSecondary}
        title={controller.settingsCopy.signOutModalTitle}
        visible={controller.showSignOutModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
  },
});
