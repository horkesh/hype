# Hype — Presentation Restyle & AI Integration Design

**Date**: 2026-03-17
**Goal**: Transform Hype from a functional prototype into a visually stunning, AI-powered city discovery app for a tourism board presentation.
**Approach**: Screen-by-screen (C) — each screen gets both visual restyle and AI integration before moving to the next. Every completed screen is immediately demo-ready.
**Audience**: Tourism board. They will receive a live URL and click around freely.
**Desired reaction**: "This person knows what they're doing and this is going to be big" — visually polished, AI-impressive, but clearly ambitious (not "already done").

---

## 1. Architecture & AI Infrastructure

### 1.1 AI Call Pattern: Supabase Edge Functions

All AI calls go through Supabase Edge Functions — never from the client. API keys stay server-side. This matches the industry pattern used by Yelp (LLM Gateway), TripAdvisor (RAG pipeline), Google Maps (Gemini API), and Airbnb (SSE streaming).

Adapted from the Chronicles project (`supabase/functions/*/index.ts`), which already implements this pattern with Claude, Gemini, and Imagen.

```
Expo App → supabase.functions.invoke('function-name', { body }) → Edge Function → AI API → Response
```

### 1.2 Edge Functions

| Function | AI Model | Purpose | Est. cost/call |
|---|---|---|---|
| `generate-plan` | GPT-4.1 mini (OpenAI) | Tonight planner — structured evening itinerary from live venue/event data | ~$0.007 |
| `generate-pulse` | Gemini 2.5 Flash-Lite (Google) | City pulse blurb for Home hero — what's happening in Sarajevo right now | ~$0.002 |
| `smart-search` | GPT-4.1 nano (OpenAI) | NL query → structured Supabase search filters (LLM-as-translator pattern from Yelp) | ~$0.001 |
| `surprise-me` | GPT-4.1 mini (OpenAI) | Spontaneous micro-plan (2-3 stops) based on time, weather, what's open | ~$0.007 |
| `translate-scene` | Gemini 2.5 Flash (Google) | Camera OCR text → English translation with cultural context | ~$0.003 |
| `enrich-descriptions` | Claude Haiku 4.5 (Anthropic) | Batch venue/event description generation — best prose voice | ~$0.02/venue |
| `parse-instagram` | Claude Haiku 4.5 (Anthropic) | Instagram post caption → structured event extraction (Chronicles pattern) | ~$0.005 |
| `analyze-venue-photo` | Gemini 2.5 Flash (Google) | Classify/tag scraped venue photos | ~$0.003 |

### 1.3 Environment Secrets (Supabase Dashboard)

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_AI_API_KEY`
- `GOOGLE_MAPS_API_KEY`

### 1.4 Client-Side AI Helpers

```
utils/ai/planGenerator.ts    → invokes generate-plan
utils/ai/cityPulse.ts        → invokes generate-pulse
utils/ai/smartSearch.ts       → invokes smart-search
utils/ai/surpriseMe.ts        → invokes surprise-me
utils/ai/translate.ts         → invokes translate-scene
```

**Backend-only functions** (not called from Expo app — invoked from Node backend scripts or scheduled jobs):
- `enrich-descriptions` — batch venue enrichment job
- `parse-instagram` — Instagram ingestion pipeline
- `analyze-venue-photo` — photo classification during Google Maps scrape

### 1.5 Caching Strategy

| Feature | Cache location | TTL | Reason |
|---|---|---|---|
| City pulse | `city_pulse` table in Supabase | 3 hours | Shared across all users, expensive to regenerate |
| Tonight plans | `ai_plans` table per user | Stored permanently | Personal history — user sees last plan on return, "Regenerate" creates a new row (old plans kept). Multiple plans per user supported. |
| Smart search | No cache | N/A | User-specific, cheap |
| Surprise Me | No cache | N/A | Spontaneous by design |
| Venue descriptions | `venues.description_bs/en` columns | Permanent until re-enriched | Batch job, not real-time |
| Instagram events | `raw_events` table | Until promoted | Part of ingestion pipeline |

### 1.6 Industry Patterns Adopted

1. **LLM as translator** (from Yelp): AI converts "good coffee near Baščaršija" into `{category: 'cafe', neighborhood: 'Baščaršija', sort: 'rating'}`. The database does the real work.
2. **Tiered model routing** (from Yelp/Airbnb): Cheapest model per task. GPT-4.1 nano for intent parsing, GPT-4.1 mini for creative generation, Claude Haiku for prose, Gemini Flash for vision.
3. **Pre-computed summaries** (from Google Maps): Batch-generate venue descriptions, cache city pulse blurbs, store plan results. Real-time AI only where it adds visible value.
4. **SSE streaming for plans** (from Airbnb): Stream the Tonight Planner response word-by-word instead of showing a loading spinner. More theatrical, better perceived speed.
5. **Behavioral signal collection** (from Fever): Start collecting saves, mood selections, search queries, time-of-day usage from day one. Even if we don't act on them yet, the data compounds.
6. **Music taste matching** (from Resident Advisor): Future — design the mood system to accommodate Spotify signals for club/concert recommendations later.

### 1.7 Edge Function Timeout Handling

Supabase Edge Functions have ~25s execution limits. Following the Chronicles pattern:
- AbortController with 20s timeout on all AI API calls
- For Tonight Planner (longest generation): SSE streaming via direct fetch (see below), or split into fast venue selection + slower narrative generation
- For city pulse: pre-compute and cache, never generate on request

### 1.7.1 SSE Streaming Implementation

`supabase.functions.invoke()` returns a standard fetch response — it does NOT support SSE natively. For streaming (Tonight Planner):

**Edge Function side:** Return a `ReadableStream` with `text/event-stream` content type.

**Client side:** Use direct `fetch()` to the Edge Function URL (not `supabase.functions.invoke`):
```
const url = `${SUPABASE_URL}/functions/v1/generate-plan`;
const res = await fetch(url, {
  method: 'POST',
  headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(params)
});
const reader = res.body.getReader();
// Read chunks and update UI progressively
```

**Fallback:** If SSE proves unreliable on the target platform, fall back to a non-streaming call with a progress animation (shimmer timeline that fills as the plan generates).

### 1.8 Cost Model

**Blended session cost (typical user: 1 plan, 1 pulse hit, 2 NL searches): ~$0.004/session**

| User Scale | Sessions/Month | Monthly AI Cost |
|---|---|---|
| Pilot (100 users) | 3,000 | ~$12 |
| Growth (1,000 users) | 30,000 | ~$120 |
| Scale (10,000 users) | 300,000 | ~$1,200 |

**For the demo**: Gemini 2.5 Flash free tier (250 RPD) covers everything at zero cost.

---

## 2. Visual Restyle — Design Language

### 2.1 Current vs Target

| Aspect | Current | Target |
|---|---|---|
| Overall feel | Functional prototype | Premium city companion |
| Icons/badges | Emoji text (🎉😎💃🍽️🍺) | Glass containers with AI-generated illustrated icons |
| Image placeholders | Emoji on amber gradient | AI-generated category photography or scraped Google Maps photos |
| Cards | Image top, text bottom, flat | Editorial — large image, overlaid title with gradient, flippable for details |
| Corners | 16px radius | 24px radius throughout |
| Shadows | elevation 3 | Soft glow, mood-colored for glass elements |
| Photography | None / placeholder | Cinematic Sarajevo imagery, context-matched per screen |
| Animation | Basic fade-in | Spring physics, parallax on scroll, 3D card flip |

### 2.2 Design Tokens

| Token | Value |
|---|---|
| Card border radius | 24px |
| Modal border radius | 28px |
| Chip/pill radius | 24px |
| Input field radius | 16px |
| Image frame radius | 20px |
| Card shadow (default) | `0 4px 20px rgba(0,0,0,0.12)` |
| Card shadow (glass) | `0 4px 16px rgba(mood_color, 0.2)` |
| Glass background | `rgba(255,255,255,0.08)` dark / `rgba(255,255,255,0.6)` light |
| Glass border | `1px solid rgba(255,255,255,0.15)` dark / `1px solid rgba(0,0,0,0.08)` light |
| Glass blur | `expo-blur` BlurView (iOS native), semi-transparent overlay fallback (Android) |
| Hero title | 32px, 700 weight |
| Section header | 24px, 700 weight |
| Card title | 18px, 700 weight |
| Body text | 15px, 400 weight |
| Accent color | `#D4A056` (unchanged) |
| Dark background | `#1A1A2E` (unchanged) |
| Light background | `#FAFAF8` (unchanged) |

