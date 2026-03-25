# Look x Visit Sarajevo — Finansijska ponuda

_Pripremljeno: 25.03.2026_

---

## 1. O projektu Look

Look je mobilna aplikacija (iOS + Android) i web platforma za otkrivanje Sarajeva — lokacija, dogadjaja, nocnog zivota, kulture i gastronomije. Aplikacija koristi najnovije AI tehnologije kako bi posjetiocima i gradjanima pruzila personalizirane preporuke na bosanskom i engleskom jeziku.

### Sta je vec gotovo

| Funkcionalnost | Status |
|----------------|--------|
| 1.226 verificiranih sarajevskih lokacija | Zavrseno |
| Dogadjaji uzivo iz 3 izvora (Pozorista.ba, AllEvents, KupiKartu) | Zavrseno |
| Dvojezicni interfejs (BS/EN) | Zavrseno |
| AI "City Pulse" — sta se trenutno desava u gradu | Zavrseno |
| AI Planer veceri — personalizirani prijedlog za vecer | Zavrseno |
| Pametna pretraga (prirodni jezik) | Zavrseno |
| Otkrivanje po raspolozenju (6 kategorija) | Zavrseno |
| Brendiranje Visit Sarajevo + logo | Zavrseno |
| Heritage setnje (kulturno-historijske rute) | 80% zavrseno |
| Web widget za VisitSarajevo.ba | Novo — 2–3 sedmice |
| Prijava na App Store (iOS + Android) | Spremno za prijavu |
| KupiKartu deep-linkovi za kupovinu karata | Zavrseno |

---

## 2. Mjesecni troskovi infrastrukture

### 2.1 Fiksne pretplate

| Usluga | Namjena | Mjesecno (KM) |
|--------|---------|---------------|
| Cloud baza podataka (Pro plan) | Baza podataka, autentikacija, funkcije, storage | ~49 KM |
| Web hosting (Pro plan) | Hosting web aplikacije, admin panel, widget | ~39 KM |
| AI razvojni alati | Razvoj, testiranje, automatizacija | ~392 KM |
| Apple Developer Program | Obavezno za iOS App Store | ~16 KM |
| Google Play Developer | Obavezno za Android Play Store | ~4 KM |
| Domena + DNS | Custom domena za web i API | ~6 KM |
| **Ukupno fiksno** | | **~506 KM/mj** |

### 2.2 AI servisni troskovi (ovisno o broju korisnika)

Aplikacija koristi vise AI modela optimiziranih za razlicite funkcije (generisanje teksta, obrada slika, pretraga, parsiranje podataka). Troskovi rastu linearno s brojem korisnika.

| Broj korisnika (MAU) | Sesija mjesecno | AI troskovi (KM/mj) |
|-----------------------|-----------------|----------------------|
| 50–100 (pilot) | 3.000 | ~24 KM |
| 500 (lansiranje) | 15.000 | ~118 KM |
| 1.000 (rast) | 30.000 | ~235 KM |
| 5.000 (skaliranje) | 150.000 | ~1.176 KM |

> Pri 1.000 aktivnih korisnika mjesecno, kompletni AI troskovi su manji od **jedne kafe dnevno** u Sarajevu.

### 2.3 Web scraping (prikupljanje podataka)

| Stavka | Mjesecno (KM) | Napomena |
|--------|---------------|----------|
| Instagram scraping (50+ lokacija) | ~96 KM | Automatski uvoz sadrzaja s Instagram profila lokacija |
| Scraping dogadjaja | 0 KM | Pozorista.ba, AllEvents, KupiKartu — vlastiti scraperi |
| Skaliranje (po potrebi) | do ~292 KM | Samo ako se znacajno poveca ucestalost scrapinga |

---

## 3. Ukupni mjesecni troskovi po fazama

### Faza A: Pilot (pred lansiranje, 50–100 korisnika)

| Kategorija | KM/mj |
|------------|-------|
| Fiksne pretplate | 506 KM |
| AI servisi | 24 KM |
| Web scraping | 96 KM |
| **Ukupno** | **~626 KM/mj** |

### Faza B: Lansiranje (500 korisnika, ljetna sezona)

| Kategorija | KM/mj |
|------------|-------|
| Fiksne pretplate | 506 KM |
| AI servisi | 118 KM |
| Web scraping | 96 KM |
| **Ukupno** | **~725 KM/mj** |

