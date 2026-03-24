# Look x Visit Sarajevo — Scaled-Down Initial Proposal

_"Skromniji pristup, dugoročna saradnja" — as advised by the tourist board_

_Prepared 2026-03-24_

---

## Context

The full development value of Look is **~108,000 KM** (BiH rate). The tourist board's budget has been cut, and they advise:
- Start modest, build the partnership over time
- Full funding request can go in **September**
- They want something **live by May** for tourist season
- Direct partnership — no public procurement (JP)

## Proposal: Phase 1 — "Look Lite" for Summer 2026

### What We Deliver by May

A production-ready mobile app (iOS + Android) + web widget with:

| Feature | Status | Remaining Work |
|---------|--------|----------------|
| 1,226 verified Sarajevo venues | **Done** | — |
| Live events from 3 sources (Pozorista, AllEvents, KupiKartu) | **Done** | Automate scraping schedule |
| Bilingual BS/EN interface | **Done** | — |
| AI City Pulse ("What's happening now") | **Done** | — |
| AI Evening Planner | **Done** | — |
| Smart Search (natural language) | **Done** | — |
| Mood-based discovery (6 moods) | **Done** | — |
| Visit Sarajevo branding + logo | **Done** | Final placement polish |
| Heritage walking routes | **80% done** | Map integration |
| Web widget for VisitSarajevo.ba | **New** | 2–3 weeks (see doc 03) |
| App Store submission (iOS + Android) | **Ready** | Store listings, screenshots, review |
| KupiKartu ticket deep-links | **Built** | Verify link format |

### What We Defer to Phase 2 (September+)

- Push notifications
- Visitor passport / gamification
- Venue claim & submission flows
- "Right Now" live mode
- Advanced analytics dashboard
- Offline mode
- Instagram rail on Home screen

### What Visit Sarajevo Gets Immediately

1. **"Look" on their homepage** — embeddable web widget showing live events + venues
2. **AI-powered tourist info** — visitors search in natural language, get instant answers
3. **Their content comes alive** — heritage walks, venue descriptions, events become interactive
4. **Data they don't have** — 1,226 verified venues with hours, photos, categories, AI descriptions
5. **Branding throughout** — Visit Sarajevo logo, attribution, transport directions

---

## Proposed Budget: Phase 1

### Option A: Minimal — "Cover Our Costs" (~3,000–5,000 KM)

This covers 3 months of infrastructure + App Store fees:

| Item | 3 Months | KM |
|------|----------|-----|
| Supabase Pro (3 mo) | $75 | 147 KM |
| Vercel Pro (3 mo) | $60 | 118 KM |
| Apify Starter (3 mo) | $147 | 288 KM |
| AI APIs (3 mo, pilot) | $36 | 71 KM |
| Apple Developer (annual) | $99 | 194 KM |
| Google Play (one-time) | $25 | 49 KM |
| Claude Max (3 mo) | $300 | 588 KM |
| App Store screenshots + listings | — | 200 KM |
| **Total** | | **~1,655 KM** |

Round up to **3,000–5,000 KM** to include minimal developer compensation for the remaining App Store readiness work (~40–60 hours at subsidized rate).

> **Message to tourist board**: "We're investing our own development time. We just need infrastructure costs covered to go live by May."

### Option B: Fair Start — Partnership Launch (~8,000–12,000 KM)

Covers infrastructure + focused development for web widget + store readiness:

| Item | KM |
|------|-----|
| Infrastructure (3 months) | 1,655 KM |
| Web widget development (see doc 03) | 3,000 KM |
| App Store readiness + submission | 2,000 KM |
| Heritage walk map completion | 1,000 KM |
| Testing + QA on 10+ devices | 1,500 KM |
| **Total** | **~9,155 KM** |

Rounded: **8,000–12,000 KM** depending on scope confirmation.

### Option C: Full Phase 1 — (~15,000–20,000 KM)

Everything above plus:

| Item | KM |
|------|-----|
| Option B | ~10,000 KM |
| Push notifications setup | 2,500 KM |
| Automated scraping pipeline | 2,500 KM |
| Admin dashboard for Visit Sarajevo | 3,000 KM |
| Content moderation tools | 2,000 KM |
| **Total** | **~20,000 KM** |

---

## Timeline

| Week | Deliverable |
|------|------------|
| **W1** (Mar 24–30) | Web widget prototype, finalize App Store assets |
| **W2** (Mar 31–Apr 6) | Web widget connected to live data, heritage walks complete |
| **W3** (Apr 7–13) | App Store submission (iOS + Android), widget deployed to staging |
| **W4** (Apr 14–20) | App Store review period, widget integration with VisitSarajevo.ba |
| **W5** (Apr 21–27) | QA pass, bug fixes, soft launch |
| **W6** (May 1–) | **Live for tourist season** |

---

## September Request (Phase 2)

In September, with summer data (downloads, usage, tourist feedback), we request the remaining investment for:
- Full feature set (gamification, push notifications, offline)
- 12-month infrastructure + API costs
- Ongoing content curation and moderation
- Marketing materials

**Estimated Phase 2 budget**: 30,000–50,000 KM (supported by real usage data from summer)

---

## KupiKartu Integration

The tourist board suggested connecting with KupiKartu. This is **already built**:
- KupiKartu is one of our 3 event scraping sources
- 93 raw events already scraped from kupikratu.ba
- Events include ticket links that deep-link back to KupiKartu for purchase
- City-filtering ensures only Sarajevo events are imported

**What we can offer KupiKartu**: Their events get visibility in Look, users tap "Kupi kartu" and land on their purchase page. Win-win with zero integration cost on their side.

---

## Key Selling Points for the Board

1. **90% of the app is already built** — this is not a promise, it's a product
2. **Infrastructure cost is absurdly low** — 430 KM/month runs the whole thing
3. **AI features are a differentiator** — no other city app in the region has this
4. **Ready by May** — 6-week sprint to production
5. **No JP risk** — direct partnership, they control scope
6. **September gives leverage** — real data to justify larger investment
