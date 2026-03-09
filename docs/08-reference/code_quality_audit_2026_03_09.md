# Code Quality Audit

Date:
- `2026-03-09`

Purpose:
- identify "AI slop" symptoms
- identify simplification opportunities
- turn qualitative discomfort into concrete cleanup work

## Summary

The current codebase is promising, but it still shows clear prototype-generation artifacts.

The biggest quality issues are:
- oversized screen files with too many responsibilities
- near-duplicate `.tsx` and `.ios.tsx` implementations
- encoding damage in user-facing strings
- local persistence scattered directly through screen components
- hardcoded external API configuration in UI code
- temporary compatibility logic living in places that should not become permanent

These are fixable.

The right approach is not a rewrite.

It is a controlled cleanup program:
- stabilize first
- extract shared logic
- remove duplication
- align with the live backend

## Findings

### Q1. Very large screen files

Severity:
- High

Examples:
- `app/(tabs)/tonight.tsx`
- `app/(tabs)/tonight.ios.tsx`
- `app/(tabs)/explore.tsx`
- `app/(tabs)/explore.ios.tsx`
- `app/(tabs)/saved.tsx`
- `app/(tabs)/saved.ios.tsx`
- `app/(tabs)/(home)/index.tsx`
- `app/(tabs)/(home)/index.ios.tsx`

Why this matters:
- large screens are harder to reason about
- state, effects, querying, formatting, and rendering are mixed together
- lifecycle bugs become easier to introduce

Interpretation:
- this is a common generated-prototype smell
- it is not fatal, but it should be reduced

Recommended cleanup:
- extract query hooks or data helpers
- extract section components from monolithic screens
- separate planner logic, list rendering, and formatting helpers

### Q2. Platform file duplication is too heavy

Severity:
- High

Examples:
- `explore.tsx` and `explore.ios.tsx`
- `saved.tsx` and `saved.ios.tsx`
- `tonight.tsx` and `tonight.ios.tsx`
- `profile.tsx` and `profile.ios.tsx`
- `app/(tabs)/(home)/index.tsx` and `app/(tabs)/(home)/index.ios.tsx`

Why this matters:
- fixes must be repeated in two files
- bugs drift between variants
- Natively/manual sync makes this worse

Interpretation:
- this is one of the biggest maintainability risks in the repo

Recommended cleanup:
- keep platform-specific files only where behavior truly differs
- otherwise move shared logic and shared UI back into one file

### Q3. Encoding and mojibake in strings

Severity:
- High

Examples seen:
- `PoÄetna`
- `IstraÅ¾i`
- `VeÄeras`
- `SaÄuvano`
- `CafÃ©s`

Main source:
- `contexts/AppContext.tsx`

Why this matters:
- user-facing quality drops immediately
- translation trust erodes
- it is a visible sign of sloppy content handling

Recommended cleanup:
- repair translations in `AppContext`
- add a simple string review pass for core UI copy

### Q4. Direct AsyncStorage usage is scattered through UI screens

Severity:
- High

Examples:
- `app/(tabs)/saved.tsx`
- `app/(tabs)/saved.ios.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/profile.ios.tsx`
- `app/event/[id].tsx`
- `app/venue/[id].tsx`
- `app/series/[id].tsx`

Why this matters:
- persistence logic is duplicated
- key names are inconsistent
- backend-backed migration becomes harder

Interpretation:
- this is prototype persistence, not durable architecture

Recommended cleanup:
- centralize persistence behind one storage abstraction
- migrate canonical user state to Supabase where tables already exist

### Q5. Saved-state naming is inconsistent

Severity:
- High

Examples:
- `savedVenues`
- `saved_venues`
- `savedEvents`
- `saved_events`

Why this matters:
- behavior can silently diverge between screens
- debugging becomes confusing

Recommended cleanup:
- define one canonical naming scheme immediately during transition
- then replace with backend-backed favorites where appropriate

### Q6. Hardcoded weather API key in screen code

Severity:
- Medium

Examples:
- `app/(tabs)/(home)/index.tsx`
- `app/(tabs)/(home)/index.ios.tsx`

Why this matters:
- configuration is mixed into UI code
- deployment and rotation are harder
- this is a classic generated-app shortcut

Recommended cleanup:
- move weather config into environment-driven configuration
- add fallback behavior if the key is missing

### Q7. Supabase client duplication still exists

Severity:
- Medium

Examples:
- `integrations/supabase/`
- `app/integrations/supabase/`

Why this matters:
- auth and data behavior can drift
- cleanup work must happen in multiple places

Recommended cleanup:
- converge on one canonical frontend Supabase client surface

### Q8. Temporary adapter logic is in `errorLogger.ts` for Natively compatibility

Severity:
- Medium

Context:
- this was a practical workaround for Natively not creating new source files

Why this matters:
- `errorLogger.ts` should not become a long-term home for data normalization

Recommended cleanup:
- keep `utils/dataAdapters.ts` as the real architectural home
- remove the workaround once Natively is no longer in the loop

## What does not look like slop

These parts are encouraging:
- the live Supabase architecture is strong
- docs discipline is now improving rapidly
- the app already has real route coverage
- RLS and data-model direction are not toy-level

So this is not a bad project.

It is a good project with prototype-generated rough edges.

## Cleanup priorities

### Priority 1

- fix runtime stability
- repair translation encoding
- standardize saved-state naming during transition
- fix Expo storage dependency mismatch

### Priority 2

- migrate favorites to Supabase
- migrate taste profile to Supabase
- extract shared persistence helpers
- move API keys/config out of screens

### Priority 3

- reduce `.ios.tsx` duplication
- split giant screen files into data helpers plus presentational sections
- consolidate Supabase client access

## Suggested automation

Yes, some of this can be automated.

Good candidates:
- repeated scan for mojibake-like text patterns
- repeated scan for hardcoded API keys
- repeated scan for duplicated storage key names
- repeated scan for screen files over a line-count threshold
- repeated scan for direct AsyncStorage imports outside approved utility layers

Best outputs for automation:
- one short code-quality report
- one list of newly introduced smells
- one reminder to update the execution board if a cleanup item becomes real

## Recommendation

Treat cleanup as a formal workstream, not an occasional refactor mood.

The repo is ready for a recurring "quality guardrail" process after the home-machine workflow is stable.