### 2.3 Glass/Glow Icon System

Each mood and category gets:
- An AI-generated illustrated icon (Gemini Pro) in a consistent soft-glow style
- A signature color (existing MoodChip colors, preserved)
- A glass container treatment:
  - `background: rgba(255,255,255,0.08)`
  - Blur: `expo-blur` BlurView wrapper (iOS), semi-transparent overlay (Android)
  - `border: 1px solid rgba(mood_color, 0.3)`
  - Shadow: React Native `shadowColor`/`shadowOffset`/`shadowRadius` (iOS), `elevation` (Android)

**Mood icon set (12):**

| Mood | Color | Icon concept |
|---|---|---|
| Party | Red `#EF4444` | Sparkler / confetti burst |
| Chill | Blue `#3B82F6` | Crescent moon / lounge silhouette |
| Girls Night | Pink `#EC4899` | Cocktail glass / stiletto |
| Date Night | Orange `#FB923C` | Two wine glasses / candlelight |
| Music | Purple `#A855F7` | Headphones / sound wave |
| Romance | Deep Red `#BE123C` | Rose / heart flame |
| Culture | Indigo `#6366F1` | Theater masks / book |
| Foodie | Amber `#EAB308` | Fork & knife / steaming plate |
| Brunch | Light Pink `#FBD0E8` | Croissant / coffee cup |
| After Work | Brown `#D97706` | Beer glass / loosened tie |
| Outdoor | Green `#22C55E` | Leaf / mountain peak |
| Tourist | Sky `#0EA5E9` | Compass / suitcase |

**Category icon set (8+):**

| Category | Icon concept |
|---|---|
| Restaurant | Plate with cutlery |
| Bar | Cocktail shaker |
| Cafe | Steaming cup |
| Club | DJ turntable / speaker |
| Theatre | Stage curtain |
| Cinema | Film reel |
| Gallery | Picture frame |
| Concert Hall | Microphone / stage |

### 2.4 Photography Direction

| Screen | Tone | Example prompts for Gemini |
|---|---|---|
| Home hero (morning) | Warm golden | "Sarajevo Baščaršija morning light, coffee steam, warm tones, cinematic" |
| Home hero (afternoon) | Bright vibrant | "Sarajevo old town sunny afternoon, blue sky, lively terrace, warm" |
| Home hero (evening) | Golden hour | "Sarajevo skyline sunset, minarets silhouette, amber sky, cinematic" |
| Home hero (night) | Moody dramatic | "Sarajevo old town at night, warm street lights, cobblestones, atmospheric" |
| Explore backgrounds | Bright editorial | "Sarajevo market colorful, bright daylight, travel photography" |
| Tonight backgrounds | Moody nightlife | "Sarajevo nightlife, neon reflections, wet cobblestones, dramatic" |
| Category fallbacks | Context-matched | Per-category: "cozy Bosnian restaurant interior, warm lighting" etc. |

### 2.5 Flippable Card Spec

