# Session Start Protocol

This is the default startup sequence for every Hype session.

If you are resuming work on Hype, start here.

If it is a cold start, machine switch, or agent handoff, read `handover.md` first.

## Purpose

Use this protocol to make sure every session begins with:
- current priorities
- structured plan state
- recurring repo rules
- recent implementation history

This keeps planning, memory, and execution aligned.

## Startup order

### 0. For handoffs or cold starts, read handover first

Read:
[handover.md](./handover.md)

Why:
- it gives the shortest high-signal project briefing
- it reduces context loss between agents and machines

### 1. Read the execution board

Read:
[execution_board.md](./execution_board.md)

Why:
- it is the structured planning source of truth
- it shows backlog, in-progress work, blockers, and next waves

### 2. Read the napkin

Read:
[napkin.md](../../.claude/napkin.md)

Why:
- it holds recurring repo-specific rules
- it prevents repeated mistakes
- it captures durable workflow habits

### 3. Read the project ledger

Read:
[project_ledger.md](../project_ledger.md)

Why:
- it shows the latest chronological changes
- it provides session-to-session continuity
- it captures recent decisions and follow-up items

### 4. Read task-specific supporting docs

Then read only what the task needs:
- quick "what remains" synthesis: `docs/00-overview/program_map.md`
- architecture work: `docs/03-architecture/`
- product behavior: `docs/04-product/`
- setup and delivery: `docs/05-dev-ops/`
- home-machine runtime or backend verification: `docs/05-dev-ops/home_machine_verification_checklist.md`
- live Supabase content reality checks: `docs/03-architecture/venue_seed_reconciliation.md`, `docs/03-architecture/events_series_reconciliation.md`, `docs/03-architecture/daily_specials_reconciliation.md`
- durable decisions: `docs/06-decisions/`
- role lenses: `docs/09-agents/`

## Role guide

Use the Hype role docs as working lenses, not ceremony.

Pick the lead lens based on the task:

- `Architect`
  - use for roadmap changes, cross-cutting design, Supabase alignment, backend ownership, and planning structure
- `Frontend`
  - use for screens, navigation, UI behavior, route bugs, schema-to-UI cleanup, and component simplification
- `Backend`
  - use for backend package work, ingestion design, schema workflows, privileged logic, and operational service boundaries
- `Chronicle`
  - use for keeping the execution board, ledger, and docs system accurate and synchronized

Default rule:
- if a task changes both planning and implementation, start with `Architect`
- if a task is mostly runtime/UI, start with `Frontend`
- if a task changes the project memory system, include `Chronicle`

## Working rule

Default rule for Hype sessions:

1. execution board first
2. napkin second
3. ledger third
4. task-specific docs fourth

## End-of-session rule

Before ending a meaningful session:

1. update `project_ledger.md`
2. update `execution_board.md` if status, backlog, or sequencing changed
3. update `.claude/napkin.md` only if a reusable rule was learned

## What each document is for

- `execution_board.md`
  - structured plan and backlog
- `.claude/napkin.md`
  - recurring rules and workflow memory
- `project_ledger.md`
  - chronological record of what happened

## Maintenance rule

If the startup order changes in practice, update this file and keep the other docs consistent with it.
