# Project Status From Master Docs

This document compares the broader Hype planning files in the parent `Hype/` folder with the actual implementation in `Hype app/`.

## Main source files reviewed

- `..\hype-architecture-v5.md`
- `..\hype-architecture-v6.txt`
- `..\hype-natively-prompt.md`
- `..\hype_feature_ideas.md`

## Where the project stands

Hype is currently in a transitional stage between concept architecture and production implementation.

The broader project vision is clear:

- Sarajevo-first
- mood-driven discovery
- bilingual BS/EN experience
- Supabase-centered data layer
- future expansion into scraping, city pulse, public site, admin tools, and venue intelligence

The actual codebase in `Hype app/` is best understood as:

- a Natively-generated Expo prototype
- extended with real route files and real Supabase queries
- partially aligned to the master architecture
- not yet stabilized enough to be treated as production-ready

## Short conclusion

The current app is a real prototype with meaningful implementation, not just mockups. But it is still below the maturity level assumed by `hype-architecture-v5.md`.

## Planned vs implemented

### Already implemented in some form

- Expo mobile app with 5-tab structure
- Bosnian / English language switching
- theme support and app-wide provider structure
- Explore screen with search, mood filters, categories, list/menu switching, and filter modal
- Tonight screen
- Saved screen
- Profile screen
- Venue detail screen
- Event detail screen
- Series detail screen
- direct Supabase reads from frontend
- weather integration attempt on Home screen
- local saved/favorite persistence using AsyncStorage

### Partially implemented or unstable

- detail screens work conceptually, but recently needed stabilization for React effect ordering and dependency issues
- Explore exists, but search and screen lifecycle behavior still need cleanup and validation
- Home exists, but should be checked against the intended sections in the Natively prompts
- auth/profile exists, but looks early-stage rather than complete
- direct frontend data access works, but ownership boundaries are still unclear

### Not meaningfully implemented yet

- admin panel
- public SEO website
- venue dashboard
- mature scraping pipeline
- canonical entity architecture
- robust city pulse / live energy system
- clear production backend strategy across Supabase and `backend/`
- durable environment/config management
- production-grade data governance and security review

## Natively prompt mapping

### Prompt 1: app shell, navigation, theme, language

Status: largely implemented

Evidence:

- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `contexts/AppContext.tsx`

### Prompt 2: Supabase tables and seed assumptions

Status: partially externalized

Evidence:

- frontend queries assume `venues`, `events`, `event_series`, and `daily_specials`
- `..\hype-supabase-schema.sql` exists

### Prompt 3: Home screen

Status: partially to mostly implemented

Evidence:

- `app/(tabs)/(home)/index.tsx`

### Prompt 4: Explore screen

Status: mostly implemented, recently being stabilized

Evidence:

- `app/(tabs)/explore.tsx`

### Prompt 5: Venue detail

Status: implemented but recently debugged

Evidence:

- `app/venue/[id].tsx`

### Prompt 6: Tonight + Event detail

Status: mostly implemented

Evidence:

- `app/(tabs)/tonight.tsx`
- `app/event/[id].tsx`

### Prompt 7: Saved + Profile

Status: implemented in early form

Evidence:

- `app/(tabs)/saved.tsx`
- `app/(tabs)/profile.tsx`

### Prompt 8: Series detail + series polish

Status: implemented in meaningful form

Evidence:

- `app/series/[id].tsx`
- Home screen already appears to reference series data

### Prompt 9 and beyond: weather polish, tickets, later enrichments

Status: partially started, not fully consolidated

Evidence:

- weather API usage exists in Home
- ticket flows exist in event-related screens

## Biggest strategic mismatch

The strongest mismatch in the project today is this:

- the master architecture assumes a mature Supabase-first platform with scraping, RLS discipline, multiple frontends, and a coherent long-term data model
- the real repo is still a mobile-first prototype with direct frontend queries, a partly separate `backend/` service, and several screens still being debugged

That means the next work should not be judged against the final architecture yet. It should be judged against the needs of a stabilization phase.

## Recommended next technical milestone

### Milestone: Stabilize the mobile prototype into a reliable v0.1 app

Goal:

Turn the current generated prototype into a dependable app baseline before adding more systems.

### What this milestone should include

1. Screen stability pass

- fix remaining runtime errors across Home, Explore, Tonight, Saved, Profile, Event, Venue, and Series
- remove repeated React effect and debounce mistakes
- verify navigation between all major screens

2. Data contract pass

- document the expected fields for `venues`, `events`, `event_series`, and `daily_specials`
- reconcile mismatches between code assumptions and `..\hype-supabase-schema.sql`
- decide the canonical location for the Supabase client

3. Product surface pass

- update `docs/04-product/screen_inventory.md` so each current screen is described by what it really does
- mark missing prompt features explicitly instead of assuming they exist

4. Architecture decision pass

- decide whether the near-term app should be:
  - frontend directly against Supabase
  - frontend plus custom backend
  - mixed model with clearly separated responsibilities

### What should wait until after this milestone

- scraping pipeline build-out
- city pulse intelligence
- admin panel
- public site
- venue dashboard
- ambitious new features from `hype_feature_ideas.md`

## Suggested next 1-2 week plan

### Week 1: hardening

- finish runtime bug cleanup
- validate all current routes
- clean Explore, Event, Venue, and Series behavior
- document actual screen behavior in product docs

### Week 2: architecture alignment

- choose backend ownership model
- unify Supabase client and environment strategy
- compare current code fields against schema
- create one ADR for data/backend direction

## Current status statement

Hype is a well-shaped prototype with real product direction, real route coverage, and real data hooks, but it is still in stabilization and architecture-alignment mode rather than feature-expansion mode.
