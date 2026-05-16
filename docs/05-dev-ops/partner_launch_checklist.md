# Partner Launch Checklist — Look App
# Checklist za partnerski sastanak — Pokretanje Look aplikacije

Written 2026-04-10. For the partner meeting about registering and launching the Look app through the partner's company.

---

## ENGLISH VERSION

### 1. Domain — look.ba

**What:** Purchase and configure the `look.ba` domain.

**How:**
- .ba domains are registered through UTIC-authorized registrars in BiH: Logosoft, BH Telecom, Blicnet, m:tel
- Search for `look.ba` availability at any of those registrars
- Registration requires: company name, address, tax ID (JIB), contact person
- **Cost:** approximately 30–60 BAM/year
- **Important:** Once you have the domain, a developer needs to host two verification files on it for universal links (iOS and Android deep links) to work — this is already coded into the app

---

### 2. App Store Accounts

#### Apple App Store — Required for iOS
- **What:** Apple Developer Program — $99/year (~180 BAM/year)
- **Enroll as:** Organization (not individual), using the company's legal name
- **Requirements:**
  - Apple ID registered to the company email
  - Company's legal name exactly as registered (must match court records)
  - D-U-N-S number — free business identifier from Dun & Bradstreet. If the company doesn't have one, apply at dnb.com — takes 5–7 business days
  - Company address and phone number
  - Credit card for payment
- **Where:** developer.apple.com/programs/enroll
- **Important:** Apple verifies company identity manually. Approval can take 1–7 days. **This is the longest step — start it first.**

#### Google Play Store — Required for Android
- **What:** Google Play Developer Account — one-time $25 (~46 BAM)
- **Enroll as:** Organization
- **Requirements:**
  - Google account (company email)
  - Company name, address, phone number
  - Credit or debit card for the one-time fee
  - Accept the developer distribution agreement
- **Where:** play.google.com/console
- **Fast:** Account typically active within 48 hours

---

### 3. Legal Documents — Required by Both Stores

Both Apple and Google **require** a publicly hosted privacy policy before any app can be submitted. Google also requires an in-app account deletion mechanism.

#### a) Privacy Policy
- Must cover: what data is collected (email, taste preferences, saved venues, AI query content), how it is stored (Supabase, EU-region servers), whether it is shared with third parties (OpenAI, Anthropic, Google AI), and user rights
- **GDPR applies:** EU tourists will use this app — GDPR compliance is required even though the company is in BiH
- BiH Personal Data Protection Law (Zakon o zaštiti ličnih podataka) also applies
- Must include: right to access, right to deletion, data retention period, contact email for data requests
- **Must be hosted at a public URL** (e.g. look.ba/privacy)

#### b) Terms of Service
- Covers: acceptable use, content ownership, liability limitations, governing law (BiH)

#### c) In-App Account Deletion
- Google Play requires this for any app with user accounts
- Apple strongly recommends it (may require it during review)
- Developer needs to add a "Delete my account" button to the Profile screen

**Recommendation:** Hire a BiH IT lawyer for a few hours — not expensive, protects against store rejection and future liability.

---

### 4. Hiring Plan

#### a) Content Reviewer / Data Curator — URGENT
- **What:** Someone who manually reviews all ~1,226 venue entries in the database
- **Tasks:**
  - Verify each venue's name, category, address, opening hours
  - Flag entries that are closed, duplicated, or miscategorized
  - Spot-check AI-generated descriptions for accuracy
  - Verify Instagram handles (189 venues have scraped handles — some may be wrong)
  - Add any prominent missing Sarajevo venues
- **Who:** Someone who knows Sarajevo well — student, local journalist, tourism worker, part-time contractor
- **Time:** ~3–6 weeks full-time, or 2–3 months part-time
- **Output:** A spreadsheet of corrections to apply to the database

#### b) Mobile Developer — for App Store Submission
- **What:** A React Native / Expo developer to handle the technical submission process
- **Tasks:**
  - Choose and register final bundle ID (e.g. `ba.look.sarajevo`)
  - Set up iOS signing certificates and provisioning profiles
  - Set up Android keystore (must be kept secure forever)
  - Run EAS production builds
  - Submit to App Store Connect and Google Play Console
  - Handle app review feedback (Apple rejects ~30% of first submissions)
  - Set up crash reporting (Sentry) and analytics (PostHog or Mixpanel)
  - Configure push notification infrastructure
  - Deploy all Supabase edge functions to production
- **Who:** Freelance React Native developer or small local agency
- **Time:** 2–4 weeks for initial submission + handling reviews
- **Note:** The codebase is already production-hardened — this is submission logistics and DevOps, not feature development

#### c) Designer (Optional, Recommended)
- **What:** Finalize app icon and create App Store screenshots
- Icon must be: 1024×1024px, no transparency, no rounded corners (Apple applies them), recognizable at small sizes
- Screenshots are marketing assets shown in store listings — they significantly affect download rates
- **Who:** A graphic designer with App Store asset experience

