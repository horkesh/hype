# Master Roadmap

This is the concrete execution roadmap for Hype across product, data, infrastructure, and operations.

It translates the broader architecture docs into sequenced work we can actually execute from the current repo state.

## North star

Build Hype from a Natively-originated prototype into a stable Sarajevo-first city discovery platform with:

- reliable mobile app
- durable Supabase backend
- structured event and venue data
- scraping and enrichment pipeline
- future-facing expansion path into admin, public web, and city pulse

## Current reality

We already have:

- Expo app prototype with major screens
- route structure for Home, Explore, Tonight, Saved, Profile, Event, Venue, Series
- Supabase reads from the frontend
- a separate backend scaffold under `backend/`
- master planning docs outside the repo

We do not yet have:

- a stable app baseline
- fully reconciled schema-to-code contracts
- a settled backend ownership model
- a live scraper pipeline
- admin/public surfaces

## Guiding principle

Do not build the later architecture on top of an unstable prototype.

The correct sequence is:

1. stabilize
2. align data contracts
3. settle architecture boundaries
4. implement data ingestion
5. expand surfaces

---

## Phase 0: Working foundation

Status: mostly done

### Outcomes

- docs system exists
- project ledger exists
- napkin exists
- repo-native role docs exist
- project status has been compared against master docs

### Remaining tasks

- keep `docs/project_ledger.md` current
- keep `.claude/napkin.md` curated with repeatable rules
- use this roadmap as the sequencing reference

---

## Phase 1: Stabilize the mobile prototype

Priority: highest

Goal:

Make the current mobile app reliable enough to validate product behavior without constant runtime debugging.

### Workstreams

#### 1.1 Route stability pass

- validate Home screen
- validate Explore screen
- validate Tonight screen
- validate Saved screen
- validate Profile screen
- validate Event detail
- validate Venue detail
- validate Series detail

Definition:

- no known render loops
- no broken effect/debounce patterns
- no obvious navigation dead ends

#### 1.2 Interaction pass

- search input works and cleans up correctly
- save/unsave flows work
- cross-navigation between event, venue, and series works
- filter modal behavior is consistent
- weather and external-link actions fail gracefully

#### 1.3 UI/content sanity pass

- identify broken strings or encoding artifacts
- verify bilingual switching across current screens
- ensure placeholder areas are explicitly known, not mistaken for complete features

### Deliverables

- stable route checklist
- updated `docs/04-product/screen_inventory.md`
- updated ledger entries for remaining bugs and fixes

### Exit criteria

- app is usable end-to-end at prototype level
- runtime bug count on main flows is low and known

---

## Phase 2: Data contract and schema alignment

Priority: very high

Goal:

Make the frontend’s assumptions match the actual data model.

### Workstreams

#### 2.1 Canonical schema review

Primary references:

- `..\hype-supabase-schema.sql`
- `..\hype-scraping-architecture.md`

Tasks:

- document expected fields for `venues`
- document expected fields for `events`
- document expected fields for `event_series`
- document expected fields for `daily_specials`
- compare these against current frontend queries

#### 2.2 Mismatch inventory

Look for:

- naming mismatches like `price_level` vs `price_range`
- description/tip field differences
- media field name differences
- category and mood vocabulary drift
- missing relational joins

#### 2.3 Canonical integration cleanup

- choose one Supabase client location
- remove duplication between `integrations/supabase/` and `app/integrations/supabase/`
- introduce environment-driven public config strategy

### Deliverables

- one schema-to-UI mapping document
- one list of field mismatches
- one canonical Supabase client surface

### Exit criteria

- current mobile screens can be explained by the actual schema without guessing

---

## Phase 3: Backend ownership decision

Priority: very high

Goal:

Decide what the near-term architecture actually is.

### Decision to make

Choose one of these:

1. Supabase-direct frontend first
2. Mixed model: frontend reads simple data direct, custom backend handles orchestration
3. Custom backend becomes main API layer

### My current recommendation

Near-term:

- frontend can continue reading from Supabase for prototype speed
- custom backend should handle future orchestration, scraper ingestion, admin workflows, and protected logic

That means:

- keep the app moving now
- avoid overbuilding an API before the data model and product are stable
- make the backend earn its place through ingestion and business workflows

### Tasks

- write one ADR for backend direction
- define what belongs in:
  - frontend direct reads
  - backend service
  - Supabase DB / auth / policies

### Deliverables

- ADR for backend ownership
- updated `docs/03-architecture/integrations.md`

### Exit criteria

- we stop designing against three different mental models at once

---

## Phase 4: Supabase environment setup

Priority: high

Goal:

Stand up a clean, deliberate Supabase project that matches the intended product direction.

### Workstreams

#### 4.1 Project provisioning

- create the Supabase project
- store the project URL and anon key in env-driven config
- decide local vs hosted workflow

#### 4.2 Schema deployment

- run the canonical schema
- verify extensions used by the schema
- confirm auth profile trigger works
- confirm RLS is present where expected

#### 4.3 Seed and demo data

- load initial Sarajevo venues
- load seed events
- load event series
- load daily specials

Possible sources:

- `..\hype-venues-seed.json`
- manual seed inserts
- curated starter dataset

#### 4.4 Access validation

- verify anon read behavior needed by the prototype
- verify write paths are limited appropriately
- verify auth and profile creation behavior

