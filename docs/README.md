# Hype Docs

This folder is the working documentation home for the Hype app.

## How to use this docs space

- For cold starts, machine switches, or agent handoffs, start with `00-overview/handover.md`.
- For a normal resume, start with `00-overview/execution_board.md`, then `.claude/napkin.md`, then `project_ledger.md`.
- Read `.claude/napkin.md` for recurring repo-specific execution rules and reusable gotchas.
- Read `00-overview/developer_workflow.md` for the default working flow in this repo.
- Read `00-overview/project_status_from_master_docs.md` for the current comparison between master planning files and the actual app repo.
- Read `00-overview/master_roadmap.md` for the sequenced execution plan across app, data, Supabase, scraping, and future surfaces.
- Read `00-overview/program_map.md` for the shortest view of what remains, in what order, and on which machine.
- Read `00-overview/execution_board.md` for the structured backlog, active plans, implemented work, and next delivery waves.
- Read `00-overview/session_start_protocol.md` when starting or resuming any Hype session.
- Read `00-overview/handover.md` for the highest-signal cross-agent and cross-machine briefing.
- Use `01-repo-map/` when we need to quickly find where code lives.
- Use `02-entrypoints/` when tracing startup and navigation flow.
- Use `03-architecture/` for shared state, data flow, and integrations.
- Use `03-architecture/schema_to_ui_contract.md` when reconciling app field usage with the Supabase schema.
- Use `03-architecture/query_surface_map.md` to see which screens touch which tables and fields.
- Use `03-architecture/live_supabase_assessment.md` to compare the real live Supabase backend against the current mobile prototype.
- Use `03-architecture/favorites_migration_plan.md` and `03-architecture/profile_taste_migration_plan.md` for the first migrations away from AsyncStorage-backed prototype user state.
- Use `03-architecture/initial_source_inventory.md` for the first real `scrape_sources` shortlist and activation plan.
- Use `03-architecture/raw_intake_enrichment_plan.md` for the next quality bar after first-pass ingestion.
- Use `03-architecture/parse_preview_workflow.md` for the first review stage between raw intake and canonical promotion.
- Use `03-architecture/promotion_workflow.md` for the first concrete path from `raw_events` to canonical `events`.
- Use `03-architecture/venue_matching_strategy.md` for how ingested candidates should attach to canonical `venues`.
- Use `03-architecture/canonical_event_update_policy.md` for how scraped data may enrich existing canonical `events` safely.
- Use `03-architecture/venue_seed_reconciliation.md` for the current venue-seed findings and the live reconciliation/import posture.
- Use `03-architecture/events_series_reconciliation.md` for the live-content reconciliation posture for canonical events and event series.
- Use `03-architecture/daily_specials_reconciliation.md` for the live-content reconciliation posture for canonical daily specials.
- Use `04-product/` for screen inventory and user-facing behavior.
- Use `04-product/design_direction_brief.md` for the current design thesis translated from the pitch into product/UI guidance.
- Use `04-product/pencil_prompt_pack.md` for Pencil exploration prompts before converging in Figma.
- Use `05-dev-ops/` for setup, commands, environment handling, and release notes.
- Use `05-dev-ops/home_work_transition_checklist.md` for the practical path off Natively and the split between home-machine runtime and work-computer preview.
- Use `05-dev-ops/home_machine_verification_checklist.md` for the standard home-machine runtime and ingestion verification sequence.
- Use `05-dev-ops/quality_guardrail_plan.md` for the recurring quality-check process and future automation path.
- Use `06-decisions/` for durable architectural or product decisions.
- Use `07-worklog/` for session-level notes that do not belong in the ledger.
- Use `08-reference/` for loose ends, audits, and lookup material.
- Use `08-reference/code_quality_audit_2026_03_09.md` for the first cleanup-oriented audit of prototype quality issues and simplification opportunities.
- Use `09-agents/` for repo-native specialist roles and working lenses.

## Folder structure