### Faza C: Rast (1.000 korisnika)

| Kategorija | KM/mj |
|------------|-------|
| Fiksne pretplate | 506 KM |
| AI servisi | 235 KM |
| Web scraping | 96 KM |
| **Ukupno** | **~840 KM/mj** |

### Faza D: Skaliranje (5.000 korisnika)

| Kategorija | KM/mj |
|------------|-------|
| Fiksne pretplate | 506 KM |
| AI servisi | 1.176 KM |
| Web scraping | 292 KM |
| **Ukupno** | **~1.975 KM/mj** |

---

## 4. Web integracija za VisitSarajevo.ba

Turisticka zajednica je izrazila zelju da se Look poveze s njihovom web stranicom tako da zive informacije budu vidljive direktno na VisitSarajevo.ba.

### Predlozeno rjesenje: Ugradivi web widget

Lagan, ugradivi widget koji Visit Sarajevo postavlja na svoju pocetnu stranicu. Widget automatski povlaci zive podatke i prikazuje ih u brendiranom panelu.

#### Sta widget prikazuje

**Tab 1: "Danas u Sarajevu"**
- AI pregled — sta se trenutno desava u gradu
- Trenutno vrijeme
- Top 3–5 dogadjaja za danas
- Svaki dogadjaj vodi na Look aplikaciju ili web

**Tab 2: "Popularna mjesta"**
- Najpopularnije lokacije
- Filteri po kategorijama (Kafane, Restorani, Kultura, Nocni zivot...)
- Svaka lokacija prikazuje: fotografiju, naziv, kategoriju, ocjenu

**Tab 3: "Veceras"**
- Vecernji dogadjaji i preporuke
- "Planiraj vecer" — otvara AI Planer veceri

#### Tehnicke karakteristike

- Jedna linija koda za ugradnju na bilo koju stranicu
- Automatsko azuriranje podataka (dogadjaji svakih 6 sati, lokacije dnevno, AI pregled svakih 30 min)
- Prilagodljiv dizajn (boje, jezik, broj stavki)
- Responzivan — radi na mobilnom, tabletu i desktopu
- Bez dodatnih mjesecnih troskova hostinga (pokriveno postojecim planom)

#### Procjena razvoja widgeta

| Zadatak | Sati |
|---------|------|
| Osnovna struktura widgeta | 8 |
| API za agregirane podatke | 4 |
| Tab "Danas u Sarajevu" | 6 |
| Tab "Popularna mjesta" | 6 |
| Tab "Veceras" | 4 |
| Integracija AI pregleda grada | 3 |
| Sistem tema (svjetlo/tamno/custom boje) | 4 |
| Responzivni dizajn | 4 |
| Deep linkovi (widget → app/web) | 3 |
| Testiranje i poliranje | 6 |
| **Ukupno** | **~48 sati** |

---

## 5. KupiKartu integracija

Turisticka zajednica je predlozila povezivanje s KupiKartu. Ovo je **vec ugradeno**:

- KupiKartu je jedan od 3 izvora dogadjaja u aplikaciji
- Dogadjaji ukljucuju linkove za kupovinu karata koji vode direktno na KupiKartu
- Filtriranje po gradu osigurava da se prikazuju samo sarajevski dogadjaji

**Dodatna vrijednost:** Web widget na VisitSarajevo.ba prirodno integrira KupiKartu — posjetilac vidi dogadjaj, klikne "Kupi kartu" i direktno kupuje na KupiKartu. Web stranica turisticke zajednice postaje centralno mjesto: vidi sta se desava → kupi kartu → planiraj vecer.

---

## 6. Finansijska ponuda — Faza 1 (april–septembar 2026)

### Opcija A: Pokrivanje troskova infrastrukture (5.000–7.000 KM)

Pokriva 3 mjeseca infrastrukture + pripremu za App Store.

| Stavka | KM |
|--------|----|
| Cloud baza podataka — Pro plan (3 mj) | 147 KM |
| Web hosting — Pro plan (3 mj) | 118 KM |
| AI razvojni alati (3 mj) | 1.176 KM |
| Web scraping (3 mj) | 288 KM |
| AI servisi — pilot (3 mj) | 71 KM |
| Apple Developer (godisnje) | 194 KM |
| Google Play (jednokratno) | 49 KM |
| Priprema za App Store (vizuali, opisi, testiranje) | 200 KM |
| **Infrastruktura ukupno** | **~2.243 KM** |
| Minimalna kompenzacija za rad na pripremi aplikacije za objavu (~40–60 sati) | 2.757–4.757 KM |
| **UKUPNO** | **5.000–7.000 KM** |

