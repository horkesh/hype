import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildVenueDeliveryActions,
  buildVenuePrimaryActions,
} from '@/utils/venueActions';

test('buildVenuePrimaryActions keeps stable ordering and saved-state icon choice', () => {
  const actions = buildVenuePrimaryActions({
    hasInstagram: true,
    hasPhone: true,
    hasWebsite: false,
    isSaved: true,
    labels: {
      navigate: 'Navigate',
      call: 'Call',
      save: 'Save',
      web: 'Web',
      instagram: 'Instagram',
      korpa: 'Korpa',
      glovo: 'Glovo',
    },
  });

  assert.deepEqual(actions.map((action) => action.id), ['navigate', 'call', 'instagram', 'save']);
  assert.equal(actions[3]?.emoji, '❤️');
});

test('buildVenueDeliveryActions includes only enabled delivery partners', () => {
  const actions = buildVenueDeliveryActions({
    hasGlovo: false,
    hasKorpa: true,
    labels: {
      korpa: 'Korpa',
      glovo: 'Glovo',
    },
  });

  assert.deepEqual(actions, [{ id: 'korpa', label: 'Korpa', emoji: '🛍' }]);
});
