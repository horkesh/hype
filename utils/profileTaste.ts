import { supabase } from '@/integrations/supabase/client';
import { isAuthSessionMissingError } from '@/utils/supabaseErrors';

export const PROFILE_TASTE_AUTH_REQUIRED = 'PROFILE_TASTE_AUTH_REQUIRED';

export class ProfileTasteAuthRequiredError extends Error {
  code: string;

  constructor(message = 'Authentication is required to manage taste profile.') {
    super(message);
    this.name = 'ProfileTasteAuthRequiredError';
    this.code = PROFILE_TASTE_AUTH_REQUIRED;
  }
}

export function isProfileTasteAuthRequiredError(error: unknown): boolean {
  return error instanceof ProfileTasteAuthRequiredError
    || (typeof error === 'object'
      && error !== null
      && 'code' in error
      && (error as { code?: string }).code === PROFILE_TASTE_AUTH_REQUIRED);
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isAuthSessionMissingError(error)) {
      return null;
    }

    throw error;
  }

  return user?.id ?? null;
}

async function requireCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new ProfileTasteAuthRequiredError();
  }

  return userId;
}

export async function getTasteMoodsForCurrentUser(): Promise<string[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('taste_moods')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const tasteMoods = data?.taste_moods;
  return Array.isArray(tasteMoods)
    ? tasteMoods.filter((value): value is string => typeof value === 'string')
    : [];
}

export async function saveTasteMoodsForCurrentUser(moods: string[]): Promise<void> {
  const userId = await requireCurrentUserId();

  const { error } = await supabase
    .from('profiles')
    .update({
      taste_moods: moods,
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}
