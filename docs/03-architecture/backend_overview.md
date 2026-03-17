# Backend Overview

This document describes the full server-side architecture of Hype as of 2026-03-17.

Hype's backend is split across three layers:

1. **Supabase** — the canonical database, auth provider, and edge function host
2. **Node backend** (`backend/`) — ingestion pipeline, admin scripts, scraper orchestration
3. **Supabase Edge Functions** (`supabase/functions/`) — AI proxy layer (8 functions)

---

## 1. Supabase (Postgres + Auth + Storage)

**Project**: `kyfoqltmkqwtnrdlacqv` (Central EU / Frankfurt)

### Core Tables

| Table | Purpose | Row count |
|-------|---------|-----------|
| `venues` | All venues in Sarajevo | ~1000 |
| `events` | Events (one-off + recurring instances) | variable |
| `event_series` | Recurring event series | variable |
| `daily_specials` | Venue daily menus/specials | variable |
| `favorites` | User-saved venues (Supabase-backed) | per user |
| `profiles` | User profiles with `taste_moods` | per user |
| `checkins` | Venue check-ins (user_id nullable for demo) | seeded ~370 |
| `city_pulse` | Cached AI city pulse blurbs (3h TTL) | 1 row at a time |
| `ai_plans` | Saved AI evening plans | per user |
| `raw_events` | Scraped/parsed event candidates awaiting review | variable |
| `scrape_sources` | Configured scrape targets | ~10 |
| `scrape_log` | Scrape run history | variable |

### Key Venue Columns (post-enrichment)

| Column | Source | Purpose |
|--------|--------|---------|
| `name`, `category`, `neighborhood` | Original seed + Google verification | Core identity |
| `google_place_id` | Seed data | Links to Google Maps |
| `google_rating`, `google_ratings_count` | Google Places API | Social proof |
| `google_editorial_summary` | Google Places API | Google's own blurb |
| `google_top_reviews` | Google Places API (text[]) | Real visitor snippets |
| `google_price_level` | Google Places API | 1-4 scale |
| `cover_image_url` | Google Maps Photos API | Venue card image |
| `photos` | Google Maps Photos API (text[]) | Additional photos |
| `description_en`, `description_bs` | AI-generated (GPT-4.1 mini) | Bilingual descriptions grounded in Google data |
| `is_hidden_gem` | Manual / future AI | Featured flag |
| `insider_tip_bs`, `insider_tip_en` | Manual / future AI | Editorial tip |
| `website`, `phone`, `address` | Google Places API | Contact info |
| `opening_hours_json` | Google Places API (jsonb) | Structured hours |
| `moods` | Seed data (text[]) | Mood tags for filtering |

### Auth

- Supabase Auth with email/password
- `profiles` table linked to `auth.users`
- `favorites` and `ai_plans` reference `auth.users(id)`
- `checkins.user_id` is nullable (demo seeding uses null)

### RLS Policies

- Venues: public read, authenticated update (for admin editor)
- Favorites: user-scoped read/write
- Profiles: user-scoped read/write
- Checkins: public read, authenticated insert

---

## 2. Node Backend (`backend/`)

Express server for ingestion, scraping, and admin operations. Runs separately from the Expo app.

### Entry Point

`backend/src/index.ts` — Express app with route registration.

### Routes

| Route | File | Purpose |
|-------|------|---------|
| `GET /ingestion/sources` | `routes/ingestion.ts` | List scrape sources |
| `POST /ingestion/run/:sourceId` | `routes/ingestion.ts` | Run scrape for a source |

### Services

| Service | Purpose |
|---------|---------|
| `ingestionSources.ts` | CRUD for scrape_sources |
| `ingestionRuns.ts` | Scrape run orchestration |
| `ingestionFetch.ts` | HTTP fetch for scrape targets |
| `rawEvents.ts` | raw_events table operations |
| `sourceExtractors.ts` | Source-aware link/event extractors (Pozorista, AllEvents, KupiKartu) |
| `sourceDetailEnrichment.ts` | Detail page enrichment for raw events |
| `parsePreview.ts` | Preview parsed events before promotion |

### Scripts (`backend/src/scripts/`)

| Script | Purpose | Run command |
|--------|---------|-------------|
| `scrapeGooglePhotos.ts` | Fetch Google Maps photos for venues | `node --env-file=backend/.env --import tsx backend/src/scripts/scrapeGooglePhotos.ts` |
| `enrichFromGoogle.ts` | Pull ratings, reviews, hours, editorial from Google Places | same pattern |
| `enrichDescriptions.ts` | Batch-run AI description enrichment via edge function | same pattern |
| `verifyCategoriesVsGoogle.ts` | Cross-check venue categories against Google Maps types, auto-fix with `--fix` | same pattern |
| `seedCheckins.ts` | Generate demo check-in data for top 50 venues | same pattern |
| `seedInstagram.ts` | Feed demo Instagram captions through parse-instagram edge function | same pattern |

### Lib

| Module | Purpose |
|--------|---------|
| `supabaseAdmin.ts` | Service-role Supabase client for backend-only operations. Exports `fetchSupabaseAdminJson`, `requestSupabaseAdminJson`, `requestSupabaseAdminNoContent` |

### Environment

Backend reads from `backend/.env`:
```
SUPABASE_URL=https://kyfoqltmkqwtnrdlacqv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret>
GOOGLE_MAPS_API_KEY=<secret>
```

---

## 3. Supabase Edge Functions (`supabase/functions/`)

Deno-based serverless functions deployed to Supabase. All AI calls go through these — API keys never touch the client.

### Shared Utilities (`_shared/`)