> Ulazemo vlastito razvojno vrijeme. Potrebna nam je podrska za pokrivanje infrastrukturnih troskova da aplikacija bude ziva do maja.

### Opcija B: Partnersko lansiranje (10.000–15.000 KM)

Pokriva infrastrukturu + razvoj web widgeta + pripremu za objavljivanje.

| Stavka | KM |
|--------|----|
| Infrastruktura (3 mjeseca) | 2.243 KM |
| Razvoj web widgeta za VisitSarajevo.ba | 3.000 KM |
| Priprema i objava na App Store (iOS + Android) | 2.000 KM |
| Zavrsavanje heritage setnji (mapa) | 1.000 KM |
| Testiranje i QA na 10+ uredjaja | 1.500 KM |
| **UKUPNO** | **~10.000–15.000 KM** |

### Opcija C: Kompletna Faza 1 (18.000–25.000 KM)

Sve iz Opcije B plus napredne funkcionalnosti.

| Stavka | KM |
|--------|----|
| Opcija B | ~10.000 KM |
| Push notifikacije | 2.500 KM |
| Automatizacija prikupljanja podataka | 2.500 KM |
| Admin dashboard za Visit Sarajevo | 3.000 KM |
| Alati za moderaciju sadrzaja | 2.000 KM |
| **UKUPNO** | **~20.000–25.000 KM** |

---

## 7. Sta Visit Sarajevo dobija odmah

1. **Look na pocetnoj stranici** — ugradivi web widget sa zivim dogadjajima i lokacijama
2. **AI-pokretane turisticke informacije** — posjetioci pretrazuju prirodnim jezikom, dobijaju trenutne odgovore
3. **Njihov sadrzaj ozivljava** — heritage setnje, opisi lokacija, dogadjaji postaju interaktivni
4. **Podaci koje nemaju** — 1.226 verificiranih lokacija sa radnim vremenom, fotografijama, kategorijama, AI opisima
5. **Brendiranje svuda** — logo Visit Sarajevo, atribucija, upute za prevoz
6. **KupiKartu integracija** — kupovina karata direktno iz aplikacije

---

## 8. Vremenski plan

| Sedmica | Isporuka |
|---------|----------|
| S1 (24–30. mart) | Prototip web widgeta, finalizacija vizuala za App Store |
| S2 (31. mart – 6. april) | Widget povezan sa zivim podacima, heritage setnje zavrsene |
| S3 (7–13. april) | Prijava na App Store (iOS + Android), widget na staging okruzenju |
| S4 (14–20. april) | Period pregleda App Store-a, integracija widgeta na VisitSarajevo.ba |
| S5 (21–27. april) | QA, ispravke gresaka, soft launch |
| S6 (1. maj —) | **Aplikacija ziva za turisticku sezonu** |

---

## 9. Faza 2 — Septembar 2026

Sa podacima iz ljetne sezone (preuzimanja, koristenje, povratne informacije turista), planiramo prosirenje saradnje:

- Kompletne funkcionalnosti (gamifikacija, push notifikacije, offline mod)
- 12-mjesecni troskovi infrastrukture i AI servisa
- Kontinuirana kuracija i moderacija sadrzaja
- Marketinski materijali

**Procijenjeni budzet za Fazu 2**: 30.000–50.000 KM (potkrijepljeno stvarnim podacima o koristenju iz ljeta)

---

## 10. Napomene

- Svi iznosi su bez PDV-a
- Troskovi infrastrukture rastu s brojem korisnika — navedene cifre pokrivaju do ~10.000 aktivnih korisnika mjesecno
- Kompletna tehnicka infrastruktura za Look kosta **625–840 KM mjesecno** u fazi lansiranja — izuzetno nisko za aplikaciju s 8 AI funkcionalnosti, 1.226 lokacija, zivim dogadjajima i dvojezicnom podrskom
- AI troskovi skaliraju linearno i predvidivo — bez iznenadjenja
- Aplikacija je spremna za lansiranje do maja 2026.
