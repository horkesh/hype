# Quality Guardrail Plan

This document defines how to keep Hype from drifting into avoidable complexity and prototype residue.

## Goal

Create a lightweight recurring quality check that catches:
- new AI-slop-like code patterns
- duplicated logic growth
- encoding regressions
- hardcoded config
- persistence drift

## What to check

### 1. Oversized screens

Flag files when:
- a screen crosses a line-count threshold
- a screen mixes querying, persistence, formatting, and UI rendering in one place

### 2. Duplicate platform screens

Flag when:
- `.tsx` and `.ios.tsx` siblings are mostly identical
- a bug fix must be applied twice to near-identical files

### 3. Mojibake and encoding damage

Flag strings containing common corruption patterns such as:
- `Ã`
- `Ä`
- `Å`
- `â`
- `ðŸ`

### 4. Hardcoded config

Flag:
- API keys
- hardcoded public endpoints
- config values living in leaf screens

### 5. Direct persistence access

Flag:
- direct AsyncStorage imports outside approved utility layers
- new saved-state key names
- new local-only persistence for data already modeled in Supabase

## Recommended cadence

Run this quality check:
- before major milestone closes
- after a burst of generated or fast prototype code
- weekly once home-machine Git workflow is stable

## Ideal output

Each run should produce:
- top findings by severity
- newly introduced issues
- recommended cleanup candidates
- whether the execution board should be updated

## Best implementation path

### Phase 1

Manual recurring audit using:
- targeted text searches
- line-count checks
- docs update in `execution_board.md`

### Phase 2

Automated script on the home machine that scans:
- file size and line counts
- suspicious encoding patterns
- duplicate storage keys
- direct AsyncStorage imports
- hardcoded API keys

### Phase 3

Optional recurring automation that:
- runs the audit
- writes a short report
- opens an inbox item for review

## Recommendation

Do not automate this from the work machine first.

Best sequence:
1. stabilize home-machine Git and Node workflow
2. create a small local audit script
3. optionally turn it into a recurring automation later
