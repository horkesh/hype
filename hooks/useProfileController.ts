import { Alert } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import { subscribeToAuthChanges } from '@/utils/authSession';
import {
  loadProfileTaste,
  loadProfileUserAndTaste,
  saveProfileTaste,
  signInProfile,
  signOutProfile,
  signUpProfile,
} from '@/utils/profileData';
import { getProfileSettingsCopy } from '@/utils/profileSettings';
import { isProfileTasteAuthRequiredError } from '@/utils/profileTaste';
import { toggleProfileMoodSelection } from '@/utils/profileScreen';

interface UseProfileControllerOptions {
  isBosnian: boolean;
}

export function useProfileController({ isBosnian }: UseProfileControllerOptions) {
  const settingsCopy = getProfileSettingsCopy(isBosnian);

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
        Alert.alert(settingsCopy.authRequiredTitle, settingsCopy.authRequiredBody);
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
          Alert.alert(settingsCopy.authRequiredTitle, settingsCopy.authRequiredSaveBody);
        }
      }
    },
    [selectedMoods, settingsCopy, user]
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
      Alert.alert(settingsCopy.signInFailedTitle, error.message || settingsCopy.signInFailedBody);
    } finally {
      setAuthLoading(false);
    }
  }, [email, password, settingsCopy.signInFailedBody, settingsCopy.signInFailedTitle]);

  const handleSignUp = useCallback(async () => {
    setAuthLoading(true);

    try {
      await signUpProfile(email, password);
      Alert.alert(settingsCopy.authCheckEmailTitle, settingsCopy.authCheckEmailBody);
      setIsSignUp(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert(settingsCopy.signUpFailedTitle, error.message || settingsCopy.signUpFailedBody);
    } finally {
      setAuthLoading(false);
    }
  }, [
    email,
    password,
    settingsCopy.authCheckEmailBody,
    settingsCopy.authCheckEmailTitle,
    settingsCopy.signUpFailedBody,
    settingsCopy.signUpFailedTitle,
  ]);

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

  return {
    authLoading,
    email,
    handleSignIn,
    handleSignOut,
    handleSignUp,
    handleToggleMood,
    isLoading,
    isSignUp,
    password,
    selectedMoods,
    setEmail,
    setIsSignUp,
    setPassword,
    settingsCopy,
    setShowSignOutModal,
    showSignOutModal,
    user,
  };
}