---

### 5. Ongoing Operational Costs

| Item | Monthly Cost |
|------|-------------|
| Supabase Pro (database + edge functions) | ~$25 (~46 BAM) |
| Apple Developer Program | $99/year (~$8/month) |
| AI API costs (OpenAI + Anthropic + Google AI) | $20–50 depending on usage |
| Domain look.ba | ~50 BAM/year (~4 BAM/month) |
| Vercel (web hosting) | Free tier sufficient |
| Crash reporting / analytics | Free tier sufficient |
| **Total** | **~$55–85/month (~100–156 BAM/month)** |

---

### 6. Recommended Order of Operations

1. **Start Apple Developer enrollment immediately** — longest step (D-U-N-S + manual review)
2. **Buy look.ba domain** — needed for deep links and privacy policy hosting
3. **Draft and host privacy policy** — required before any store submission
4. **Hire content reviewer** — can start immediately in parallel
5. **Hire developer** — once Apple account is approved
6. **Google Play account** — do this in parallel, it's fast
7. **Hire designer** — for icon and screenshots, needed before submission

**Apple enrollment is the critical path. Everything else can run in parallel, but without an Apple Developer account the iOS version cannot be submitted. Start this process today.**

---
---

## BOSANSKA VERZIJA

### 1. Domena — look.ba

**Šta:** Kupovina i konfiguracija domene `look.ba`.

**Kako:**
- .ba domene se registriraju kod UTIC-ovlaštenih registrara u BiH: Logosoft, BH Telecom, Blicnet, m:tel
- Provjeri dostupnost `look.ba` kod nekog od tih registrara
- Za registraciju potrebno: naziv kompanije, adresa, JIB, kontakt osoba
- **Cijena:** otprilike 30–60 BAM godišnje
- **Važno:** Nakon kupovine domene, programer treba postaviti dvije verifikacijske datoteke za universal linkove (iOS i Android) — ovo je već kodirano u aplikaciju

---

### 2. App Store nalozi

#### Apple App Store — Obavezno za iOS
- **Šta:** Apple Developer Program — $99/godišnje (~180 BAM/godišnje)
- **Upis kao:** Organizacija (ne kao fizičko lice), pod pravnim imenom kompanije
- **Potrebno:**
  - Apple ID registriran na email kompanije
  - Pravni naziv kompanije točno onako kako je registriran (mora odgovarati sudskim dokumentima)
  - D-U-N-S broj — besplatni poslovni identifikator od Dun & Bradstreet. Ako ga kompanija nema, prijavi se na dnb.com — obrada traje 5–7 radnih dana
  - Adresa i broj telefona kompanije
  - Kreditna kartica za plaćanje
- **Gdje:** developer.apple.com/programs/enroll
- **Važno:** Apple ručno verifikuje identitet kompanije. Odobrenje može trajati 1–7 dana. **Ovo je najduži korak — počni odmah.**

#### Google Play Store — Obavezno za Android
- **Šta:** Google Play Developer nalog — jednokratno $25 (~46 BAM)
- **Upis kao:** Organizacija
- **Potrebno:**
  - Google nalog (email kompanije)
  - Naziv, adresa i telefon kompanije
  - Kreditna ili debitna kartica
  - Prihvatanje ugovora o distribuciji
- **Gdje:** play.google.com/console
- **Brzo:** Nalog aktivan unutar 48 sati

---

### 3. Pravni dokumenti — Obavezno za oba stora

I Apple i Google **zahtijevaju** javno hostirani pravilnik o privatnosti prije nego što se aplikacija može predati. Google sada zahtijeva i mehanizam za brisanje naloga unutar aplikacije.

#### a) Pravilnik o privatnosti (Privacy Policy)
- Mora pokrivati: koje podatke prikupljamo (email, preferencije ukusa, sačuvane lokacije, sadržaj AI upita), kako se čuvaju (Supabase, EU serveri), da li se dijele s trećim stranama (OpenAI, Anthropic, Google AI), prava korisnika
- **GDPR se primjenjuje:** EU turisti će koristiti aplikaciju — GDPR usklađenost je obavezna
- BiH Zakon o zaštiti ličnih podataka se also primjenjuje
- Mora uključiti: pravo na pristup, pravo na brisanje, rok čuvanja podataka, kontakt email za zahtjeve
- **Mora biti dostupan na javnom URL-u** (npr. look.ba/privacy)

#### b) Uslovi korištenja (Terms of Service)
- Pokriva: dozvoljenu upotrebu, vlasništvo sadržaja (podaci o lokacijama), ograničenja odgovornosti, mjerodavno pravo (BiH)

