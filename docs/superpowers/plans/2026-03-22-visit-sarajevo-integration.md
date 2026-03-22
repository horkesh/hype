# Visit Sarajevo Full Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pull Visit Sarajevo's website content, events, attractions, and Instagram feed into Look so the tourism board sees their own content living interactively in the app during the pitch.

**Architecture:** 7 integration features built as independent vertical slices. Each adds a data source (scrape/seed), a data layer (utils), and a UI surface (component). The existing edge function + Supabase + glass component patterns are reused throughout. Heritage walks and Ask Sarajevo get their own edge functions; the rest reuse existing infrastructure.

**Tech Stack:** Expo Router, Supabase (DB + Edge Functions + Storage), Claude Sonnet 4.5, Apify Instagram scraper, existing glass component system, DM Serif Display / DM Sans typography.

---

## Chunk 1: Home Screen Restructure + Venue Sections

The reference screenshots show a fundamentally different Home layout than what we have. The default (no mood) home should show:
1. Hero + mood chips (keep as-is)
2. **Featured** — editor pick, large event card
3. **New in Town** — recently opened venues as list rows
4. **Happening Now** — current/upcoming events as large cards

When a mood IS selected, the unified mood feed replaces these sections (existing behavior, keep as-is).

### Task 1.1: Add `is_featured` and `opened_date` venue support to homeData

**Files:**
- Modify: `utils/homeData.ts`
- Test: `tests/homeData.test.ts` (create if not exists)

- [ ] **Step 1: Write test for loadHomeFeaturedEvent**

```typescript
// tests/homeData.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getFeaturedEventQuery, getNewInTownQuery } from '../utils/homeDataUtils.ts';

describe('homeDataUtils', () => {
  it('getFeaturedEventQuery returns correct filter shape', () => {
    const q = getFeaturedEventQuery();
    assert.deepStrictEqual(q, {
      table: 'events',
      filters: { is_featured: true, is_active: true },
      order: 'start_datetime',
      ascending: true,
      limit: 1,
      select: 'id, title_bs, title_en, cover_image_url, start_datetime, price_bam, location_name, moods, venues(name)',
    });
  });

  it('getNewInTownQuery returns correct filter shape', () => {
    const q = getNewInTownQuery();
    assert.ok(q.table === 'venues');
    assert.ok(q.limit === 6);
    assert.ok(q.order === 'created_at');
    assert.ok(q.ascending === false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/homeDataUtils.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create homeDataUtils with query builders**

```typescript
// utils/homeDataUtils.ts

export interface QueryShape {
  table: string;
  filters: Record<string, unknown>;
  order: string;
  ascending: boolean;
  limit: number;
  select: string;
}

export function getFeaturedEventQuery(): QueryShape {
  return {
    table: 'events',
    filters: { is_featured: true, is_active: true },
    order: 'start_datetime',
    ascending: true,
    limit: 1,
    select: 'id, title_bs, title_en, cover_image_url, start_datetime, price_bam, location_name, moods, venues(name)',
  };
}

export function getNewInTownQuery(): QueryShape {
  return {
    table: 'venues',
    filters: { is_active: true },
    order: 'created_at',
    ascending: false,
    limit: 6,
    select: 'id, name, cover_image_url, category, neighborhood, address, description_bs, description_en, google_rating, price_level',
  };
}

