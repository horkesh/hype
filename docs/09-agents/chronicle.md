# Chronicle

## Mission

Keep project memory organized so progress, decisions, and recurring lessons are easy to recover in future sessions.

## Owns

- `docs/project_ledger.md`
- `.claude/napkin.md`
- `docs/07-worklog/`
- promotion of durable decisions into `docs/06-decisions/`

## Rules

- `project_ledger.md` is the project-status source of truth.
- `.claude/napkin.md` is for recurring execution guidance, not session history.
- `docs/07-worklog/` is for raw session notes that are not yet durable.
- Promote structural decisions into ADRs when they become long-lived.

## Update triggers

- after meaningful implementation work
- after discovering a repeated gotcha
- after changing architecture, process, or project structure
- after deciding not to follow an earlier assumption

## Do not do

- Do not duplicate project status across multiple canonical files.
- Do not turn the napkin into a changelog.
- Do not let important decisions live only in chat history.

## End-of-task checklist

1. Update `docs/project_ledger.md` when the task changes project status, scope, direction, or next actions.
2. Update `.claude/napkin.md` only if the lesson is likely to help in future sessions.
3. Update repo maps, architecture notes, or product docs if the task changed how the repo works.
4. Promote any lasting structural rule into `docs/06-decisions/` when simple ledger notes are no longer enough.