**Front (emotion side):**
- 70% image coverage
- Title overlaid at bottom with gradient fade (`linear-gradient(transparent, rgba(0,0,0,0.7))`)
- Mood glass badges: top-right corner, small (28px) glass circles
- Category pill: top-left corner, glass treatment
- Border radius: 24px
- Subtle parallax on scroll (native only)

**Back (information side):**
- Same card dimensions, 3D flip transform (`rotateY(180deg)`)
- Background: card surface color (no image)
- Content: address, hours (open/closed badge), price level, distance, short description, action buttons (navigate, call, save)
- Border radius: 24px

**Animation library:** `react-native-reanimated` v3 (already standard for Expo). Use `withSpring` for flip physics, `interpolate` on `rotateY`, and `backfaceVisibility: 'hidden'` on both card faces.

**Flip trigger:**
- Info icon (ℹ) bottom-right of card front — tap to flip
- Long-press as secondary trigger
- Main card tap → navigates to full detail screen (not flip)

### 2.6 Gemini Asset Generation List

**Icons to generate (20+):**
1. 12 mood icons (consistent soft-glow style, transparent background, 512x512)
2. 8+ category icons (matching style, transparent background, 512x512)

**Hero backgrounds (6):**
1. Morning — Sarajevo golden morning
2. Afternoon — bright vibrant city
3. Evening — golden hour skyline
4. Night — moody atmospheric streets
5. Tonight section header — dramatic nightlife
6. Explore section header — lively daytime

**Category fallback photography (8+):**
1. Restaurant — warm Bosnian interior
2. Bar — atmospheric cocktail scene
3. Cafe — steaming coffee, ćilim textiles
4. Club — dark energy, DJ booth
5. Theatre — stage curtain, dramatic lighting
6. Cinema — film screening ambiance
7. Gallery — art exhibition space
8. Concert — stage lights, crowd

**App Store / presentation assets (4):**
1. Wide hero banner (hype.ba landing page concept)
2. Phone mockup frame
3. Feature highlight cards
4. Logo refinement (if needed)

---

## 3. Screen-by-Screen Design

### Screen 1: Home

**Current state:** Weather hero card (emoji + amber gradient), mood chips (emoji text), "Gdje na kafu?" section (not implemented), events carousel, featured cafe.

**New design:**

#### 3.1.1 Hero Section (top)

- **Background**: Full-width cinematic Sarajevo photo, matched to time of day (4 variants)
- **Overlay**: Dark gradient from bottom (`rgba(0,0,0,0.5)`)
- **Content layers** (bottom to top):
  1. Photo background
  2. Gradient overlay
  3. **City Pulse AI blurb** — 2-3 sentences generated by AI: "Baščaršija is buzzing tonight — 3 live music events, perfect weather for terraces. Don't miss the jazz at BKC." Updated every 3 hours.
  4. **"Surprise Me" card** — compact glass card within the hero. Shows a subtle sparkle icon + "Iznenadi me" / "Surprise me". Tap → card expands as an overlay on top of the hero (does NOT push content below), showing a 2-3 stop micro-plan with venue cards, timing, and a one-line AI pitch per stop. Tap outside or "X" to collapse back.
  5. Time-based greeting: "Dobro jutro, Sarajevo" / "Šta radimo večeras?" — bilingual, DM Sans 32px bold

#### 3.1.2 Mood Selector (below hero)

- Horizontal scrollable row of glass mood chips
- Each chip: glass container + AI-generated mood icon (28px) + label text
- Selected state: signature mood color fills the glass, white text
- Unselected: transparent glass, subtle border, muted text
- Tapping a mood filters events below AND adds a behavioral signal

#### 3.1.3 "Gdje na kafu?" Section

- Standalone glass card with coffee photography background
- "Gdje na kafu?" title + "Hajde!" CTA button
- Tap → shows a random cafe card (flippable) with name, photo, neighborhood, one-line description
- "Daj drugo" button to re-roll
- Quick win, very charming for Sarajevo demo

#### 3.1.4 Hidden Gems Spotlight

- Horizontal rail of 3-4 hidden gem venue cards
- Special badge: "Skriveni dragulj" / "Hidden Gem" in glass treatment
- Insider tip shown as a quote bubble on the card
- Data source: `venues WHERE is_hidden_gem = true`

#### 3.1.5 Tonight in Sarajevo (events)

- Horizontal carousel of flippable event cards
- Front: cinematic event image, title overlay, time badge, mood glass badges
- Back: venue name, price, ticket CTA, description snippet
- "See all" link → navigates to Tonight tab

#### 3.1.6 Active Series

- Horizontal rail of series cards (SFF, Baščaršijske Noći, etc.)
- Countdown badge if upcoming
- Large image + title overlay

---

### Screen 2: Explore

**Current state:** Search bar, mood chips, category grid, list/menu tab switcher, venue cards, filter modal.

**New design:**

#### 3.2.1 Smart Search Bar

- Glass-styled input field with search icon
- **Two modes** (detected automatically):
  - **Search mode**: User types a venue/event name → autocomplete dropdown as today
  - **Concierge mode**: User types a natural language question ("best ćevapi near the river", "where should I take my parents for dinner?") → AI detects intent → shows a conversational response card inline below the search bar, with relevant venue cards underneath
- Mode detection: Edge function `smart-search` handles both in a single call — GPT-4.1 nano receives the query and returns a JSON response with `{ mode: 'search' | 'conversation', filters?: {...}, response?: string, venues?: [...] }`. One call, no double-latency.
- Conversational response: glass card with AI avatar icon, response text, and "Based on X venues" attribution

#### 3.2.2 Mood & Category Chips

- Same glass mood chips as Home (shared component)
- Category chips below: glass containers with category icons
- Both act as filters on the venue list

#### 3.2.3 Venue Cards (List View)

