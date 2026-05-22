import { supabase } from '@/integrations/supabase/client';
import {
  getTasteMoodsForCurrentUser,
  saveTasteMoodsForCurrentUser,
} from '@/utils/profileTaste';

export async function loadProfileUserAndTaste(): Promise<{
  moods: string[];
  user: any | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      moods: [],
      user: null,
    };
  }

  return {
    moods: await getTasteMoodsForCurrentUser(),
    user,
  };
}

export async function loadProfileTaste(): Promise<string[]> {
  return getTasteMoodsForCurrentUser();
}

export async function saveProfileTaste(moods: string[]): Promise<void> {
  await saveTasteMoodsForCurrentUser(moods);
}

export async function signInProfile(
  email: string,
  password: string
): Promise<any> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signUpProfile(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signOutProfile(): Promise<void> {
  // Clear locally-cached, user-scoped state BEFORE the signOut call so that
  // even if the auth call fails mid-flight, we've already wiped data that
  // belongs to the outgoing user. Prevents user B from seeing user A's
  // favorites / saved events after a same-device handoff.
  await clearLocalUserCaches();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

async function clearLocalUserCaches(): Promise<void> {
  try {
    // Lazy-import these to keep profileData a thin auth shim — and to avoid
    // pulling RN-only AsyncStorage into module init at server-side rendering.
    const [
      { LEGACY_FAVORITE_VENUE_KEYS },
      { LEGACY_SAVED_EVENT_KEYS },
      { LEGACY_SAVED_SERIES_KEYS },
      AsyncStorageModule,
      planGenerator,
    ] = await Promise.all([
      import('@/utils/favoritesLegacy'),
      import('@/utils/savedEventsStorage'),
      import('@/utils/savedSeriesStorage'),
      import('@react-native-async-storage/async-storage'),
      import('@/utils/ai/planGenerator'),
    ]);
    const AsyncStorage = AsyncStorageModule.default;
    const keys = [
      ...LEGACY_FAVORITE_VENUE_KEYS,
      ...LEGACY_SAVED_EVENT_KEYS,
      ...LEGACY_SAVED_SERIES_KEYS,
    ];
    await Promise.all(keys.map((k) => AsyncStorage.removeItem(k).catch(() => {})));
    planGenerator.clearVenueLookupCache();
  } catch (err) {
    // Best-effort — the sign-out should still complete even if we couldn't
    // wipe local state. Worst case the next user sees stale favorites for
    // a moment until they touch them.
    console.error('clearLocalUserCaches:', err);
  }
}
