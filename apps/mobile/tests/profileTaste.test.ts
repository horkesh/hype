import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROFILE_TASTE_AUTH_REQUIRED,
  ProfileTasteAuthRequiredError,
  isProfileTasteAuthRequiredError,
} from '../utils/profileTasteErrors';

test('ProfileTasteAuthRequiredError exposes the canonical auth-required code', () => {
  const error = new ProfileTasteAuthRequiredError();

  assert.equal(error.code, PROFILE_TASTE_AUTH_REQUIRED);
  assert.equal(isProfileTasteAuthRequiredError(error), true);
});

test('isProfileTasteAuthRequiredError recognizes plain objects with the auth-required code', () => {
  assert.equal(
    isProfileTasteAuthRequiredError({ code: PROFILE_TASTE_AUTH_REQUIRED }),
    true,
  );
  assert.equal(isProfileTasteAuthRequiredError({ code: 'OTHER_ERROR' }), false);
});
