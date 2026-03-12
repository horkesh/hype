import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HypeHeader } from '@/components/HypeHeader';
import { ProfileAccountCard } from '@/components/profile/ProfileAccountCard';
import { ProfileAuthCard } from '@/components/profile/ProfileAuthCard';
import { ProfileMoodSection } from '@/components/profile/ProfileMoodSection';
import { ProfileSettingsSection } from '@/components/profile/ProfileSettingsSection';
import { ProfileSignOutModal } from '@/components/profile/ProfileSignOutModal';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { subscribeToAuthChanges } from '@/utils/authSession';
import {
  loadProfileTaste,
  loadProfileUserAndTaste,
  saveProfileTaste,
  signInProfile,
  signOutProfile,
  signUpProfile,
} from '@/utils/profileData';
import { isProfileTasteAuthRequiredError } from '@/utils/profileTaste';
import {
  PROFILE_DEMO_BADGES,
  PROFILE_MOODS,
  PROFILE_THEME_OPTIONS,
  toggleProfileMoodSelection,
} from '@/utils/profileScreen';

export default function ProfileScreen() {
  const { language, setLanguage, setThemeMode, themeMode } = useApp();
  const { colors } = useTheme();
  const isBosnian = language === 'bs';

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const checkUser = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await loadProfileUserAndTaste();
      setUser(result.user);
      setSelectedMoods(result.moods);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkUser();
  }, [checkUser]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        void loadProfileTaste().then(setSelectedMoods).catch((error) => {
          console.error('Error loading taste profile:', error);
        });
      } else {
        setSelectedMoods([]);
      }
    });

    return unsubscribe;
  }, []);

  const handleToggleMood = useCallback(
    async (moodId: string) => {
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to personalize your taste profile.');
        return;
      }

      const nextMoods = toggleProfileMoodSelection(selectedMoods, moodId);
      const previousMoods = selectedMoods;
      setSelectedMoods(nextMoods);

      try {
        await saveProfileTaste(nextMoods);
      } catch (error) {
        console.error('Error saving taste profile:', error);
        setSelectedMoods(previousMoods);

        if (isProfileTasteAuthRequiredError(error)) {
          Alert.alert('Sign in required', 'Please sign in to save your taste profile.');
        }
      }
    },
    [selectedMoods, user]
  );

  const handleSignIn = useCallback(async () => {
    setAuthLoading(true);

    try {
      const nextUser = await signInProfile(email, password);
      setUser(nextUser);
      setSelectedMoods(await loadProfileTaste());
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Sign in failed', error.message || 'Failed to sign in');
    } finally {
      setAuthLoading(false);
    }
  }, [email, password]);

  const handleSignUp = useCallback(async () => {
    setAuthLoading(true);

    try {
      await signUpProfile(email, password);
      Alert.alert('Check your email', 'Check your email for the confirmation link.');
      setIsSignUp(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Sign up failed', error.message || 'Failed to sign up');
    } finally {
      setAuthLoading(false);
    }
  }, [email, password]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutProfile();
      setUser(null);
      setSelectedMoods([]);
      setShowSignOutModal(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  if (isLoading) {
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
          {!user ? (
            <ProfileAuthCard
              accentColor={colors.accent}
              authLoading={authLoading}
              backgroundColor={colors.background}
              cardColor={colors.card}
              email={email}
              isSignUp={isSignUp}
              onChangeEmail={setEmail}
              onChangePassword={setPassword}
              onSubmit={isSignUp ? handleSignUp : handleSignIn}
              onToggleMode={() => setIsSignUp((current) => !current)}
              password={password}
              placeholderTextColor={colors.textSecondary}
              textColor={colors.text}
            />
          ) : (
            <ProfileAccountCard
              accentColor={colors.accent}
              backgroundColor={colors.background}
              badgeCountLabel={isBosnian ? 'Bedževa' : 'Badges'}
              badgeCountNumber={PROFILE_DEMO_BADGES.length}
              badges={PROFILE_DEMO_BADGES}
              cardColor={colors.card}
              email={user.email || ''}
              onSignOut={() => setShowSignOutModal(true)}
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
          onToggleMood={handleToggleMood}
          selectedMoods={selectedMoods}
          title="Šta te zanima?"
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
        onCancel={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        textColor={colors.text}
        textSecondaryColor={colors.textSecondary}
        visible={showSignOutModal}
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
