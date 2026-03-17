# Hype Presentation Restyle & AI Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Hype from a functional prototype with emoji placeholders into a visually stunning, AI-powered Sarajevo city discovery app for a tourism board presentation.

**Architecture:** Supabase Edge Functions as AI proxy layer (keys never client-side). Multi-provider: GPT-4.1 mini/nano (OpenAI), Gemini 2.5 Flash/Flash-Lite (Google), Claude Haiku 4.5 (Anthropic). Glass/glow UI system replacing all emojis. Flippable editorial cards via react-native-reanimated v3.

**Tech Stack:** Expo 54 + Expo Router 6, React Native, Supabase (Postgres + Edge Functions + Storage), react-native-reanimated v3, expo-blur, expo-camera, DM Sans typography.

**Spec:** `docs/superpowers/specs/2026-03-17-presentation-restyle-design.md`

**Coding lessons (MUST follow):** Spec Section 10 — from AWWV and Chronicles projects.

**Process discipline:** Read `.claude/napkin.md` + `docs/project_ledger.md` before each wave. Run `/simplify` after each wave. Update ledger + napkin at every checkpoint.

---

## File Map — New & Modified Files

### New Files (Edge Functions)
```
supabase/functions/_shared/cors.ts              — CORS headers helper
supabase/functions/_shared/ai-clients.ts        — AI provider client factories (OpenAI, Gemini, Anthropic)
supabase/functions/_shared/supabase-admin.ts    — Service-role Supabase client for edge functions
supabase/functions/generate-pulse/index.ts      — City Pulse (Gemini Flash-Lite)
supabase/functions/generate-plan/index.ts       — Tonight Planner with SSE (GPT-4.1 mini)
supabase/functions/smart-search/index.ts        — NL search classifier (GPT-4.1 nano)
supabase/functions/surprise-me/index.ts         — Micro-plan generator (GPT-4.1 mini)
supabase/functions/translate-scene/index.ts     — Camera OCR + translation (Gemini Flash vision)
supabase/functions/enrich-descriptions/index.ts — Batch venue descriptions (Claude Haiku)
supabase/functions/parse-instagram/index.ts     — Instagram caption → event extraction (Claude Haiku)
supabase/functions/analyze-venue-photo/index.ts — Classify/tag scraped venue photos (Gemini Flash)
```

### New Files (Client AI Helpers)
```
utils/ai/edgeFunctionClient.ts  — Wrapper for supabase.functions.invoke + direct fetch for SSE
utils/ai/cityPulse.ts           — Fetch/cache city pulse
utils/ai/planGenerator.ts       — Generate evening plan (SSE streaming)
utils/ai/smartSearch.ts         — NL search query
utils/ai/surpriseMe.ts          — Surprise micro-plan
utils/ai/translate.ts           — Camera capture + translate
```

### New Files (Shared Components)
```
components/glass/GlassContainer.tsx    — Reusable glass card (blur + border + shadow)
components/glass/GlassMoodChip.tsx     — Glass mood chip with icon (replaces MoodChip.tsx)
components/glass/GlassCategoryChip.tsx — Glass category chip with icon
components/glass/GlassBadge.tsx        — Small glass badge (urgency, hidden gem, etc.)
components/cards/FlippableCard.tsx     — Reanimated v3 3D flip card (front/back)
components/cards/VenueCardFront.tsx    — Editorial front: image + overlay title + badges
components/cards/VenueCardBack.tsx     — Info back: address, hours, actions
components/cards/EventCardFront.tsx    — Event front: image + title + time + mood badges
components/cards/EventCardBack.tsx     — Event back: venue, price, ticket CTA
components/cards/SeriesCard.tsx        — Active series card with countdown badge
```

### New Files (Home Features)
```
components/home/HomeHeroPhoto.tsx       — Photo background hero with time-based variants
components/home/HomeCityPulse.tsx       — AI pulse blurb display
components/home/HomeSurpriseMe.tsx      — Surprise Me overlay card
components/home/HomeKafuSection.tsx     — "Gdje na kafu?" randomizer
components/home/HomeHiddenGems.tsx      — Hidden gems spotlight rail
```

### New Files (Explore Features)
```
components/explore/ExploreSmartSearch.tsx — AI concierge search bar + response card
components/explore/ExploreLiveTranslation.tsx — Camera + translation overlay
```

### New Files (Tonight Features)
```
components/tonight/TonightAIPlanner.tsx  — Real AI planner (replaces mock)
components/tonight/TonightPlanStream.tsx — SSE streaming plan renderer
```

### New Files (Backend Scripts)
```
backend/src/scripts/scrapeGooglePhotos.ts   — Batch Google Maps photo scrape
backend/src/scripts/enrichDescriptions.ts   — Batch venue description enrichment
backend/src/scripts/seedInstagram.ts        — Manual Instagram caption seeder
```

### New Files (Design Tokens)
```
styles/glassTokens.ts   — Glass/glow design tokens (colors, shadows, borders)
styles/designTokens.ts  — Updated shared tokens (radii, typography, spacing)
```

### New Files (Tests)
```
tests/ai/edgeFunctionClient.test.ts
tests/ai/cityPulse.test.ts
tests/ai/smartSearch.test.ts
tests/ai/planGenerator.test.ts
tests/glass/GlassContainer.test.ts
tests/glass/GlassMoodChip.test.ts
tests/cards/FlippableCard.test.ts
```

### Modified Files (Key Changes)
```
styles/commonStyles.ts              — Add glass tokens, update card radius to 24px
components/MoodChip.tsx             — Replaced by GlassMoodChip (keep for backward compat, re-export)
components/home/HomeScreen.tsx      — Add city pulse, surprise me, kafu, hidden gems sections
components/home/HomeHeroSection.tsx — Replace gradient with photo hero
components/home/HomeEventsSection.tsx — Use FlippableCard
components/explore/ExploreSearchSection.tsx — Integrate smart search
components/tonight/TonightPlannerModal.tsx — Wire to real AI
components/tonight/TonightPlannerResults.tsx — SSE streaming display
components/venue/VenueDetailHeader.tsx — Photo hero, glass badges
components/venue/VenueActionButtons.tsx — Glass pill buttons with icons
supabase/config.toml                — Add edge function configs
integrations/supabase/client.ts     — Export getSession helper for direct fetch auth
```

---

## Chunk 1: Foundation — Design Tokens, Glass System, Shared Components

This chunk creates the reusable building blocks that every subsequent wave depends on. No AI calls yet — pure UI.

### Task 1: Design Tokens

**Files:**
- Create: `styles/glassTokens.ts`
- Create: `styles/designTokens.ts`
- Modify: `styles/commonStyles.ts`
- Test: `tests/styles/designTokens.test.ts`

- [ ] **Step 1: Write test for design tokens**

```typescript
// tests/styles/designTokens.test.ts
import { describe, it, expect } from 'vitest';
import { glassTokens } from '@/styles/glassTokens';
import { designTokens } from '@/styles/designTokens';

describe('glassTokens', () => {
  it('exports dark and light glass backgrounds', () => {
    expect(glassTokens.dark.background).toBe('rgba(255,255,255,0.08)');
    expect(glassTokens.light.background).toBe('rgba(255,255,255,0.6)');
  });

  it('exports mood glow colors for all 12 moods', () => {
    const moods = ['party', 'chill', 'girls_night', 'date_night', 'muzika',
      'romantika', 'kultura', 'foodie', 'brunch', 'after_work', 'outdoor', 'turista'];
    for (const mood of moods) {
      expect(glassTokens.moodColors[mood]).toBeDefined();
      expect(glassTokens.moodColors[mood].primary).toBeTruthy();
    }
  });
});

describe('designTokens', () => {
  it('exports updated card radius', () => {
    expect(designTokens.radius.card).toBe(24);
    expect(designTokens.radius.modal).toBe(28);
    expect(designTokens.radius.chip).toBe(24);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/styles/designTokens.test.ts`
Expected: FAIL — modules not found

- [ ] **Step 3: Create glassTokens.ts**

```typescript
// styles/glassTokens.ts

export const glassTokens = {
  dark: {
    background: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
  },
  light: {
    background: 'rgba(255,255,255,0.6)',
    border: 'rgba(0,0,0,0.08)',
    borderWidth: 1,
  },
  moodColors: {
    party:       { primary: '#EF4444', glow: 'rgba(239,68,68,0.2)',   bg: 'rgba(239,68,68,0.25)' },
    chill:       { primary: '#3B82F6', glow: 'rgba(59,130,246,0.2)',  bg: 'rgba(59,130,246,0.25)' },
    girls_night: { primary: '#EC4899', glow: 'rgba(236,72,153,0.2)', bg: 'rgba(236,72,153,0.25)' },
    date_night:  { primary: '#FB923C', glow: 'rgba(251,146,60,0.2)', bg: 'rgba(251,146,60,0.25)' },
    muzika:      { primary: '#A855F7', glow: 'rgba(168,85,247,0.2)', bg: 'rgba(168,85,247,0.25)' },
    romantika:   { primary: '#BE123C', glow: 'rgba(190,18,60,0.2)',  bg: 'rgba(190,18,60,0.25)' },
    kultura:     { primary: '#6366F1', glow: 'rgba(99,102,241,0.2)', bg: 'rgba(99,102,241,0.25)' },
    foodie:      { primary: '#EAB308', glow: 'rgba(234,179,8,0.2)',  bg: 'rgba(234,179,8,0.25)' },
    brunch:      { primary: '#FBD0E8', glow: 'rgba(251,207,232,0.2)', bg: 'rgba(251,207,232,0.2)' },
    after_work:  { primary: '#D97706', glow: 'rgba(217,119,6,0.2)',  bg: 'rgba(217,119,6,0.25)' },
    outdoor:     { primary: '#22C55E', glow: 'rgba(34,197,94,0.2)',  bg: 'rgba(34,197,94,0.25)' },
    turista:     { primary: '#0EA5E9', glow: 'rgba(14,165,233,0.2)', bg: 'rgba(14,165,233,0.25)' },
  },
  shadow: {
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 5,
    },
  },
} as const;

export type MoodId = keyof typeof glassTokens.moodColors;
```

- [ ] **Step 4: Create designTokens.ts**

```typescript
// styles/designTokens.ts

export const designTokens = {
  radius: {
    card: 24,
    modal: 28,
    chip: 24,
    input: 16,
    imageFrame: 20,
  },
  typography: {
    heroTitle:     { fontSize: 32, fontWeight: '700' as const, fontFamily: 'DMSans_700Bold' },
    sectionHeader: { fontSize: 24, fontWeight: '700' as const, fontFamily: 'DMSans_700Bold' },
    cardTitle:     { fontSize: 18, fontWeight: '700' as const, fontFamily: 'DMSans_700Bold' },
    body:          { fontSize: 15, fontWeight: '400' as const, fontFamily: 'DMSans_400Regular' },
    caption:       { fontSize: 12, fontWeight: '500' as const, fontFamily: 'DMSans_500Medium' },
  },
  spacing: {
    screenPadding: 16,
    cardGap: 12,
    sectionGap: 24,
  },
} as const;
```

- [ ] **Step 5: Run tests, verify pass**

Run: `npx vitest run tests/styles/designTokens.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add styles/glassTokens.ts styles/designTokens.ts tests/styles/designTokens.test.ts
git commit -m "feat: add glass and design token systems for presentation restyle"
```

---

### Task 2: GlassContainer Component

**Files:**
- Create: `components/glass/GlassContainer.tsx`
- Test: `tests/glass/GlassContainer.test.ts`

- [ ] **Step 1: Write test**

```typescript
// tests/glass/GlassContainer.test.ts
import { describe, it, expect } from 'vitest';
// Structural test — verify the component exports and accepts required props
import { GlassContainer } from '@/components/glass/GlassContainer';

describe('GlassContainer', () => {
  it('is exported as a function component', () => {
    expect(typeof GlassContainer).toBe('function');
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement GlassContainer**

```typescript
// components/glass/GlassContainer.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { glassTokens } from '@/styles/glassTokens';

interface GlassContainerProps {
  children: ReactNode;
  glowColor?: string;
  style?: any;
  borderRadius?: number;
}

