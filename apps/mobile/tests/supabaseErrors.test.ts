import test from 'node:test';
import assert from 'node:assert/strict';
import { isAuthSessionMissingError } from '../utils/supabaseErrors';

test('isAuthSessionMissingError recognizes Supabase auth-session-missing errors by name', () => {
  assert.equal(
    isAuthSessionMissingError({ name: 'AuthSessionMissingError', message: 'Auth session missing!' }),
    true,
  );
});

test('isAuthSessionMissingError recognizes Supabase auth-session-missing errors by message', () => {
  assert.equal(
    isAuthSessionMissingError({ message: 'Auth session missing!' }),
    true,
  );
  assert.equal(
    isAuthSessionMissingError({ message: 'Something else failed' }),
    false,
  );
});
