import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getProfileSettingsCopy,
  PROFILE_LANGUAGE_OPTIONS,
} from '@/utils/profileSettings';

test('profile settings exposes stable language options', () => {
  assert.deepEqual(PROFILE_LANGUAGE_OPTIONS, [
    { value: 'bs', label: 'BS' },
    { value: 'en', label: 'EN' },
  ]);
});

test('profile settings copy is localized and clean', () => {
  const bosnian = getProfileSettingsCopy(true);
  const english = getProfileSettingsCopy(false);

  assert.equal(bosnian.sectionTitle, 'Postavke');
  assert.equal(bosnian.badgeCountLabel, 'Bedzeva');
  assert.equal(bosnian.moodTitle, 'Sta te zanima?');
  assert.equal(english.sectionTitle, 'Settings');
  assert.equal(english.signOutLabel, 'Sign out');
});
