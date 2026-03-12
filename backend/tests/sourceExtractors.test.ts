import test from 'node:test';
import assert from 'node:assert/strict';
import { extractCandidatesForSource } from '../src/services/sourceExtractors.js';

test('extractCandidatesForSource prefers Pozorista event links when configured', () => {
  const candidates = extractCandidatesForSource(
    `
      <div>
        <a href="/?event=mala-floramye">Mala Floramye</a>
        <a href="/?event=sarajevska-prica">Sarajevska priča</a>
      </div>
    `,
    {
      id: 'pozorista',
      name: 'Pozorista',
      sourceUrl: 'https://pozorista.ba/',
      tier: 1,
      scrapeConfig: {
        parser_hint: 'pozorista_calendar',
      },
      frequencyHours: 24,
      isActive: true,
      lastScrapedAt: null,
      readyToRun: true,
    },
  );

  assert.ok(candidates);
  assert.equal(candidates?.length, 2);
  assert.equal(candidates?.[0]?.sourceUrl, 'https://pozorista.ba/?event=mala-floramye');
  assert.equal(candidates?.[0]?.titleRaw, 'Mala Floramye');
  assert.equal(candidates?.[0]?.dateRaw, null);
});

test('extractCandidatesForSource recognizes AllEvents Sarajevo event links', () => {
  const candidates = extractCandidatesForSource(
    `
      <div>
        <a href="/sarajevo/opera-mala-floramye/200029692717302">
          <img src="/images/opera.jpg" />
          Opera Mala Floramye
        </a>
        Fri 14 Mar 2026 19:30 at Narodno Pozoriste Sarajevo 245+ Interested
        <a href="https://allevents.in/sarajevo/hardcore-udara/200029548920340">Hardcore Udara</a>
      </div>
    `,
    {
      id: 'allevents',
      name: 'AllEvents',
      sourceUrl: 'https://allevents.in/sarajevo/all',
      tier: 1,
      scrapeConfig: {
        parser_hint: 'allevents_listing',
      },
      frequencyHours: 8,
      isActive: true,
      lastScrapedAt: null,
      readyToRun: true,
    },
  );

  assert.ok(candidates);
  assert.equal(candidates?.length, 2);
  assert.equal(
    candidates?.[0]?.sourceUrl,
    'https://allevents.in/sarajevo/opera-mala-floramye/200029692717302',
  );
  assert.equal(candidates?.[0]?.titleRaw, 'Opera Mala Floramye');
  assert.equal(candidates?.[0]?.dateRaw, 'Fri 14 Mar 2026 19:30');
  assert.equal(candidates?.[0]?.venueNameRaw, 'Narodno Pozoriste Sarajevo');
  assert.equal(candidates?.[0]?.imageUrl, 'https://allevents.in/images/opera.jpg');
});

test('extractCandidatesForSource recognizes KupiKartu event links and trims card noise', () => {
  const candidates = extractCandidatesForSource(
    `
      <div>
        <a href="/karte/event/7656/fk-zeljeznicar-fk-sloga">
          <img src="/img/test.jpg" />
          25.02.2026
          FK ZELJEZNICAR - FK SLOGA
          @Stadion Grbavica
        </a>
        <a href="https://www.kupikartu.ba/karte/event/8123/jazz-night">
          07/03
          Jazz Night Sarajevo
          @BKC
        </a>
      </div>
    `,
    {
      id: 'kupikartu',
      name: 'KupiKartu',
      sourceUrl: 'https://www.kupikartu.ba',
      tier: 1,
      scrapeConfig: {
        parser_hint: 'kupikartu_listing',
      },
      frequencyHours: 6,
      isActive: true,
      lastScrapedAt: null,
      readyToRun: true,
    },
  );

  assert.ok(candidates);
  assert.equal(candidates?.length, 2);
  assert.equal(
    candidates?.[0]?.sourceUrl,
    'https://www.kupikartu.ba/karte/event/7656/fk-zeljeznicar-fk-sloga',
  );
  assert.equal(candidates?.[0]?.titleRaw, 'FK ZELJEZNICAR - FK SLOGA');
  assert.equal(candidates?.[0]?.dateRaw, '25.02.2026');
  assert.equal(candidates?.[0]?.venueNameRaw, 'Stadion Grbavica');
  assert.equal(candidates?.[0]?.imageUrl, 'https://www.kupikartu.ba/img/test.jpg');
  assert.equal(candidates?.[1]?.titleRaw, 'Jazz Night Sarajevo');
  assert.equal(candidates?.[1]?.dateRaw, '07/03');
  assert.equal(candidates?.[1]?.venueNameRaw, 'BKC');
});
