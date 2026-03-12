# Handover Protocol

Use this protocol whenever continuity could break between sessions, agents, or machines.

## When to refresh handover

Refresh `handover.md` when:
- the architecture position changes
- the active milestone changes
- the canonical source of truth changes
- a major environment constraint changes
- a major workaround is introduced or removed
- a new workstream becomes central

## What belongs in handover

Include only high-signal continuity information:
- current project phase
- canonical sources of truth
- current architecture stance
- active workstreams
- environment split
- major workarounds
- high-impact risks
- exact resume point when one workstream is clearly next
- the specific files most likely to matter in the next session

Do not turn `handover.md` into:
- a diary
- a duplicate backlog
- a full design document

## Relationship to other docs

- `handover.md`
  - short cross-session briefing
- `execution_board.md`
  - structured plan and backlog
- `.claude/napkin.md`
  - recurring rules
- `project_ledger.md`
  - chronological history

## Default startup order with handover

For a cold start or machine switch:

1. `docs/00-overview/handover.md`
2. `docs/00-overview/execution_board.md`
3. `.claude/napkin.md`
4. `docs/project_ledger.md`

For a normal short-gap session:

1. `docs/00-overview/session_start_protocol.md`

## Maintenance rule

If another agent misses important context, improve `handover.md` and this protocol rather than relying on memory next time.

When a session ends mid-debugging, refresh the handover with:
- current reproduced symptom
- latest attempted mitigation
- whether the symptom is fully fixed, partially improved, or still unverified
- the next verification command or runtime path to use first
