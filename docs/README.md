# Hype Docs

This folder is the working documentation home for the Hype app.

## How to use this docs space

- Start with `project_ledger.md` to understand current status, priorities, blockers, and recent changes.
- Read `.claude/napkin.md` for recurring repo-specific execution rules and reusable gotchas.
- Read `00-overview/developer_workflow.md` for the default working flow in this repo.
- Read `00-overview/project_status_from_master_docs.md` for the current comparison between master planning files and the actual app repo.
- Read `00-overview/master_roadmap.md` for the sequenced execution plan across app, data, Supabase, scraping, and future surfaces.
- Read `00-overview/execution_board.md` for the structured backlog, active plans, implemented work, and next delivery waves.
- Read `00-overview/session_start_protocol.md` when starting or resuming any Hype session.
- Use `01-repo-map/` when we need to quickly find where code lives.
- Use `02-entrypoints/` when tracing startup and navigation flow.
- Use `03-architecture/` for shared state, data flow, and integrations.
- Use `03-architecture/schema_to_ui_contract.md` when reconciling app field usage with the Supabase schema.
- Use `03-architecture/query_surface_map.md` to see which screens touch which tables and fields.
- Use `03-architecture/live_supabase_assessment.md` to compare the real live Supabase backend against the current mobile prototype.
- Use `03-architecture/favorites_migration_plan.md` and `03-architecture/profile_taste_migration_plan.md` for the first migrations away from AsyncStorage-backed prototype user state.
- Use `04-product/` for screen inventory and user-facing behavior.
- Use `05-dev-ops/` for setup, commands, environment handling, and release notes.
- Use `05-dev-ops/home_work_transition_checklist.md` for the practical path off Natively and the split between home-machine runtime and work-computer preview.
- Use `05-dev-ops/quality_guardrail_plan.md` for the recurring quality-check process and future automation path.
- Use `06-decisions/` for durable architectural or product decisions.
- Use `07-worklog/` for session-level notes that do not belong in the ledger.
- Use `08-reference/` for loose ends, audits, and lookup material.
- Use `08-reference/code_quality_audit_2026_03_09.md` for the first cleanup-oriented audit of prototype quality issues and simplification opportunities.
- Use `09-agents/` for repo-native specialist roles and working lenses.

## Folder structure

- `00-overview/`: high-level current-state summaries and onboarding notes.
- `00-overview/developer_workflow.md`: default work protocol for humans and future sessions.
- `00-overview/session_start_protocol.md`: default startup order for every Hype session.
- `00-overview/project_status_from_master_docs.md`: comparison of master planning files versus the real repo implementation.
- `00-overview/master_roadmap.md`: master execution roadmap from prototype stabilization through platform expansion.
- `00-overview/execution_board.md`: structured planning board for backlog, in-progress work, blockers, and recently implemented items.
- `01-repo-map/`: maps of the root app, backend, routes, and important modules.
- `02-entrypoints/`: frontend and backend startup flow.
- `03-architecture/`: state, data flow, and integration notes.
- `03-architecture/schema_to_ui_contract.md`: current mobile UI expectations versus the canonical Supabase schema.
- `03-architecture/query_surface_map.md`: exact table and field usage by current mobile screens.
- `03-architecture/live_supabase_assessment.md`: architecture review of the exported live Supabase schema, policies, and RLS state.
- `03-architecture/favorites_migration_plan.md`: migration plan from AsyncStorage-based saved venues to Supabase `favorites`.
- `03-architecture/profile_taste_migration_plan.md`: migration plan from local taste profile storage to `profiles.taste_moods`.
- `04-product/`: screens, features, and journeys.
- `05-dev-ops/`: local setup, commands, secrets handling, testing, and release process.
- `05-dev-ops/home_work_transition_checklist.md`: exact setup and daily workflow for Expo, EAS, and Vercel across home and work machines.
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