- Flippable editorial cards (shared component)
- Front: large image (Google Maps scraped or Gemini fallback), title overlay, category pill, open/closed badge, mood glass badges
- Back: address, hours, price, distance, description, action row
- Sorted by relevance when search/mood active, otherwise by proximity or popularity

#### 3.2.4 Dnevni Meni Tab

- Same card treatment but food-photography focused
- Price prominently displayed
- Valid hours shown as a pill
- Filter chips: "do 8 KM", "8-12 KM", "12+ KM"

#### 3.2.5 Filter Modal

- Bottom sheet with 28px radius top corners
- Glass treatment on the modal surface
- Sections: Moods (glass chips), Categories (glass chips), Price Level (slider or segmented), Open Now (toggle), Distance (slider)
- "Apply" button in accent amber

#### 3.2.6 Live Translation (Explore integration)

- Camera icon in the search bar (right side)
- Tap → opens camera view with an overlay frame: "Point at Bosnian text"
- OCR captures text → `translate-scene` edge function → response card appears:
  - Original text
  - English translation
  - Cultural context note in a subtle glass callout
- Example: "Ćevapi sa lukom" → "Ćevapi with onion — *The signature Bosnian grilled meat, served in warm somun bread. Locals order 5 or 10 pieces — never less.*"

---

### Screen 3: Tonight

**Current state:** Time-segmented tabs, event list, AI planner (mocked), vote feature (mocked).

**New design:**

#### 3.3.1 Tonight Header

- Moody nightlife background image (or gradient if before evening)
- Dynamic title: changes by time segment
- Subtle animation: slow parallax or color shift

#### 3.3.2 Time Segments

- Glass pill tabs: Jutro | Ručak | Večer | Noć
- Auto-highlighted current segment with accent glow
- Events filtered to that time window

#### 3.3.3 AI Evening Planner (THE SHOWSTOPPER)

- Prominent glass card at top: "Predloži mi plan" / "Plan my evening"
- Tap → opens planner modal:
  1. **Mood selection** (glass mood chips — pick 1-3)
  2. **Group size** (stepper: 1-8+)
  3. **Budget** (segmented: Casual / Mid / Premium)
  4. **Generate** button with sparkle animation
- On generate:
  - **SSE streaming** — plan appears word by word (Airbnb pattern)
  - Shows a structured itinerary: 3-5 stops with:
    - Venue card (flippable) per stop
    - Timing ("19:00 — Start with coffee at...")
    - AI-written one-liner per stop
    - Walking time between stops
  - "Save Plan" and "Share Plan" buttons
  - "Regenerate" button for a fresh take
- **Data flow**: Edge function queries real venues/events from Supabase matching mood + budget + time + open status → feeds them as context to GPT-4.1 mini → returns structured plan JSON → client renders the itinerary with real venue cards

#### 3.3.4 Event Cards

- Flippable editorial cards (same shared component)
- Urgency badges: "Večeras!" (red glow), "Sutra" (amber glow), "Besplatan" (green glow) — glass treatment
- Ticket CTA: "Kupi na KupiKartu" / "Kupi na Entrio" — amber button

---

### Screen 4: Venue Detail

**Current state:** Hero image, venue info, tabs (Info, Events, Specials), action buttons.

**New design:**

#### 3.4.1 Hero

- Full-width photo (Google Maps scraped, or Gemini category fallback)
- Title overlaid at bottom with gradient
- Category pill + price level dots + open/closed badge — all glass treatment
- Mood glass badges

#### 3.4.2 Action Row

- Glass pill buttons in a horizontal row: Navigate, Call, Web, Instagram, Save
- Icons instead of emoji text
- Delivery buttons (Korpa, Glovo) if available — separate row with delivery icon

#### 3.4.3 Hidden Gem Badge

- If `is_hidden_gem`: special glass badge with glow + insider tip in a styled callout card

#### 3.4.4 Tabs

- Glass tab pills: Info | Događaji | Ponude
- Info: AI-enriched description (bilingual), mini map, contact
- Events: upcoming events at this venue — flippable cards
- Specials: daily specials with price, hours, food photography

---

### Screen 5: Event Detail

**Current state:** Cover image, title, date/time, venue link, mood badges, description, save/share.

**New design:**

- Same hero treatment as venue detail
- Series badge if part of a series (glass, tappable → series detail)
- Prominent ticket CTA (glass amber button, full width)
- AI-enriched description
- Venue card (flippable) embedded — shows where the event is
- "Going" counter badge

---

### Screen 6: Saved

**Current state:** Tabs for venues/events/badges, card lists.

**New design:**

- Glass tab pills
- Venue cards: flippable editorial style (same shared component)
- Event cards: same
- Empty states: beautiful photography + encouraging copy, not sad placeholders
- Badges section: glass badge grid with glow per earned badge

---

### Screen 7: Profile

**Current state:** Auth, taste moods, settings, language toggle.

**New design:**

- Glass profile card at top (avatar, name, stats)
- Taste mood selector: glass mood chips (same shared component)
- Settings as glass cards with toggle rows
- Sign-in flow: clean, modern, glass modal
- Future: "HYPE Wrapped" monthly stats teaser

---

## 4. New Features

### 4.1 "Gdje na kafu?" Randomizer