export function GlassContainer({
  children,
  glowColor,
  style,
  borderRadius = 24,
}: GlassContainerProps) {
  const { isDark } = useTheme();
  const tokens = isDark ? glassTokens.dark : glassTokens.light;

  const glowShadow = glowColor
    ? { shadowColor: glowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 5 }
    : glassTokens.shadow.default;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.background,
          borderColor: glowColor ? glowColor + '4D' : tokens.border, // 30% opacity
          borderRadius,
          ...glowShadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
```

> **Note:** We skip `expo-blur` BlurView in the initial implementation. The glass `background: rgba(...)` gives 90% of the effect. BlurView can be added as a polish step in Wave 6 for iOS only — it causes performance issues on Android and doesn't work on web.

- [ ] **Step 4: Run test, verify pass**
- [ ] **Step 5: Commit**

```bash
git add components/glass/GlassContainer.tsx tests/glass/GlassContainer.test.ts
git commit -m "feat: add GlassContainer reusable component"
```

---

### Task 3: GlassMoodChip Component

**Files:**
- Create: `components/glass/GlassMoodChip.tsx`
- Modify: `components/MoodChip.tsx` (add deprecation re-export)
- Test: `tests/glass/GlassMoodChip.test.ts`

- [ ] **Step 1: Write test**

```typescript
// tests/glass/GlassMoodChip.test.ts
import { describe, it, expect } from 'vitest';
import { GlassMoodChip } from '@/components/glass/GlassMoodChip';

describe('GlassMoodChip', () => {
  it('is exported as a function component', () => {
    expect(typeof GlassMoodChip).toBe('function');
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement GlassMoodChip**

This replaces the emoji-based MoodChip with an icon-based glass chip. Initially uses the mood's color circle as icon placeholder until Gemini-generated icons are ready.

```typescript
// components/glass/GlassMoodChip.tsx
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { glassTokens } from '@/styles/glassTokens';
import type { MoodId } from '@/styles/glassTokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GlassMoodChipProps {
  moodId: MoodId;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  iconSource?: any; // Image source — will be Gemini-generated icon
}

export function GlassMoodChip({
  moodId,
  label,
  isSelected,
  onPress,
  iconSource,
}: GlassMoodChipProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const mood = glassTokens.moodColors[moodId];

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const chipBg = isSelected
    ? mood?.primary ?? colors.accent
    : isDark
    ? mood?.bg ?? 'rgba(255,255,255,0.08)'
    : (mood?.bg ?? 'rgba(0,0,0,0.05)').replace('0.25', '0.12');

  const glowShadow = isSelected && mood
    ? { shadowColor: mood.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
    : {};

  const borderColor = isSelected
    ? mood?.primary ?? colors.accent
    : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';

  const textColor = isSelected ? '#FFFFFF' : colors.text;

  const chipStyle = [
    styles.chip,
    { backgroundColor: chipBg, borderColor, ...glowShadow },
  ];

  const content = (
    <>
      {iconSource ? (
        <Image source={iconSource} style={styles.icon} />
      ) : (
        <View style={[styles.iconPlaceholder, { backgroundColor: mood?.primary ?? colors.accent }]} />
      )}
      <Text
        style={[
          styles.label,
          { color: textColor, fontFamily: isSelected ? 'DMSans_700Bold' : 'DMSans_500Medium' },
        ]}
      >
        {label}
      </Text>
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity onPress={onPress} style={chipStyle} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, chipStyle]}
      activeOpacity={0.8}
    >
      {content}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: 8,
    marginBottom: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 6,
    borderRadius: 10,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
  },
});
```

- [ ] **Step 4: Run test, verify pass**
- [ ] **Step 5: Commit**

```bash
git add components/glass/GlassMoodChip.tsx tests/glass/GlassMoodChip.test.ts
git commit -m "feat: add GlassMoodChip with glass/glow treatment replacing emoji"
```

---

### Task 4: FlippableCard Component

**Files:**
- Create: `components/cards/FlippableCard.tsx`
- Test: `tests/cards/FlippableCard.test.ts`

- [ ] **Step 1: Write test**

```typescript
// tests/cards/FlippableCard.test.ts
import { describe, it, expect } from 'vitest';
import { FlippableCard } from '@/components/cards/FlippableCard';

describe('FlippableCard', () => {
  it('is exported as a function component', () => {
    expect(typeof FlippableCard).toBe('function');
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement FlippableCard**

```typescript
// components/cards/FlippableCard.tsx
import React, { useCallback } from 'react';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { designTokens } from '@/styles/designTokens';

interface FlippableCardProps {
  front: ReactNode;
  back: ReactNode;
  onPress?: () => void; // Main tap → navigate to detail
  width?: number;
  height?: number;
  style?: any;
}

export function FlippableCard({
  front,
  back,
  onPress,
  width,
  height = 280,
  style,
}: FlippableCardProps) {
  const flipProgress = useSharedValue(0);
  const isFlipped = useSharedValue(false);

  const handleFlip = useCallback(() => {
    isFlipped.value = !isFlipped.value;
    flipProgress.value = withSpring(isFlipped.value ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      zIndex: flipProgress.value < 0.5 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      zIndex: flipProgress.value >= 0.5 ? 1 : 0,
    };
  });

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Animated.View style={[styles.face, frontAnimatedStyle]}>
        <Pressable onPress={onPress} onLongPress={handleFlip} style={styles.pressable}>
          {front}
          <Pressable onPress={handleFlip} style={styles.flipButton} hitSlop={8}>
            <View style={styles.flipIcon}>
              <Animated.Text style={styles.flipIconText}>ℹ</Animated.Text>
            </View>
          </Pressable>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.face, styles.backFace, backAnimatedStyle]}>
        <Pressable onPress={handleFlip} style={styles.pressable}>
          {back}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: designTokens.radius.card,
    overflow: 'hidden',
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: designTokens.radius.card,
    overflow: 'hidden',
  },
  backFace: {
    // Back face starts rotated — the animated style handles the rest
  },
  pressable: {
    flex: 1,
  },
  flipButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  flipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipIconText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
```

- [ ] **Step 4: Run test, verify pass**
- [ ] **Step 5: Commit**

```bash
git add components/cards/FlippableCard.tsx tests/cards/FlippableCard.test.ts
git commit -m "feat: add FlippableCard with reanimated v3 3D flip"
```

---

### Task 5: VenueCardFront and VenueCardBack

**Files:**
- Create: `components/cards/VenueCardFront.tsx`
- Create: `components/cards/VenueCardBack.tsx`

- [ ] **Step 1: Write VenueCardFront**

```typescript
// components/cards/VenueCardFront.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { designTokens } from '@/styles/designTokens';

interface VenueCardFrontProps {
  name: string;
  imageUrl?: string;
  category?: string;
  isOpen?: boolean;
  moodIds?: string[];
  isHiddenGem?: boolean;
}

export function VenueCardFront({
  name,
  imageUrl,
  category,
  isOpen,
  moodIds = [],
  isHiddenGem,
}: VenueCardFrontProps) {
  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      >
        <Text style={styles.title} numberOfLines={2}>{name}</Text>
      </LinearGradient>
      {category && (
        <View style={styles.categoryPill}>
          <GlassBadge label={category} />
        </View>
      )}
      {isOpen !== undefined && (
        <View style={styles.statusBadge}>
          <GlassBadge
            label={isOpen ? 'Open' : 'Closed'}
            variant={isOpen ? 'success' : 'muted'}
          />
        </View>
      )}
      {isHiddenGem && (
        <View style={styles.gemBadge}>
          <GlassBadge label="Hidden Gem" variant="accent" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { ...StyleSheet.absoluteFillObject, borderRadius: designTokens.radius.card },
  placeholder: { backgroundColor: '#2A2A3E' },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
    borderRadius: designTokens.radius.card,
  },
  title: {
    ...designTokens.typography.cardTitle,
    color: '#FFF',
  },
  categoryPill: { position: 'absolute', top: 12, left: 12 },
  statusBadge: { position: 'absolute', top: 12, right: 12 },
  gemBadge: { position: 'absolute', top: 44, right: 12 },
});
```

- [ ] **Step 2: Write VenueCardBack**

```typescript
// components/cards/VenueCardBack.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { designTokens } from '@/styles/designTokens';
import { IconSymbol } from '@/components/IconSymbol';

interface VenueCardBackProps {
  name: string;
  address?: string;
  hours?: string;
  priceLevel?: number;
  distance?: string;
  description?: string;
  onNavigate?: () => void;
  onCall?: () => void;
  onSave?: () => void;
}

export function VenueCardBack({
  name,
  address,
  hours,
  priceLevel,
  distance,
  description,
  onNavigate,
  onCall,
  onSave,
}: VenueCardBackProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{name}</Text>
      {address && <Text style={[styles.detail, { color: colors.textSecondary }]}>{address}</Text>}
      {hours && <Text style={[styles.detail, { color: colors.textSecondary }]}>{hours}</Text>}
      {priceLevel && (
        <Text style={[styles.detail, { color: colors.accent }]}>
          {'$'.repeat(priceLevel)}{'$'.repeat(4 - priceLevel).split('').map(() => '').join('')}
        </Text>
      )}
      {distance && <Text style={[styles.detail, { color: colors.textSecondary }]}>{distance}</Text>}
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
          {description}
        </Text>
      )}
      <View style={styles.actions}>
        {onNavigate && (
          <TouchableOpacity onPress={onNavigate} style={[styles.actionBtn, { borderColor: colors.border }]}>
            <IconSymbol name="navigation" size={16} color={colors.text} />
          </TouchableOpacity>
        )}
        {onCall && (
          <TouchableOpacity onPress={onCall} style={[styles.actionBtn, { borderColor: colors.border }]}>
            <IconSymbol name="phone" size={16} color={colors.text} />
          </TouchableOpacity>
        )}
        {onSave && (
          <TouchableOpacity onPress={onSave} style={[styles.actionBtn, { borderColor: colors.border }]}>
            <IconSymbol name="favorite" size={16} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: designTokens.radius.card,
    justifyContent: 'space-between',
  },
  title: { ...designTokens.typography.cardTitle, marginBottom: 8 },
  detail: { fontSize: 13, marginBottom: 4, fontFamily: 'DMSans_400Regular' },
  description: { fontSize: 13, lineHeight: 18, marginTop: 8, fontFamily: 'DMSans_400Regular' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add components/cards/VenueCardFront.tsx components/cards/VenueCardBack.tsx
git commit -m "feat: add VenueCardFront and VenueCardBack for flippable cards"
```

---

### Task 6: GlassBadge Component

**Files:**
- Create: `components/glass/GlassBadge.tsx`

- [ ] **Step 1: Implement GlassBadge**

```typescript
// components/glass/GlassBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted';

interface GlassBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'rgba(255,255,255,0.15)', text: '#FAFAF8' },
  success: { bg: 'rgba(34,197,94,0.2)', text: '#22C55E' },
  warning: { bg: 'rgba(234,179,8,0.2)', text: '#EAB308' },
  danger:  { bg: 'rgba(239,68,68,0.2)', text: '#EF4444' },
  accent:  { bg: 'rgba(212,160,86,0.3)', text: '#D4A056' },
  muted:   { bg: 'rgba(113,113,122,0.2)', text: '#71717A' },
};

export function GlassBadge({ label, variant = 'default', size = 'sm' }: GlassBadgeProps) {
  const { isDark } = useTheme();
  const colors = VARIANT_COLORS[variant];

  return (
    <View style={[
      styles.badge,
      size === 'md' && styles.badgeMd,
      { backgroundColor: colors.bg, borderColor: colors.text + '33' },
    ]}>
      <Text style={[
        styles.label,
        size === 'md' && styles.labelMd,
        { color: colors.text },
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelMd: {
    fontSize: 13,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/glass/GlassBadge.tsx
git commit -m "feat: add GlassBadge component for glass-styled status badges"
```

---

### Task 7: Edge Function Shared Utilities

**Files:**
- Create: `supabase/functions/_shared/cors.ts`
- Create: `supabase/functions/_shared/ai-clients.ts`
- Create: `supabase/functions/_shared/supabase-admin.ts`
- Modify: `supabase/config.toml`

- [ ] **Step 1: Create CORS helper**

```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function corsResponse() {
  return new Response('ok', { headers: corsHeaders });
}
```

- [ ] **Step 2: Create AI client factories**

```typescript
// supabase/functions/_shared/ai-clients.ts

// OpenAI — GPT-4.1 mini/nano
export async function callOpenAI(params: {
  model: 'gpt-4.1-mini' | 'gpt-4.1-nano';
  messages: Array<{ role: string; content: string }>;
  response_format?: { type: string };
  max_tokens?: number;
}) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  // Always use internal 20s timeout — never bypass the safety net
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        max_tokens: params.max_tokens ?? 1024,
        ...(params.response_format && { response_format: params.response_format }),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI ${res.status}: ${err}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Gemini — Flash / Flash-Lite
export async function callGemini(params: {
  model: 'gemini-2.5-flash-lite' | 'gemini-2.5-flash';
  contents: Array<{ role: string; parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> }>;
  maxOutputTokens?: number;
}) {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not set');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: params.contents,
        generationConfig: { maxOutputTokens: params.maxOutputTokens ?? 1024 },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Anthropic — Claude Haiku 4.5
export async function callClaude(params: {
  model: 'claude-haiku-4-5-20251001';
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  system?: string;
}) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        max_tokens: params.max_tokens ?? 1024,
        messages: params.messages,
        ...(params.system && { system: params.system }),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude ${res.status}: ${err}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

- [ ] **Step 3: Create Supabase admin client**

```typescript
// supabase/functions/_shared/supabase-admin.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

export function getSupabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key);
}
```

- [ ] **Step 4: Update supabase/config.toml**

```toml
# supabase/config.toml
project_id = "kyfoqltmkqwtnrdlacqv"

[functions.generate-pulse]
verify_jwt = false

[functions.generate-plan]
verify_jwt = false

[functions.smart-search]
verify_jwt = false

[functions.surprise-me]
verify_jwt = false

[functions.translate-scene]
verify_jwt = false

[functions.enrich-descriptions]
verify_jwt = false

[functions.parse-instagram]
verify_jwt = false

[functions.analyze-venue-photo]
verify_jwt = false
```

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/ supabase/config.toml
git commit -m "feat: add edge function shared utilities (AI clients, CORS, admin)"
```

---

### Task 8: Client-Side Edge Function Helper

**Files:**
- Create: `utils/ai/edgeFunctionClient.ts`
- Modify: `integrations/supabase/client.ts` — add session getter export
- Test: `tests/ai/edgeFunctionClient.test.ts`

- [ ] **Step 1: Write test**

```typescript
// tests/ai/edgeFunctionClient.test.ts
import { describe, it, expect } from 'vitest';
import { invokeEdgeFunction, streamEdgeFunction } from '@/utils/ai/edgeFunctionClient';

describe('edgeFunctionClient', () => {
  it('exports invokeEdgeFunction', () => {
    expect(typeof invokeEdgeFunction).toBe('function');
  });
  it('exports streamEdgeFunction', () => {
    expect(typeof streamEdgeFunction).toBe('function');
  });
});
```

- [ ] **Step 2: Run test, verify fail**

- [ ] **Step 3: Implement edge function client**

```typescript
// utils/ai/edgeFunctionClient.ts
import { supabase } from '@/integrations/supabase/client';
import { publicConfig } from '@/utils/publicConfig';

/**
 * Standard invoke — uses supabase.functions.invoke.
 * For non-streaming edge functions.
 */
export async function invokeEdgeFunction<T = any>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, { body });
    if (error) {
      return { data: null, error: error.message ?? 'Edge function error' };
    }
    // Edge functions always return { success, data?, error? } per our convention
    if (data && !data.success) {
      return { data: null, error: data.error ?? 'Unknown error' };
    }
    return { data: data?.data ?? data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? 'Network error' };
  }
}

/**
 * Streaming invoke — uses direct fetch for SSE.
 * Required because supabase.functions.invoke doesn't support ReadableStream.
 * Used by the Tonight Planner.
 */
export async function streamEdgeFunction(
  functionName: string,
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
): Promise<{ error: string | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const url = `${publicConfig.supabaseUrl}/functions/v1/${functionName}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        apikey: publicConfig.supabaseAnonKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { error: `${res.status}: ${errText}` };
    }

    const reader = res.body?.getReader();
    if (!reader) return { error: 'No response body' };

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      onChunk(text);
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message ?? 'Stream error' };
  }
}
```

- [ ] **Step 4: Run test, verify pass**
- [ ] **Step 5: Commit**

```bash
git add utils/ai/edgeFunctionClient.ts tests/ai/edgeFunctionClient.test.ts
git commit -m "feat: add edge function client with standard and SSE streaming modes"
```

---

### Chunk 1 Checkpoint

- [ ] **Run `/simplify` on all Chunk 1 code**

Run: Review all files in `components/glass/`, `components/cards/`, `styles/`, `utils/ai/`, `supabase/functions/_shared/` for reuse, quality, efficiency.

- [ ] **Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Update ledger**

Append to `docs/project_ledger.md`:
```
### 2026-03-17 — Wave Foundation (Chunk 1)
- Created glass design token system (glassTokens.ts, designTokens.ts)
- Built shared components: GlassContainer, GlassMoodChip, GlassBadge, FlippableCard
- Built VenueCardFront/Back for editorial flippable cards
- Created edge function shared utilities (AI clients for OpenAI/Gemini/Claude, CORS, admin)
- Created client-side edge function helper (standard + SSE streaming)
- All components use react-native-reanimated v3, follow glass design language
- Decision: Skip expo-blur initially (polish in Wave 6), use rgba backgrounds
```

- [ ] **Update napkin if patterns emerged**

---

## Chunk 2: Wave 0 — Data Pipeline + Edge Functions

This chunk creates the edge functions for AI features and the backend scripts for data population. Runs in parallel with frontend work.

### Task 9: generate-pulse Edge Function

**Files:**
- Create: `supabase/functions/generate-pulse/index.ts`
- Create: `utils/ai/cityPulse.ts`
- Test: `tests/ai/cityPulse.test.ts`

- [ ] **Step 1: Write test for cityPulse client helper**

```typescript
// tests/ai/cityPulse.test.ts
import { describe, it, expect } from 'vitest';
import { fetchCityPulse } from '@/utils/ai/cityPulse';

describe('fetchCityPulse', () => {
  it('is exported as a function', () => {
    expect(typeof fetchCityPulse).toBe('function');
  });
});
```

- [ ] **Step 2: Implement the edge function**

```typescript
// supabase/functions/generate-pulse/index.ts
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callGemini } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const supabase = getSupabaseAdmin();

    // Check cache first (3-hour TTL)
    const { data: cached } = await supabase
      .from('city_pulse')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      if (age < 3 * 60 * 60 * 1000) {
        return new Response(
          JSON.stringify({ success: true, data: cached }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
        );
      }
    }

    // Fetch live data for context
    const { data: todayEvents } = await supabase
      .from('events')
      .select('title, venue_name, start_time, category')
      .gte('start_time', new Date().toISOString())
      .lte('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    const { data: openVenues } = await supabase
      .from('venues')
      .select('name, category, neighborhood')
      .limit(15);

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    const prompt = `You are the pulse of Sarajevo. Write 2-3 short, punchy sentences about what's happening in the city right now.

Time: ${timeOfDay} (${hour}:00)
Today's events: ${JSON.stringify(todayEvents ?? [])}
Popular venues: ${JSON.stringify(openVenues ?? [])}

Rules:
- Write in the present tense, like a friend texting
- Mention 1-2 specific venues or events by name
- Match the energy to the time of day
- Include a recommendation
- Max 200 characters per language
- Return JSON: { "pulse_bs": "...", "pulse_en": "..." }`;

    const result = await callGemini({
      model: 'gemini-2.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      maxOutputTokens: 512,
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    let parsed: { pulse_bs: string; pulse_en: string };
    try {
      // Strip markdown fences if present
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { pulse_bs: text.slice(0, 200), pulse_en: text.slice(0, 200) };
    }

    // Cache the result
    await supabase.from('city_pulse').insert({
      pulse_bs: parsed.pulse_bs,
      pulse_en: parsed.pulse_en,
      time_of_day: timeOfDay,
    });

    return new Response(
      JSON.stringify({ success: true, data: { ...parsed, time_of_day: timeOfDay } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  }
});
```

- [ ] **Step 3: Implement client helper**

```typescript
// utils/ai/cityPulse.ts
import { invokeEdgeFunction } from './edgeFunctionClient';

interface CityPulse {
  pulse_bs: string;
  pulse_en: string;
  time_of_day: string;
}

let cachedPulse: { data: CityPulse; fetchedAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

export async function fetchCityPulse(): Promise<CityPulse | null> {
  // Client-side cache
  if (cachedPulse && Date.now() - cachedPulse.fetchedAt < CACHE_TTL) {
    return cachedPulse.data;
  }

  const { data, error } = await invokeEdgeFunction<CityPulse>('generate-pulse', {});
  if (error || !data) return null;

  cachedPulse = { data, fetchedAt: Date.now() };
  return data;
}
```

- [ ] **Step 4: Run test, verify pass**
- [ ] **Step 5: Commit**

```bash
git add supabase/functions/generate-pulse/ utils/ai/cityPulse.ts tests/ai/cityPulse.test.ts
git commit -m "feat: add generate-pulse edge function + client helper"
```

---

### Task 10: smart-search Edge Function

**Files:**
- Create: `supabase/functions/smart-search/index.ts`
- Create: `utils/ai/smartSearch.ts`
- Test: `tests/ai/smartSearch.test.ts`

- [ ] **Step 1: Write test**

```typescript
// tests/ai/smartSearch.test.ts
import { describe, it, expect } from 'vitest';
import { smartSearch } from '@/utils/ai/smartSearch';

describe('smartSearch', () => {
  it('is exported as a function', () => {
    expect(typeof smartSearch).toBe('function');
  });
});
```

- [ ] **Step 2: Implement edge function**

```typescript
// supabase/functions/smart-search/index.ts
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callOpenAI } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { query, language = 'en' } = await req.json();
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing query' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    const supabase = getSupabaseAdmin();

    // Get categories and neighborhoods for context
    const { data: venues } = await supabase
      .from('venues')
      .select('name, category, neighborhood')
      .limit(50);

    const categories = [...new Set(venues?.map(v => v.category) ?? [])];
    const neighborhoods = [...new Set(venues?.map(v => v.neighborhood).filter(Boolean) ?? [])];

    const systemPrompt = `You are Hype's search assistant for Sarajevo. Given a user query, determine if it's a simple search or a conversational question.

Available categories: ${categories.join(', ')}
Available neighborhoods: ${neighborhoods.join(', ')}

Return JSON only:
{
  "mode": "search" | "conversation",
  "filters": {
    "category": "optional category match",
    "neighborhood": "optional neighborhood match",
    "query": "cleaned search text",
    "mood": "optional mood id",
    "priceLevel": null or 1-4,
    "isOpen": true or null
  },
  "response": "Only if mode=conversation: a friendly 1-2 sentence recommendation in ${language === 'bs' ? 'Bosnian' : 'English'}",
  "venueNames": ["If mode=conversation, list up to 5 venue names you'd recommend"]
}`;

    const result = await callOpenAI({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 512,
    });

    const text = result.choices?.[0]?.message?.content ?? '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { mode: 'search', filters: { query }, response: null, venueNames: [] };
    }

    // If conversation mode, fetch the mentioned venues
    let matchedVenues = null;
    if (parsed.mode === 'conversation' && parsed.venueNames?.length) {
      const { data } = await supabase
        .from('venues')
        .select('*')
        .in('name', parsed.venueNames)
        .limit(5);
      matchedVenues = data;
    }

    return new Response(
      JSON.stringify({ success: true, data: { ...parsed, matchedVenues } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  }
});
```

- [ ] **Step 3: Implement client helper**

```typescript
// utils/ai/smartSearch.ts
import { invokeEdgeFunction } from './edgeFunctionClient';

export interface SmartSearchResult {
  mode: 'search' | 'conversation';
  filters: {
    category?: string;
    neighborhood?: string;
    query: string;
    mood?: string;
    priceLevel?: number | null;
    isOpen?: boolean | null;
  };
  response?: string;
  venueNames?: string[];
  matchedVenues?: any[];
}

export async function smartSearch(
  query: string,
  language: string = 'en',
): Promise<SmartSearchResult | null> {
  const { data, error } = await invokeEdgeFunction<SmartSearchResult>('smart-search', {
    query,
    language,
  });
  if (error || !data) return null;
  return data;
}
```

- [ ] **Step 4: Run test, verify pass**
- [ ] **Step 5: Commit**

```bash
git add supabase/functions/smart-search/ utils/ai/smartSearch.ts tests/ai/smartSearch.test.ts
git commit -m "feat: add smart-search edge function (GPT-4.1 nano, single-call)"
```

---

### Task 11: surprise-me Edge Function

**Files:**
- Create: `supabase/functions/surprise-me/index.ts`
- Create: `utils/ai/surpriseMe.ts`

- [ ] **Step 1: Implement edge function**

```typescript
// supabase/functions/surprise-me/index.ts
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callOpenAI } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { moods = [], language = 'en' } = await req.json();
    const supabase = getSupabaseAdmin();

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    // Fetch open venues
    const { data: venues } = await supabase
      .from('venues')
      .select('name, category, neighborhood, description_en, description_bs, cover_image_url')
      .limit(30);

    const prompt = `You are Hype's spontaneous adventure generator for Sarajevo.

Time of day: ${timeOfDay}
User moods: ${moods.join(', ') || 'any'}
Available venues: ${JSON.stringify(venues?.slice(0, 20) ?? [])}

Generate a 2-3 stop micro-plan. Return JSON only:
{
  "stops": [
    {
      "venue_name": "exact venue name from list",
      "time": "suggested time like 19:30",
      "pitch_${language}": "One exciting sentence about why"
    }
  ],
  "tagline_${language}": "A punchy one-liner for the whole plan"
}`;

    const result = await callOpenAI({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You generate spontaneous micro-plans for Sarajevo exploration. Return valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 512,
    });

    const text = result.choices?.[0]?.message?.content ?? '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { stops: [], tagline_en: 'Explore Sarajevo!', tagline_bs: 'Istraži Sarajevo!' };
    }

    // Enrich stops with venue data
    const venueMap = new Map((venues ?? []).map(v => [v.name, v]));
    const enrichedStops = (parsed.stops ?? []).map((stop: any) => ({
      ...stop,
      venue: venueMap.get(stop.venue_name) ?? null,
    }));

    return new Response(
      JSON.stringify({ success: true, data: { ...parsed, stops: enrichedStops } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  }
});
```

- [ ] **Step 2: Implement client helper**

```typescript
// utils/ai/surpriseMe.ts
import { invokeEdgeFunction } from './edgeFunctionClient';

export interface SurprisePlan {
  stops: Array<{
    venue_name: string;
    time: string;
    pitch_en?: string;
    pitch_bs?: string;
    venue?: any;
  }>;
  tagline_en?: string;
  tagline_bs?: string;
}

export async function fetchSurprise(
  moods: string[] = [],
  language: string = 'en',
): Promise<SurprisePlan | null> {
  const { data, error } = await invokeEdgeFunction<SurprisePlan>('surprise-me', {
    moods,
    language,
  });
  if (error || !data) return null;
  return data;
}
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/surprise-me/ utils/ai/surpriseMe.ts
git commit -m "feat: add surprise-me edge function (GPT-4.1 mini micro-plans)"
```

---

### Task 12: generate-plan Edge Function (SSE Streaming)

**Files:**
- Create: `supabase/functions/generate-plan/index.ts`
- Create: `utils/ai/planGenerator.ts`
- Test: `tests/ai/planGenerator.test.ts`

- [ ] **Step 1: Write test**

```typescript
// tests/ai/planGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { generatePlan } from '@/utils/ai/planGenerator';

describe('generatePlan', () => {
  it('is exported as a function', () => {
    expect(typeof generatePlan).toBe('function');
  });
});
```

- [ ] **Step 2: Implement edge function with SSE streaming**

```typescript
// supabase/functions/generate-plan/index.ts
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { moods = [], groupSize = 2, budget = 'mid', language = 'en' } = await req.json();
    const supabase = getSupabaseAdmin();

    const hour = new Date().getHours();
    const startTime = hour < 18 ? '18:00' : `${hour}:00`;

    // Fetch matching venues
    const { data: venues } = await supabase
      .from('venues')
      .select('name, category, neighborhood, description_en, description_bs, price_level, cover_image_url')
      .limit(40);

    // Fetch tonight's events
    const { data: events } = await supabase
      .from('events')
      .select('title, venue_name, start_time, category, price')
      .gte('start_time', new Date().toISOString())
      .lte('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .limit(15);

    const budgetMap = { casual: 'under 20 KM per stop', mid: '20-50 KM per stop', premium: '50+ KM per stop' };

    const prompt = `You are Hype's evening planner for Sarajevo. Create a structured 3-5 stop evening itinerary.

Group: ${groupSize} people
Moods: ${moods.join(', ') || 'any'}
Budget: ${budgetMap[budget as keyof typeof budgetMap] ?? budgetMap.mid}
Start time: ${startTime}
Language: ${language === 'bs' ? 'Bosnian' : 'English'}

Available venues: ${JSON.stringify(venues?.slice(0, 25) ?? [])}
Tonight's events: ${JSON.stringify(events ?? [])}

Return valid JSON:
{
  "stops": [
    {
      "time": "19:00",
      "venue_name": "exact name from list",
      "activity_${language}": "What to do here",
      "pitch_${language}": "Why this stop is perfect — one exciting sentence",
      "walk_minutes": 5,
      "estimated_cost": 25
    }
  ],
  "total_cost": 75,
  "tagline_${language}": "A punchy headline for this plan"
}`;

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    // Use streaming for better UX
    // 20s timeout wraps the ENTIRE stream, not just initial fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'You are a Sarajevo evening planner. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1024,
        stream: true,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    // NOTE: Do NOT clear timeout here — it must cover the entire stream duration.
    // The controller.abort() will close the stream if it takes > 20s total.

    if (!openaiRes.ok) {
      clearTimeout(timeoutId);
      const err = await openaiRes.text();
      throw new Error(`OpenAI ${openaiRes.status}: ${err}`);
    }

    // Stream the response through as SSE
    const stream = new ReadableStream({
      async start(streamController) {
        const reader = openaiRes.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            streamController.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (err) {
          // Stream ended
        } finally {
          streamController.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  }
});
```

- [ ] **Step 3: Implement client helper with SSE parsing**

```typescript
// utils/ai/planGenerator.ts
import { streamEdgeFunction, invokeEdgeFunction } from './edgeFunctionClient';

export interface PlanStop {
  time: string;
  venue_name: string;
  activity_en?: string;
  activity_bs?: string;
  pitch_en?: string;
  pitch_bs?: string;
  walk_minutes?: number;
  estimated_cost?: number;
  venue?: any; // Enriched venue data
}

export interface EveningPlan {
  stops: PlanStop[];
  total_cost: number;
  tagline_en?: string;
  tagline_bs?: string;
}

/**
 * Generate an evening plan with SSE streaming.
 * Calls onProgress with accumulated JSON text as it streams.
 * Returns the final parsed plan.
 */
export async function generatePlan(
  params: {
    moods: string[];
    groupSize: number;
    budget: 'casual' | 'mid' | 'premium';
    language: string;
  },
  onProgress?: (text: string) => void,
): Promise<EveningPlan | null> {
  let accumulated = '';

  const { error } = await streamEdgeFunction(
    'generate-plan',
    params,
    (chunk) => {
      // Parse SSE chunks from OpenAI
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              onProgress?.(accumulated);
            }
          } catch {
            // Non-JSON line, skip
          }
        }
      }
    },
  );

  if (error) {
    console.warn('Plan generation stream error:', error);
    return null;
  }

  try {
    const clean = accumulated.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    console.warn('Failed to parse plan JSON:', accumulated.slice(0, 100));
    return null;
  }
}
```

- [ ] **Step 4: Run test, verify pass**
- [ ] **Step 5: Commit**

```bash
git add supabase/functions/generate-plan/ utils/ai/planGenerator.ts tests/ai/planGenerator.test.ts
git commit -m "feat: add generate-plan edge function with SSE streaming"
```

---

### Task 13: translate-scene Edge Function

**Files:**
- Create: `supabase/functions/translate-scene/index.ts`
- Create: `utils/ai/translate.ts`

- [ ] **Step 1: Implement edge function**

```typescript
// supabase/functions/translate-scene/index.ts
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callGemini } from '../_shared/ai-clients.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { image_base64, mime_type = 'image/jpeg' } = await req.json();
    if (!image_base64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing image_base64' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    const result = await callGemini({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          {
            inline_data: { mime_type, data: image_base64 },
          },
          {
            text: `Look at this image and find any Bosnian/Croatian/Serbian text visible.

Return JSON:
{
  "original_text": "the text you see in the original language",
  "translation": "English translation",
  "context": "1-2 sentences of cultural context explaining what this means, local customs, etc.",
  "confidence": "high" | "medium" | "low"
}

If no text is visible, return: { "original_text": "", "translation": "", "context": "No text detected in image", "confidence": "low" }`,
          },
        ],
      }],
      maxOutputTokens: 512,
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    let parsed;
    try {
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { original_text: '', translation: text, context: '', confidence: 'low' };
    }

    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  }
});
```

- [ ] **Step 2: Implement client helper**

```typescript
// utils/ai/translate.ts
import { invokeEdgeFunction } from './edgeFunctionClient';

export interface TranslationResult {
  original_text: string;
  translation: string;
  context: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function translateScene(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<TranslationResult | null> {
  const { data, error } = await invokeEdgeFunction<TranslationResult>('translate-scene', {
    image_base64: imageBase64,
    mime_type: mimeType,
  });
  if (error || !data) return null;
  return data;
}
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/translate-scene/ utils/ai/translate.ts
git commit -m "feat: add translate-scene edge function (Gemini Flash vision OCR)"
```

---

### Task 14: enrich-descriptions Edge Function

**Files:**
- Create: `supabase/functions/enrich-descriptions/index.ts`

- [ ] **Step 1: Implement edge function**

```typescript
// supabase/functions/enrich-descriptions/index.ts
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callClaude } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { venue_id, batch_size = 5 } = await req.json();
    const supabase = getSupabaseAdmin();

    // Fetch venues needing enrichment
    let query = supabase
      .from('venues')
      .select('id, name, category, neighborhood, moods')
      .is('description_en', null)
      .limit(batch_size);

    if (venue_id) {
      query = supabase.from('venues').select('id, name, category, neighborhood, moods').eq('id', venue_id);
    }

    const { data: venues, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;
    if (!venues?.length) {
      return new Response(
        JSON.stringify({ success: true, data: { enriched: 0, message: 'No venues need enrichment' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    let enriched = 0;
    for (const venue of venues) {
      const prompt = `Write a 2-3 sentence description for this Sarajevo venue. Be engaging, warm, and specific.

Venue: ${venue.name}
Category: ${venue.category}
Neighborhood: ${venue.neighborhood ?? 'Sarajevo'}
Moods: ${venue.moods?.join(', ') ?? 'general'}

Return JSON: { "description_bs": "Bosnian description", "description_en": "English description" }`;

      try {
        const result = await callClaude({
          model: 'claude-haiku-4-5-20251001',
          messages: [{ role: 'user', content: prompt }],
          system: 'You write bilingual venue descriptions for a Sarajevo city guide app. Return valid JSON only.',
          max_tokens: 512,
        });

        const text = result.content?.[0]?.text ?? '';
        const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(clean);

        await supabase
          .from('venues')
          .update({
            description_bs: parsed.description_bs,
            description_en: parsed.description_en,
          })
          .eq('id', venue.id);

        enriched++;
      } catch (err) {
        console.error(`Failed to enrich ${venue.name}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: { enriched, total: venues.length } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/enrich-descriptions/
git commit -m "feat: add enrich-descriptions edge function (Claude Haiku bilingual)"
```

---

### Task 15: parse-instagram Edge Function

**Files:**
- Create: `supabase/functions/parse-instagram/index.ts`

- [ ] **Step 1: Implement edge function**

```typescript
// supabase/functions/parse-instagram/index.ts
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callClaude } from '../_shared/ai-clients.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { caption, account_name, post_url } = await req.json();
    if (!caption) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing caption' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    const result = await callClaude({
      model: 'claude-haiku-4-5-20251001',
      messages: [{
        role: 'user',
        content: `Analyze this Instagram post caption from a Sarajevo venue/event account.

Account: @${account_name ?? 'unknown'}
Caption: "${caption}"

Is this an event announcement? If yes, extract the details.

Return JSON:
{
  "is_event": true/false,
  "title": "event name" or null,
  "date": "YYYY-MM-DD" or null,
  "time": "HH:MM" or null,
  "venue_name": "venue name" or null,
  "price": "price string" or null,
  "description_bs": "brief description in Bosnian" or null,
  "description_en": "brief description in English" or null,
  "moods": ["relevant mood ids"] or [],
  "category": "event category" or null,
  "confidence": "high" | "medium" | "low"
}`,
      }],
      system: 'You extract structured event data from Instagram captions for a Sarajevo events platform. Return valid JSON only.',
      max_tokens: 512,
    });

    const text = result.content?.[0]?.text ?? '';
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      parsed = { is_event: false, confidence: 'low' };
    }

    // If it's an event, optionally insert into raw_events
    if (parsed.is_event && parsed.title) {
      const supabase = getSupabaseAdmin();
      await supabase.from('raw_events').insert({
        title: parsed.title,
        date: parsed.date,
        time: parsed.time,
        venue_name: parsed.venue_name,
        price: parsed.price,
        description_bs: parsed.description_bs,
        description_en: parsed.description_en,
        source: `instagram:@${account_name}`,
        source_url: post_url,
        status: 'pending',
      }).single();
    }

    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/parse-instagram/
git commit -m "feat: add parse-instagram edge function (Claude Haiku event extraction)"
```

---

### Task 16: Google Maps Photo Scrape Script

**Files:**
- Create: `backend/src/scripts/scrapeGooglePhotos.ts`

- [ ] **Step 1: Implement scrape script**

```typescript
// backend/src/scripts/scrapeGooglePhotos.ts
/**
 * Batch scrape venue photos from Google Maps Places API.
 * Run: npx tsx backend/src/scripts/scrapeGooglePhotos.ts
 *
 * Requires:
 * - GOOGLE_MAPS_API_KEY in backend/.env
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env
 */
import { fetchSupabaseAdminJson, requestSupabaseAdminJson } from '../lib/supabaseAdmin.js';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  console.error('Missing GOOGLE_MAPS_API_KEY in backend/.env');
  process.exit(1);
}

async function getPlacePhotos(placeId: string): Promise<string[]> {
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(detailsUrl);
  const data = await res.json();

  const photos = data.result?.photos ?? [];
  return photos.slice(0, 3).map((photo: any) =>
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
  );
}

async function main() {
  console.log('Fetching venues with google_place_id...');

  // Fetch venues that have a google_place_id but no cover photo
  const venues = await fetchSupabaseAdminJson(
    '/rest/v1/venues?select=id,name,google_place_id,cover_image_url&google_place_id=not.is.null&cover_image_url=is.null&limit=50'
  );

  console.log(`Found ${venues.length} venues to scrape`);

  let scraped = 0;
  for (const venue of venues) {
    try {
      const photoUrls = await getPlacePhotos(venue.google_place_id);
      if (photoUrls.length === 0) {
        console.log(`  ⏭ ${venue.name}: no photos available`);
        continue;
      }

      // Update the venue with the first photo as cover
      await requestSupabaseAdminJson(`/rest/v1/venues?id=eq.${venue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          cover_image_url: photoUrls[0],
          photos: photoUrls,
        }),
      });

      scraped++;
      console.log(`  ✓ ${venue.name}: ${photoUrls.length} photos`);
    } catch (err) {
      console.error(`  ✗ ${venue.name}: ${err}`);
    }
  }

  console.log(`\nDone. Scraped ${scraped}/${venues.length} venues.`);
}

main().catch(console.error);
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/scripts/scrapeGooglePhotos.ts
git commit -m "feat: add Google Maps photo scrape script for venues"
```

---

### Task 16b: Backend Scripts — Enrichment Runner and Instagram Seeder

**Files:**
- Create: `backend/src/scripts/enrichDescriptions.ts`
- Create: `backend/src/scripts/seedInstagram.ts`

- [ ] **Step 1: Create enrichment runner**

```typescript
// backend/src/scripts/enrichDescriptions.ts
/**
 * Batch run venue description enrichment via edge function.
 * Run: npx tsx backend/src/scripts/enrichDescriptions.ts
 */
import { requestSupabaseAdminJson } from '../lib/supabaseAdmin.js';

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  if (!SUPABASE_URL) { console.error('Missing SUPABASE_URL'); process.exit(1); }

  let total = 0;
  let batch = 1;

  while (true) {
    console.log(`Batch ${batch}...`);
    const res = await fetch(`${SUPABASE_URL}/functions/v1/enrich-descriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ batch_size: 5 }),
    });
    const data = await res.json();
    if (!data.success || data.data.enriched === 0) break;
    total += data.data.enriched;
    console.log(`  Enriched ${data.data.enriched} venues (${total} total)`);
    batch++;
  }

  console.log(`\nDone. Enriched ${total} venues total.`);
}

