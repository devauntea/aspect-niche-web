# CLAUDE.md — Hobby Graph

> Stable contract. This file changes rarely. Living knowledge lives in the vault
> (see the Knowledge base section). Do not turn this file into a running checklist.

## Project at a glance
- **Product:** Hobby Graph — a graph-based hobby discovery app, Obsidian-inspired visual links.
- **Stack:** Next.js + TypeScript + Tailwind + React Flow. Local React state + localStorage first; Postgres only when shared state is truly needed.
- **Current state:** Working prototype — dark UI, static fitness cluster, clickable nodes, detail panel.
- **Target:** Polished MVP with dynamic graph exploration, random activity, nearby places, saving, and AI enrichment.

## How Claude should work here
- Work **one phase at a time**. Never skip a phase gate.
- Before coding: restate the goal in 3–5 bullets, list files you expect to touch, name assumptions.
- After coding: return changed files, why, manual test steps, and remaining risks.
- Implement the **smallest complete slice** that clears the current phase gate.
- No new dependency unless the benefit is clear and immediate. Postpone non-essential refactors.
- The graph stays **deterministic and data-driven**. Activities, tags, and key edges come from curated typed data — not from AI.
- Use AI **only** where the blueprint says to introduce it (Phase 4+), behind a provider abstraction, with schema validation and fallbacks. Never block core navigation on an AI call.

## Design language (do not drift)
Dark canvas, soft node glow, smooth transitions, readable spacing, intentional graph layout.
Every interactive element needs explicit states: default, hover, selected, loading, empty, error.

## Knowledge base (read these from the vault before non-trivial work)
- `01-Projects/Hobby-Graph/_Project-Home.md` — dashboard + index.
- `01-Projects/Hobby-Graph/Current-Phase.md` — what we're building **right now** and its acceptance criteria.
- `01-Projects/Hobby-Graph/Blueprint.md` — full phased plan and quality bar (source of truth for scope).
- `01-Projects/Hobby-Graph/Decisions.md` — why things are the way they are. Append, don't rewrite history.
- `01-Projects/Hobby-Graph/Open-Questions.md` — unresolved items needing a human call.
- `03-Resources/AI-Practices.md` — rules for any AI-enriched feature.

## Session protocol
At the end of a working session, append a short entry to
`01-Projects/Hobby-Graph/Session-Log.md` (date, what changed, decisions made, next step).
If a decision was made, also add it to `Decisions.md`. If a phase gate cleared, update `Current-Phase.md`.
