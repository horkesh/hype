export const FAVORITES_AUTH_REQUIRED = 'FAVORITES_AUTH_REQUIRED';

export class FavoritesAuthRequiredError extends Error {
  code: string;

  constructor(message = 'Authentication is required to manage favorites.') {
    super(message);
    this.name = 'FavoritesAuthRequiredError';
    this.code = FAVORITES_AUTH_REQUIRED;
  }
}

export function isFavoritesAuthRequiredError(error: unknown): boolean {
  return error instanceof FavoritesAuthRequiredError
    || (typeof error === 'object'
      && error !== null
      && 'code' in error
      && (error as { code?: string }).code === FAVORITES_AUTH_REQUIRED);
}
