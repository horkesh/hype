import assert from 'node:assert/strict';
import test from 'node:test';

import { buildLeafletMapHtml, DEFAULT_MAP_REGION } from '@/utils/mapEmbed';

test('buildLeafletMapHtml escapes popup content', () => {
  const html = buildLeafletMapHtml(
    [
      {
        id: '1',
        latitude: 43.85,
        longitude: 18.41,
        title: 'Cafe <Tito>',
        description: 'Best & brightest',
      },
    ],
    DEFAULT_MAP_REGION
  );

  assert.match(html, /Cafe &lt;Tito&gt;/);
  assert.match(html, /Best &amp; brightest/);
  assert.doesNotMatch(html, /leaflet-routing-machine/);
});

test('buildLeafletMapHtml includes map center and marker coordinates', () => {
  const html = buildLeafletMapHtml(
    [
      {
        id: '1',
        latitude: 43.8563,
        longitude: 18.4131,
      },
    ],
    DEFAULT_MAP_REGION
  );

  assert.match(html, /37\.78825/);
  assert.match(html, /-122\.4324/);
  assert.match(html, /43\.8563/);
  assert.match(html, /18\.4131/);
});