### Deliverables

- working Supabase project
- documented environment variables
- seed strategy and initial seed loaded

### Exit criteria

- mobile app can run against a deliberate Supabase setup instead of accidental schema drift

---

## Phase 5: Product documentation pass

Priority: high

Goal:

Make the implemented app surface explicit before feature growth resumes.

### Tasks

- expand `docs/04-product/screen_inventory.md`
- add implemented vs missing notes per screen
- note where the prompt and current repo diverge
- map current user journeys:
  - browse
  - search
  - open event
  - open venue
  - save content
  - manage profile

### Deliverables

- accurate screen inventory
- current user journey notes

### Exit criteria

- we can discuss product state without guessing

---

## Phase 6: Scraper foundation

Priority: medium-high

Goal:

Start data ingestion in a way that matches the long-term Hype vision.

### Important sequencing note

Do not build the full scraping empire first.

Start with 2-3 high-value sources and a minimal ingestion loop.

### Initial source recommendation

Start with:

1. AllEvents
2. KupiKartu
3. Pozorista

Reason:

- validation doc says these are the strongest near-term sources
- they cover broad event volume with workable extraction paths

### Workstreams

#### 6.1 Scraper architecture choice

Decide where scraper logic lives first:

- Supabase Edge Functions
- custom `backend/` service
- hybrid model

My recommendation:

- use the `backend/` service for early implementation comfort and observability
- move specific production-safe jobs into scheduled environments later if needed

#### 6.2 Raw ingestion model

Create or confirm tables for:

- scrape sources
- scrape runs / logs
- raw payloads or normalized staging records

#### 6.3 Parsing and normalization

- ingest raw source records
- normalize source metadata
- parse with deterministic helpers first
- use LLM parsing where structure is messy

#### 6.4 Deduplication

- define event fingerprint strategy
- define venue matching strategy
- avoid duplicate event insertion across sources

### Deliverables

- first ingestion path from at least one source into the database
- scrape logging
- dedupe policy draft

### Exit criteria

- at least one source updates data repeatably without manual copying

---

## Phase 7: Canonical entity model

Priority: medium-high

Goal:

Move toward the stronger architecture hinted by `hype-architecture-v6.txt`.

### Target model

- sources
- venues
- events
- event_instances

### Why this matters

- makes deduplication tractable
- improves recurring events and series handling
- separates event identity from one occurrence
- supports multiple source references cleanly

### Approach

- do not refactor into this model until the first ingestion loop works
- once ingestion exists, migrate incrementally

### Deliverables

- design note for canonical entity model
- migration strategy from current schema to target structure

### Exit criteria

- we know whether and when to evolve beyond the current event table model

---

## Phase 8: City pulse foundation

Priority: medium

Goal:

Begin implementing the distinctive Hype value proposition: where the energy is right now.

### First version

Use simple signals:

- checkins
- upcoming event count
- venue open/closed state
- time of day

### Later version

Add:

- attendance
- recent activity
- manual curation
- source confidence

### Deliverables

- pulse scoring rules v1
- one visible app surface using pulse data

### Exit criteria

- Hype starts feeling like a live city companion, not just a listings app

---

## Phase 9: Auth, profiles, and personalization

Priority: medium

Goal:

Upgrade the current early auth/profile layer into a durable user system.

### Tasks

- validate Supabase auth flows
- formalize profile creation
- persist taste moods in canonical profile storage
- define saved/favorite storage strategy
- define notification preferences

### Deliverables

- profile/auth data contract
- cleaned-up profile and saved flows

---

## Phase 10: Admin and moderation surface

Priority: medium-late

Goal:

Create the first operational interface for content management.

### Scope

- review submissions
- manage venues/events
- inspect scraper results
- fix or approve records

### Recommendation

Do this only after:

- mobile prototype is stable
- Supabase schema is settled enough
- scraper ingestion exists

### Deliverables

- admin requirements doc
- initial admin surface plan

---

## Phase 11: Public website and SEO

Priority: later

Goal:

Create the web acquisition layer for hype.ba.

### Scope

- landing page
- SEO venue/event pages
- app install funnel
- city guides and content marketing

### Dependency

Needs a stable and trustworthy data layer first.

---

## Phase 12: Venue tools and claims

Priority: later

Goal:

Enable venue participation and self-service.

### Scope

- venue claims
- venue updates
- event submissions
- analytics and performance views

### Dependency

Needs moderation, schema maturity, and admin tools first.

---

## Concrete next steps from today

These are the next architect-approved steps in order:

1. Finish prototype stabilization on the current mobile screens.
2. Expand `docs/04-product/screen_inventory.md` to reflect real behavior.
3. Create a schema-to-UI contract document.
4. Consolidate the Supabase client and env strategy.
5. Write one ADR on backend ownership.
6. Provision and validate the canonical Supabase project.
7. Start with one scraper source and one ingestion path.

## Suggested ownership order for us

When working together, I’ll treat priorities like this:

1. prevent product instability
2. reduce architectural ambiguity
3. make data contracts explicit
4. add durable ingestion
5. only then expand platform breadth

## What I would not do yet

- build the admin dashboard now
- build the public site now
- build all scrapers at once
- fully replatform around the backend before deciding ownership
- chase advanced city pulse UX before data reliability improves
