# UX/UI Overhaul — "10x pass" changelog

Night-sky field guide identity, delivered in five passes (2026-07-03 → 07-04).
All values trace to tokens in `src/lib/theme.ts` (mirrored in `globals.css
@theme`). Component kit: `src/components/ui`.

## Before / after

| Screen | Before | After |
|---|---|---|
| App / graph | [before-app](before-app.png) (cream chrome, pill nodes) | [after-app](after-app.png) (night chrome, star-core constellation) |
| Detail panel | [before-detail-panel](before-detail-panel.png) (white modal-era card) | [after-detail-panel](after-detail-panel.png) (eyebrow → display name → chips → meta row → alpha primary) |
| Canvas (interim Track B) | [before-canvas-trackB](before-canvas-trackB.png) | [after-canvas-zoomout](after-canvas-zoomout.png) (calm at low zoom, labels fade) |
| Splash / loading | colorful bubble logo | [after-splash](after-splash.png) (mark ignites star-by-star, alpha tail last) |
| Onboarding moment | none (hard cut) | [after-onboarding-ignition](after-onboarding-ignition.png) ("Your sky starts here") |
| Random Activity | flip-card, legacy colors | [after-surprise](after-surprise.png) (discovered star + why-it-fits) |
| Saved empty state | gray bookmark icon | [after-saved-empty](after-saved-empty.png) (faint mark + next action) |
| Plan-a-Date overlap | static gold dots | [after-date-overlap](after-date-overlap.png) (shared stars ignite) |
| Phone | untested | [after-phone-sheet](after-phone-sheet.png) (focused cluster + bottom sheet) |

## Pass summaries

1. **Brand** — mark canonicalized in `brandGeometry.ts` (cotton-tail alpha
   star added); three SVG assets generated to spec in `public/brand/`; SVG
   favicon; star-by-star loading ignition; Inter + Space Grotesk; night
   tokens landed. Old logos deleted repo-wide.
2. **Canvas** — star-core nodes sized by importance, category as hue-shifted
   glow (`starHues`), hairline violet edges with comet pulse on live edges,
   selection = star ignition + orbital ring, nebula re-centers (420ms),
   zoom-based label declutter via `--graph-zoom` (no re-renders).
3. **Chrome** — full dark flip; token component kit (Card/Sheet/Button/Chip/
   Input/Eyebrow); slim translucent header; detail panel hierarchy rebuild;
   dynamic alpha-star reserve rule (verified: exactly one per screen state).
4. **Flows** — SkyIgnition onboarding moment (once/session, skippable);
   Surprise as discovered star with one next step; overlap ignition in date
   mode; copy pass; silent create-niche failure now a visible, self-clearing
   alert.
5. **Fit & finish** — this document.

## Proof (Pass 5)

- **Lighthouse accessibility: 100 / 100 on both routes** (`/`, `/demo`).
  Fixes: landing violet darkened to #584CC4 (6.5:1), footer alpha raised,
  `<main>` landmark added, icon-only buttons labeled, sr-only `h1` on demo.
- **Contrast (tokens)**: dust/space-950 6.60:1 · dust/space-900 6.06:1 ·
  violet/space-900 5.37:1 · alpha-star button text 18.1:1 — all ≥ 4.5:1.
- **Keyboard path**: Tab reaches graph nodes → Enter selects (handler added;
  React Flow alone doesn't fire click) → Esc closes → violet focus ring
  everywhere (`:focus-visible`).
- **Responsive**: no horizontal overflow at 1512 / 1280 / 834 / 390 (header
  collapses to icon buttons + mark on phone; filter strip clips and scrolls).
  Phone detail = bottom sheet over the lower half, node visible above.
- **Performance**: 60.7fps idle, 60.9fps with cluster + comet + starfield
  (star-field layer static spans + one rAF canvas ≈ free). Heavy panels
  (Plan-a-Date, AI rabbit hole) now `next/dynamic` lazy-loaded.
- **Layout shift**: CLS 0.0000 on `/` and `/demo`.
- **Reduced motion**: splash/ignition/comet/settle/orbits all collapse to
  clean static states (verified per pass).

## Known exemptions

- **Date mode** keeps its intentional rose/plum theme (product decision) —
  it adopts the type, radii, and ignition motion but not the night palette.
- **Header search** from the work order is not built — search doesn't exist
  yet (blueprint Phase 1 debt); filters occupy the center slot.
- Brand SVGs were authored to the work-order spec (no source files were
  provided); drop real designer files over `public/brand/*` to replace.

## "Down the rabbit hole" — brand identity + loading animation

The brand story: Aspect Niche is a rabbit hole you jump into on purpose.
New running-hare (Lepus-style) constellation with a 7s dive animation.

- **Geometry**: `src/lib/hareGeometry.ts` — 16 stars (nose→ears→back→legs),
  16 point-to-point lines, generated shadow silhouette, hole at x 350–510,
  ground plane y=396, and the beat sheet (timings preserved exactly).
- **`RabbitHoleLoader`** — CSS-only per-element keyframes generated from the
  beat sheet. `mode="boot"`: the loading screen loops and hands off after
  the dive (~90%; never before the beat-4 shadow reveal). `mode="finale"`:
  beats 5–7 only via negative animation delay — the onboarding "Jump in."
  moment, landing in the first cluster. Theme-aware (all colors are theme
  variables; verified live in Daybreak and Midnight).
- **Ground-plane clip** on a static wrapper (transform on the inner group)
  so the hare is genuinely swallowed at the hole.
- **Assets generated** (authored to spec — none were provided):
  `public/brand/aspect-niche-logo-rabbithole.svg` (static, dark-surface
  Midnight colors) and `aspect-niche-loading-animation.svg` (self-contained
  7s loop, embedded CSS, `prefers-reduced-motion` static fallback).
- **Motif reuse (sparingly)**: onboarding CTA copy is now "Jump in · N
  interests →"; the Random Activity card's discovered star hovers over a
  small violet-rimmed hole. Landing hero uses the static hare mark; nav,
  favicon, and small marks keep the compact BrandMark (the shadow dies
  below ~48px).

Acceptance: ☑ boot loop 60.7fps, fixed-overlay handoff (no layout shift)
☑ handoff after the dive, never mid-star ☑ reduced motion = static
constellation + shadow, no hole, no movement (probed) ☑ "Jump in" CTA →
jump beat → first cluster ☑ hero mark on landing; small sizes unchanged.
