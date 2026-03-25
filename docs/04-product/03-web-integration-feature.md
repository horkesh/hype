# Look — Web Integration for Visit Sarajevo

_"Oni bi stavili Look na home page" — Tourist board request_

_Prepared 2026-03-24_

---

## What They Asked For

The tourist board wants to **connect Look with their website** so that:
1. Live information from Look is visible on VisitSarajevo.ba
2. Look appears on their homepage
3. Data updates in real-time (events, venues, what's happening)

## Proposed Solution: Embeddable Web Widget

### Concept

A lightweight, embeddable widget that Visit Sarajevo drops onto their homepage with a single `<script>` tag. It pulls live data from our Supabase backend and renders a beautiful, branded panel.

```html
<!-- Drop this on any page -->
<script src="https://look-widget.vercel.app/embed.js"
        data-theme="light"
        data-locale="bs"
        data-partner="visit-sarajevo">
</script>
<div id="look-sarajevo-widget"></div>
```

### What the Widget Shows

#### Tab 1: "Danas u Sarajevu" (Today in Sarajevo)
- AI City Pulse headline (what's happening right now)
- Current weather
- Top 3–5 events happening today
- Each event links to Look app (deep link) or Look web

#### Tab 2: "Popularna mjesta" (Popular Places)
- Trending venues (based on check-in data)
- Category filter chips (Kafane, Restorani, Kultura, Noćni život...)
- Each venue card shows: photo, name, category, rating indicator
- Tap → opens Look web or app

#### Tab 3: "Večeras" (Tonight)
- Tonight's events and venue highlights
- "Planiraj večer" CTA → opens Look's AI Evening Planner on web

### Technical Architecture

```
VisitSarajevo.ba
    │
    ├── <script> embed.js (hosted on Vercel)
    │       │
    │       ├── Fetches from Look API (Supabase REST)
    │       │     ├── GET /rest/v1/events?date=today
    │       │     ├── GET /rest/v1/venues?trending=true
    │       │     └── GET /rest/v1/rpc/city_pulse (Edge Function)
    │       │
    │       └── Renders in shadow DOM (no CSS conflicts)
    │
    └── Styling: matches Visit Sarajevo brand OR Look's glass theme
```

### Implementation Options

#### Option A: Iframe Embed (Fastest — 1 week)

- Build a dedicated `/widget` route in the existing Expo Web app
- Visit Sarajevo embeds it as an iframe
- Responsive, auto-resizing
- Pros: Fastest, reuses existing components
- Cons: Less flexible styling, iframe quirks

#### Option B: Standalone Widget (Recommended — 2–3 weeks)

- Lightweight Preact/vanilla JS widget (~30 KB)
- Shadow DOM for style isolation
- Direct Supabase REST API calls
- Customizable theme (light/dark, brand colors)
- Pros: Professional, fast-loading, no iframe
- Cons: Separate build, some component duplication

#### Option C: Full Web App Link (Simplest — already done)

- Look already deploys to `hype-alpha.vercel.app` as a PWA
- Visit Sarajevo links to it from their homepage
- Pros: Zero additional work
- Cons: Not "embedded" — it's just a link

### Recommended: Option B with Option C as interim

Ship **Option C immediately** (it's free — just a link) while building **Option B** over 2–3 weeks.

---

## Data Flow

### Real-Time Updates

The widget doesn't need WebSockets — the data changes at most a few times per day:

| Data Type | Update Frequency | Caching Strategy |
|-----------|-----------------|------------------|
| Events | Every 6 hours (scraper runs) | CDN cache, 30-min TTL |
| Venues | Daily (new additions rare) | CDN cache, 1-hour TTL |
| City Pulse | Every 30 min (AI-generated) | Edge cache, 30-min TTL |
| Weather | Every 30 min (OpenWeather) | Client cache, 30 min |
| Trending | Every hour (check-in aggregation) | CDN cache, 1-hour TTL |

### API Endpoints Needed

Most already exist in Supabase:

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /rest/v1/events` | **Exists** | Filter by date, city |
| `GET /rest/v1/venues` | **Exists** | Filter by category, trending |
| `POST /rest/v1/rpc/generate-pulse` | **Exists** | City Pulse Edge Function |
| `GET /widget/config` | **New** | Widget configuration (partner branding) |
| `GET /widget/today` | **New** | Aggregated "today" snapshot for widget |

Only 2 new lightweight endpoints needed — an aggregated "today" view and a config endpoint.

---

## Visit Sarajevo Branding

The widget can be styled to match their site:

```js
// Widget configuration
{
  theme: "light",              // or "dark" for Look's glass theme
  accentColor: "#1a5f3a",      // Visit Sarajevo green
  logo: "visit-sarajevo",      // Show their logo in header
  locale: "bs",                // Default to Bosnian
  maxEvents: 5,                // Number of events to show
  showWeather: true,
  showCityPulse: true,
  ctaText: "Otvori u Look",   // Call-to-action text
  ctaUrl: "https://look-sarajevo.app"  // Or deep link
}
```

---

## Effort Estimate

| Task | Hours | Notes |
|------|-------|-------|
| Widget shell + shadow DOM | 8 | Preact, build pipeline |
| "Today" aggregated API endpoint | 4 | Supabase function |
| Events tab | 6 | Card design, filtering, links |
| Venues tab | 6 | Trending logic, category chips |
| Tonight tab | 4 | Evening events + planner CTA |
| City Pulse integration | 3 | Fetch + render AI headline |
| Theming system (light/dark/custom) | 4 | CSS variables, partner config |
| Responsive design | 4 | Mobile/tablet/desktop |
| Deep linking (widget → app/web) | 3 | Universal links |
| Testing + polish | 6 | Cross-browser, Visit Sarajevo site test |
| **Total** | **~48 hours** | **~2.5 weeks** |

At BiH rate (30 EUR/hr): **~1,440 EUR / ~2,820 KM**

---

## KupiKartu Connection

The widget naturally integrates KupiKartu:
- Events scraped from KupiKartu appear in the widget
- Each event card shows a "Kupi kartu" button
- Tapping it deep-links to the KupiKartu purchase page
- Visit Sarajevo's site becomes a **one-stop shop**: see what's on → buy tickets → plan evening

This is exactly what the tourist board wants — their website becomes the hub.

---

## Deployment

| Step | Details |
|------|---------|
| Hosting | Vercel (same project, `/widget` route or separate) |
| CDN | Vercel Edge Network (global, fast) |
| SSL | Automatic via Vercel |
| Domain | `widget.look-sarajevo.app` or subdirectory |
| Monitoring | Vercel Analytics (free tier) |

**Monthly cost**: $0 additional (covered by existing Vercel Pro plan).

---

## Summary

| What | Details |
|------|---------|
| **Deliverable** | Embeddable JS widget for VisitSarajevo.ba homepage |
| **Shows** | Live events, trending venues, AI city pulse, tonight's picks |
| **Build time** | 2–3 weeks |
| **Cost** | ~2,820 KM development, $0/mo additional hosting |
| **Interim** | Link to existing Look PWA (available immediately) |
| **Bonus** | KupiKartu ticket links built-in |
