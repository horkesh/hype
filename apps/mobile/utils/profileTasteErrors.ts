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
