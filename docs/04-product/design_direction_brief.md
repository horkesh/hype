# Hype Design Direction Brief

## Purpose

Translate the current Hype pitch into a concrete product-design direction that can guide:

- Pencil exploration
- Figma work
- frontend implementation

This is the design brief for the current phase, not a final brand book.

## Design thesis

Hype should feel like:

- the digital pulse of Sarajevo
- a stylish local concierge
- a trusted city-intelligence layer

It should **not** feel like:

- a generic nightlife app
- a tourist brochure
- a database wrapped in cards
- a cold startup dashboard

## Pitch alignment

The current pitch already points in the right direction.

It describes Hype as:

- a real-time city guide
- mood-first
- bilingual
- local and insider-driven
- useful for both tourists and locals
- differentiated by curated venue knowledge plus AI-powered freshness

That means the product design should emphasize:

1. live city energy
2. local taste and credibility
3. fast decision-making
4. emotional discovery, not just filtering

## Product design principles

### 1. Mood before taxonomy

The product should lead with:

- how the user feels
- what kind of evening they want
- what the city feels like tonight

Instead of leading only with:

- category
- venue type
- raw lists

Recommended mood examples:

- quiet coffee
- date night
- culture night
- after work
- big night out
- hidden gem
- Sunday slow
- tourist essentials

### 2. Concierge over feed

The home screen should feel like:

- "Here is what fits you tonight"

Not:

- "Here are many things"

Recommended behavior:

- fewer, stronger recommendations
- clear editorial hierarchy
- one or two standout calls to action
- less visual sameness

### 3. Editorial trust over marketplace clutter

The pitch sells local intelligence.

So the interface should communicate:

- taste
- curation
- confidence
- local specificity

Recommended cues:

- short editorial descriptors
- clear mood framing
- "from venue", "confirmed", or "tonight" style trust labels
- local insider notes used sparingly but meaningfully

### 4. Warm Sarajevo atmosphere

The visual language should feel warm, textured, and urban.

Recommended palette direction:

- deep night blue
- warm ivory or stone
- brass/gold accents
- muted terracotta or wine red
- olive or forest accents for depth

Avoid:

- purple-on-white startup defaults
- overly glossy nightlife clichés
- sterile monochrome SaaS styling

### 5. Tourist-friendly without becoming touristy

The pitch is strong on tourism, but the product should still feel cool enough for locals.

Recommended rule:

- one product
- different modes of relevance

Tourist-facing utility can be expressed through:

- "must-see" framing
- transport/currency help
- map confidence

But the overall aesthetic should still feel contemporary and local-first.

## Home-screen concept

The Home screen should become the clearest expression of the pitch.

Recommended structure:

### Block 1. City pulse hero

Purpose:

- communicate what the city feels like right now

Contents:

- a strong greeting
- weather/time-aware mood framing
- one standout recommendation or city-state summary

Examples:

- "Sarajevo feels slow and golden tonight."
- "Best tonight: jazz, wine, and late dinner."
- "The city is lively tonight. Start in Mejtas, end in the Old Town."

### Block 2. Mood shortcuts

Purpose:

- help the user decide quickly

Recommended interaction:

- expressive chips or pills
- not generic filters

### Block 3. Tonight now

Purpose:

- fulfill the "what's happening tonight" promise

Format:

- compact, signal-rich rows
- time-first presentation
- clearer difference between event, venue, and special

### Block 4. One strong editorial section

Examples:

- hidden gems tonight
- date night picks
- for first-time visitors
- culture tonight

This is where Hype becomes more than a listing app.

### Block 5. City map or neighborhood lens

Purpose:

- show spatial confidence

Recommended presentation:

- neighborhood-led
- "near you" or "best in this area"

Not:

- a map just because maps exist

## Core UI recommendations

### Cards

Do not make every item the same card.

Use at least three visual patterns:

- feature cards for standout recommendations
- compact timeline rows for tonight
- venue tiles for discovery clusters

### Typography

Choose typography with character.

Recommended direction:

- one expressive display face
- one highly readable supporting face

The type should feel editorial, not corporate.

### Motion

Use motion lightly but purposefully:

- soft page-load reveal
- subtle stagger for mood chips or tonight rows
- meaningful transitions between list and detail

Avoid:

- generic micro-animations everywhere

### Confidence and provenance

The interface should quietly express trust.

Possible label language:

- confirmed
- from venue
- likely tonight
- insider pick
- seasonal

Keep it human, not technical.

## What the current app most needs visually

Based on the current repo state:

1. a stronger Home identity
2. clearer hierarchy between live events, venues, and specials
3. less card sameness
4. warmer and more intentional color/typography
5. a more editorial expression of hidden gems, moods, and city pulse

## Recommended design workflow

1. explore multiple visual directions in Pencil
2. choose one direction intentionally
3. rebuild it properly in Figma
4. define reusable components and tokens there
5. implement from Figma into the app

## Suggested first screens to design

In order:

1. Home
2. Venue detail
3. Tonight
4. Explore

Why:

- Home expresses the thesis
- Venue detail expresses trust and depth
- Tonight expresses real-time utility
- Explore expresses scale and browsing

## Decision filter

When reviewing design ideas, ask:

1. does this feel specific to Sarajevo
2. does this feel more like a concierge than a database
3. does this help a user decide quickly
4. does this make Hype feel trustworthy
5. would both a local and a tourist want to open this tonight
