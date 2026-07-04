# Multi-theme system — changelog + acceptance sweep

Themes are data (`src/lib/themes.ts`): each `ThemeDefinition` compiles to a
`[data-theme]` CSS-variable block rendered into `<head>`. Components read
variables only. Switcher in the app header (sky swatches, hover = live
preview). Persistence: `localStorage("an-theme")`; first visit honors
`prefers-color-scheme`.

## Per-theme QA screenshots (graph + detail panel / flow screen)

| Theme | Graph + panel | Flow (Random Activity) |
|---|---|---|
| Midnight | [t3b-midnight](t3b-midnight.png) | [t4-flow-midnight](t4-flow-midnight.png) |
| Aurora | [t3b-aurora](t3b-aurora.png) | [t4-flow-aurora](t4-flow-aurora.png) |
| Daybreak | [t3b-daybreak](t3b-daybreak.png) | [t4-flow-daybreak](t4-flow-daybreak.png) |
| Playground | [t3b-playground](t3b-playground.png) | [t4-flow-playground](t4-flow-playground.png) |

## Acceptance sweep (all verified in the running app)

- ☑ **Switch = one crossfade, zero layout shift, zero graph re-layout** —
  node transforms byte-identical across switches (probed); 240ms blanket
  transition class; canvas star field re-resolves via MutationObserver.
- ☑ **Persistence + system preference** — choice survives reload
  (pre-hydration inline script); fresh visit with light preference lands on
  Daybreak.
- ☑ **Variables only** — grep across the themed scope (`src/components`,
  `src/app/demo`, excluding the exempt date-mode + landing): zero raw token
  hexes; radii/durations/easings read `--radius-*`/`--dur-*`/`--ease-spring`.
- ☑ **Contrast + squint** — live-measured on real elements per theme; every
  text pair ≥ 5.0:1. Spec deviations (documented): Daybreak dim text
  `#6B7194→#5D6383` (4.21→5.2); new `--color-glow-text` (glow-as-text was
  1.9:1 on paper; `violet-glow` utility + Button/Chip resolve through it).
- ☑ **Dummy fifth theme** — added one object to `THEMES`: appeared in the
  switcher, previewed, applied, persisted; removed after. Stale stored ids
  fall back to Midnight cleanly.
- ☑ **Reduced motion** — instant switches (no crossfade), no bouncy easing
  effects, Playground confetti suppressed (`content: none`).

## Theme notes

- **Midnight** — the overhaul baseline, byte-for-byte after tokenization.
- **Aurora** — drifting northern-lights layer (60s, transform-only, inner
  layer so it can't fight the nebula's selection re-centering); edges tinted
  by cluster hue via `--edge-hue-mix: 100%`; 6-hue aurora category set.
- **Daybreak** — paper/ink dawn; starfield density 0 (canvas + chrome);
  horizon gradient via `--graph-nebula-layer`; mono logo; ink category hues;
  `--color-on-alpha`/`--color-focus`/`--color-glow-text` for light-surface
  contrast.
- **Playground** — candy cosmos; radii 14/20/28; bouncy `--ease-spring`
  (feeds dock + node-settle); `--hover-scale-*` bumps; confetti sparks on
  star ignition (playground-only CSS, reduced-motion safe).
- **Exempt**: date mode (intentional occasion palette) and the marketing
  landing page.
