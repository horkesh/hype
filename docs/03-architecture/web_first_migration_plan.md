# Web-first migration plan

Target architecture: Solito-style monorepo with Next.js for web + Expo for mobile, sharing business logic and a universal UI layer (Tamagui).

The web app becomes the primary product surface; mobile remains a first-class consumer of the same shared packages, ready to ship later without forking code.

---

## Pre-flight decisions (researched, locked)

Each call below was tested against the actual state of the ecosystem in Feb 2026 — not training-data defaults.

### 1. Package manager → **pnpm 10**

Bun is ~4× faster on cold installs but has compatibility edge cases in RN + Next monorepos. pnpm has battle-tested workspace support, dominant adoption (65M weekly downloads vs Bun's small CLI share), and is what [Expo's official monorepo example](https://github.com/byCedric/expo-monorepo-example) uses. Stability > raw speed at this stage.

### 2. Web framework → **Next.js 15+ App Router with React 19 + RSC**

Not One (Nate Wienert's Vite-based universal framework). One is interesting and Lighthouse-100-capable, but it's v1 RC — newer and less battle-tested than Next.js, and would burn risk budget that should be spent on the actual product. Next.js App Router + RSC is the safer call and pairs cleanly with Supabase SSR.

### 3. Universal UI layer → **Tamagui v1.144 (stable line)**, NOT NativeWind

This was the most-researched call. Three options seriously considered:

- **NativeWind v4** — most popular (~403k weekly downloads) but [explicitly doesn't support RSC yet](https://www.nativewind.dev/docs/getting-started/installation/nextjs): "Only works with /pages router or 'use client' routes, RSC support is in progress." For a web-first SEO product where every venue/event page is server-rendered, that's a structural blocker — we'd lose RSC's whole value prop.
- **Unistyles 3.0** — production-stable since July 2025, Nitro Modules-backed, type-safe. But Next.js documentation is thin and the SSR story is less battle-tested. Better fit for mobile-first projects.
- **Tamagui v1.144** — explicit RSC + Next.js App Router + React 19 support. Animation drivers, themes, responsive styles all work server-rendered without flicker. [Official Next.js setup guide](https://tamagui.dev/docs/guides/next-js) is current. Lower adoption (~75k weekly) but it's the canonical choice for the universal-Next-Expo stack.

**Tamagui v2 deliberately NOT chosen** despite being available (rc.38+) — many RCs signal hardening, but production launch on a not-yet-stable major is unnecessary risk when v1 is actively maintained. Upgrade once v2 hits stable; the v1→v2 path is documented.

**Solo-maintainer risk** is the real concern (Tamagui is Nate Wienert + commercial offerings funding the work). Mitigation: Tamagui's primitives are thin wrappers around RN-Web + CSS — worst case is forking to maintain ourselves, not throwing away the codebase.

### 4. Cross-platform navigation → **Solito 5**

[Vercel acquired Solito](https://x.com/FernandoTheRojo/status/1963261649793712500); Fernando Rojo is Vercel's Head of Mobile. Solito 5 dropped its RN-Web dependency and now re-exports Next.js components directly on web — much lighter than earlier versions. Use Solito's `<Link>` and `useRouter` everywhere so screens don't fork navigation logic between platforms. Comes pre-wired in the [`tamagui/starter-free`](https://github.com/tamagui/starter-free) template.

### 5. Supabase client → **`@supabase/ssr` with new key format**

Per [Supabase's 2026 SSR guide](https://supabase.com/docs/guides/auth/server-side/nextjs): `createBrowserClient` for client components, `createServerClient` for server components, middleware to refresh expired tokens (server components can't write cookies). Migrate to the new `sb_publishable_xxx` / `sb_secret_xxx` key format — old `anon` / `service_role` keys deprecate end of 2026.

### 6. URL + language strategy → **Bosnian-default at `/`, English mirror at `/en/...`**

Primary market is BiH locals + diaspora who search in Bosnian; tourist English audience is secondary but real. Mirrored URL trees rank better than language-as-query-param — Google's [own statistics show 60% of multilingual sites have hreflang errors](https://generaltranslation.com/en-US/blog/multilingual-nextjs-seo), so we ship hreflang via both Next.js metadata API's `alternates.languages` AND the XML sitemap (the most reliable delivery method). Slugs stay language-neutral (`cinemas-sloga`).

---

## Phase 0 — Monorepo restructure

Single atomic PR, no behavior change.

```
look/
├─ apps/
│  ├─ mobile/          (current root — Expo app)
│  ├─ web/             (new — Next.js 15 App Router)
│  └─ admin/           (current admin/ — Vite + React, untouched)
├─ packages/
│  ├─ shared/          (utils, types, supabase client, AI clients, helpers)
│  └─ ui/              (Tamagui config + universal components)
├─ backend/            (unchanged)
├─ supabase/           (unchanged)
└─ docs/               (unchanged)
```

**Deliverable**: `pnpm install && pnpm dev:mobile && pnpm dev:web` boot both apps. Mobile is functionally identical. Web is the Next.js starter. CI runs both builds + tests.

---

## Phase 1 — UI primitive set

Build the smallest universal component library that can render the most complex screen.

Primitives in `packages/ui`: `Stack`, `Box`, `Text`, `Heading`, `Button`, `Card`, `Input`, `Image`, `Link`, `Spinner`, `Modal`, `Sheet`.

Port existing color tokens, type scale, gold/black palette into `tamagui.config.ts`.

**Deliverable**: hello-world pages in `apps/web` and `apps/mobile` render all 12 primitives identically.

---

## Phase 2 — One screen, end-to-end (proof of concept)

Pick **venue detail** as the proof. Hardest screen → if Tamagui handles it cleanly, everything else follows.

- `apps/web/app/lokacija/[slug]/page.tsx` server-renders via `getServerSupabase()`.
- Page composition uses `packages/ui` primitives.
- Re-implement the mobile venue detail screen with the same composition.

**Deliverable**: same `<VenueDetailContent>` component renders correctly on both apps. View source on web shows real HTML with title, OG tags, JSON-LD. Mobile screen visually unchanged.

---

## Phase 3 — SEO foundation (parallel with Phase 2)

Non-screen-specific work that unblocks the rest.

- **Event slugs**: add `slug text unique` to `events` table, backfill, update `promoteEvents.ts` to generate on insert.
- **`getServerSupabase()`** + **`getBrowserSupabase()`** helpers via `@supabase/ssr`. Cookie-based session for server components.
- **`generateMetadata`** per route — title, description, OG image, Twitter card, per-language alt tags.
- **JSON-LD components**: `<VenueJsonLd>` emits `LocalBusiness`; `<EventJsonLd>` emits `Event` with offers/prices/location. Validate via Google's Rich Results test.
- **`sitemap.ts`** dynamic — queries Supabase at build, revalidates every 6h.
- **`robots.txt`** — production allow, preview deployments noindexed.
- **OG image generation** via Next.js `ImageResponse` (Edge runtime). 1200x630 with venue name + cover. Default fallback when `cover_image_url` is null.

---

## Phase 4 — Port remaining screens

Order = highest SEO value first.

1. Venue detail *(done in Phase 2)*
2. Event detail
3. Venues list (with category + neighborhood filters)
4. Events list (tonight / this week / weekend / all)
5. Home (hero, pulse, suggested venues)
6. Series / heritage walks / wellness verticals
7. Saved (favorites) — auth-gated, low SEO
8. Profile + auth — last; conversion follows discovery

Per screen:
- Data fetch in `packages/shared`
- View composition in `packages/ui`
- Web wrapper in `apps/web/app/...`
- Mobile wrapper in `apps/mobile/app/...`

**Acceptance per screen**: both apps render correctly, web has correct metadata, Lighthouse >90 on performance + SEO + a11y.

---

## Phase 5 — Performance + polish

After all screens land:

- **LCP <2.5s** on 4G
- **CLS <0.1**
- **<250KB** initial JS for top routes
- Images via Next/Image with Supabase CDN as remote pattern
- Fonts via `next/font/local`, `display: swap`
- **ISR**: 1h revalidation for venue pages, 5min for event pages
- **Edge middleware** for language detection (Accept-Language → `/en/...` redirect)
- **PWA manifest + service worker** (Workbox / Serwist). Offline shell + cached venue/event pages

---

## Phase 6 — Web ops

- **Sentry** for both apps via shared init in `packages/shared`
- **Plausible** (privacy-first, EU-hosted) or PostHog (if you want funnels + session replay)
- **Custom domain** on Vercel — HSTS, www → apex, cache headers on `/_next/static/*`
- **Search Console** verification, sitemap submission
- **Preview deployments** noindexed via `x-robots-tag` middleware
- **404 + error pages** matching brand
- **Sentry alerts**: 1% error rate over 1h → Slack ping

---

## Phase 7 — Mobile reunification

- Native-only surfaces (push notifications, native share sheets, deep links) get platform implementations behind shared interfaces in `packages/shared`
- TestFlight build → Play Console internal track → ship

---

## What stays unchanged

- **Backend Node service** (`backend/`)
- **Supabase edge functions**
- **All RLS policies and RPCs**
- **IG scraper + promoter pipeline**
- **Admin app** at look-admin.vercel.app — stays as `apps/admin`, never ported. Different audience, different surface, already RLS-protected.

---

## Critical risks + mitigations

| Risk | Mitigation |
|---|---|
| Tamagui can't handle a screen-specific need | Phase 2 builds the hardest screen first. Discover at week 2, not week 8. |
| Supabase SSR session refresh edge cases | Build `getServerSupabase()` + integration tests in Phase 3 before any auth-gated screen ports. |
| Bundle bloat from universal `<Image>` shipping to web | Tamagui ships `<Image>` as `<img>` on web by default; verify in Phase 5 bundle analyzer; platform-fork only where needed (`Image.web.tsx` / `Image.native.tsx`). |
| SEO migration timing — Google indexing the old client-rendered URLs poisons future ranking | Don't let old `hype-alpha.vercel.app` URLs live alongside the new domain. 301 redirect every old URL to the new equivalent the moment Phase 4 lands. Keep `noindex` on the legacy domain until cutover. |