main().catch(console.error);
```

- [ ] **Step 2: Create Instagram seeder**

```typescript
// backend/src/scripts/seedInstagram.ts
/**
 * Manual Instagram caption seeder for demo.
 * Paste real Instagram captions here and run through parse-instagram edge function.
 * Run: npx tsx backend/src/scripts/seedInstagram.ts
 */

const DEMO_CAPTIONS = [
  {
    account: 'undergroundclubsa',
    caption: 'TONIGHT 🔥 DJ Marko starting at 23:00! Entry 10 KM. See you on the dance floor! #sarajevonightlife',
    url: 'https://instagram.com/p/example1',
  },
  {
    account: 'bkc.sarajevo',
    caption: 'Jazz večer u BKC-u, 20:00, ulaz slobodan. Nastupa Sarajevo Jazz Quartet. #jazzsarajevo',
    url: 'https://instagram.com/p/example2',
  },
  // Add more real captions here for the demo
];

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  if (!SUPABASE_URL) { console.error('Missing SUPABASE_URL'); process.exit(1); }

  for (const item of DEMO_CAPTIONS) {
    console.log(`Processing @${item.account}...`);
    const res = await fetch(`${SUPABASE_URL}/functions/v1/parse-instagram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        caption: item.caption,
        account_name: item.account,
        post_url: item.url,
      }),
    });
    const data = await res.json();
    console.log(`  ${data.data?.is_event ? '✓ Event detected' : '⏭ Not an event'}: ${data.data?.title ?? 'N/A'}`);
  }
}

main().catch(console.error);
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/scripts/enrichDescriptions.ts backend/src/scripts/seedInstagram.ts
git commit -m "feat: add batch enrichment runner and Instagram seeder scripts"
```

---

### Task 16c: analyze-venue-photo Edge Function

**Files:**
- Create: `supabase/functions/analyze-venue-photo/index.ts`

- [ ] **Step 1: Implement**

```typescript
// supabase/functions/analyze-venue-photo/index.ts
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { callGemini } from '../_shared/ai-clients.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const { image_url } = await req.json();
    if (!image_url) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing image_url' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Fetch image and convert to base64
    const imgRes = await fetch(image_url);
    const imgBuffer = await imgRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));

    const result = await callGemini({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: base64 } },
          { text: 'Classify this venue photo. Return JSON: { "tags": ["interior", "exterior", "food", "drinks", "atmosphere", "crowd"], "primary_tag": "most dominant tag", "quality": "high" | "medium" | "low", "description": "one sentence describing the image" }' },
        ],
      }],
      maxOutputTokens: 256,
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    let parsed;
    try {
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { tags: [], primary_tag: 'unknown', quality: 'medium', description: '' };
    }

    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/analyze-venue-photo/
git commit -m "feat: add analyze-venue-photo edge function (Gemini Flash)"
```

---

### Chunk 2 Checkpoint

- [ ] **Run `/simplify` on all Chunk 2 code**

Review all edge functions in `supabase/functions/`, client helpers in `utils/ai/`, and backend scripts.

- [ ] **Deploy edge functions**

```bash
npx supabase functions deploy generate-pulse --no-verify-jwt
npx supabase functions deploy smart-search --no-verify-jwt
npx supabase functions deploy surprise-me --no-verify-jwt
npx supabase functions deploy generate-plan --no-verify-jwt
npx supabase functions deploy translate-scene --no-verify-jwt
npx supabase functions deploy enrich-descriptions --no-verify-jwt
npx supabase functions deploy parse-instagram --no-verify-jwt
npx supabase functions deploy analyze-venue-photo --no-verify-jwt
```

- [ ] **Set secrets in Supabase Dashboard**

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
GOOGLE_MAPS_API_KEY=...
```

- [ ] **Run test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Update ledger**

Append to `docs/project_ledger.md`:
```
### 2026-03-17 — Wave 0 (Chunk 2): Data Pipeline + Edge Functions
- Created 7 edge functions: generate-pulse, smart-search, surprise-me, generate-plan (SSE), translate-scene, enrich-descriptions, parse-instagram
- Created 5 client-side AI helpers: cityPulse, smartSearch, surpriseMe, planGenerator, translate
- Created Google Maps photo scrape script
- All edge functions follow Chronicles pattern: status 200 always, AbortController 20s timeout, npm: imports for Deno
- Multi-provider: OpenAI (GPT-4.1 mini/nano), Google (Gemini 2.5 Flash/Flash-Lite), Anthropic (Claude Haiku 4.5)
```

---

## Chunk 3: Wave 1 — Home Screen Restyle

This chunk transforms the Home screen from emoji-driven prototype to the glass/photo premium experience.

### Task 17: Home Hero Photo Background

**Files:**
- Modify: `components/home/HomeHeroSection.tsx` — replace gradient with photo + overlay
- Create: `components/home/HomeHeroPhoto.tsx` — time-based photo background
- Create: `components/home/HomeCityPulse.tsx` — AI pulse display

- [ ] **Step 1: Create HomeHeroPhoto**

```typescript
// components/home/HomeHeroPhoto.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { designTokens } from '@/styles/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 320;

// Hero images — will be replaced with Gemini-generated assets
// For now, use placeholder gradient as fallback
const HERO_IMAGES: Record<string, any> = {
  morning: null,   // require('@/assets/hero/morning.jpg')
  afternoon: null,
  evening: null,
  night: null,
};

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function getGreeting(timeOfDay: string, language: string): string {
  const greetings: Record<string, Record<string, string>> = {
    morning:   { bs: 'Dobro jutro, Sarajevo', en: 'Good morning, Sarajevo' },
    afternoon: { bs: 'Dobar dan, Sarajevo', en: 'Good afternoon, Sarajevo' },
    evening:   { bs: 'Šta radimo večeras?', en: 'What are we doing tonight?' },
    night:     { bs: 'Sarajevo ne spava', en: 'Sarajevo never sleeps' },
  };
  return greetings[timeOfDay]?.[language] ?? greetings.evening.en;
}

interface HomeHeroPhotoProps {
  language: string;
  children?: React.ReactNode; // City pulse, surprise me overlaid
}

export function HomeHeroPhoto({ language, children }: HomeHeroPhotoProps) {
  const timeOfDay = getTimeOfDay();
  const greeting = getGreeting(timeOfDay, language);
  const heroImage = HERO_IMAGES[timeOfDay];

  return (
    <View style={styles.container}>
      {heroImage ? (
        <Image source={heroImage} style={styles.backgroundImage} />
      ) : (
        <LinearGradient
          colors={['#D4A056', '#1A1A2E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundImage}
        />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.overlay}
      >
        <Text style={styles.greeting}>{greeting}</Text>
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 24,
  },
  greeting: {
    ...designTokens.typography.heroTitle,
    color: '#FFF',
    marginBottom: 12,
  },
});
```

- [ ] **Step 2: Create HomeCityPulse**

```typescript
// components/home/HomeCityPulse.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchCityPulse } from '@/utils/ai/cityPulse';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { GlassBadge } from '@/components/glass/GlassBadge';

interface HomeCityPulseProps {
  language: string;
}

export function HomeCityPulse({ language }: HomeCityPulseProps) {
  const [pulse, setPulse] = useState<{ pulse_bs: string; pulse_en: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchCityPulse()
      .then((data) => {
        if (mounted) setPulse(data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <GlassContainer style={styles.container}>
        <SkeletonLoader height={14} width="90%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={14} width="70%" />
      </GlassContainer>
    );
  }

  if (!pulse) return null;

  const text = language === 'bs' ? pulse.pulse_bs : pulse.pulse_en;

  return (
    <GlassContainer style={styles.container}>
      <View style={styles.header}>
        <GlassBadge label="City Pulse" variant="accent" size="sm" />
        <Text style={styles.aiLabel}>AI</Text>
      </View>
      <Text style={styles.pulseText}>{text}</Text>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4A056',
    fontFamily: 'DMSans_700Bold',
  },
  pulseText: {
    fontSize: 14,
    color: '#FAFAF8',
    lineHeight: 20,
    fontFamily: 'DMSans_400Regular',
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add components/home/HomeHeroPhoto.tsx components/home/HomeCityPulse.tsx
git commit -m "feat: add HomeHeroPhoto (time-based) and HomeCityPulse (AI)"
```

---

### Task 18: Surprise Me Card

**Files:**
- Create: `components/home/HomeSurpriseMe.tsx`

- [ ] **Step 1: Implement Surprise Me**

```typescript
// components/home/HomeSurpriseMe.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { fetchSurprise } from '@/utils/ai/surpriseMe';
import type { SurprisePlan } from '@/utils/ai/surpriseMe';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';

interface HomeSurpriseMeProps {
  language: string;
  tasteMoods?: string[];
}

export function HomeSurpriseMe({ language, tasteMoods = [] }: HomeSurpriseMeProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [plan, setPlan] = useState<SurprisePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const expandHeight = useSharedValue(48);

  const handlePress = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      expandHeight.value = withSpring(48, { damping: 15 });
      return;
    }

    setLoading(true);
    try {
      const result = await fetchSurprise(tasteMoods, language);
      if (result) {
        setPlan(result);
        setExpanded(true);
        expandHeight.value = withSpring(200 + (result.stops.length * 60), { damping: 15 });
      }
    } catch {
      // Error state handled by null plan
    } finally {
      setLoading(false);
    }
  }, [expanded, tasteMoods, language]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    height: expandHeight.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={containerAnimStyle}>
      <GlassContainer glowColor="#D4A056" style={styles.container}>
        <TouchableOpacity onPress={handlePress} style={styles.header} activeOpacity={0.8}>
          <Text style={styles.sparkle}>✦</Text>
          <Text style={styles.title}>
            {language === 'bs' ? 'Iznenadi me' : 'Surprise me'}
          </Text>
          {loading && <ActivityIndicator size="small" color="#D4A056" />}
        </TouchableOpacity>

        {expanded && plan && (
          <View style={styles.planContent}>
            <Text style={styles.tagline}>
              {language === 'bs' ? plan.tagline_bs : plan.tagline_en}
            </Text>
            {plan.stops.map((stop, i) => (
              <TouchableOpacity
                key={i}
                style={styles.stopRow}
                onPress={() => {
                  if (stop.venue?.id) router.push(`/venue/${stop.venue.id}`);
                }}
              >
                <Text style={styles.stopTime}>{stop.time}</Text>
                <View style={styles.stopInfo}>
                  <Text style={[styles.stopVenue, { color: colors.text }]}>{stop.venue_name}</Text>
                  <Text style={styles.stopPitch}>
                    {language === 'bs' ? stop.pitch_bs : stop.pitch_en}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </GlassContainer>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sparkle: { fontSize: 16, color: '#D4A056' },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FAFAF8',
    fontFamily: 'DMSans_700Bold',
    flex: 1,
  },
  planContent: { marginTop: 12 },
  tagline: {
    fontSize: 13,
    color: '#D4A056',
    fontFamily: 'DMSans_500Medium',
    marginBottom: 10,
  },
  stopRow: { flexDirection: 'row', marginBottom: 8, gap: 10 },
  stopTime: {
    fontSize: 13,
    color: '#D4A056',
    fontFamily: 'DMSans_700Bold',
    width: 40,
  },
  stopInfo: { flex: 1 },
  stopVenue: { fontSize: 14, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
  stopPitch: { fontSize: 12, color: '#A0A0A0', fontFamily: 'DMSans_400Regular', marginTop: 2 },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/home/HomeSurpriseMe.tsx
git commit -m "feat: add HomeSurpriseMe AI card with expand overlay"
```

---

### Task 19: "Gdje na kafu?" Randomizer

**Files:**
- Create: `components/home/HomeKafuSection.tsx`

- [ ] **Step 1: Implement**

```typescript
// components/home/HomeKafuSection.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

interface HomeKafuSectionProps {
  language: string;
}

export function HomeKafuSection({ language }: HomeKafuSectionProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [cafe, setCafe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const rollCafe = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch a single random cafe from Supabase (server-side random, no Math.random)
      const { data } = await supabase
        .rpc('random_venue', { p_category: 'cafe' });

      // Fallback if RPC not available: fetch one with offset based on time
      if (!data || data.length === 0) {
        const offset = new Date().getMinutes(); // stable per minute
        const { data: fallback } = await supabase
          .from('venues')
          .select('id, name, neighborhood, cover_image_url, description_en, description_bs')
          .eq('category', 'cafe')
          .range(offset % 20, (offset % 20) + 1);
        if (fallback && fallback.length > 0) setCafe(fallback[0]);
      } else {
        setCafe(data[0] ?? data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <GlassContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'bs' ? 'Gdje na kafu?' : 'Coffee time?'}
        </Text>
      </View>

      {!cafe ? (
        <TouchableOpacity onPress={rollCafe} style={styles.ctaButton} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.ctaText}>{language === 'bs' ? 'Hajde!' : "Let's go!"}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.result}>
          <TouchableOpacity onPress={() => router.push(`/venue/${cafe.id}`)}>
            {cafe.cover_image_url && (
              <Image source={{ uri: cafe.cover_image_url }} style={styles.cafeImage} />
            )}
            <Text style={[styles.cafeName, { color: colors.text }]}>{cafe.name}</Text>
            {cafe.neighborhood && (
              <Text style={[styles.cafeNeighborhood, { color: colors.textSecondary }]}>
                {cafe.neighborhood}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={rollCafe} style={styles.rerollButton}>
            <Text style={styles.rerollText}>{language === 'bs' ? 'Daj drugo' : 'Another one'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, marginHorizontal: 16, marginBottom: 16 },
  header: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  ctaButton: {
    backgroundColor: '#D4A056',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  result: {},
  cafeImage: { width: '100%', height: 120, borderRadius: 16, marginBottom: 8 },
  cafeName: { fontSize: 16, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  cafeNeighborhood: { fontSize: 13, marginTop: 2, fontFamily: 'DMSans_400Regular' },
  rerollButton: { marginTop: 10, alignSelf: 'center' },
  rerollText: { color: '#D4A056', fontSize: 14, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/home/HomeKafuSection.tsx
git commit -m "feat: add Gdje na kafu randomizer section"
```

---

### Task 20: Hidden Gems Rail

**Files:**
- Create: `components/home/HomeHiddenGems.tsx`

- [ ] **Step 1: Implement**

```typescript
// components/home/HomeHiddenGems.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '@/integrations/supabase/client';
import { FlippableCard } from '@/components/cards/FlippableCard';
import { VenueCardFront } from '@/components/cards/VenueCardFront';
import { VenueCardBack } from '@/components/cards/VenueCardBack';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { SectionHeader } from '@/components/SectionHeader';

interface HomeHiddenGemsProps {
  language: string;
}

export function HomeHiddenGems({ language }: HomeHiddenGemsProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [gems, setGems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('venues')
      .select('*')
      .eq('is_hidden_gem', true)
      .limit(6)
      .then(({ data }) => {
        if (mounted && data) setGems(data);
      });
    return () => { mounted = false; };
  }, []);

  if (gems.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        title={language === 'bs' ? 'Skriveni dragulji' : 'Hidden Gems'}
      />
      <FlatList
        horizontal
        data={gems}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <FlippableCard
            width={220}
            height={280}
            style={styles.card}
            onPress={() => router.push(`/venue/${item.id}`)}
            front={
              <VenueCardFront
                name={item.name}
                imageUrl={item.cover_image_url}
                category={item.category}
                isHiddenGem
              />
            }
            back={
              <VenueCardBack
                name={item.name}
                address={item.address}
                description={language === 'bs' ? item.description_bs : item.description_en}
              />
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  list: { paddingHorizontal: 16 },
  card: { marginRight: 12 },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/home/HomeHiddenGems.tsx
git commit -m "feat: add HomeHiddenGems spotlight rail with flippable cards"
```

---

### Task 21: Wire Home Screen Together

**Files:**
- Modify: `components/home/HomeScreen.tsx` — integrate all new sections
- Modify: `components/home/HomeHeroSection.tsx` — wrap with new photo hero

- [ ] **Step 1: Update HomeScreen to use new components**

This is the integration step. Read the current `HomeScreen.tsx` and add the new sections in order:

1. `HomeHeroPhoto` (replaces old hero) containing:
   - `HomeCityPulse` (AI)
   - `HomeSurpriseMe` (AI)
2. `GlassMoodChip` row (replaces old MoodChip)
3. `HomeKafuSection`
4. `HomeHiddenGems`
5. Existing event carousel (using FlippableCard)
6. Existing series section

- [ ] **Step 2: Update mood chip usage**

Replace all `<MoodChip emoji={...}` calls with `<GlassMoodChip moodId={...}` — remove emoji prop, add moodId.

- [ ] **Step 3: Test on device/web**

Run: `npx expo start --web`
Verify: Home screen shows photo hero, city pulse, surprise me, glass mood chips, kafu randomizer, hidden gems, event cards.

- [ ] **Step 4: Commit**

```bash
git add components/home/HomeScreen.tsx components/home/HomeHeroSection.tsx
git commit -m "feat: wire Home screen with new glass/AI components"
```

---

### Chunk 3 Checkpoint

- [ ] **Run `/simplify` on all Wave 1 code**
- [ ] **Run: `npx vitest run`**
- [ ] **Visual check on web + device**
- [ ] **Update ledger**

```
### 2026-03-17 — Wave 1 (Chunk 3): Home Screen Restyle
- Home hero: time-based photo background with gradient overlay
- City Pulse AI: Gemini Flash-Lite generates bilingual blurb, cached 3h
- Surprise Me AI: GPT-4.1 mini generates micro-plans, expands as overlay
- Glass mood chips replace emoji chips everywhere
- "Gdje na kafu?" randomizer — charming Sarajevo touch
- Hidden Gems rail with flippable editorial cards
- All shared components (GlassContainer, GlassMoodChip, FlippableCard) proven in production
```

- [ ] **Update napkin if patterns emerged**

---

## Chunk 4: Wave 2 — Explore Screen Restyle

### Task 22: Smart Search Integration

**Files:**
- Create: `components/explore/ExploreSmartSearch.tsx`
- Modify: `components/explore/ExploreSearchSection.tsx`
- Modify: `hooks/useExploreController.ts`

- [ ] **Step 1: Create ExploreSmartSearch component**

This is the AI concierge response card that appears below the search bar when NL query is detected.

```typescript
// components/explore/ExploreSmartSearch.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { useTheme } from '@/hooks/useTheme';

interface ExploreSmartSearchProps {
  response: string | null;
  isLoading: boolean;
  venueCount?: number;
}

export function ExploreSmartSearch({ response, isLoading, venueCount }: ExploreSmartSearchProps) {
  const { colors } = useTheme();

  if (!isLoading && !response) return null;

  return (
    <GlassContainer style={styles.container} glowColor="#D4A056">
      <View style={styles.header}>
        <GlassBadge label="AI Concierge" variant="accent" size="sm" />
      </View>
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#D4A056" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Thinking...</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.responseText, { color: colors.text }]}>{response}</Text>
          {venueCount !== undefined && venueCount > 0 && (
            <Text style={[styles.attribution, { color: colors.textSecondary }]}>
              Based on {venueCount} venues
            </Text>
          )}
        </>
      )}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, marginHorizontal: 16, marginBottom: 12 },
  header: { marginBottom: 8 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, fontFamily: 'DMSans_400Regular' },
  responseText: { fontSize: 14, lineHeight: 20, fontFamily: 'DMSans_400Regular' },
  attribution: { fontSize: 11, marginTop: 8, fontFamily: 'DMSans_500Medium' },
});
```

- [ ] **Step 2: Update useExploreController to add smart search**

Add to `hooks/useExploreController.ts`:
- New state: `aiResponse`, `aiLoading`, `aiVenues`
- When search query length > 10 characters and looks like a question (contains "?", "where", "best", "good", etc.), call `smartSearch()` from `utils/ai/smartSearch.ts`
- If mode is `conversation`, set `aiResponse` and show `ExploreSmartSearch`
- If mode is `search`, apply the returned filters to the existing venue list

- [ ] **Step 3: Update ExploreSearchSection to render SmartSearch card**

Below the search input, render `<ExploreSmartSearch response={aiResponse} isLoading={aiLoading} />` when active.

- [ ] **Step 4: Test on web**

Run: `npx expo start --web`
Type: "best ćevapi near the river" in Explore search
Expected: AI concierge card appears with recommendation + venue cards

- [ ] **Step 5: Commit**

```bash
git add components/explore/ExploreSmartSearch.tsx hooks/useExploreController.ts components/explore/ExploreSearchSection.tsx
git commit -m "feat: integrate AI concierge smart search into Explore"
```

---

### Task 23: Live Translation

**Files:**
- Create: `components/explore/ExploreLiveTranslation.tsx`
- Modify: `components/explore/ExploreSearchSection.tsx` — add camera icon

- [ ] **Step 1: Implement Live Translation component**

```typescript
// components/explore/ExploreLiveTranslation.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { translateScene } from '@/utils/ai/translate';
import type { TranslationResult } from '@/utils/ai/translate';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from '@/components/IconSymbol';

interface ExploreLiveTranslationProps {
  visible: boolean;
  onClose: () => void;
}

export function ExploreLiveTranslation({ visible, onClose }: ExploreLiveTranslationProps) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const cameraRef = useRef<any>(null);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      setCapturedImage(photo.uri);
      setTranslating(true);
      try {
        const translation = await translateScene(photo.base64, 'image/jpeg');
        setResult(translation);
      } catch {
        setResult(null);
      } finally {
        setTranslating(false);
      }
    } catch {
      // Camera error
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setResult(null);
  };

  if (!visible) return null;

  // Permission not granted yet
  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.permissionText, { color: colors.text }]}>
            Camera access is needed to translate Bosnian text
          </Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.cameraContainer}>
        {!capturedImage ? (
          <>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            <View style={styles.cameraOverlay}>
              <Text style={styles.instruction}>Point at Bosnian text</Text>
              <TouchableOpacity onPress={handleCapture} style={styles.shutterButton}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.resultContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            {translating ? (
              <GlassContainer style={styles.resultCard}>
                <ActivityIndicator size="small" color="#D4A056" />
                <Text style={styles.translatingText}>Translating...</Text>
              </GlassContainer>
            ) : result ? (
              <GlassContainer style={styles.resultCard}>
                <Text style={styles.originalLabel}>Original:</Text>
                <Text style={styles.originalText}>{result.original_text}</Text>
                <Text style={styles.translationLabel}>Translation:</Text>
                <Text style={styles.translationText}>{result.translation}</Text>
                {result.context && (
                  <GlassContainer style={styles.contextCard} glowColor="#D4A056">
                    <Text style={styles.contextText}>{result.context}</Text>
                  </GlassContainer>
                )}
              </GlassContainer>
            ) : (
              <GlassContainer style={styles.resultCard}>
                <Text style={styles.errorText}>Could not translate. Try again with clearer text.</Text>
              </GlassContainer>
            )}
            <TouchableOpacity onPress={handleReset} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={onClose} style={styles.closeCameraButton}>
          <IconSymbol name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 20, fontFamily: 'DMSans_400Regular' },
  permissionButton: { backgroundColor: '#D4A056', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  permissionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  closeButton: { marginTop: 16 },
  closeText: { fontSize: 14, fontFamily: 'DMSans_400Regular' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 },
  instruction: { color: '#FFF', fontSize: 16, marginBottom: 20, fontFamily: 'DMSans_500Medium' },
  shutterButton: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF' },
  closeCameraButton: { position: 'absolute', top: 60, right: 20 },
  resultContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  capturedImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },
  resultCard: { padding: 16, marginBottom: 12 },
  translatingText: { color: '#D4A056', marginTop: 8, textAlign: 'center', fontFamily: 'DMSans_500Medium' },
  originalLabel: { fontSize: 11, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'DMSans_700Bold' },
  originalText: { fontSize: 16, color: '#FAFAF8', marginBottom: 12, fontFamily: 'DMSans_500Medium' },
  translationLabel: { fontSize: 11, color: '#D4A056', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'DMSans_700Bold' },
  translationText: { fontSize: 16, color: '#FAFAF8', fontFamily: 'DMSans_500Medium' },
  contextCard: { marginTop: 12, padding: 10 },
  contextText: { fontSize: 13, color: '#A0A0A0', lineHeight: 18, fontFamily: 'DMSans_400Regular', fontStyle: 'italic' },
  errorText: { color: '#EF4444', textAlign: 'center', fontFamily: 'DMSans_400Regular' },
  retryButton: { alignSelf: 'center', marginTop: 12 },
  retryText: { color: '#D4A056', fontSize: 14, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
});
```

- [ ] **Step 2: Add camera icon to ExploreSearchSection**

In `ExploreSearchSection.tsx`, add a camera icon button to the right side of the search input that opens `ExploreLiveTranslation`.

- [ ] **Step 3: Test**

Run: `npx expo start` (on device with camera)
Test: Camera opens, captures image, sends to Gemini, shows translation card.

- [ ] **Step 4: Commit**

```bash
git add components/explore/ExploreLiveTranslation.tsx components/explore/ExploreSearchSection.tsx
git commit -m "feat: add Live Translation with Gemini Flash vision OCR"
```

---

### Task 24: Explore Glass Restyle

- [ ] **Step 1: Update ExploreMoodStrip to use GlassMoodChip**
- [ ] **Step 2: Update ExploreCategoryGrid to use GlassCategoryChip** (create `GlassCategoryChip` similar to `GlassMoodChip`)
- [ ] **Step 3: Update ExploreVenueCard to use FlippableCard**
- [ ] **Step 4: Update ExploreFilterModal with glass treatment**
- [ ] **Step 5: Test on web + device**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: restyle Explore with glass chips, flippable cards, glass filter modal"
```

---

### Chunk 4 Checkpoint

- [ ] **Run `/simplify` on all Wave 2 code**
- [ ] **Run test suite**
- [ ] **Update ledger + napkin**

---

## Chunk 5: Wave 3 — Tonight Screen + AI Planner

### Task 25: Tonight Header & Glass Tabs

- [ ] **Step 1: Update TonightScreenContent with moody photo header**
- [ ] **Step 2: Restyle TonightSegmentTabs with glass pill treatment**
- [ ] **Step 3: Commit**

### Task 26: Wire AI Evening Planner

**Files:**
- Modify: `components/tonight/TonightPlannerModal.tsx`
- Create: `components/tonight/TonightPlanStream.tsx`
- Modify: `hooks/useTonightController.ts`
- Remove mock: `utils/tonightMockPlans.ts` (no longer needed)

- [ ] **Step 1: Create TonightPlanStream — SSE rendering component**

```typescript
// components/tonight/TonightPlanStream.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { generatePlan } from '@/utils/ai/planGenerator';
import type { EveningPlan, PlanStop } from '@/utils/ai/planGenerator';
import { FlippableCard } from '@/components/cards/FlippableCard';
import { VenueCardFront } from '@/components/cards/VenueCardFront';
import { VenueCardBack } from '@/components/cards/VenueCardBack';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';

interface TonightPlanStreamProps {
  moods: string[];
  groupSize: number;
  budget: 'casual' | 'mid' | 'premium';
  language: string;
  onPlanGenerated?: (plan: EveningPlan) => void;
}

export function TonightPlanStream({
  moods,
  groupSize,
  budget,
  language,
  onPlanGenerated,
}: TonightPlanStreamProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [streamText, setStreamText] = useState('');
  const [plan, setPlan] = useState<EveningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    generatePlan(
      { moods, groupSize, budget, language },
      (text) => {
        if (mounted) setStreamText(text);
      },
    )
      .then((result) => {
        if (!mounted) return;
        if (result) {
          setPlan(result);
          onPlanGenerated?.(result);
        } else {
          setError('Could not generate plan. Try again?');
        }
      })
      .catch(() => {
        if (mounted) setError('Plan generation failed');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [moods, groupSize, budget, language]);

  if (error) {
    return (
      <GlassContainer style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </GlassContainer>
    );
  }

  // Show streaming shimmer while loading
  if (loading && !plan) {
    return (
      <View style={styles.shimmerContainer}>
        <GlassBadge label="Generating your plan..." variant="accent" size="md" />
        {[1, 2, 3].map((i) => (
          <GlassContainer key={i} style={styles.shimmerStop}>
            <SkeletonLoader height={16} width={40} />
            <SkeletonLoader height={20} width="70%" style={{ marginTop: 6 }} />
            <SkeletonLoader height={14} width="90%" style={{ marginTop: 4 }} />
          </GlassContainer>
        ))}
        {streamText && (
          <Text style={[styles.streamPreview, { color: colors.textSecondary }]} numberOfLines={3}>
            {streamText.slice(-200)}
          </Text>
        )}
      </View>
    );
  }

  if (!plan) return null;

  return (
    <ScrollView style={styles.planContainer}>
      <Text style={[styles.tagline, { color: colors.accent }]}>
        {language === 'bs' ? plan.tagline_bs : plan.tagline_en}
      </Text>

      {plan.stops.map((stop, i) => (
        <View key={i} style={styles.stopContainer}>
          <View style={styles.timeline}>
            <View style={styles.timelineDot} />
            {i < plan.stops.length - 1 && <View style={styles.timelineLine} />}
          </View>
          <View style={styles.stopContent}>
            <Text style={[styles.stopTime, { color: colors.accent }]}>{stop.time}</Text>
            <GlassContainer style={styles.stopCard}>
              <Text style={[styles.stopVenue, { color: colors.text }]}>{stop.venue_name}</Text>
              <Text style={[styles.stopActivity, { color: colors.textSecondary }]}>
                {language === 'bs' ? stop.activity_bs : stop.activity_en}
              </Text>
              <Text style={[styles.stopPitch, { color: colors.textSecondary }]}>
                {language === 'bs' ? stop.pitch_bs : stop.pitch_en}
              </Text>
              {stop.walk_minutes && (
                <Text style={styles.walkTime}>🚶 {stop.walk_minutes} min walk</Text>
              )}
              {stop.estimated_cost && (
                <Text style={[styles.cost, { color: colors.accent }]}>~{stop.estimated_cost} KM</Text>
              )}
            </GlassContainer>
          </View>
        </View>
      ))}

      <GlassContainer style={styles.totalCard} glowColor="#D4A056">
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Estimated total</Text>
        <Text style={[styles.totalAmount, { color: colors.accent }]}>~{plan.total_cost} KM</Text>
      </GlassContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  shimmerContainer: { padding: 16, gap: 12 },
  shimmerStop: { padding: 12 },
  streamPreview: { fontSize: 11, marginTop: 8, fontFamily: 'DMSans_400Regular', opacity: 0.5 },
  errorContainer: { padding: 16, margin: 16 },
  errorText: { color: '#EF4444', textAlign: 'center', fontFamily: 'DMSans_400Regular' },
  planContainer: { padding: 16 },
  tagline: { fontSize: 18, fontWeight: '700', marginBottom: 20, fontFamily: 'DMSans_700Bold' },
  stopContainer: { flexDirection: 'row', marginBottom: 16 },
  timeline: { width: 24, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D4A056', marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(212,160,86,0.3)', marginTop: 4 },
  stopContent: { flex: 1, marginLeft: 12 },
  stopTime: { fontSize: 14, fontWeight: '700', marginBottom: 6, fontFamily: 'DMSans_700Bold' },
  stopCard: { padding: 12 },
  stopVenue: { fontSize: 16, fontWeight: '700', marginBottom: 4, fontFamily: 'DMSans_700Bold' },
  stopActivity: { fontSize: 13, marginBottom: 4, fontFamily: 'DMSans_500Medium' },
  stopPitch: { fontSize: 13, lineHeight: 18, fontFamily: 'DMSans_400Regular', fontStyle: 'italic' },
  walkTime: { fontSize: 11, marginTop: 6, color: '#A0A0A0', fontFamily: 'DMSans_400Regular' },
  cost: { fontSize: 13, marginTop: 4, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
  totalCard: { padding: 16, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontFamily: 'DMSans_400Regular' },
  totalAmount: { fontSize: 20, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
});
```

- [ ] **Step 2: Update TonightPlannerModal to use TonightPlanStream**

Replace the mock plan generation in `TonightPlannerModal.tsx` with `<TonightPlanStream>`. The planner setup UI (mood, group size, budget) stays the same — only the results rendering changes.

- [ ] **Step 3: Update useTonightController**

Replace `generateMockTonightPlan` call with the real AI path. Keep the mock as a fallback if the edge function is unreachable.

- [ ] **Step 4: Test**

Run: `npx expo start --web`
Navigate to Tonight tab → Plan my evening → Select moods → Generate
Expected: Plan streams in with timeline visualization

- [ ] **Step 5: Commit**

```bash
git add components/tonight/TonightPlanStream.tsx components/tonight/TonightPlannerModal.tsx hooks/useTonightController.ts
git commit -m "feat: wire AI Evening Planner with SSE streaming (replaces mock)"
```

---

### Task 27: Tonight Event Cards Restyle

- [ ] **Step 1: Update TonightEventCard to use FlippableCard**
- [ ] **Step 2: Add urgency badges (Večeras!, Sutra, Besplatan)**
- [ ] **Step 3: Restyle ticket CTA buttons with glass amber treatment**
- [ ] **Step 4: Commit**

---

### Chunk 5 Checkpoint

- [ ] **Run `/simplify` on all Wave 3 code**
- [ ] **Run test suite**
- [ ] **Update ledger + napkin (SSE patterns, streaming state management)**

---

## Chunk 6: Waves 4-6 — Detail Screens, Saved, Profile, Polish

### Task 27b: EventCardFront and EventCardBack

**Files:**
- Create: `components/cards/EventCardFront.tsx`
- Create: `components/cards/EventCardBack.tsx`

- [ ] **Step 1: Create EventCardFront** (same pattern as VenueCardFront but for events: image + title + time badge + mood glass badges)

```typescript
// components/cards/EventCardFront.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { designTokens } from '@/styles/designTokens';

interface EventCardFrontProps {
  title: string;
  imageUrl?: string;
  startTime?: string;
  moodIds?: string[];
  urgency?: 'tonight' | 'tomorrow' | 'free' | null;
}

export function EventCardFront({ title, imageUrl, startTime, moodIds = [], urgency }: EventCardFrontProps) {
  const urgencyMap = {
    tonight: { label: 'Večeras!', variant: 'danger' as const },
    tomorrow: { label: 'Sutra', variant: 'warning' as const },
    free: { label: 'Besplatan', variant: 'success' as const },
  };

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.gradient}>
        {startTime && <Text style={styles.time}>{startTime}</Text>}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      </LinearGradient>
      {urgency && urgencyMap[urgency] && (
        <View style={styles.urgencyBadge}>
          <GlassBadge label={urgencyMap[urgency].label} variant={urgencyMap[urgency].variant} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { ...StyleSheet.absoluteFillObject, borderRadius: designTokens.radius.card },
  placeholder: { backgroundColor: '#2A2A3E' },
  gradient: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 16, borderRadius: designTokens.radius.card },
  time: { fontSize: 12, color: '#D4A056', fontWeight: '700', fontFamily: 'DMSans_700Bold', marginBottom: 4 },
  title: { ...designTokens.typography.cardTitle, color: '#FFF' },
  urgencyBadge: { position: 'absolute', top: 12, right: 12 },
});
```

- [ ] **Step 2: Create EventCardBack** (venue name, price, ticket CTA, description)

```typescript
// components/cards/EventCardBack.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { designTokens } from '@/styles/designTokens';

interface EventCardBackProps {
  title: string;
  venueName?: string;
  price?: string;
  description?: string;
  ticketUrl?: string;
  onTicket?: () => void;
}

export function EventCardBack({ title, venueName, price, description, onTicket }: EventCardBackProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {venueName && <Text style={[styles.venue, { color: colors.textSecondary }]}>{venueName}</Text>}
      {price && <Text style={[styles.price, { color: colors.accent }]}>{price}</Text>}
      {description && <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={3}>{description}</Text>}
      {onTicket && (
        <TouchableOpacity onPress={onTicket} style={styles.ticketBtn}>
          <Text style={styles.ticketText}>Get Tickets</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, borderRadius: designTokens.radius.card, justifyContent: 'space-between' },
  title: { ...designTokens.typography.cardTitle, marginBottom: 6 },
  venue: { fontSize: 13, marginBottom: 4, fontFamily: 'DMSans_400Regular' },
  price: { fontSize: 15, fontWeight: '700', marginBottom: 6, fontFamily: 'DMSans_700Bold' },
  desc: { fontSize: 13, lineHeight: 18, fontFamily: 'DMSans_400Regular' },
  ticketBtn: { backgroundColor: '#D4A056', paddingVertical: 10, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  ticketText: { color: '#FFF', fontSize: 14, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
});
```

- [ ] **Step 3: Commit**

```bash
git add components/cards/EventCardFront.tsx components/cards/EventCardBack.tsx
git commit -m "feat: add EventCardFront and EventCardBack for flippable event cards"
```

---

### Task 27c: GlassCategoryChip Component

**Files:**
- Create: `components/glass/GlassCategoryChip.tsx`

- [ ] **Step 1: Implement** (same pattern as GlassMoodChip but for categories — uses category icons and a neutral glass treatment)

```typescript
// components/glass/GlassCategoryChip.tsx
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GlassCategoryChipProps {
  categoryId: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  iconSource?: any;
}

export function GlassCategoryChip({ categoryId, label, isSelected, onPress, iconSource }: GlassCategoryChipProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const chipBg = isSelected ? colors.accent : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const borderColor = isSelected ? colors.accent : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
  const textColor = isSelected ? '#FFF' : colors.text;

  const content = (
    <>
      {iconSource ? (
        <Image source={iconSource} style={styles.icon} />
      ) : (
        <View style={[styles.iconPlaceholder, { backgroundColor: colors.accent }]} />
      )}
      <Text style={[styles.label, { color: textColor, fontFamily: isSelected ? 'DMSans_700Bold' : 'DMSans_500Medium' }]}>
        {label}
      </Text>
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.chip, { backgroundColor: chipBg, borderColor }]} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      style={[animatedStyle, styles.chip, { backgroundColor: chipBg, borderColor }]}
      activeOpacity={0.8}
    >
      {content}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, borderWidth: 1.5, marginRight: 8, marginBottom: 8 },
  icon: { width: 18, height: 18, marginRight: 6, borderRadius: 9 },
  iconPlaceholder: { width: 18, height: 18, borderRadius: 9, marginRight: 6, opacity: 0.5 },
  label: { fontSize: 13 },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/glass/GlassCategoryChip.tsx
git commit -m "feat: add GlassCategoryChip component"
```

---

### Task 27d: Plan Persistence (save/regenerate/history)

**Files:**
- Create: `utils/ai/planPersistence.ts`
- Modify: `components/tonight/TonightPlanStream.tsx` — add save button

- [ ] **Step 1: Create plan persistence helper**

```typescript
// utils/ai/planPersistence.ts
import { supabase } from '@/integrations/supabase/client';
import type { EveningPlan } from './planGenerator';

export async function savePlan(plan: EveningPlan, params: {
  moods: string[];
  groupSize: number;
  budget: string;
  language: string;
}): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('ai_plans')
    .insert({
      user_id: session.user.id,
      moods: params.moods,
      group_size: params.groupSize,
      budget: params.budget,
      plan_json: plan,
      language: params.language,
    })
    .select('id')
    .single();

  if (error) { console.warn('Failed to save plan:', error); return null; }
  return data?.id ?? null;
}

export async function loadLatestPlan(): Promise<{ plan: EveningPlan; id: string } | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('ai_plans')
    .select('id, plan_json')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return { plan: data.plan_json as EveningPlan, id: data.id };
}
```

- [ ] **Step 2: Add save/regenerate buttons to TonightPlanStream**
- [ ] **Step 3: Commit**

```bash
git add utils/ai/planPersistence.ts
git commit -m "feat: add plan persistence (save/load/regenerate)"
```

---

### Task 27e: Active Series Card Restyle

- [ ] **Step 1: Create `components/cards/SeriesCard.tsx`** — large image + title overlay + countdown badge
- [ ] **Step 2: Update `components/home/HomeSeriesCard.tsx` to use new SeriesCard**
- [ ] **Step 3: Commit**

---

### Task 28: Venue Detail Restyle

- [ ] **Step 1: Update VenueDetailHeader — photo hero with glass badges**

Replace the current header with: full-width cover photo (from `cover_image_url`), gradient overlay from bottom, title overlaid, glass badges for category + price level + open/closed. Use same `LinearGradient` + `Image` pattern as `HomeHeroPhoto`.

- [ ] **Step 2: Update VenueActionButtons — glass pill buttons with icons**

Replace text/emoji action buttons with glass pill buttons using `IconSymbol`. Buttons: Navigate, Call, Web, Instagram, Save. Each is a `GlassContainer` with `borderRadius: 20`, icon, and label.

- [ ] **Step 3: Add hidden gem badge + insider tip callout**

If `venue.is_hidden_gem`, show a `GlassBadge` with "Hidden Gem" variant accent, and below it a `GlassContainer` with `insider_tip_bs` / `insider_tip_en` as styled quote text.

- [ ] **Step 4: Display AI-enriched descriptions**

Replace any existing description display with the bilingual `description_bs` / `description_en` fields. Show based on current language from `useApp().language`.

- [ ] **Step 5: Restyle venue tabs with glass pills**

Replace existing tab buttons with glass pill treatment: `GlassContainer` per tab, selected state fills with accent color.

- [ ] **Step 6: Add check-in button**

Create a "I'm here" glass button (`GlassContainer` + location icon + label). On press:
```typescript
await supabase.from('checkins').insert({ user_id: session.user.id, venue_id });
```
Show check-in count on the venue header as a glass badge: `flame icon + "X people here now"`.

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: restyle Venue Detail with glass treatment, check-in, hidden gem"
```

### Task 29: Event Detail Restyle

**Files:**
- Modify: `components/event/EventDetailHero.tsx`
- Modify: `components/event/EventVenueAndBadges.tsx`
- Modify: `components/event/EventPurchaseSection.tsx`
- Modify: `app/event/[id].tsx`

- [ ] **Step 1: Update EventDetailHero — full-width photo hero with gradient, same pattern as venue**
- [ ] **Step 2: Add series badge** — if event has `series_id`, show a tappable `GlassBadge` linking to series detail
- [ ] **Step 3: Prominent ticket CTA** — full-width `GlassContainer` with accent fill, "Get Tickets" text, links to ticket URL
- [ ] **Step 4: Embed flippable venue card** — below the event info, show a `FlippableCard` with `VenueCardFront`/`VenueCardBack` for the event's venue
- [ ] **Step 5: Display AI-enriched event description** (bilingual from `description_bs`/`description_en`)
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: restyle Event Detail with glass hero, venue card, ticket CTA"
```

### Task 29b: Series Detail Restyle

**Files:**
- Modify: `components/series/SeriesDetailHero.tsx`
- Modify: `components/series/SeriesEventCard.tsx`

- [ ] **Step 1: Update SeriesDetailHero — same photo hero pattern**
- [ ] **Step 2: Add countdown badge** — if series start date is upcoming, show countdown in a `GlassBadge`
- [ ] **Step 3: Restyle SeriesEventCard** — use FlippableCard with EventCardFront/Back
- [ ] **Step 4: Commit**

```bash
git commit -m "feat: restyle Series Detail with glass hero and countdown badge"
```

### Task 30: Saved Screen Restyle

**Files:**
- Modify: `app/(tabs)/saved.tsx`
- Modify: `components/saved/SavedEmptyState.tsx`

- [ ] **Step 1: Glass tab pills** — replace existing tab buttons with glass pill treatment for venues/events/badges tabs
- [ ] **Step 2: Update card lists to use FlippableCard** — venues use VenueCardFront/Back, events use EventCardFront/Back
- [ ] **Step 3: Replace empty states** — for each tab, show encouraging photography + copy instead of sad placeholder. Example: "Start exploring to find your favourite spots" with a Sarajevo photo background
- [ ] **Step 4: Badges section** — glass badge grid with glow per earned badge
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: restyle Saved screen with glass tabs, flippable cards, photo empty states"
```

### Task 31: Profile Screen Restyle

**Files:**
- Modify: `app/(tabs)/profile.tsx`
- Modify: `components/profile/ProfileAuthCard.tsx`
- Modify: `components/profile/ProfileMoodSection.tsx`
- Modify: `components/profile/ProfileSettingsCard.tsx`

- [ ] **Step 1: Glass profile card at top** — `GlassContainer` wrapping avatar placeholder circle, display name, and stats row (saved count, check-in count)
- [ ] **Step 2: Taste mood selector** — replace existing MoodChip usage with `GlassMoodChip` components
- [ ] **Step 3: Settings as glass cards** — each settings section in a `GlassContainer` with toggle rows styled using accent color for active state
- [ ] **Step 4: Language toggle** — glass segmented control (BS | EN)
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: restyle Profile screen with glass cards, mood chips, settings"
```

### Task 32: Wave 6 — Polish & Final QA

- [ ] **Step 1: End-to-end demo walkthrough — every screen, every feature**
- [ ] **Step 2: Loading state polish — check all shimmer timing**
- [ ] **Step 3: Edge case fixes — empty states, timeout handling**
- [ ] **Step 4: Performance pass — image optimization, list virtualization**
- [ ] **Step 5: Final `/simplify` pass on entire restyle codebase**
- [ ] **Step 6: Final ledger entry — restyle complete, demo-ready status**
- [ ] **Step 7: Final napkin update — crystallize all recurring patterns**

---

## Database Migrations Required

Before running the edge functions, ensure these tables/columns exist:

```sql
-- City pulse cache table
CREATE TABLE IF NOT EXISTS city_pulse (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pulse_bs text NOT NULL,
  pulse_en text NOT NULL,
  time_of_day text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- AI plans table
CREATE TABLE IF NOT EXISTS ai_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  moods text[] DEFAULT '{}',
  group_size int DEFAULT 2,
  budget text DEFAULT 'mid',
  plan_json jsonb NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

-- Ensure venues have description columns
ALTER TABLE venues ADD COLUMN IF NOT EXISTS description_bs text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_hidden_gem boolean DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS insider_tip_bs text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS insider_tip_en text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_place_id text;

-- Raw events table (for Instagram pipeline)
CREATE TABLE IF NOT EXISTS raw_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  date text,
  time text,
  venue_name text,
  price text,
  description_bs text,
  description_en text,
  source text,
  source_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  venue_id uuid REFERENCES venues(id),
  created_at timestamptz DEFAULT now()
);
```

Run: Apply via Supabase Dashboard SQL editor or `supabase db push`.

---

## Summary

| Chunk | Wave | Tasks | Focus |
|---|---|---|---|
| 1 | Foundation | 1-8 | Design tokens, glass components, flippable cards, edge function scaffolding |
| 2 | Wave 0 | 9-16c | All 8 edge functions, AI client helpers, Google Maps scrape script, batch runners |
| 3 | Wave 1 | 17-21 | Home screen: photo hero, city pulse, surprise me, kafu, hidden gems |
| 4 | Wave 2 | 22-24 | Explore: smart search, live translation, glass restyle |
| 5 | Wave 3 | 25-27e | Tonight: AI planner with SSE streaming, plan persistence, event/series cards, glass tabs |
| 6 | Waves 4-6 | 28-32 | Detail screens (venue, event, series), saved, profile, check-in, polish, final QA |

**Total tasks:** 40+
**Edge functions:** 8
**New components:** ~25
**Modified components:** ~20

**After each chunk:** `/simplify`, ledger entry, napkin update.
