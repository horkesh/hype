import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FAVORITES_AUTH_REQUIRED,
  FavoritesAuthRequiredError,
  isFavoritesAuthRequiredError,
} from '../utils/favoritesErrors';

test('FavoritesAuthRequiredError exposes the canonical auth-required code', () => {
  const error = new FavoritesAuthRequiredError();

  assert.equal(error.code, FAVORITES_AUTH_REQUIRED);
  assert.equal(isFavoritesAuthRequiredError(error), true);
});

test('isFavoritesAuthRequiredError recognizes plain objects with the auth-required code', () => {
  assert.equal(
    isFavoritesAuthRequiredError({ code: FAVORITES_AUTH_REQUIRED }),
    true,
  );
  assert.equal(isFavoritesAuthRequiredError({ code: 'OTHER_ERROR' }), false);
});
