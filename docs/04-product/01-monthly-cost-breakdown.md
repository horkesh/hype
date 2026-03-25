# Look — Monthly Operating Costs

_Prepared 2026-03-24 — post-pitch to Visit Sarajevo tourist board_

## 1. Fixed Subscriptions (Monthly)

| Service | Plan | Monthly (USD) | Monthly (KM) | What it covers |
|---------|------|---------------|--------------|----------------|
| **Claude Max** (Anthropic) | Max plan | $200 | ~392 KM | Development via Claude Code CLI — the engine behind 90% of the codebase |
| **Supabase** | Pro | $25 | ~49 KM | Database, Auth, Edge Functions, Storage (10+ tables, 8 migrations, RLS) |
| **Vercel** | Pro | $20 | ~39 KM | Web hosting (PWA) + admin panel deployment |
| **Apple Developer** | Annual ($99/yr) | ~$8.25 | ~16 KM | iOS App Store listing (required) |
| **Google Play** | One-time ($25) | ~$2.08 | ~4 KM | Android Play Store listing (amortized/yr) |
| **Domain + DNS** | Annual | ~$3 | ~6 KM | Custom domain for web + API |
| | | | | |
| **Subtotal Fixed** | | **~$258/mo** | **~506 KM/mo** | |

## 2. Usage-Based Services (Monthly, by user scale)

### AI API Costs (Blended Multi-Provider Mix)

Current model assignments:
- **City Pulse**: Gemini 2.5 Flash-Lite (near-free with caching)
- **Tonight AI Planner**: Claude Sonnet 4.5 (best Bosnian prose)
- **Surprise Me**: Claude Sonnet 4.5
- **Natural Language Search**: GPT-4.1 Nano (cheapest structured output)
- **Hero Image Generation**: Imagen 4.0 Fast → fallback chain
- **Instagram Caption Parsing**: Claude Haiku 4.5
- **Venue Descriptions**: Claude Haiku 4.5 (batch, one-time)

| User Tier | MAU | Sessions/mo | AI Cost/mo (USD) | AI Cost/mo (KM) |
|-----------|-----|-------------|------------------|-----------------|
| **Demo / Pilot** | 50–100 | 3,000 | ~$12 | ~24 KM |
| **Launch** | 500 | 15,000 | ~$60 | ~118 KM |
| **Growth** | 1,000 | 30,000 | ~$120 | ~235 KM |
| **Scale** | 5,000 | 150,000 | ~$600 | ~1,176 KM |

> At 1,000 MAU the entire AI layer costs less than **one coffee per day** in Sarajevo.

### Apify (Web Scraping)

| Usage | Monthly (USD) | Monthly (KM) | Notes |
|-------|---------------|--------------|-------|
| **Starter** | $49 | ~96 KM | Instagram scraping (189 venues), event sources |
| **Scale (if needed)** | $149 | ~292 KM | Only if scraping frequency increases significantly |

Current scraping targets:
- **Instagram**: 50+ curated venue accounts via `apify~instagram-scraper`
- **Events**: Pozorista.ba, AllEvents.in, KupiKartu.ba (custom scrapers, no Apify cost)

### OpenAI API

| Usage | Monthly (USD) | Monthly (KM) | Notes |
|-------|---------------|--------------|-------|
| GPT-4.1 Nano + Mini | ~$5–20 | ~10–39 KM | Search + planner (low volume at pilot) |

### Google Cloud (Gemini + Imagen)

| Usage | Monthly (USD) | Monthly (KM) | Notes |
|-------|---------------|--------------|-------|
| Free tier | $0 | 0 KM | 250 RPD Flash, 1000 RPD Flash-Lite covers pilot |
| Growth | ~$10–30 | ~20–59 KM | Hero images + city pulse beyond free tier |

### Anthropic API (Claude Haiku / Sonnet)

| Usage | Monthly (USD) | Monthly (KM) | Notes |
|-------|---------------|--------------|-------|
| Pilot | ~$5–15 | ~10–29 KM | Caption parsing, planner, descriptions |
| Growth (1K MAU) | ~$60–80 | ~118–157 KM | Scales with planner + surprise-me usage |

## 3. Total Monthly Cost Scenarios

### Scenario A: Pilot Phase (pre-launch, demo, 50–100 users)

| Category | USD | KM |
|----------|-----|-----|
| Fixed subscriptions | $258 | 506 KM |
| AI APIs (blended) | $12 | 24 KM |
| Apify | $49 | 96 KM |
| **Total** | **~$320/mo** | **~626 KM/mo** |

### Scenario B: Launch (500 MAU, summer season)

| Category | USD | KM |
|----------|-----|-----|
| Fixed subscriptions | $258 | 506 KM |
| AI APIs (blended) | $60 | 118 KM |
| Apify | $49 | 96 KM |
| **Total** | **~$370/mo** | **~725 KM/mo** |

### Scenario C: Growth (1,000 MAU)

| Category | USD | KM |
|----------|-----|-----|
| Fixed subscriptions | $258 | 506 KM |
| AI APIs (blended) | $120 | 235 KM |
| Apify | $49 | 96 KM |
| **Total** | **~$430/mo** | **~840 KM/mo** |

### Scenario D: Scale (5,000 MAU)

| Category | USD | KM |
|----------|-----|-----|
| Fixed subscriptions | $258 | 506 KM |
| AI APIs (blended) | $600 | 1,176 KM |
| Apify | $149 | 292 KM |
| **Total** | **~$1,010/mo** | **~1,975 KM/mo** |

## 4. One-Time / Occasional Costs

| Item | Cost | Notes |
|------|------|-------|
| EAS Build (Expo) | Free tier covers dev builds | Paid only if >30 builds/mo |
| Apify initial scrape | ~$20–50 one-time | Full Instagram backfill of 189 venues |
| Google Places API | ~$10–20 one-time | Category verification + photo enrichment (done) |

## 5. What's NOT Included (Human Labor)

| Role | Purpose |
|------|---------|
| Developer (Haris) | Ongoing development, bug fixes, new features |
| Business / Partnerships (Berina) | Tourist board liaison, content curation, QA |
| Content moderation | Venue/event approval (partially automated via admin panel) |

---

## Key Insight

The entire technical infrastructure for Look costs **625–840 KM/month** at launch scale. This is remarkably lean for an app with 8 AI features, 1,226 venues, live event scraping, and bilingual support. The AI cost scales linearly and predictably — no surprises.
