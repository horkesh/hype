import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enrichAllEventsCandidateFromDetail,
  enrichCandidatesForSource,
  enrichKupikartuCandidateFromDetail,
} from '../src/services/sourceDetailEnrichment.js';

test('enrichAllEventsCandidateFromDetail uses JSON-LD event data', () => {
  const enriched = enrichAllEventsCandidateFromDetail(
    {
      sourceUrl: 'https://allevents.in/sarajevo/opera/2001',
      titleRaw: 'Opera',
      rawHtml: null,
      rawJson: {},
    },
    `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Event",
              "name": "Opera Mala Floramye",
              "startDate": "2026-03-14T19:30:00+01:00",
              "description": "A full-length opera event.",
              "image": ["https://allevents.in/images/opera-detail.jpg"],
              "location": {
                "@type": "Place",
                "name": "Narodno Pozoriste Sarajevo"
              }
            }
          </script>
        </head>
      </html>
    `,
  );

  assert.equal(enriched.titleRaw, 'Opera Mala Floramye');
  assert.equal(enriched.dateRaw, '2026-03-14T19:30:00+01:00');
  assert.equal(enriched.descriptionRaw, 'A full-length opera event.');
  assert.equal(enriched.imageUrl, 'https://allevents.in/images/opera-detail.jpg');
  assert.equal(enriched.venueNameRaw, 'Narodno Pozoriste Sarajevo');
});

test('enrichKupikartuCandidateFromDetail uses detail page metadata', () => {
  const enriched = enrichKupikartuCandidateFromDetail(
    {
      sourceUrl: 'https://www.kupikartu.ba/karte/event/8123/jazz-night',
      titleRaw: 'Jazz Night Sarajevo',
      rawHtml: null,
      rawJson: {},
    },
    `
      <html>
        <head>
          <meta property="og:image" content="https://www.kupikartu.ba/images/jazz-detail.jpg" />
          <meta property="og:description" content="A jazz evening in Sarajevo." />
        </head>
        <body>
          <h1>Jazz Night Sarajevo</h1>
          07.03.2026 u 20:00
          @BKC Sarajevo
        </body>
      </html>
    `,
  );

  assert.equal(enriched.titleRaw, 'Jazz Night Sarajevo');
  assert.equal(enriched.dateRaw, '07.03.2026 20:00');
  assert.equal(enriched.descriptionRaw, 'A jazz evening in Sarajevo.');
  assert.equal(enriched.imageUrl, 'https://www.kupikartu.ba/images/jazz-detail.jpg');
  assert.equal(enriched.venueNameRaw, 'BKC Sarajevo');
});

test('enrichCandidatesForSource applies source-specific detail fetch to the first candidates only', async () => {
  const candidates = await enrichCandidatesForSource(
    [
      {
        sourceUrl: 'https://allevents.in/sarajevo/opera/2001',
        titleRaw: 'Opera',
        rawHtml: null,
        rawJson: {},
      },
      {
        sourceUrl: 'https://allevents.in/sarajevo/party/2002',
        titleRaw: 'Party',
        rawHtml: null,
        rawJson: {},
      },
    ],
    {
      id: 'allevents',
      name: 'AllEvents',
      sourceUrl: 'https://allevents.in/sarajevo/all',
      tier: 1,
      scrapeConfig: {
        parser_hint: 'allevents_listing',
        detail_fetch: true,
        detail_fetch_limit: 1,
      },
      frequencyHours: 6,
      isActive: true,
      lastScrapedAt: null,
      readyToRun: true,
    },
    async (url: string) =>
      new Response(
        `
          <script type="application/ld+json">
            {
              "@type": "Event",
              "name": "${url.includes('/opera/') ? 'Opera Detail' : 'Party Detail'}",
              "startDate": "2026-03-14T19:30:00+01:00",
              "location": { "name": "Test Venue" }
            }
          </script>
        `,
        { status: 200 },
      ),
  );

  assert.equal(candidates[0]?.titleRaw, 'Opera Detail');
  assert.equal(candidates[1]?.titleRaw, 'Party');
});
