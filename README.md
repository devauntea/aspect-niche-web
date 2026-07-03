# Aspect Niche — Hobby Graph

A graph-based hobby discovery app inspired by Obsidian's visual links. Pick a few
interests, explore a constellation of activities, get a "surprise me" suggestion
with a deterministic *why it fits*, save what you like, and drop down an
AI-powered rabbit hole into ultra-niche corners of any hobby.

Built with Next.js + TypeScript + Tailwind CSS v4 + React Flow. State is local
React + `localStorage` first; there is no database.

## Routes

- `/` — marketing landing page.
- `/demo` — **the actual app** (onboarding → graph → detail cards → rabbit hole).

## Prerequisites

- Node.js 20+ and npm.
- A [Groq](https://console.groq.com/) API key — **optional**. Core navigation
  (graph, filters, Surprise Me, save, checklists) runs fully offline from local
  data. The key only powers the two AI features: the Rabbit Hole panel and
  "create a niche." Without it, those calls fail gracefully and the rest works.

## Getting started

```bash
git clone <repo-url>
cd hobby-graph-app
npm install

# Configure environment (see .env.example)
cp .env.example .env.local
# then edit .env.local and set GROQ_API_KEY=... to enable AI features

npm run dev
```

Open [http://localhost:3000/demo](http://localhost:3000/demo) to use the app.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | Optional | Enables the AI Rabbit Hole (`/api/rabbit-hole`) and Create Niche (`/api/create-niche`) routes. |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run the Vitest suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run format` | Format the codebase with Prettier. |
| `npm run format:check` | Check formatting without writing. |

## Project structure

```
src/
  app/
    page.tsx            Marketing landing page
    demo/page.tsx       The app (graph, detail cards, rabbit hole)
    api/                AI routes (rabbit-hole, create-niche) — server-side Groq
  components/           UI: GraphCanvas, cards, onboarding, drawers, icons
  data/                 Curated typed content (activities, edges, niches, resources)
  lib/
    theme.ts            JS-side design tokens (colors, radii, transitions)
    graphUtils.ts       Deterministic node/edge builders from data
    recommendations.ts  Deterministic "why it fits", checklist, similar picks
    *.test.ts           Vitest unit tests for the deterministic core
  types/graph.ts        Core types (Activity, Interest, HobbyNode/Edge, GraphState)
```

## Design tokens

The palette lives in two coordinated places, kept in sync by hand:

- **`src/lib/theme.ts`** — JS-side source of truth (inline styles, React Flow node
  colors, hex-keyed accent lookups). Values are hex on purpose.
- **`src/app/globals.css` `@theme`** — the Tailwind v4 utility palette
  (`bg-brand`, `text-body`, `text-muted`, `border-border`, …).

## Testing

Vitest covers the deterministic logic (`recommendations.ts`, `graphUtils.ts`).
AI routes are intentionally not unit-tested yet — see the project vault's
`Current-Phase` / `Decisions` for the planned Phase 4 provider refactor.

```bash
npm run test
```
