# Home Screen Redesign: Smart Magazine Cover with Category Grid

**Date:** 2026-03-22
**Status:** Draft
**Trigger:** Partner feedback — Home reads like a restaurant menu, not a city discovery experience.

## Problem

The current Home screen stacks discovery sections vertically (Trending, Kafu, Hidden Gems, Events) which feels like browsing a restaurant menu. Categories and search live on a separate Explore tab, splitting the discovery experience across two screens. Users open the app and see a list of sections rather than a curated editorial experience.

## Design

### Mental model

Home is a **smart travel magazine cover** that adapts to what you're interested in. Explore is the **full database** for power users who want advanced filters.

### Home screen layout (top to bottom)

#### 1. Hero (unchanged)

AI-generated photo of Sarajevo matching time of day, weather, and holidays. Contains:
- Greeting text ("Dobro jutro, Sarajevo")
- City pulse (AI-generated one-liner about what's happening)
- Surprise Me button

#### 2. Category grid (new)

A 4x2 grid of category icons, always visible below the hero.

Categories (8 total):
- Restaurant, Bar, Club, Theatre, Cinema, Exhibition, Concert, Festival

Each cell: ~80x80, contains a vector icon (MaterialCommunityIcons) and a label beneath. Glass background when unselected, gold accent border when selected.

Behavior:
- Tap to select, tap again to deselect
- Single-select (tapping a new category deselects the previous)
- Selection filters the content sections below

#### 3. Mood chips (existing, repositioned)

Horizontal scroll row of glass mood chips, positioned directly below the category grid.

Behavior:
- Tap to select, tap again to deselect
- Single-select (same as current)
- Acts as a **soft sort/boost**, not a hard filter
- Can combine with an active category selection

#### 4. Content sections (adaptive)

What renders below depends on the active selection state:

**Default (nothing selected):**
Editorial magazine sections in this order:
1. Featured event/venue (large hero card)
2. New in Town (recently added venues)
3. Trending Now (venues with recent check-ins)
4. Hidden Gems (curated lesser-known spots)
5. Upcoming Events (event card rail + series)

These sections feel editorial — curated, not database-like.

**Category selected (e.g. "Restaurant"):**
A venue list filtered to that category, styled as cards (image, name, neighborhood, rating). Sorted by relevance/rating. Mood boost applies if a mood is also selected.

**Mood selected (no category):**
Current mood feed behavior — interleaved venues and events matching the mood tag.

**Both selected (e.g. "Restaurant" + "Date Night"):**
Venue list filtered to the category. Venues tagged with the selected mood are sorted to the top. All venues in the category still appear, but mood-matching ones come first.

### Filter interaction model

| Category | Mood | Content shown |
|----------|------|---------------|
| None | None | Editorial magazine sections |
| Restaurant | None | All restaurants as card list |
| None | Date Night | Mood feed (venues + events) |
| Restaurant | Date Night | All restaurants, date-night ones first |

Category = hard filter (only that category).
Mood = soft boost (mood-tagged items sort to top, others still show).

### What stays on Explore

Explore keeps its role as the power-user database:
- Full venue list with all filters (price, open now, neighborhood)
- Daily specials / menu tab
- AI smart search concierge
- Live camera translation
- Advanced filter modal (categories + moods + price level + open now)

### What moves from Explore to Home

- Category browsing (as the icon grid — visual, not filter chips)
- Nothing else. Search stays on Explore for now.

### What gets removed from Home

- HomeKafuSection (random cafe) — redundant if categories exist
- HomeAskSarajevo — low usage, Explore has smart search

### Visual style

The category grid should feel like **illustrated navigation**, not a filter bar:
- Icons: MaterialCommunityIcons, sized 28-32px, tinted with the warm accent palette
- Labels: DM Sans 500, 11px, beneath each icon
- Grid cells: glass background (rgba token), rounded corners (16px)
- Selected state: gold border (D4A056), slightly elevated shadow
- Grid padding: 12px between cells, 16px horizontal margin

Mood chips remain unchanged (glass chips with vector icons, horizontal scroll).

## Scope boundaries

This spec covers only the Home screen layout changes. It does not cover:
- Changes to Explore (Explore stays as-is)
- New features (Instagram rail, heritage walks — separate specs)
- Backend changes (no new tables or edge functions needed)
- The category grid reuses existing `EXPLORE_CATEGORIES` data

## Data requirements

Category-filtered venue list:
- Query: `supabase.from('venues').select('*').eq('category', selected).order('google_rating', { ascending: false }).limit(30)`
- If mood is also selected: client-side sort — mood-tagged venues first, then the rest

No new tables, edge functions, or migrations required.

## Components affected

### New components
- `components/home/HomeCategoryGrid.tsx` — the 4x2 icon grid

### Modified components
- `components/home/HomeContentSections.tsx` — add category grid, wire selection state, add category-filtered content branch
- `components/home/HomeScreen.tsx` — add `selectedCategory` state alongside `selectedMood`

### Removed components
- `components/home/HomeKafuSection.tsx` — replaced by category browsing
- `components/home/HomeAskSarajevo.tsx` — moved to Explore only

## Risks

- **Content density**: grid + mood chips + content could feel heavy on small screens. Mitigation: keep grid compact (80px cells), test on iPhone SE viewport.
- **Empty states**: some category + mood combos may return few results. Mitigation: show "X spots found" count, fall back to category-only results if combo returns < 3.
