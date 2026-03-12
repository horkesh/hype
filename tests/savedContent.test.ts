import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSavedBadgeCardModels,
  buildSavedEventCardModels,
  buildSavedVenueCardModels,
} from '@/utils/savedContent';

test('buildSavedVenueCardModels shapes venue price and mood display data', () => {
  const models = buildSavedVenueCardModels(
    [
      {
        id: 'venue-1',
        name: 'Kino Bosna',
        category: 'bar',
        neighborhood: 'Centar',
        price_level: 2,
        moods: ['party', 'culture'],
        cover_image_url: null,
      },
    ],
    {
      getPriceLevelDisplay: (level) => '$'.repeat(level),
      moodLookup: { party: 'P', culture: 'C' },
    }
  );

  assert.deepEqual(models, [
    {
      id: 'venue-1',
      venueId: 'venue-1',
      category: 'bar',
      imageSource: null,
      moodBadges: ['P', 'C'],
      name: 'Kino Bosna',
      neighborhood: 'Centar',
      priceDisplay: '$$',
    },
  ]);
});

test('buildSavedEventCardModels shapes localized event copy and fallback venue names', () => {
  const models = buildSavedEventCardModels(
    [
      {
        id: 'event-1',
        title_bs: 'Koncert',
        title_en: 'Concert',
        cover_image_url: null,
        start_datetime: '2026-03-12T20:15:00',
        price_bam: null,
        venues: null,
        location_name: 'Dom mladih',
      },
    ],
    {
      atLabel: 'at',
      freeLabel: 'Free',
      formatDate: (date, atLabel) => `${date}:${atLabel}`,
      isBosnian: false,
    }
  );

  assert.deepEqual(models, [
    {
      dateDisplay: '2026-03-12T20:15:00:at',
      eventId: 'event-1',
      imageSource: null,
      priceDisplay: 'Free',
      title: 'Concert',
      venueName: 'Dom mladih',
    },
  ]);
});

test('buildSavedBadgeCardModels shapes earned state and progress per badge', () => {
  const models = buildSavedBadgeCardModels(
    [
      {
        id: 'badge-1',
        badge_key: 'explorer',
        name_bs: 'Istrazi',
        name_en: 'Explorer',
        description_bs: '',
        description_en: '',
        icon: 'X',
        criteria: {},
        is_active: true,
      },
      {
        id: 'badge-2',
        badge_key: 'unknown',
        name_bs: 'Drugi',
        name_en: 'Other',
        description_bs: '',
        description_en: '',
        icon: 'Y',
        criteria: {},
        is_active: true,
      },
    ],
    {
      earnedBadgeKeys: ['explorer'],
      formatDate: () => '12.3.2026',
      getProgress: (badgeKey) => (badgeKey === 'explorer' ? { current: 3, total: 3 } : { current: 1, total: 10 }),
      isBosnian: false,
    }
  );

  assert.deepEqual(models, [
    {
      badgeId: 'badge-1',
      badgeName: 'Explorer',
      earnedDate: '12.3.2026',
      icon: 'X',
      isEarned: true,
      progress: { current: 3, total: 3 },
      rawBadge: {
        id: 'badge-1',
        badge_key: 'explorer',
        name_bs: 'Istrazi',
        name_en: 'Explorer',
        description_bs: '',
        description_en: '',
        icon: 'X',
        criteria: {},
        is_active: true,
      },
    },
    {
      badgeId: 'badge-2',
      badgeName: 'Other',
      earnedDate: '12.3.2026',
      icon: 'Y',
      isEarned: false,
      progress: { current: 1, total: 10 },
      rawBadge: {
        id: 'badge-2',
        badge_key: 'unknown',
        name_bs: 'Drugi',
        name_en: 'Other',
        description_bs: '',
        description_en: '',
        icon: 'Y',
        criteria: {},
        is_active: true,
      },
    },
  ]);
});