- `00-overview/`: high-level current-state summaries and onboarding notes.
- `00-overview/developer_workflow.md`: default work protocol for humans and future sessions.
- `00-overview/handover.md`: short cross-agent and cross-machine handoff summary.
- `00-overview/handover_protocol.md`: rules for when and how to refresh the handoff layer.
- `00-overview/session_start_protocol.md`: default startup order for every Hype session.
- `00-overview/project_status_from_master_docs.md`: comparison of master planning files versus the real repo implementation.
- `00-overview/master_roadmap.md`: master execution roadmap from prototype stabilization through platform expansion.
- `00-overview/program_map.md`: compact synthesis of remaining work, sequencing, machine split, and the v0.1 exit definition.
- `00-overview/execution_board.md`: structured planning board for backlog, in-progress work, blockers, and recently implemented items.
- `01-repo-map/`: maps of the root app, backend, routes, and important modules.
- `02-entrypoints/`: frontend and backend startup flow.
- `03-architecture/`: state, data flow, and integration notes.
- `03-architecture/schema_to_ui_contract.md`: current mobile UI expectations versus the canonical Supabase schema.
- `03-architecture/query_surface_map.md`: exact table and field usage by current mobile screens.
- `03-architecture/live_supabase_assessment.md`: architecture review of the exported live Supabase schema, policies, and RLS state.
- `03-architecture/favorites_migration_plan.md`: migration plan from AsyncStorage-based saved venues to Supabase `favorites`.
- `03-architecture/profile_taste_migration_plan.md`: migration plan from local taste profile storage to `profiles.taste_moods`.
- `03-architecture/initial_source_inventory.md`: recommended first active, inactive, and deferred sources for the live ingestion pipeline.
- `03-architecture/raw_intake_enrichment_plan.md`: current and next-step guidance for improving `raw_events` metadata before full parse/promotion work.
- `03-architecture/parse_preview_workflow.md`: backend-admin parse-preview stage for reviewing and normalizing recent `raw_events`.
- `03-architecture/promotion_workflow.md`: stage-by-stage rules for turning candidates into canonical `events` safely.
- `03-architecture/venue_matching_strategy.md`: confidence-based venue-match rules for ingested candidates.
- `03-architecture/canonical_event_update_policy.md`: trust hierarchy and field-level update rules when scraped candidates match existing canonical events.
- `03-architecture/venue_seed_reconciliation.md`: current findings on the 1233-venue seed and how it should be reconciled against live `venues`.
- `03-architecture/events_series_reconciliation.md`: current findings and unknowns around live canonical `events` and `event_series` content.
- `03-architecture/daily_specials_reconciliation.md`: current findings and unknowns around live canonical `daily_specials` content and UI-shape mismatch.
- `04-product/`: screens, features, and journeys.
- `04-product/design_direction_brief.md`: current product-design brief grounded in the Hype pitch and Sarajevo-first positioning.
- `04-product/pencil_prompt_pack.md`: prompt pack for generating fast Hype design directions in Pencil before systematizing them in Figma.
- `05-dev-ops/`: local setup, commands, secrets handling, testing, and release process.
- `05-dev-ops/home_work_transition_checklist.md`: exact setup and daily workflow for Expo, EAS, and Vercel across home and work machines.
- `05-dev-ops/home_machine_verification_checklist.md`: standard ordered runtime-validation playbook for home-machine app and backend verification.
- `05-dev-ops/quality_guardrail_plan.md`: recurring code-quality review process and proposed automation path.
- `05-dev-ops/next_milestone.md`: current technical milestone and what belongs in it.
- `05-dev-ops/schema_alignment_workplan.md`: concrete order for the first schema cleanup pass.
- `06-decisions/`: ADR-style decisions and rationale.
- `06-decisions/adr_0002_schema_alignment_strategy.md`: chosen strategy for moving from prototype fields to the canonical schema.
- `07-worklog/`: session notes and rolling work records.
- `08-reference/`: open questions, audits, and supporting notes.
- `08-reference/code_quality_audit_2026_03_09.md`: first structured audit of code-quality risks, AI-slop symptoms, and simplification opportunities.
- `09-agents/`: adapted Hype Crew role docs for this repo.

## Maintenance rules

- Keep `project_ledger.md` current before and after meaningful work.
- Keep `.claude/napkin.md` curated with recurring rules, not timeline notes.
- Prefer short, current notes over long historical prose.
- Link to code paths directly when a note refers to a concrete implementation area.
- When a temporary note becomes important, promote it into `06-decisions/` or `03-architecture/`.
