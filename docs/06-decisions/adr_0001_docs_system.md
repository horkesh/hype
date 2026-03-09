# ADR 0001: Establish Docs System

## Status

Accepted

## Date

2026-03-09

## Context

The repository needs a durable documentation structure that reflects real implementation areas, startup paths, and ongoing work history.

## Decision

Create a dedicated `docs/` system with focused subfolders for repo maps, entrypoints, architecture, product notes, dev ops, decisions, worklogs, and reference material. Use `project_ledger.md` as the first-stop working record for ongoing development.

## Consequences

- Team members have a predictable place to find structural documentation.
- Ongoing work is less likely to be tracked in scattered chat history only.
- Important architecture decisions can be promoted into dedicated ADRs as the app evolves.
