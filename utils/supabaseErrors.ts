export function isAuthSessionMissingError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if ('name' in error && error.name === 'AuthSessionMissingError') {
    return true;
  }

  if ('message' in error && typeof error.message === 'string') {
    return error.message.includes('Auth session missing');
  }

  return false;
}
