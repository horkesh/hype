# Web SEO pipeline

How the website at `hype-alpha.vercel.app` is built and where SEO metadata
lives. Read this first if you're about to touch anything web-facing.

## What the web build is — and what it isn't

The website is **not** a separate Next.js app. It is the same `apps/mobile`
Expo Router app, statically pre-rendered for the browser. The mobile UI
runs on react-native-web with full visual parity to iOS/Android. There is
no `apps/web/`, no `packages/ui/`, no `packages/shared/` — those were
removed on 2026-05-22 after the web-first migration plan was abandoned.

## The two-step pipeline

`apps/mobile/package.json` defines:

```
"build:web": "expo export -p web && node scripts/inject-seo.mjs"
```

### Step 1 — Expo static export

`expo export -p web` runs Expo Router's **static rendering** mode
(configured via `web.output: 'static'` in `app.config.ts`). For each app
route it produces one HTML file in `apps/mobile/dist/`.

For dynamic routes (`venue/[id]`, `event/[id]`), each route file exports a
`generateStaticParams()` that hits Supabase and returns every active
venue / upcoming approved event id. Expo writes one HTML per id at
`/venue/<uuid>.html` and `/event/<uuid>.html`.

**Critical gotcha:** Expo only renders the `[id]` template component
**once** and copies the same rendered HTML to every emitted URL. The
files are byte-identical at this stage — they differ only in their path
on disk. Per-id metadata cannot be inserted from the screen component,
because the screen runs once and is reused.

### Step 2 — `scripts/inject-seo.mjs`

A plain Node script that runs after the Expo export. It:

1. Parses `apps/mobile/.env` itself (the Expo CLI auto-loads it, but
   plain `node` does not).
2. Bulk-fetches all active venues and all upcoming approved events from
   Supabase.
3. For each row, opens the corresponding `dist/venue/<id>.html` or
   `dist/event/<id>.html` and rewrites the `<head>`:
   - Replaces the empty `<title data-rh="true"></title>` placeholder.
   - Injects `<meta name="description">`, `<link rel="canonical">`,
     OG (title / description / type / url / image), Twitter card, and
     Schema.org JSON-LD (LocalBusiness for venues, Event for events).
4. Also rewrites the top-level static routes (home, wellness, explore,
   tonight) from a hardcoded map at the bottom of the file.

After this script runs, `dist/` is a fully SEO-ready static site that
Vercel can serve verbatim.

## What gets indexed

Googlebot and the social OG bots see:

- **`<head>` per route** — fully populated, with real per-venue and
  per-event metadata. This is what Twitter, Facebook, WhatsApp, LinkedIn
  use for link previews, and what shows up in Google search result
  snippets.
- **Page body** — an empty React root that hydrates client-side from
  the JS bundle. Googlebot executes JS during rendering and will index
  the actual content (venue cards, event details, etc.) — but with a
  render budget. Twitter/Facebook OG bots do **not** execute JS; they
  only get the `<head>`, which is exactly what they need.

This is **not** true SSR. The body content does not exist in the HTML
before JS runs. For competitive search ranking on listing pages, true
SSR (Expo SDK 55+ with data loaders) would be better; not adopted yet
since SDK 55 is alpha.

## When to touch which file

| Task | File |
|---|---|
| Add a new `<head>` field (e.g. `og:video`, hreflang alternates) | `scripts/inject-seo.mjs` |
| Add a new dynamic route that needs SEO (e.g. `/series/[id]`) | Add `generateStaticParams` to that route file **and** an `injectSeries` function + per-id rewrite loop in the script |
| Change which venues/events get HTML files | `generateStaticParams` in the relevant `app/[thing]/[id].tsx` |
| Change which venues/events get *metadata* (must match the above) | The Supabase select inside the corresponding `inject<Thing>s` function in the script |
| Change a top-level page's title/description | The `STATIC_TOPS`-like map at the bottom of the script |

**Do not** try to inject metadata via `expo-router/head` from inside the
screen component. The component renders once, gets copied to N URLs, and
its `<head>` writes only land in the template — useless for per-id SEO.

## Env vars

Both the build and the injector read:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Set in Vercel project settings on `hype` (production + preview). For
local dev, `apps/mobile/.env` is loaded by Expo and (after `inject-seo`
reads it manually) by the injector.

## Adding new venues to production

The HTML files are baked at build time. A venue added to Supabase **does
not exist on the website** until the next build runs.

Triggers for rebuild:
- Any push to `main` triggers a Vercel production build.
- Manual rebuild via the Vercel dashboard ("Redeploy" on the latest
  deployment).
- Not yet wired: a Supabase webhook → Vercel deploy hook. That would
  fully automate the "new venue appears on the web" loop.

Build cost: ~3–4 minutes for ~1000 venues + 40 events. Build minutes on
Vercel are billed at the project level.

## Deploy target

The `hype` Vercel project is the only deployment target.
- Production alias: `hype-alpha.vercel.app`.
- Project root reads from the repo root via the top-level `vercel.json`
  which sets `buildCommand: pnpm --filter @look/mobile build:web`,
  `outputDirectory: apps/mobile/dist`.
- An earlier `look-web` Vercel project (which built the abandoned
  Next.js app) was deleted on 2026-05-22.

## History

The current architecture is the third iteration. The first (PR #3) built
a parallel Next.js app with universal Tamagui components that never
matched the mobile UI. The second proposed Expo Router's `web.output:
'server'` for real SSR — but SDK 54's "server" mode is actually static
prerender with empty bodies, not on-demand SSR (real SSR is SDK 55+
alpha as of 2026-05-22). The current path (static export + post-build
injector) is the third try and gives full visual parity with the mobile
app plus crawler-readable `<head>` on every route.

See `docs/project_ledger.md` arc `2026-05-22` for the full progression.
