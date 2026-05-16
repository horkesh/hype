import test from 'node:test';
import assert from 'node:assert/strict';
import { extractCandidatesForSource } from '../src/services/sourceExtractors.js';

test('extractCandidatesForSource keeps Sarajevo-tagged Pozorista links and drops out-of-city or unsignalled cards', () => {
  const candidates = extractCandidatesForSource(
    `
      <div>
        <a href="/?event=sarajevska-prica">Sarajevska priča</a>
        Pozorište: Kamerni teatar 55
      </div>
      <div>
        <a href="/?event=tuzla-show">Tuzla Show</a>
        Pozorište: Narodno pozorište Tuzla
      </div>
      <div>
        <a href="/?event=narodno-sarajevo">Premijera u Narodnom pozorištu</a>
        Pozorište: Narodno pozorište Sarajevo
      </div>
      <div>
        <a href="/?event=mala-floramye">Mala Floramye</a>
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
  assert.equal(candidates?.length, 2, 'Tuzla card and unsignalled Mala Floramye must be dropped');
  assert.equal(candidates?.[0]?.sourceUrl, 'https://pozorista.ba/?event=sarajevska-prica');
  assert.equal(candidates?.[0]?.venueNameRaw, 'Kamerni teatar 55');
  assert.equal(candidates?.[1]?.sourceUrl, 'https://pozorista.ba/?event=narodno-sarajevo');
  assert.equal(candidates?.[1]?.venueNameRaw, 'Narodno pozorište Sarajevo');
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

test('extractCandidatesForSource recognizes Ulaznice event cards and keeps only Sarajevo entries', () => {
  const html = `
    <div class="col-md-6 col-lg-4 col-sm-12 event">
      <div class="movie-grid">
        <div class="movie-thumb c-thumb" data-bkgimg="/uploads/event/0/xs/301.png?timestamp=F1777285761">
          <a href="/tickets/301/pedja-medenica"><img src="/images/7x3.png" /></a>
        </div>
        <div class="movie-content bg-one">
          <h5 class="title m-0 event-title-front">
            <a href="/tickets/301/pedja-medenica">PEDJA MEDENICA</a>
          </h5>
          <span class="time">
            <span class="time">
              <i class="la la-calendar"></i>
              16. Maj 2026
            </span>
          </span>
          <span class="location">
            <a class="text-warning" target="_blank" href="https://www.google.com/maps/search/?api=1&query=AQUA">
              <i class="la la-map-marker"></i>
              <b>AQUA CLUB</b><span class="smallinfo">,  Sarajevo</span>
            </a>
          </span>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-4 col-sm-12 event">
      <div class="movie-grid">
        <div class="movie-thumb c-thumb" data-bkgimg="/uploads/event/0/xs/292.png">
          <a href="/tickets/292/aleksandra-mladenovic"><img src="/images/7x3.png" /></a>
        </div>
        <div class="movie-content bg-one">
          <h5 class="title m-0 event-title-front">
            <a href="/tickets/292/aleksandra-mladenovic">Aleksandra Mladenović</a>
          </h5>
          <span class="time">
            <span class="time">
              <i class="la la-calendar"></i>
              16. Maj 2026
            </span>
          </span>
          <span class="location">
            <a class="text-warning" target="_blank" href="https://www.google.com/maps/search/?api=1&query=Busovaca">
              <i class="la la-map-marker"></i>
              <b>OS Busovača</b><span class="smallinfo">,  Busovaca</span>
            </a>
          </span>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-4 col-sm-12 event">
      <div class="movie-grid">
        <div class="movie-thumb c-thumb" data-bkgimg="/uploads/event/0/xs/301.png">
          <a href="/tickets/301/pedja-medenica"><img src="/images/7x3.png" /></a>
        </div>
        <div class="movie-content bg-one">
          <h5 class="title m-0 event-title-front">
            <a href="/tickets/301/pedja-medenica">PEDJA MEDENICA</a>
          </h5>
        </div>
      </div>
    </div>
  `;

  const candidates = extractCandidatesForSource(html, {
    id: 'ulaznice',
    name: 'Ulaznice.org',
    sourceUrl: 'https://www.ulaznice.org/cat/1/muzika',
    tier: 1,
    scrapeConfig: {
      parser_hint: 'ulaznice_listing',
    },
    frequencyHours: 6,
    isActive: true,
    lastScrapedAt: null,
    readyToRun: true,
  });

  assert.ok(candidates);
  assert.equal(candidates?.length, 1, 'Busovaca card must be dropped; duplicate /tickets/301 must be deduped');
  assert.equal(
    candidates?.[0]?.sourceUrl,
    'https://www.ulaznice.org/tickets/301/pedja-medenica',
  );
  assert.equal(candidates?.[0]?.titleRaw, 'PEDJA MEDENICA');
  assert.equal(candidates?.[0]?.dateRaw, '16. Maj 2026');
  assert.equal(candidates?.[0]?.venueNameRaw, 'AQUA CLUB');
  assert.equal(
    candidates?.[0]?.imageUrl,
    'https://www.ulaznice.org/uploads/event/0/xs/301.png?timestamp=F1777285761',
  );
});

test('extractCandidatesForSource handles ulaznice vendor-prefixed event URLs', () => {
  const html = `
    <div class="movie-grid">
      <div class="movie-thumb c-thumb" data-bkgimg="/uploads/event/0/xs/265.png">
        <a href="/coloseum/tickets/265/nikola-rokvic"><img src="/images/7x3.png" /></a>
      </div>
      <div class="movie-content bg-one">
        <h5 class="title m-0 event-title-front">
          <a href="/coloseum/tickets/265/nikola-rokvic">Nikola Rokvic</a>
        </h5>
        <span class="time">
          <span class="time">
            <i class="la la-calendar"></i>
            20. Juni 2026
          </span>
        </span>
        <span class="location">
          <a href="#">
            <i class="la la-map-marker"></i>
            <b>Coloseum Club</b><span class="smallinfo">,  Sarajevo</span>
          </a>
        </span>
      </div>
    </div>
  `;

  const candidates = extractCandidatesForSource(html, {
    id: 'ulaznice',
    name: 'Ulaznice.org',
    sourceUrl: 'https://www.ulaznice.org/',
    tier: 1,
    scrapeConfig: { parser_hint: 'ulaznice_listing' },
    frequencyHours: 6,
    isActive: true,
    lastScrapedAt: null,
    readyToRun: true,
  });

  assert.ok(candidates);
  assert.equal(candidates?.length, 1);
  assert.equal(
    candidates?.[0]?.sourceUrl,
    'https://www.ulaznice.org/coloseum/tickets/265/nikola-rokvic',
  );
  assert.equal(candidates?.[0]?.venueNameRaw, 'Coloseum Club');
  assert.equal(candidates?.[0]?.dateRaw, '20. Juni 2026');
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

test('extractCandidatesForSource strict-rejects KupiKartu cards with no Sarajevo signal', () => {
  const candidates = extractCandidatesForSource(
    `
      <div>
        <a href="/karte/event/9001/utakmica-x">
          15.06.2026
          Utakmica X
          @Sportska dvorana
        </a>
        <a href="/karte/event/9002/utakmica-y">
          15.06.2026
          Utakmica u Mostaru
          @Hala Mostar
        </a>
      </div>
    `,
    {
      id: 'kupikartu',
      name: 'KupiKartu',
      sourceUrl: 'https://www.kupikartu.ba',
      tier: 1,
      scrapeConfig: { parser_hint: 'kupikartu_listing' },
      frequencyHours: 6,
      isActive: true,
      lastScrapedAt: null,
      readyToRun: true,
    },
  );

  assert.ok(candidates);
  assert.equal(
    candidates?.length,
    0,
    'Both cards must drop — Utakmica X has no signal, Utakmica u Mostaru has a non-Sarajevo city',
  );
});
