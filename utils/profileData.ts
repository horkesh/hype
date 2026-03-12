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
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