| File | Purpose |
|------|---------|
| `cors.ts` | CORS headers + preflight response |
| `ai-clients.ts` | AI provider factories: `callOpenAI()` (GPT-4.1 mini/nano), `callGemini()` (Flash/Flash-Lite), `callClaude()` (any Claude model). All with AbortController timeout. |
| `supabase-admin.ts` | Service-role Supabase client for edge functions |

### Edge Functions

| Function | AI Model | Purpose | Cost/call |
|----------|----------|---------|-----------|
| `generate-pulse` | Gemini 2.5 Flash-Lite | City pulse blurb (bilingual), cached 3h in `city_pulse` table | ~$0.002 |
| `smart-search` | GPT-4.1 nano | NL query → structured filters or conversational recommendation | ~$0.001 |
| `surprise-me` | GPT-4.1 mini | 2-3 stop micro-plan from available venues | ~$0.003 |
| `generate-plan` | GPT-4.1 mini (SSE) | Full evening planner with streaming response | ~$0.007 |
| `translate-scene` | Gemini 2.5 Flash (vision) | Camera OCR → Bosnian text translation with cultural context | ~$0.005 |
| `enrich-descriptions` | GPT-4.1 mini (configurable) | Batch venue description generation, grounded in Google data | ~$0.003/venue |
| `parse-instagram` | Claude Haiku 4.5 | Instagram caption → structured event extraction | ~$0.002 |
| `analyze-venue-photo` | Gemini 2.5 Flash (vision) | Venue photo classification (tags, quality, description) | ~$0.005 |

### Edge Function Conventions

- Always return HTTP 200 with `{ success: true/false, data/error }` envelope
- CORS headers on all responses, OPTIONS returns `corsResponse()`
- 20s AbortController timeout (45s for Sonnet-class models)
- JSON fence stripping: `text.replace(/```json\n?/g, '').replace(/```\n?/g, '')`
- `Deno.serve(async (req) => { ... })` pattern
- `npm:` prefix for npm imports in Deno

### Secrets (set in Supabase Dashboard → Edge Functions → Secrets)

```
OPENAI_API_KEY
ANTHROPIC_API_KEY
GOOGLE_AI_API_KEY
GOOGLE_MAPS_API_KEY
SUPABASE_URL (auto-set)
SUPABASE_SERVICE_ROLE_KEY (auto-set)
```

---

## 4. Client-Side AI Helpers (`utils/ai/`)

Thin wrappers that the Expo app uses to call edge functions.

| Helper | Edge Function | Features |
|--------|--------------|----------|
| `edgeFunctionClient.ts` | — | Base layer: `invokeEdgeFunction()` (standard) + `streamEdgeFunction()` (SSE) |
| `cityPulse.ts` | `generate-pulse` | 3h client-side cache, `clearCityPulseCache()` for invalidation |
| `smartSearch.ts` | `smart-search` | Returns `SmartSearchResult` with mode/filters/response |
| `surpriseMe.ts` | `surprise-me` | Returns `SurprisePlan` with stops + taglines |
| `planGenerator.ts` | `generate-plan` | SSE accumulator, parses streaming JSON into `EveningPlan` |
| `translate.ts` | `translate-scene` | Sends base64 image, returns `TranslationResult` |
| `planPersistence.ts` | — (direct Supabase) | `savePlan()` / `loadLatestPlan()` for ai_plans table |

---

## 5. Data Quality Pipeline

Scripts that run in sequence to ensure venue data accuracy:

```
1. verifyCategoriesVsGoogle.ts    Check categories against Google Maps types
         │                         (found 162 mismatches, auto-fixed)
         ▼
2. scrapeGooglePhotos.ts          Pull cover photos from Google Maps
         │                         (958/1000 venues covered)
         ▼
3. enrichFromGoogle.ts            Pull ratings, reviews, editorial, hours
         │                         (960/1060 venues got reviews)
         ▼
4. enrichDescriptions.ts          AI generates bilingual descriptions
         │                         grounded in real Google data
         ▼
5. Admin Venue Editor             Human reviews and corrects
   (admin/ Vite app)              (deployed to Vercel)
```

### Quality Rules Enforced in AI Prompt

- Bosnian uses ijekavica only ("umjetnost" not "umetnost")
- Latin script only, never Cyrillic
- Correct noun declension ("na Markalama" not "na Markaleima")
- Mandatory diacritics (š, č, ć, ž, đ)
- No English/foreign language mixing in Bosnian field
- Grounded in Google visitor reviews, not hallucinated
- Venue's established Bosnian name used when available

---

## 6. Admin Tools

### Venue Editor (`admin/`)

Standalone Vite + React app deployed to Vercel. Features:
- Supabase email/password auth
- Searchable, filterable venue table (1000+ venues)
- Green/red status dots for: EN description, BS description, photo, Google reviews
- Inline editing with Google context panel (editorial + reviews)
- Direct Supabase writes via RLS policy
- Keyboard navigation (Arrow Up/Down)
- Dark theme matching Hype brand

### Supabase Dashboard

Direct SQL access for:
- Schema migrations
- RLS policy management
- Edge function logs
- Secret management

---

## Architecture Decision: Why Edge Functions for AI?

1. **API keys stay server-side** — never in the client bundle
2. **Provider flexibility** — switch models per function without app update
3. **Cost control** — cheapest model per task (nano for search, mini for planning, Haiku for prose)
4. **Caching** — server-side cache (city_pulse 3h TTL) saves API costs
5. **SSE streaming** — generate-plan streams through edge function to client
6. **Same pattern as industry** — Yelp (LLM Gateway), TripAdvisor (RAG pipeline), Airbnb (SSE streaming)