export interface NewInTownVenue {
  id: string;
  name: string;
  cover_image_url: string | null;
  category: string;
  neighborhood: string | null;
  address: string | null;
  description_bs: string | null;
  description_en: string | null;
  google_rating: number | null;
  price_level: string | null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test tests/homeDataUtils.test.ts`
Expected: PASS

- [ ] **Step 5: Add loadHomeFeaturedEvent and loadHomeNewInTown to homeData.ts**

Add to `utils/homeData.ts`:

```typescript
import type { NewInTownVenue } from './homeDataUtils';

export async function loadHomeFeaturedEvent(): Promise<HomeEventItem | null> {
  const { data } = await supabase
    .from('events')
    .select('id, title_bs, title_en, cover_image_url, start_datetime, price_bam, location_name, moods, venues(name)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function loadHomeNewInTown(): Promise<NewInTownVenue[]> {
  const { data } = await supabase
    .from('venues')
    .select('id, name, cover_image_url, category, neighborhood, address, description_bs, description_en, google_rating, price_level')
    .order('created_at', { ascending: false })
    .limit(6);
  return (data ?? []) as NewInTownVenue[];
}
```

- [ ] **Step 6: Commit**

```bash
git add utils/homeDataUtils.ts utils/homeData.ts tests/homeDataUtils.test.ts
git commit -m "feat: add Featured event and New in Town venue loaders"
```

### Task 1.2: Create HomeFeaturedSection and HomeNewInTownSection components

**Files:**
- Create: `components/home/HomeFeaturedSection.tsx`
- Create: `components/home/HomeNewInTownSection.tsx`
- Modify: `components/home/HomeContentSections.tsx`

- [ ] **Step 1: Create HomeFeaturedSection**

```typescript
// components/home/HomeFeaturedSection.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { loadHomeFeaturedEvent, type HomeEventItem } from '@/utils/homeData';
import { getHomeEventCardContent } from '@/utils/homeEventsSection';
import { designTokens } from '@/styles/designTokens';
import { glassTokens } from '@/styles/glassTokens';
import type { HomeLanguage } from '@/utils/homeScreenContent';

interface Props {
  language: HomeLanguage;
  colors: { accent: string; card: string; text: string; textSecondary: string };
  onEventPress: (eventId: string) => void;
}

export function HomeFeaturedSection({ language, colors, onEventPress }: Props) {
  const [event, setEvent] = useState<HomeEventItem | null>(null);

  useEffect(() => {
    loadHomeFeaturedEvent().then(setEvent);
  }, []);

  if (!event) return null;

  const content = getHomeEventCardContent(language, event);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {language === 'bs' ? 'Izdvojeno' : 'Featured'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {language === 'bs' ? 'Naš izbor za tebe' : "Editor's picks for you"}
      </Text>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => onEventPress(event.id)}
        activeOpacity={0.85}
      >
        {event.cover_image_url && (
          <Image source={{ uri: event.cover_image_url }} style={styles.image} />
        )}
        <View style={styles.overlay}>
          <Text style={styles.cardTitle}>{content.title}</Text>
          <Text style={styles.cardMeta}>
            {content.dateLabel} {content.venueName ? `· ${content.venueName}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    ...designTokens.typography.sectionHeader,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 12,
  },
  card: {
    borderRadius: designTokens.radius.card,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(20,10,0,0.7)',
  },
  cardTitle: {
    ...designTokens.typography.cardTitle,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.7)',
  },
});
```

- [ ] **Step 2: Create HomeNewInTownSection**

```typescript
// components/home/HomeNewInTownSection.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { loadHomeNewInTown } from '@/utils/homeData';
import { getCategoryLabel } from '@/utils/categoryLabels';
import { designTokens } from '@/styles/designTokens';
import type { NewInTownVenue } from '@/utils/homeDataUtils';
import type { HomeLanguage } from '@/utils/homeScreenContent';

interface Props {
  language: HomeLanguage;
  colors: { accent: string; card: string; text: string; textSecondary: string };
}

export function HomeNewInTownSection({ language, colors }: Props) {
  const [venues, setVenues] = useState<NewInTownVenue[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadHomeNewInTown().then(setVenues);
  }, []);

  if (venues.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {language === 'bs' ? 'Novo u gradu' : 'New in Town'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {language === 'bs' ? 'Tek otvoreno' : 'Just opened'}
      </Text>
      {venues.slice(0, 4).map((venue) => (
        <TouchableOpacity
          key={venue.id}
          style={[styles.row, { backgroundColor: colors.card }]}
          onPress={() => router.push(`/venue/${venue.id}`)}
          activeOpacity={0.85}
        >
          {venue.cover_image_url && (
            <Image source={{ uri: venue.cover_image_url }} style={styles.thumb} />
          )}
          <View style={styles.rowContent}>
            <Text style={[styles.venueName, { color: colors.text }]} numberOfLines={1}>
              {venue.name}
            </Text>
            <Text style={[styles.venueCategory, { color: colors.textSecondary }]}>
              {getCategoryLabel(venue.category, language)}
              {venue.neighborhood ? ` · ${venue.neighborhood}` : ''}
            </Text>
          </View>
          {venue.google_rating && (
            <Text style={[styles.rating, { color: colors.accent }]}>
              {venue.google_rating.toFixed(1)}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    ...designTokens.typography.sectionHeader,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
  },
  rowContent: { flex: 1 },
  venueName: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 2,
  },
  venueCategory: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  rating: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    marginLeft: 8,
  },
});
```

- [ ] **Step 3: Wire into HomeContentSections**

In `components/home/HomeContentSections.tsx`, add the new sections to the default (no mood) layout:

```typescript
// Add imports
import { HomeFeaturedSection } from './HomeFeaturedSection';
import { HomeNewInTownSection } from './HomeNewInTownSection';

// In the render, when no mood is selected, change section order to:
// 1. HomeFeaturedSection (new)
// 2. HomeNewInTownSection (new)
// 3. HomeTrendingSection (existing — "Happening Now")
// 4. HomeKafuSection (existing)
// 5. HomeHiddenGems (existing)
// 6. HomeEventsSection (existing)
```

- [ ] **Step 4: Verify on web preview**

Run: `npx.cmd expo start --web`
Check: Home screen shows Featured + New in Town sections above existing sections when no mood selected. Mood feed still works when mood chip tapped.

- [ ] **Step 5: Commit**

```bash
git add components/home/HomeFeaturedSection.tsx components/home/HomeNewInTownSection.tsx components/home/HomeContentSections.tsx
git commit -m "feat: add Featured and New in Town sections to Home"
```

---

## Chunk 2: Visit Sarajevo Events Scraper

Add `visitsarajevo.ba/latest-events/` as a scrape source. Their events use Tribe Events Calendar (WordPress plugin) with a predictable HTML structure.

### Task 2.1: Add Visit Sarajevo scrape source to DB

**Files:**
- Create: `backend/src/scripts/seedVisitSarajevoSource.ts`

- [ ] **Step 1: Create seed script**

```typescript
// backend/src/scripts/seedVisitSarajevoSource.ts
import { requestSupabaseAdminNoContent } from '../lib/supabaseAdmin';

async function main() {
  await requestSupabaseAdminNoContent('/rest/v1/scrape_sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({
      name: 'Visit Sarajevo',
      source_url: 'https://www.visitsarajevo.ba/latest-events/',
      tier: 1,
      frequency_hours: 24,
      is_active: true,
      scrape_config: {
        fetch_method: 'direct_html',
        list_urls: ['https://www.visitsarajevo.ba/latest-events/'],
        parser_hint: 'tribe_events',
      },
    }),
  });
  console.log('Visit Sarajevo source seeded.');
}

main().catch(console.error);
```

- [ ] **Step 2: Run seed script**

Run: `node --env-file=backend/.env --import tsx backend/src/scripts/seedVisitSarajevoSource.ts`
Expected: "Visit Sarajevo source seeded."

- [ ] **Step 3: Commit**

```bash
git add backend/src/scripts/seedVisitSarajevoSource.ts
git commit -m "feat: seed Visit Sarajevo as scrape source"
```

### Task 2.2: Add Visit Sarajevo extractor to sourceExtractors

**Files:**
- Modify: `backend/src/services/sourceExtractors.ts`

- [ ] **Step 1: Add tribe_events extractor**

Add a new extractor function for the Tribe Events Calendar HTML format used by Visit Sarajevo. Extract event title, date (`tribe-event-date-start`), venue, description, and image from each `.tribe-events-calendar-list__event-row` element.

- [ ] **Step 2: Test with a manual scrape**

Run: `node --env-file=backend/.env --import tsx backend/src/scripts/runScraper.ts`
Expected: raw_events inserted for Visit Sarajevo events

- [ ] **Step 3: Commit**

```bash
git add backend/src/services/sourceExtractors.ts
git commit -m "feat: add Visit Sarajevo Tribe Events extractor"
```

---

## Chunk 3: Visit Sarajevo Instagram Rail on Home

Pull their Instagram feed into a horizontal card rail on the Home screen.

### Task 3.1: Create Instagram data loader

**Files:**
- Create: `utils/visitSarajevoInstagram.ts`

- [ ] **Step 1: Create the data loader**

```typescript
// utils/visitSarajevoInstagram.ts
import { supabase } from '@/integrations/supabase/client';

export interface VisitSarajevoPost {
  id: string;
  image_url: string;
  caption: string;
  post_url: string;
  timestamp: string;
}

// Posts are stored in a visit_sarajevo_posts table (seeded by Apify scraper)
export async function loadVisitSarajevoPosts(limit = 10): Promise<VisitSarajevoPost[]> {
  const { data } = await supabase
    .from('visit_sarajevo_posts')
    .select('id, image_url, caption, post_url, timestamp')
    .order('timestamp', { ascending: false })
    .limit(limit);
  return (data ?? []) as VisitSarajevoPost[];
}
```

- [ ] **Step 2: Commit**

```bash
git add utils/visitSarajevoInstagram.ts
git commit -m "feat: add Visit Sarajevo Instagram post loader"
```

### Task 3.2: Create DB table and Apify scraper for @visitsarajevo.ba

**Files:**
- Create: `supabase/migrations/20260322_visit_sarajevo_posts.sql`
- Create: `backend/src/scripts/scrapeVisitSarajevoInstagram.ts`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/20260322_visit_sarajevo_posts.sql
CREATE TABLE IF NOT EXISTS visit_sarajevo_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  post_url TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE visit_sarajevo_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON visit_sarajevo_posts FOR SELECT USING (true);
```

- [ ] **Step 2: Apply migration**

Run: `npx.cmd supabase db push`

- [ ] **Step 3: Create scraper script**

Reuse the existing Apify Instagram scraper pattern from `scrapeInstagram.ts`, pointed at `@visitsarajevo.ba`. Store posts in `visit_sarajevo_posts` table.

- [ ] **Step 4: Run scraper**

Run: `node --env-file=backend/.env --import tsx backend/src/scripts/scrapeVisitSarajevoInstagram.ts`
Expected: Posts inserted into visit_sarajevo_posts

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260322_visit_sarajevo_posts.sql backend/src/scripts/scrapeVisitSarajevoInstagram.ts
git commit -m "feat: Visit Sarajevo Instagram scraper + DB table"
```

### Task 3.3: Create HomeVisitSarajevoRail component

**Files:**
- Create: `components/home/HomeVisitSarajevoRail.tsx`
- Modify: `components/home/HomeContentSections.tsx`

- [ ] **Step 1: Create the rail component**

Horizontal ScrollView of glass cards showing Visit Sarajevo Instagram posts. Each card: image (160x200), short caption (2 lines max), "via @visitsarajevo.ba" attribution at bottom. Tapping opens the post URL.

Design: match existing HomeCardRail pattern. Glass card with warm amber overlay at bottom for text.

- [ ] **Step 2: Wire into HomeContentSections**

Add `HomeVisitSarajevoRail` after the hero section, before mood chips (or after mood chips — before Featured). Only show in default view (no mood selected).

Section header: "Visit Sarajevo Stories" (BS: "Visit Sarajevo priče")

- [ ] **Step 3: Verify on web**

Check: Instagram rail shows with real posts, scrolls horizontally, cards look correct.

- [ ] **Step 4: Commit**

```bash
git add components/home/HomeVisitSarajevoRail.tsx components/home/HomeContentSections.tsx
git commit -m "feat: Visit Sarajevo Instagram stories rail on Home"
```

---

## Chunk 4: Heritage Walks — Interactive Walking Tours

Turn Visit Sarajevo's sightseeing themes into interactive AI-guided walking tours.

### Task 4.1: Create heritage_walks seed data

**Files:**
- Create: `supabase/migrations/20260322_heritage_walks.sql`
- Create: `backend/src/scripts/seedHeritageWalks.ts`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/20260322_heritage_walks.sql
CREATE TABLE IF NOT EXISTS heritage_walks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_bs TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_bs TEXT,
  description_en TEXT,
  icon TEXT DEFAULT 'walk',
  cover_image_url TEXT,
  estimated_minutes INTEGER DEFAULT 90,
  distance_km NUMERIC(4,1) DEFAULT 2.0,
  difficulty TEXT DEFAULT 'easy',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS heritage_walk_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  walk_id UUID REFERENCES heritage_walks(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  sort_order INTEGER NOT NULL,
  title_bs TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_bs TEXT,
  description_en TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  walking_minutes_to_next INTEGER DEFAULT 5,
  what_to_look_for_bs TEXT,
  what_to_look_for_en TEXT,
  source_attribution TEXT DEFAULT 'Visit Sarajevo'
);

ALTER TABLE heritage_walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE heritage_walk_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON heritage_walks FOR SELECT USING (true);
CREATE POLICY "Public read" ON heritage_walk_stops FOR SELECT USING (true);
```

- [ ] **Step 2: Apply migration**

Run: `npx.cmd supabase db push`

- [ ] **Step 3: Create seed script with Visit Sarajevo content**

Seed 3 heritage walks using their content:
1. **Ottoman Sarajevo** — Sebilj → Baščaršija → Gazi Husrev-bey Mosque → Morića Han → Brusa Bezistan
2. **Austro-Hungarian Sarajevo** — City Hall → Latin Bridge → Cathedral → National Theatre → Eternal Flame
3. **European Jerusalem** — Old Orthodox Church → Sephardic Temple → Gazi Husrev-bey Mosque → Catholic Cathedral

Each stop uses Visit Sarajevo's description text (attributed) + our venue photo + walking time.

- [ ] **Step 4: Run seed**

Run: `node --env-file=backend/.env --import tsx backend/src/scripts/seedHeritageWalks.ts`

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260322_heritage_walks.sql backend/src/scripts/seedHeritageWalks.ts
git commit -m "feat: heritage walks DB schema + seed data from Visit Sarajevo"
```

### Task 4.2: Create heritage walk data layer

**Files:**
- Create: `utils/heritageWalkData.ts`
- Create: `utils/heritageWalkScreen.ts`

- [ ] **Step 1: Create data loader**

```typescript
// utils/heritageWalkData.ts
import { supabase } from '@/integrations/supabase/client';

export interface HeritageWalk {
  id: string;
  slug: string;
  title_bs: string;
  title_en: string;
  description_bs: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  estimated_minutes: number;
  distance_km: number;
  difficulty: string;
}

export interface HeritageWalkStop {
  id: string;
  sort_order: number;
  title_bs: string;
  title_en: string;
  description_bs: string | null;
  description_en: string | null;
  latitude: number | null;
  longitude: number | null;
  walking_minutes_to_next: number;
  what_to_look_for_bs: string | null;
  what_to_look_for_en: string | null;
  source_attribution: string | null;
  venue_id: string | null;
  venues?: { name: string; cover_image_url: string | null } | null;
}

export async function loadHeritageWalks(): Promise<HeritageWalk[]> {
  const { data } = await supabase
    .from('heritage_walks')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as HeritageWalk[];
}

export async function loadHeritageWalkDetail(walkId: string): Promise<{
  walk: HeritageWalk | null;
  stops: HeritageWalkStop[];
}> {
  const [walkRes, stopsRes] = await Promise.all([
    supabase.from('heritage_walks').select('*').eq('id', walkId).maybeSingle(),
    supabase
      .from('heritage_walk_stops')
      .select('*, venues(name, cover_image_url)')
      .eq('walk_id', walkId)
      .order('sort_order', { ascending: true }),
  ]);
  return {
    walk: (walkRes.data as HeritageWalk) ?? null,
    stops: (stopsRes.data ?? []) as HeritageWalkStop[],
  };
}
```

- [ ] **Step 2: Create display helpers**

```typescript
// utils/heritageWalkScreen.ts
import type { HeritageWalk, HeritageWalkStop } from './heritageWalkData';

type Lang = 'bs' | 'en';

export function getWalkTitle(walk: HeritageWalk, language: Lang): string {
  return language === 'bs' ? walk.title_bs : walk.title_en;
}

export function getStopTitle(stop: HeritageWalkStop, language: Lang): string {
  return language === 'bs' ? stop.title_bs : stop.title_en;
}

export function getStopDescription(stop: HeritageWalkStop, language: Lang): string | null {
  return language === 'bs' ? stop.description_bs : stop.description_en;
}

export function getWhatToLookFor(stop: HeritageWalkStop, language: Lang): string | null {
  return language === 'bs' ? stop.what_to_look_for_bs : stop.what_to_look_for_en;
}

export function getWalkSummary(walk: HeritageWalk, language: Lang): string {
  const mins = walk.estimated_minutes;
  const km = walk.distance_km;
  if (language === 'bs') return `${mins} min · ${km} km · ${walk.difficulty === 'easy' ? 'Lagano' : 'Umjereno'}`;
  return `${mins} min · ${km} km · ${walk.difficulty.charAt(0).toUpperCase() + walk.difficulty.slice(1)}`;
}

export function getHeritageWalksLabel(language: Lang) {
  return {
    title: language === 'bs' ? 'Šetnje kroz historiju' : 'Heritage Walks',
    subtitle: language === 'bs' ? 'Sadržaj: Visit Sarajevo' : 'Content by Visit Sarajevo',
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add utils/heritageWalkData.ts utils/heritageWalkScreen.ts
git commit -m "feat: heritage walk data layer and display helpers"
```

### Task 4.3: Create Heritage Walk UI screens

**Files:**
- Create: `app/(tabs)/(home)/heritage/index.tsx` — walk list
- Create: `app/(tabs)/(home)/heritage/[id].tsx` — walk detail with stops
- Create: `components/heritage/HeritageWalkCard.tsx`
- Create: `components/heritage/HeritageStopCard.tsx`
- Modify: `app/(tabs)/(home)/_layout.tsx` — add heritage routes

- [ ] **Step 1: Add heritage routes to layout**

In `app/(tabs)/(home)/_layout.tsx`, add:
```typescript
<Stack.Screen name="heritage/index" options={{ headerShown: false }} />
<Stack.Screen name="heritage/[id]" options={{ headerShown: false }} />
```

- [ ] **Step 2: Create HeritageWalkCard component**

Glass card with walk title, cover image, duration/distance badge, "Powered by Visit Sarajevo" attribution.

- [ ] **Step 3: Create walk list screen**

Vertical list of HeritageWalkCards. Header: "Heritage Walks" with Visit Sarajevo logo. Back button.

- [ ] **Step 4: Create HeritageStopCard component**

Each stop: numbered circle, title, description, venue photo (if linked), walking time to next, "What to look for" section, "Source: Visit Sarajevo" attribution badge.

- [ ] **Step 5: Create walk detail screen**

Shows walk title, cover image, summary (time/distance), then vertical list of HeritageStopCards with connecting line between them (timeline pattern).

- [ ] **Step 6: Add Heritage Walks section to Home**

Create `components/home/HomeHeritageSection.tsx` — horizontal rail of walk cards. Add to `HomeContentSections` in default view, positioned after Featured and before New in Town.

- [ ] **Step 7: Verify on web**

Check: Heritage walks show on Home, tapping opens walk list, tapping a walk shows stops with Visit Sarajevo attribution.

- [ ] **Step 8: Commit**

```bash
git add app/(tabs)/(home)/heritage/ components/heritage/ components/home/HomeHeritageSection.tsx app/(tabs)/(home)/_layout.tsx components/home/HomeContentSections.tsx
git commit -m "feat: Heritage Walk screens with Visit Sarajevo content"
```

---

## Chunk 5: "Ask Sarajevo" AI Concierge

RAG-style AI that knows everything Visit Sarajevo has published.

### Task 5.1: Scrape Visit Sarajevo content into knowledge base

**Files:**
- Create: `backend/src/scripts/scrapeVisitSarajevoContent.ts`
- Create: `supabase/migrations/20260322_visit_sarajevo_kb.sql`

- [ ] **Step 1: Create knowledge base table**

```sql
-- supabase/migrations/20260322_visit_sarajevo_kb.sql
CREATE TABLE IF NOT EXISTS visit_sarajevo_kb (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT UNIQUE NOT NULL,
  page_title TEXT,
  content_text TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE visit_sarajevo_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON visit_sarajevo_kb FOR SELECT USING (true);
```

- [ ] **Step 2: Apply migration**

Run: `npx.cmd supabase db push`

- [ ] **Step 3: Create scraper**

Scrape key Visit Sarajevo pages: top attractions (10 pages), places to eat categories, transport info, sightseeing themes. Store each page's full text content + URL + category in `visit_sarajevo_kb`.

- [ ] **Step 4: Run scraper**

Run: `node --env-file=backend/.env --import tsx backend/src/scripts/scrapeVisitSarajevoContent.ts`

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260322_visit_sarajevo_kb.sql backend/src/scripts/scrapeVisitSarajevoContent.ts
git commit -m "feat: scrape Visit Sarajevo website into knowledge base"
```

### Task 5.2: Create ask-sarajevo edge function

**Files:**
- Create: `supabase/functions/ask-sarajevo/index.ts`

- [ ] **Step 1: Create edge function**

Uses Claude Sonnet 4.5 with the full Visit Sarajevo KB as system prompt context. Receives a user question + language, returns a conversational answer with venue/attraction links.

Pattern: fetch all KB rows, concatenate into system prompt, send user question as user message. Match mentioned venue names against our venues table to return clickable venue IDs.

- [ ] **Step 2: Deploy**

Run: `npx.cmd supabase functions deploy ask-sarajevo --no-verify-jwt`

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/ask-sarajevo/
git commit -m "feat: ask-sarajevo edge function with Visit Sarajevo KB"
```

### Task 5.3: Create Ask Sarajevo client helper and UI

**Files:**
- Create: `utils/ai/askSarajevo.ts`
- Create: `components/home/HomeAskSarajevo.tsx`
- Modify: `components/home/HomeContentSections.tsx`

- [ ] **Step 1: Create client helper**

```typescript
// utils/ai/askSarajevo.ts
import { invokeEdgeFunction } from './edgeFunctionClient';

export interface AskSarajevoResult {
  answer_bs: string;
  answer_en: string;
  mentioned_venues: Array<{ venue_id: string; name: string }>;
  source_pages: string[];
}

export async function askSarajevo(
  question: string,
  language: string = 'bs'
): Promise<AskSarajevoResult | null> {
  const result = await invokeEdgeFunction<AskSarajevoResult>('ask-sarajevo', {
    question,
    language,
  });
  return result.data;
}
```

- [ ] **Step 2: Create Ask Sarajevo component**

GlassContainer on Home with a text input: "Ask anything about Sarajevo..." + AI badge. On submit, shows streaming answer with tappable venue links. Attribution: "Powered by Visit Sarajevo content".

- [ ] **Step 3: Wire into Home**

Add to `HomeContentSections` in default view, positioned after City Pulse and before Surprise Me.

- [ ] **Step 4: Verify on web**

Test question: "Where was Franz Ferdinand assassinated?" → should answer from KB content + link to Latin Bridge venue.

- [ ] **Step 5: Commit**

```bash
git add utils/ai/askSarajevo.ts components/home/HomeAskSarajevo.tsx components/home/HomeContentSections.tsx
git commit -m "feat: Ask Sarajevo AI concierge on Home"
```

---

## Chunk 6: Transport Directions + City Pulse Attribution

### Task 6.1: Add transport data to venue detail

**Files:**
- Create: `utils/venueTransport.ts`
- Create: `components/venue/VenueTransportSection.tsx`
- Modify: `app/(tabs)/(home)/venue/[id].tsx`

- [ ] **Step 1: Create transport helper**

Hardcode Sarajevo's transit lines from Visit Sarajevo's transport page. Map neighborhoods to nearest tram/bus stops. Return "How to get here" directions for any venue based on its coordinates or neighborhood.

```typescript
// utils/venueTransport.ts
export interface TransportDirection {
  mode: 'tram' | 'bus' | 'trolleybus' | 'walk';
  line: string;
  stop: string;
  walkMinutes: number;
}

export function getTransportDirections(
  neighborhood: string | null,
  latitude: number | null,
  longitude: number | null,
  language: 'bs' | 'en'
): TransportDirection[] {
  // Map neighborhoods to nearest transit
  // e.g. Baščaršija → Tram 3 to Baščaršija, walk 1 min
  // Ilidža → Tram 3 to Ilidža, walk 5 min
  // etc.
}
```

- [ ] **Step 2: Create VenueTransportSection component**

Shows transit directions with tram/bus icons. Attribution line: "Transport data: Visit Sarajevo".

- [ ] **Step 3: Add to venue detail**

Add VenueTransportSection to the Info tab, after the hours section.

- [ ] **Step 4: Commit**

```bash
git add utils/venueTransport.ts components/venue/VenueTransportSection.tsx app/(tabs)/(home)/venue/[id].tsx
git commit -m "feat: transport directions on venue detail from Visit Sarajevo"
```

### Task 6.2: Add "Powered by Visit Sarajevo" to AI plans

**Files:**
- Modify: `components/home/HomeSurpriseMe.tsx`
- Modify: `components/tonight/TonightPlannerResults.tsx` (or equivalent)

- [ ] **Step 1: Add attribution badge**

Add a small "Based on data from Visit Sarajevo and 1,226 local venues" text at the bottom of AI plan results, with the Visit Sarajevo logo image.

- [ ] **Step 2: Commit**

```bash
git add components/home/HomeSurpriseMe.tsx components/tonight/TonightPlannerResults.tsx
git commit -m "feat: Visit Sarajevo attribution on AI plans"
```

---

## Chunk 7: Visitor Passport (Gamification)

### Task 7.1: Create passport DB schema

**Files:**
- Create: `supabase/migrations/20260322_visitor_passport.sql`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/20260322_visitor_passport.sql
CREATE TABLE IF NOT EXISTS passport_stamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  venue_id UUID REFERENCES venues(id),
  walk_id UUID REFERENCES heritage_walks(id),
  stamp_type TEXT NOT NULL CHECK (stamp_type IN ('attraction', 'walk_complete', 'explorer')),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, venue_id, stamp_type)
);

-- Define the 10 Visit Sarajevo top attractions as passport-eligible
CREATE TABLE IF NOT EXISTS passport_attractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id),
  name_bs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  stamp_icon TEXT DEFAULT 'star',
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE passport_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_attractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stamps" ON passport_stamps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own stamps" ON passport_stamps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read attractions" ON passport_attractions FOR SELECT USING (true);
```

- [ ] **Step 2: Apply migration**

Run: `npx.cmd supabase db push`

- [ ] **Step 3: Seed passport attractions**

Seed the 10 Visit Sarajevo top attractions into `passport_attractions` — mapped to existing venues in our DB where possible.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260322_visitor_passport.sql
git commit -m "feat: visitor passport DB schema with Visit Sarajevo attractions"
```

### Task 7.2: Create passport data layer and UI

**Files:**
- Create: `utils/passportData.ts`
- Create: `utils/passportScreen.ts`
- Create: `app/(tabs)/(home)/passport.tsx`
- Create: `components/passport/PassportCard.tsx`
- Create: `components/passport/PassportStamp.tsx`
- Modify: `app/(tabs)/(home)/_layout.tsx`

- [ ] **Step 1: Create data loader**

Load passport attractions + user's earned stamps. Functions: `loadPassportAttractions()`, `loadUserStamps(userId)`, `earnStamp(userId, venueId)`.

- [ ] **Step 2: Create display helpers**

```typescript
// utils/passportScreen.ts
export function getPassportProgress(total: number, earned: number, language: 'bs' | 'en') {
  if (language === 'bs') return `${earned}/${total} pečata`;
  return `${earned}/${total} stamps`;
}

export function getPassportTitle(language: 'bs' | 'en') {
  return language === 'bs' ? 'Sarajevo Pasoš' : 'Sarajevo Passport';
}
```

- [ ] **Step 3: Create passport screen**

Grid of passport stamps (Visit Sarajevo attractions). Earned stamps are filled/colored, unearned are grayed out. Progress bar at top. "Sarajevo Explorer" badge when all 10 collected. Visit Sarajevo logo attribution.

- [ ] **Step 4: Add route to layout**

Add `passport` screen to `app/(tabs)/(home)/_layout.tsx`.

- [ ] **Step 5: Add passport entry point to Home**

Create a small "Sarajevo Passport" banner on Home with progress indicator. Tapping navigates to passport screen.

- [ ] **Step 6: Commit**

```bash
git add utils/passportData.ts utils/passportScreen.ts app/(tabs)/(home)/passport.tsx components/passport/ app/(tabs)/(home)/_layout.tsx components/home/HomeContentSections.tsx
git commit -m "feat: Visitor Passport with Visit Sarajevo attractions"
```

---

## Chunk 8: Replace AI Descriptions with Visit Sarajevo Content

For venues that correspond to Visit Sarajevo top attractions, use their rich descriptions instead of Haiku-generated ones.

### Task 8.1: Update venue descriptions from Visit Sarajevo

**Files:**
- Create: `backend/src/scripts/updateVisitSarajevoDescriptions.ts`

- [ ] **Step 1: Create update script**

Match Visit Sarajevo attraction names to our venue DB. For each match, update `description_bs` and `description_en` with the Visit Sarajevo content, adding an `_attribution` note. Their descriptions are much richer than our 1-2 sentence AI versions.

Map:
- "Bascarsija and Sebilj Fountain" → venue matching "Baščaršija" or "Sebilj"
- "City Hall" → venue matching "Vijećnica"
- "Latin Bridge" → venue matching "Latinski most"
- etc.

- [ ] **Step 2: Run script**

Run: `node --env-file=backend/.env --import tsx backend/src/scripts/updateVisitSarajevoDescriptions.ts`

- [ ] **Step 3: Verify on web**

Check venue detail for Latin Bridge — should show Visit Sarajevo's full description, not the old AI-generated one.

- [ ] **Step 4: Commit**

```bash
git add backend/src/scripts/updateVisitSarajevoDescriptions.ts
git commit -m "feat: replace AI descriptions with Visit Sarajevo content for top attractions"
```

---

## Chunk 9: Deploy and Document

### Task 9.1: Deploy all edge functions

- [ ] **Step 1: Deploy ask-sarajevo**

Run: `npx.cmd supabase functions deploy ask-sarajevo --no-verify-jwt`

- [ ] **Step 2: Push to Vercel**

```bash
git push
```

- [ ] **Step 3: Verify on production**

Visit `https://hype-alpha.vercel.app/` and check:
1. Visit Sarajevo logo in header, centered, clickable
2. Instagram stories rail on Home
3. Heritage Walks section on Home
4. Ask Sarajevo input on Home
5. Featured + New in Town sections on Home
6. Transport directions on venue detail
7. Visit Sarajevo attribution on AI plans
8. Passport screen accessible

### Task 9.2: Update documentation

**Files:**
- Modify: `docs/project_ledger.md`
- Modify: `docs/00-overview/execution_board.md`
- Modify: `.claude/napkin.md`

- [ ] **Step 1: Update ledger**

Add session entry documenting all 7 integration features.

- [ ] **Step 2: Update execution board**

Add E16 epic for Visit Sarajevo integration. Move relevant backlog items to Done.

- [ ] **Step 3: Update napkin**

Add rules:
- Visit Sarajevo content attribution is mandatory on all derived surfaces
- Heritage walk stops use `source_attribution` field — never remove it
- Passport stamps are proximity-based (when checkin system is live)

- [ ] **Step 4: Final commit**

```bash
git add docs/ .claude/napkin.md
git commit -m "docs: chronicle Visit Sarajevo integration — 7 features"
git push
```

---

## Implementation Order (Recommended)

The chunks are independent and can be parallelized via subagents. However, if sequential:

1. **Chunk 1** — Home restructure (Featured + New in Town) — foundational UI change
2. **Chunk 2** — Events scraper — low effort, high demo value
3. **Chunk 3** — Instagram rail — high demo value, visible immediately
4. **Chunk 8** — Description replacement — quick win, improves existing content
5. **Chunk 6** — Transport + attribution — medium effort, practical depth
6. **Chunk 4** — Heritage Walks — the "wow" moment, needs DB + 2 screens
7. **Chunk 5** — Ask Sarajevo — the "it can do THAT?!" moment, needs edge function
8. **Chunk 7** — Visitor Passport — gamification story, needs auth
9. **Chunk 9** — Deploy and document
