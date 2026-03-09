# HYPE CREW — Claude Code Instructions

## Project
Hype (hype.ba) — mood-driven events, nightlife, dining & culture guide for Sarajevo.

## Quick Start
1. Read .cursorrules for global context
2. Check PROGRESS.md for current status
3. Check .claude/napkin.md for past mistakes
4. Consult docs/ for architecture and schema

## Key Files
- docs/hype-architecture-v5.md — THE source of truth
- docs/hype-supabase-schema.sql — Database schema
- docs/hype-scraping-architecture.md — Scraper pipeline
- docs/hype-venues-seed.json — 1,233 venues

## Stack
React Native (Expo) · Supabase · OpenAI GPT-4o-mini · Apify

## Critical Rules
- Bilingual: all user-facing content in BS + EN
- RLS on ALL tables, no exceptions
- Edge Functions are Deno (NOT Node.js)
- TypeScript strict mode
- Moods drive discovery, categories are structure
