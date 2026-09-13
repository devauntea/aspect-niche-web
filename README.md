# Aspect Niche — Website

[![Live](https://img.shields.io/badge/live-aspectniche.com-brightgreen)](https://aspectniche.com) [![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](./LICENSE)

The marketing site for Aspect Niche, a graph-based hobby discovery app: pick a few
interests, explore a constellation of activities, and follow a connection into
ultra-niche corners of a hobby. The app itself is the iOS project in
[`aspect-niche-mobile`](../aspect-niche-mobile); this repo is the site that
describes it, plus the pages that open the invitations the app generates.

Built with Next.js + TypeScript + Tailwind CSS v4. No database, no cookies, and
no third-party requests — fonts included.

> **The interactive web demo has been removed.** It used to live at `/demo` and
> carried the graph canvas, onboarding, rabbit hole, and date planner. All of it
> is recoverable from git history at commit `9b86bc5` if a web app version gets
> built later.

## Routes

| Route | What it is |
|---|---|
| `/` | The landing page. Its own interactive sections (discovery graph, theme studio, memory walk) are marketing pieces, self-contained in `src/app/_landing/`. |
| `/i` | Opens an invitation encoded in the link the mobile app shares. |
| `/r` | Shows the RSVP reply encoded back from an invitation. |
| `/privacy` | Privacy policy — the App Store requires a reachable URL. |
| `/terms` | Terms of use. |
| `/support` | Support page — also required by App Store Connect. |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables are
needed; there is nothing to configure.

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
    page.tsx          The landing route — fonts and metadata only
    _landing/         The landing page itself, scoped under `.anl`
                      Hero, DiscoveryStory, ThemeStudio, MemoryWalk, Landing
    _legal/           Shared shell for the privacy, terms, and support pages
    i/                Invitation: page, view, OG card route, invite.css
    r/                RSVP reply
    globals.css       Only what every page shares — the two design surfaces
                      live in landing.css and invite.css
  lib/
    invite.ts         Encode/decode the invitation and reply links
    invite.test.ts    Vitest coverage for that round trip
```

## Testing

Vitest covers the invitation link encoding, which is the one piece of logic on
the site that the mobile app depends on being exactly right.

```bash
npm run test
```

## Docs

`docs/` and `MOBILE-PARITY.md` are a record of the removed web demo and of what
the mobile app became. They describe history, not the current site.
