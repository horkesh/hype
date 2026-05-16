import test from 'node:test';
import assert from 'node:assert/strict';
import { extractRawEventCandidates } from '../src/services/ingestionFetch.js';

test('extractRawEventCandidates resolves relative links and keeps visible titles', () => {
  const candidates = extractRawEventCandidates(
    `
      <html>
        <body>
          <a href="/events/test-event">Test Event Tonight</a>
          <a href="https://example.com/events/second">Second Event</a>
        </body>
      </html>
    `,
    {
      id: 'source-1',
      name: 'Example Source',
      sourceUrl: 'https://example.com/listings',
      tier: 2,
      scrapeConfig: {},
      frequencyHours: 24,
      isActive: true,
      lastScrapedAt: null,
      readyToRun: true,
    },
  );

  assert.equal(candidates.length, 2);
  assert.equal(candidates[0]?.sourceUrl, 'https://example.com/events/test-event');
  assert.equal(candidates[0]?.titleRaw, 'Test Event Tonight');
});

test('extractRawEventCandidates resolves relative links against an override list url', () => {
  const candidates = extractRawEventCandidates(
    `
      <html>
        <body>
          <a href="/karte/event/8123/jazz-night">07/03 Jazz Night Sarajevo @BKC</a>
        </body>
      </html>
    `,
    {
      id: 'source-2',
      name: 'KupiKartu',
      sourceUrl: 'https://www.kupikartu.ba',
      tier: 1,
      scrapeConfig: {
        parser_hint: 'kupikartu_listing',
        list_url: 'https://www.kupikartu.ba/karte/kategorija/2',
      },
      frequencyHours: 6,
      isActive: true,
      lastScrapedAt: null,
      readyToRun: true,
    },
    25,
    'https://www.kupikartu.ba/karte/kategorija/2',
  );

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0]?.sourceUrl, 'https://www.kupikartu.ba/karte/event/8123/jazz-night');
  assert.equal(candidates[0]?.titleRaw, 'Jazz Night Sarajevo');
  assert.equal(candidates[0]?.rawJson.sourcePageUrl, 'https://www.kupikartu.ba/karte/kategorija/2');
});

test('extractRawEventCandidates does NOT fall back to generic anchors when a source-specific extractor returns empty', () => {
  // A category page with zero Sarajevo events. The strict filter drops every
  // ticket card, so extractCandidatesForSource returns []. The generic anchor
  // fallback would otherwise harvest nav/footer links ("Muzika", "Kontakt").
  const candidates = extractRawEventCandidates(
    `
      <html>
        <body>
          <a href="/cat/1/muzika">Muzika</a>
          <a href="/contact">Kontakt</a>
          <div class="movie-grid">
            <h5 class="title m-0 event-title-front">
              <a href="/tickets/999/show-in-mostar">Concert in Mostar</a>
            </h5>
            <span class="location"><b>Hala</b><span class="smallinfo">,  Mostar</span></span>
          </div>
        </body>
      </html>
    `,
    {
      id: 'ulaznice',
      name: 'Ulaznice.org Sarajevo',
      sourceUrl: 'https://www.ulaznice.org/cat/1/muzika',
      tier: 1,
      scrapeConfig: { parser_hint: 'ulaznice_listing' },
      frequencyHours: 6,
      isActive: true,
      lastScrapedAt: null,
      readyToRun: true,
    },
  );

  assert.equal(
    candidates.length,
    0,
    'When the source-specific extractor returns [], we must NOT fall back to anchor harvesting',
  );
});