#### c) Brisanje naloga unutar aplikacije
- Google Play zahtijeva ovo za sve aplikacije s korisničkim nalozima
- Apple snažno preporučuje (može zahtijevati tokom pregleda)
- Programer treba dodati dugme "Obriši moj nalog" na ekranu Profila

**Preporuka:** Angažiraj BiH advokata koji se bavi IT pravom na nekoliko sati — nije skupo, štiti od odbijanja u app storu i buduće odgovornosti.

---

### 4. Plan zapošljavanja

#### a) Reviewer sadržaja / Kurator podataka — HITNO
- **Šta:** Osoba koja ručno prolazi kroz svih ~1.226 unesenih lokacija u bazi podataka
- **Zadaci:**
  - Provjera naziva, kategorije, adrese i radnog vremena svake lokacije
  - Označavanje lokacija koje su zatvorene, duplicirane ili pogrešno kategorizirane
  - Provjera AI-generiranih opisa za tačnost (aplikacija ima 1.226 opisa na bosanskom, AI-generirani)
  - Provjera Instagram naloga (189 lokacija ima naloge preuzete s web stranica — neki mogu biti pogrešni)
  - Dodavanje istaknutih lokacija u Sarajevu koje nedostaju
- **Ko:** Neko ko dobro poznaje Sarajevo — student, lokalni novinar, radnik u turizmu, povremeni saradnik
- **Vrijeme:** Otprilike 3–6 sedmica puno radno vrijeme, ili 2–3 mjeseca skraćeno
- **Rezultat:** Tabela ispravki koje se unose u bazu podataka

#### b) Mobilni programer — za predaju u App Store
- **Šta:** React Native / Expo programer koji vodi tehnički proces predaje
- **Zadaci:**
  - Odabir i registracija finalnog bundle ID-a (npr. `ba.look.sarajevo`)
  - Postavljanje iOS certifikata za potpisivanje i provisioning profila (kompleksno, Apple-specifično)
  - Postavljanje Android keystora (jednostavnije ali mora biti čuvano zauvijek)
  - Pokretanje EAS production buildova
  - Predaja u App Store Connect i Google Play Console
  - Odgovaranje na komentare tokom pregleda (Apple odbija ~30% prvih predaja — česti razlozi: nedostaje privacy policy, greške, nedovoljan sadržaj)
  - Postavljanje Sentry-ja ili sličnog alata za praćenje rušenja aplikacije
  - Postavljanje analitike (PostHog, Mixpanel ili slično)
  - Konfiguracija infrastrukture za push notifikacije
  - Deploy svih Supabase edge funkcija u produkciju
- **Ko:** Freelance React Native programer ili mala lokalna agencija
- **Vrijeme:** 2–4 sedmice za prvu predaju + rješavanje komentara
- **Napomena:** Kôd je već osposobljen za produkciju — ovo su logistika predaje i DevOps, ne razvoj funkcionalnosti

#### c) Dizajner (opcionalno, preporučuje se)
- **Šta:** Finalizacija ikone aplikacije i izrada screenshotova za App Store
- Ikona mora biti: 1024×1024px, bez transparentnosti, bez zaobljenih uglova (Apple ih automatski dodaje), prepoznatljiva u malim dimenzijama
- Screenshots su marketinški materijali prikazani u listingu App Storea — značajno utječu na stopu preuzimanja
- **Ko:** Grafički dizajner koji ima iskustva s App Store materijalima

---

### 5. Tekući operativni troškovi

| Stavka | Mjesečni trošak |
|--------|----------------|
| Supabase Pro (baza + edge funkcije) | ~$25 (~46 BAM) |
| Apple Developer Program | $99/godišnje (~8 BAM/mj.) |
| AI API troškovi (OpenAI + Anthropic + Google AI) | $20–50 ovisno o korištenju |
| Domena look.ba | ~50 BAM/godišnje (~4 BAM/mj.) |
| Vercel (web hosting) | Besplatno |
| Praćenje grešaka / analitika | Besplatno |
| **Ukupno** | **~$55–85/mj. (~100–156 BAM/mj.)** |

---

### 6. Preporučeni redoslijed akcija

1. **Odmah počni Apple Developer prijavu** — traje najduže (D-U-N-S + ručna verifikacija)
2. **Kupi domenu look.ba** — potrebna za deep linkove i hosting privacy policije
3. **Napiši i hostuj pravilnik o privatnosti** — obavezno prije bilo kakve predaje
4. **Angažiraj reviewera sadržaja** — može početi odmah dok se ostali koraci odvijaju
5. **Angažiraj programera** — kada Apple nalog bude odobren, može početi rad na predaji
6. **Google Play nalog** — uradi paralelno, brzo je
7. **Angažiraj dizajnera** — za ikonu i screenshots, potrebno prije predaje

**Apple enrollment je kritični put. Sve ostalo može teći paralelno, ali bez Apple Developer naloga iOS verzija ne može biti predana. Taj proces treba pokrenuti danas.**