- Home screen section: glass card with coffee photography
- Tap → random cafe from Supabase (`category = 'cafe'`, random)
- Shows: flippable venue card + "Hajmo!" (let's go) + "Daj drugo" (re-roll)
- Lightweight, charming, very Sarajevo

### 4.2 Hidden Gems / Insider Mode

- Home: spotlight rail of hidden gem venues
- Explore: "Insider Mode" toggle in filter — shows only `is_hidden_gem = true` venues
- Venue detail: special badge + insider tip callout
- Data: already exists in schema (`is_hidden_gem`, `insider_tip_bs/en`)

### 4.3 Instagram Scraping Pipeline

Adapted from Chronicles `analyze-instagram` edge function pattern:

**Flow:**
1. Node backend scheduled job fetches latest posts from configured Instagram accounts via **Instagram Graph API** (requires business account tokens) or **manual ingestion for the demo** (copy-paste captions into a seed script)
2. For each post, calls `parse-instagram` edge function with caption text
3. Claude Haiku determines: is this an event announcement?
4. If yes: extracts title, date, time, venue, price, mood → inserts into `raw_events`
5. Deduplication check against existing events (fingerprint: title + date + venue)
6. Approved events promote to `events` table

**Initial scope for demo:**
- 5-10 high-value Instagram accounts (clubs, bars with events, event venues)
- Run manually for the demo, schedule later
- Show the pipeline working: "This event was discovered from @undergroundclubsa's Instagram post 2 hours ago"

### 4.4 Google Maps Photo Scraping

**Flow:**
1. Use Google Places API with `google_place_id` from venue records
2. Fetch place photos (up to 5 per venue)
3. Store in Supabase Storage
4. Update `venues.cover_image_url` and `venues.photos` array
5. Run as a batch job, not per-request

**API cost:** Google Places Photo API is ~$7 per 1,000 photo requests. For 250 venues × 3 photos = 750 requests = ~$5 one-time.

### 4.5 Live Translation

**Flow:**
1. Camera icon in Explore search bar
2. Opens camera view with text detection overlay
3. User captures frame → image sent to `translate-scene` edge function
4. Gemini 2.5 Flash with vision: OCR + translation + cultural context
5. Response card overlay: original text, translation, context note

**Tech:** `expo-camera` for capture, Gemini vision API for OCR + translation in one call (no separate OCR library needed — Gemini handles both).

**Permission handling:**
- Request camera permission via `expo-camera` `requestCameraPermissionsAsync()` on first tap of camera icon
- If denied: show a glass callout explaining why camera is needed, with a "Open Settings" button linking to app settings
- Capture mode: tap-to-capture (not live OCR) — user frames the text and taps a shutter button
- While processing: show a shimmer overlay on the captured image with "Translating..." text

### 4.6 Check-in Concept (Lightweight)

- Venue detail: "I'm here" button (glass, with location icon)
- Stores check-in in `checkins` table (user_id, venue_id, timestamp)
- Shows check-in count on venue cards (flame icon + "12 people here now" — glass badge with warm glow)
- Foundation for future City Pulse real-time data

### 4.7 Surprise Me

- Glass card in Home hero section
- Tap → calls `surprise-me` edge function with: current time, weather, user's taste moods, what's open nearby
- Returns a 2-3 stop micro-plan
- Expands in-place as a beautiful card sequence with venue images and timing
- "Let's go" CTA per stop → navigates to venue detail

---

## 5. Data & Content Requirements

### 5.1 Venue Photos

- **Primary**: Google Maps Places API scrape (batch, ~$5 one-time)
- **Fallback**: Gemini-generated category photography (8 images)
- **Future**: Instagram scraped venue photos, user uploads

### 5.2 Venue Descriptions

- **Batch enrichment**: Claude Haiku 4.5 generates bilingual descriptions for all 250+ venues
- **Cost**: ~$5 one-time (250 venues × $0.02/venue)
- **Input**: venue name, category, neighborhood, existing description, moods, tags
- **Output**: 2-3 sentence engaging description in both BS and EN

### 5.3 Event Data

- **Existing**: Supabase events table with manual and scraped events
- **New**: Instagram pipeline adds real-time event discovery
- **Enrichment**: AI-generated descriptions for events with thin copy

### 5.4 Demo Data Quality

For the presentation, ensure:
- At least 20 venues with real photos (Google Maps scrape)
- At least 10 upcoming events (real or carefully seeded)
- At least 3 daily specials with food photography
- At least 1 active event series
- Hidden gems flagged and with insider tips
- AI descriptions generated for all visible venues

---

## 6. Asset Generation Plan (Gemini Pro Prompts)

### 6.1 Mood Icons (12)

Base prompt: `"Soft glowing icon, frosted glass effect, subtle [COLOR] ambient light, [SUBJECT], dark background, premium mobile app aesthetic, clean minimal design, no text, centered composition, 512x512"`

| Mood | Subject | Color |
|---|---|---|
| Party | sparkler with confetti sparks | red |
| Chill | crescent moon over lounge silhouette | blue |
| Girls Night | elegant cocktail glass with cherry | pink |
| Date Night | two clinking wine glasses by candlelight | orange |
| Music | over-ear headphones with sound waves | purple |
| Romance | single red rose with soft petals | deep red |
| Culture | theatrical comedy-tragedy masks | indigo |
| Foodie | steaming plate with fork and knife | amber |
| Brunch | croissant with coffee cup | light pink |
| After Work | beer glass with foam | brown/amber |
| Outdoor | stylized leaf with mountain peak | green |
| Tourist | compass with directional needle | sky blue |

### 6.2 Category Icons (8)

Same base prompt, with:

| Category | Subject |
|---|---|
| Restaurant | elegant plate with cutlery arrangement |
| Bar | cocktail shaker pouring |
| Cafe | steaming coffee cup with saucer |
| Club | DJ turntable with spinning vinyl |
| Theatre | ornate stage curtain parting |
| Cinema | classic film reel unwinding |
| Gallery | framed canvas on wall |
| Concert Hall | standing microphone with spotlight |

### 6.3 Hero Backgrounds (6)

Prompt: `"Cinematic photograph, [SCENE], Sarajevo Bosnia, [LIGHTING], shallow depth of field, professional travel photography, 16:9 aspect ratio, no text, no people in focus, 1920x1080"`

| Variant | Scene | Lighting |
|---|---|---|
| Morning | Baščaršija cobblestone street with a coffee cup in foreground | warm golden morning light |
| Afternoon | Old town panorama with terrace umbrellas and blue sky | bright midday sun |
| Evening | Skyline with minarets | golden hour sunset, amber and pink sky |
| Night | Old town lantern-lit street, wet cobblestones | warm street lights, atmospheric |
| Tonight header | Neon bar signs reflecting on rain-slicked street | dramatic neon and shadow |
| Explore header | Colorful market stalls with spices and textiles | bright natural daylight |

### 6.4 Category Fallback Photography (8)

Prompt: `"[SCENE], Bosnian aesthetic, warm inviting atmosphere, professional food/interior photography, no text, no faces, 4:3 aspect ratio, 1024x768"`

| Category | Scene |
|---|---|
| Restaurant | Cozy restaurant interior with ćilim textiles and warm wood, table set with traditional Bosnian dishes |
| Bar | Atmospheric cocktail bar interior with amber lighting and glass shelves |
| Cafe | Turkish coffee set on copper tray with Baščaršija courtyard visible through window |
| Club | Dark dance floor with dramatic overhead lighting and DJ booth silhouette |
| Theatre | Ornate theatre interior with red velvet seats and gilded proscenium |
| Cinema | Dark cinema auditorium with screen glow and rows of seats |
| Gallery | White-walled gallery space with dramatic spotlight on artwork |
| Concert | Concert stage with dramatic spotlights and instrument silhouettes |

---

## 7. Implementation Order

Screen-by-screen, both visual and AI in each pass. **Wave 0 runs in parallel with all other waves** — it provides the real photos and descriptions that every screen needs.

**Process discipline at every wave boundary:**
- **Before each wave**: Read `.claude/napkin.md` + `docs/project_ledger.md`. Check execution board.
- **After each wave**: Run `/simplify` on all changed code (reuse, quality, efficiency). Update ledger with wave summary. Update napkin if new recurring rules emerged.
- **Subagent ownership**: Every task has a named owner below. `[frontend]` = frontend agent, `[backend]` = backend/data agent, `[edge-fn]` = edge function agent, `[assets]` = asset generation (human + Gemini), `[review]` = simplify/review agent.

---

### Wave 0: Data & Pipeline (runs in parallel from day 1)

| # | Task | Owner |
|---|---|---|
| 0.1 | Google Maps photo scrape script (batch, Places API) | `[backend]` |
| 0.2 | Run photo scrape — populate venue images | `[backend]` |
| 0.3 | `enrich-descriptions` edge function (Claude Haiku) | `[edge-fn]` |
| 0.4 | Run venue description enrichment (batch, 250+ venues) | `[backend]` |
| 0.5 | Instagram seed script (manual caption ingestion for demo) | `[backend]` |
| 0.6 | `parse-instagram` edge function (Claude Haiku) | `[edge-fn]` |
| 0.7 | Demo data quality pass — verify 20+ venues w/ photos, 10+ events, 3+ specials, hidden gems flagged | `[backend]` |

**→ Checkpoint: `/simplify` on all backend + edge function code. Ledger entry. Napkin update.**

---

### Wave 1: Home (highest demo impact)

| # | Task | Owner |
|---|---|---|
| 1.1 | Generate hero background photos (4 time variants + tonight + explore) via Gemini | `[assets]` |
| 1.2 | Generate mood icons (12) via Gemini | `[assets]` |
| 1.3 | Generate category icons (8+) via Gemini | `[assets]` |
| 1.4 | `GlassMoodChip` shared component (glass container + icon + label + selected state) | `[frontend]` |
| 1.5 | `FlippableCard` shared component (reanimated v3, front/back, parallax) | `[frontend]` |
| 1.6 | Home hero restyle (photo backgrounds, time-based switching, gradient overlay) | `[frontend]` |
| 1.7 | `generate-pulse` edge function (Gemini Flash-Lite) | `[edge-fn]` |
| 1.8 | City Pulse integration — client helper + hero display | `[frontend]` |
| 1.9 | `surprise-me` edge function (GPT-4.1 mini) | `[edge-fn]` |
| 1.10 | Surprise Me card — glass card in hero, expand overlay, venue cards | `[frontend]` |
| 1.11 | "Gdje na kafu?" randomizer section | `[frontend]` |
| 1.12 | Hidden Gems spotlight rail | `[frontend]` |
| 1.13 | Tonight events carousel (flippable cards, reuse 1.5) | `[frontend]` |
| 1.14 | Active series cards restyle | `[frontend]` |

**→ Checkpoint: `/simplify` on all Wave 1 code. Ledger entry. Napkin update if shared component patterns crystallized.**

---

### Wave 2: Explore (second highest impact)

| # | Task | Owner |
|---|---|---|
| 2.1 | `smart-search` edge function (GPT-4.1 nano, single-call classify + respond) | `[edge-fn]` |
| 2.2 | Smart search bar — glass input, NL detection, concierge response card | `[frontend]` |
| 2.3 | Glass mood/category chips in Explore (reuse `GlassMoodChip` from 1.4) | `[frontend]` |
| 2.4 | Venue cards restyle — flippable editorial (reuse `FlippableCard` from 1.5) | `[frontend]` |
| 2.5 | Filter modal restyle (glass bottom sheet, chip selectors, sliders) | `[frontend]` |
| 2.6 | Dnevni meni tab restyle (food photography focus, price pills) | `[frontend]` |
| 2.7 | `translate-scene` edge function (Gemini Flash vision) | `[edge-fn]` |
| 2.8 | Live Translation — camera icon, expo-camera integration, permission flow, result card | `[frontend]` |

**→ Checkpoint: `/simplify` on all Wave 2 code. Ledger entry. Napkin update (especially camera/permission patterns).**

---

### Wave 3: Tonight (showstopper AI demo)

| # | Task | Owner |
|---|---|---|
| 3.1 | Generate tonight header photography via Gemini | `[assets]` |
| 3.2 | Tonight header restyle (moody background, dynamic title) | `[frontend]` |
| 3.3 | Glass time segment tabs (Jutro / Ručak / Večer / Noć) | `[frontend]` |
| 3.4 | `generate-plan` edge function (GPT-4.1 mini, SSE streaming via ReadableStream) | `[edge-fn]` |
| 3.5 | AI Evening Planner modal — mood/group/budget inputs, generate button | `[frontend]` |
| 3.6 | Planner SSE client — direct fetch, streaming render, timeline with venue cards | `[frontend]` |
| 3.7 | Plan persistence — save/regenerate/history in `ai_plans` table | `[backend]` |
| 3.8 | Event cards restyle (reuse `FlippableCard`) + urgency badges | `[frontend]` |
| 3.9 | Ticket CTA buttons restyle (glass amber) | `[frontend]` |

**→ Checkpoint: `/simplify` on all Wave 3 code. Ledger entry. Napkin update (SSE patterns, streaming state management).**

---

### Wave 4: Venue/Event/Series Detail

| # | Task | Owner |
|---|---|---|
| 4.1 | Venue detail hero restyle (Google Maps photos, gradient overlay, glass badges) | `[frontend]` |
| 4.2 | Glass action row (navigate, call, web, Instagram, save — icon buttons) | `[frontend]` |
| 4.3 | Hidden gem badge + insider tip callout | `[frontend]` |
| 4.4 | AI-enriched description display (bilingual, from pre-computed `description_bs/en`) | `[frontend]` |
| 4.5 | Venue tabs restyle (glass pills: Info / Događaji / Ponude) | `[frontend]` |
| 4.6 | Event detail restyle (hero, series badge, ticket CTA, embedded venue card) | `[frontend]` |
| 4.7 | Series detail restyle (hero, countdown badge, event list) | `[frontend]` |
| 4.8 | Check-in button + `checkins` table + count badge on venue cards | `[backend]` + `[frontend]` |

**→ Checkpoint: `/simplify` on all Wave 4 code. Ledger entry. Napkin update (detail screen patterns).**

---

### Wave 5: Saved + Profile

| # | Task | Owner |
|---|---|---|
| 5.1 | Saved screen — glass tab pills, flippable card lists (reuse shared components) | `[frontend]` |
| 5.2 | Generate empty state photography via Gemini | `[assets]` |
| 5.3 | Empty states — photography + encouraging copy, not sad placeholders | `[frontend]` |
| 5.4 | Badges section — glass badge grid with glow per earned badge | `[frontend]` |
| 5.5 | Profile screen — glass profile card, taste mood chips, settings cards | `[frontend]` |
| 5.6 | Settings restyle (glass cards with toggle rows) | `[frontend]` |

**→ Checkpoint: `/simplify` on all Wave 5 code. Ledger entry. Napkin update.**

---

### Wave 6: Polish & Final QA

| # | Task | Owner |
|---|---|---|
| 6.1 | End-to-end demo walkthrough on target device | `[review]` |
| 6.2 | Loading state polish (shimmer timing, animation smoothness) | `[frontend]` |
| 6.3 | Edge case fixes (empty states, timeout handling, offline graceful degradation) | `[frontend]` |
| 6.4 | Performance pass (image optimization, lazy loading, list virtualization) | `[frontend]` |
| 6.5 | Final `/simplify` pass on entire codebase touched during restyle | `[review]` |
| 6.6 | Final ledger entry — restyle complete, demo-ready status | `[review]` |
| 6.7 | Final napkin update — crystallize all recurring patterns from this sprint | `[review]` |

---

## 8. Error Handling & Loading States

### 8.1 AI Feature Error States

Every AI-powered feature needs a graceful fallback when the AI call fails, times out, or returns malformed data:

| Feature | Loading State | Error Fallback |
|---|---|---|
| City Pulse | Shimmer text block in hero (2 lines) | Show last cached pulse, or static fallback: "Dobro došli u Sarajevo" with weather |
| Surprise Me | Sparkle animation on card + "Thinking..." | "Couldn't generate a surprise right now. Try again?" with retry button |
| Smart Search (concierge) | Typing indicator dots in response card | Fall back to standard text search (filter by query string) |
| Tonight Planner | Shimmer timeline with 4 placeholder stops | "Plan generation timed out. Here are tonight's top events instead." → show event list |
| Live Translation | Shimmer overlay on captured photo | "Couldn't translate. Try capturing again with clearer text." |
| Venue descriptions | N/A (pre-computed) | Show raw existing description or "Description coming soon" |

### 8.2 Loading States (Skeleton/Shimmer)

All screens use shimmer placeholders during data fetches — never blank screens:

- **Cards**: Shimmer rectangle matching card dimensions (24px radius), subtle pulse animation
- **Hero**: Full-width shimmer with gradient overlay
- **Text blocks**: 2-3 shimmer lines at 60%/80%/40% width
- **Mood chips**: Row of shimmer pills
- **AI responses**: Typing indicator (3 bouncing dots) in a glass card

### 8.3 Network Failure

If the device is offline or Supabase is unreachable:
- Show cached data where available (venues, events from local SQLite/AsyncStorage cache)
- AI features show "Offline — AI features need internet" in a subtle glass banner
- Non-AI browsing continues to work from cache

---

## 9. Presentation Strategy

### 9.1 What to Show

The board receives a live URL. Every screen must be functional. Demo flow if guided:

1. **Home** — "Look at this" → city pulse, surprise me, hidden gems, coffee randomizer
2. **Explore** — "Ask it anything" → type a natural language question, watch AI respond
3. **Explore** — "Translate this" → point camera at Bosnian text
4. **Tonight** — "Plan my evening" → AI generates a real plan from live data, streamed
5. **Venue detail** — "Every venue has real photos, AI descriptions, insider tips"
6. **Saved** — "Users build their personal Sarajevo"

### 9.2 What Not to Show (unless asked)

- Backend admin / scraping internals
- Raw database views
- Technical architecture
- Cost breakdowns (have the PDF ready if asked)

### 9.3 Key Talking Points

- "Hype aggregates from 30+ Sarajevo sources — including Instagram — using AI"
- "Every description, every recommendation is AI-powered and bilingual"
- "The AI costs pennies per user — less than a coffee per thousand users"
- "This is designed to scale to any city"
- "The tourism board gets a modern digital asset for Sarajevo"

---

## 10. Coding Lessons Applied (from AWWV & Chronicles)

Hard-won patterns from sibling projects that apply directly to this work. Every subagent MUST follow these.

### 10.1 Supabase & Edge Functions

| Rule | Source | Detail |
|---|---|---|
| **Never await inside `onAuthStateChange`** | Chronicles | Supabase-js v2 holds an internal lock. Awaiting a query inside the callback deadlocks the entire app. Defer with `setTimeout(() => ..., 0)`. |
| **Edge functions return status 200 always** | Chronicles | Non-2xx status cannot be caught client-side on Supabase Edge. Wrap errors in `{ success: false, error: msg }` with `status: 200`. |
| **Deploy edge functions with `--no-verify-jwt`** | Chronicles | JWT verification breaks after session expiry. Also set `verify_jwt = false` in `supabase/config.toml`. |
| **AbortController with 20s timeout on ALL AI fetch calls** | Chronicles | Supabase infra kills at ~25s. Our 20s timeout gives 5s buffer for response serialization. |
| **One Supabase client instance** | Chronicles | `import { supabase } from '@/lib/supabase'` everywhere. Never create a second client. |
| **Regenerate types after schema changes** | Chronicles | `supabase gen types typescript --project-id [id] > src/types/database.ts` before writing TS touching new columns. |
| **Make migrations idempotent** | Chronicles | `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `DO $$ ... $$` for policies. |
| **Deno edge function imports use `npm:` prefix** | Chronicles | `import Anthropic from 'npm:@anthropic-ai/sdk'`, `import { createClient } from 'npm:@supabase/supabase-js'` |

### 10.2 AI Integration

| Rule | Source | Detail |
|---|---|---|
| **AI calls through edge functions only** | Chronicles | Never call OpenAI/Gemini/Anthropic from client. All keys in Supabase secrets. |
| **Use `gemini-2.5-flash` not `gemini-2.0-flash`** | Chronicles | 2.0 is deprecated (404 for new users). |
| **Route by model strength** | Chronicles | Claude for prose/narrative, Gemini for vision/OCR, OpenAI for structured JSON. Don't use expensive models for cheap tasks. |
| **Two-step for image restyle: analyze then generate** | Chronicles | Passing an image to Gemini Image Gen for "restyle" just applies a filter. Instead: Gemini vision describes scene (text) → Gemini Image Gen creates from text only. |
| **Parallel queries with `Promise.all`** | Chronicles | Independent data fetches in parallel, not sequential await chains. |

### 10.3 Architecture & Code Organization

| Rule | Source | Detail |
|---|---|---|
| **Data layer separation** | Chronicles | ALL Supabase calls in dedicated files (`utils/data/*.ts` or `hooks/`). Never call Supabase directly from screens. |
| **Pages are orchestration shells** | Chronicles + AWWV | Pages have no business logic. They call hooks, pass data to components, handle navigation. |
| **Use `import type` for type-only imports** | AWWV | `import type { Venue } from './types'` — distinguishes compile-time vs runtime, reduces bundle. |
| **Factory/builder functions for complex objects** | AWWV | `buildPlanPayload()`, `buildSearchFilters()` — centralized, testable. |
| **No `Math.random()` in render paths** | AWWV + Hype napkin | Use stable inputs for mock data. Random in render causes hydration mismatches and flicker. |
| **Nested state: manual spread for deep updates** | AWWV | `{ ...state, nested: { ...state.nested, field: value } }` — shallow spread overwrites nested structures silently. |

### 10.4 React / React Native Patterns

| Rule | Source | Detail |
|---|---|---|
| **Loading states require try-catch-finally** | Chronicles | `setLoading(false)` in `finally`, never just happy path. Otherwise errors leave spinners forever. |
| **Timer cleanup in useEffect return** | Chronicles | `return () => clearTimeout(timer)` — prevents setState on unmounted components. |
| **Realtime subscription cleanup on unmount** | Chronicles | `return () => supabase.removeChannel(channel)` — prevents socket accumulation and memory leaks. |
| **Debounced handlers need a stable instance** | Hype napkin | `useMemo(() => debounce(fn, 300), [])` — and `.cancel()` on unmount. |
| **useEffect dependencies must match actual usage** | AWWV + Hype napkin | Wrong deps → stale closures, infinite loops, or missed updates. |
| **Stagger animations break with async state hydration** | Chronicles | Zustand persist hydrates after first render. Stagger `initial: { opacity: 0 }` starts invisible permanently. Use simple fade instead. |

### 10.5 Validation Triad (run after every change)

```
1. tsc --noEmit          (TypeScript passes)
2. tests pass            (vitest / jest)
3. build succeeds        (expo export --platform web / npx expo start)
```

### 10.6 Anti-Patterns (BANNED)

- `as any` type casts — use proper narrowing or safe casts
- Emoji in premium UI — use icons, text dividers, CSS ornaments
- Service worker runtime caching on Supabase routes — causes stale data deadlocks
- Prop drilling 5+ levels — use context or hooks
- `Math.random()` or `Date.now()` in deterministic paths
- Sequential awaits when queries are independent — use `Promise.all`
- Hardcoded strings in leaf components — extract to helper/copy modules
