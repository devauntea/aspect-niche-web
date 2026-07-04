// Design tokens — JS-side source of truth for Aspect Niche.
//
// Used for inline styles, React Flow node colors, and the hex-keyed accent
// lookups (which require literal hex, so values here stay hex — not var()).
// The Tailwind utility palette lives in src/app/globals.css `@theme`; keep the
// shared hex values in the two files in sync.
//
// No behavior change: every value here mirrors a literal that was previously
// inlined across components. Migrate inline literals to these tokens; do not
// invent new values without a design decision.

/** Core palette: brand, interest-category colors, and neutrals. */
export const colors = {
  // Brand
  brand: "#7F77DD",
  brandDark: "#534AB7",

  // Interest categories (also used as node/accent colors)
  fitness: "#D4537E",
  creative: "#7F77DD",
  outdoor: "#1D9E75",
  tech: "#378ADD",
  social: "#EF9F27",
  culinary: "#D85A30",

  // Neutrals — backgrounds, surfaces, borders
  appBg: "#FAF8F2",
  surface: "#FFFFFF",
  surfaceSubtle: "#F0EDE6",
  border: "#E8E4DA",
  borderHover: "#D3D0C8",

  // Neutrals — text (darkest → faintest)
  textPrimary: "#1A1916",
  textBody: "#5A5855",
  textMuted: "#B0ADA8",
  textFaint: "#9A9690",
} as const;

/**
 * Interest category → node/accent color.
 * Keyed by interest id. Source of truth for cluster coloring.
 */
export const interestColors: Record<string, string> = {
  fitness: colors.fitness,
  creative: colors.creative,
  outdoor: colors.outdoor,
  tech: colors.tech,
  social: colors.social,
  culinary: colors.culinary,
};

/**
 * Activity id → node color. Each activity inherits a color from its cluster's
 * palette; kept explicit so individual nodes can be tuned without recomputing.
 */
export const activityColors: Record<string, string> = {
  "rock-climbing": "#D4537E",
  zumba: "#EF9F27",
  cycling: "#1D9E75",
  yoga: "#7F77DD",
  running: "#D85A30",
  hiking: "#1D9E75",
  photography: "#7F77DD",
  drawing: "#D4537E",
  music: "#EF9F27",
  pottery: "#D85A30",
  kayaking: "#378ADD",
  coding: "#378ADD",
  "3d-printing": "#639922",
  electronics: "#EF9F27",
  "board-games": "#D4537E",
  improv: "#EF9F27",
  cooking: "#D85A30",
  baking: "#EF9F27",
  coffee: "#D85A30",
  fermentation: "#1D9E75",
  "cooking-club": "#D4537E",
};

/**
 * Accent color → darker variant, for text/gradients on tinted surfaces.
 * Falls back to the base color when a darker pair isn't defined.
 */
export const accentDark: Record<string, string> = {
  "#D4537E": "#993556",
  "#7F77DD": "#534AB7",
  "#EF9F27": "#854F0B",
  "#1D9E75": "#0F6E56",
  "#378ADD": "#185FA5",
  "#D85A30": "#993C1D",
  "#639922": "#3B6D11",
};

/** Resolve an accent color for a node id (interest first, then activity). */
export function accentFor(id: string | null): string {
  if (!id) return colors.brand;
  return interestColors[id] ?? activityColors[id] ?? colors.brand;
}

/** Resolve the darker pair for an accent, falling back to the accent itself. */
export function darkenAccent(accent: string): string {
  return accentDark[accent] ?? accent;
}

/** Border radii (px) matching the Tailwind scale used in markup. */
export const radii = {
  md: 12, // rounded-xl
  lg: 16, // rounded-2xl
  xl: 24, // rounded-3xl
  full: 9999,
} as const;

/** Transition durations. UI motion is intentionally quick and uniform. */
export const transitions = {
  fast: "0.2s ease",
} as const;

/**
 * Night-sky field guide tokens (UX overhaul work order). Single source of
 * truth for the brand palette; Tailwind utilities mirror these in
 * globals.css `@theme` (--color-space-950 etc.) — keep the two in sync.
 * alpha-star is reserved: at most ONE alpha-star element per screen.
 */
export const nightSky = {
  space950: "var(--color-bg)", // app background
  space900: "var(--color-surface)", // raised surfaces
  space800: "var(--color-surface-raised)", // borders-as-surfaces, hover fills
  starlight: "var(--color-text)", // primary text
  dust: "var(--color-text-dim)", // secondary text, captions
  violetGlow: "var(--color-glow)", // graph energy: glows, highlights, focus
  alphaStar: "var(--color-alpha)", // reserved accent — one per screen
  success: "var(--color-success-t)",
  warning: "var(--color-warning-t)",
  danger: "var(--color-danger-t)",
  /** Depth comes from glow, not shadow. */
  raisedGlow: "0 0 24px color-mix(in srgb, var(--color-glow) 10%, transparent)",
} as const;

/** Motion durations (ms): micro / standard / scene, per the overhaul spec. */
export const durations = {
  micro: 120,
  standard: 240,
  scene: 420,
} as const;

/** Radius family (px): one scale, no mixing — controls / cards / sheets. */
export const radiiScale = {
  control: "var(--radius-control)",
  card: "var(--radius-card)",
  sheet: "var(--radius-sheet)",
} as const;

/**
 * Motion tokens for the node → detail-card choreography.
 * The graph reacts first (camera ease), then the card slides in — selection
 * must never feel like an instant modal. CSS reads these via vars set on the
 * dock element, so this stays the single source of truth.
 */
export const motionTokens = {
  /** Camera ease when focusing or releasing a node. */
  cameraMs: 500,
  /** How long the graph gets to react before the card starts sliding in. */
  cardDelayMs: 180,
  /** Docked card slide/fade duration. */
  cardDurationMs: 450,
  /** Spring ease — themed via --ease-spring (calm / bouncy / none). */
  springEase: "var(--ease-spring, cubic-bezier(0.32, 0.72, 0.28, 1))",
  /** Node hover scale/glow response. */
  hoverMs: 180,
  /** Nodes glide (never snap) to new layout positions. */
  settleMs: 550,
} as const;

/**
 * Night-sky graph canvas — the identity surface. Everything derives from the
 * nightSky tokens: violet is the graph's energy; categories read as subtle
 * hue shifts of the glow (starHues), never loud fills.
 * Keep any hex mirrored into globals.css `.constellation` rules in sync.
 */
export const constellation = {
  /** Theme-lifted field center, darkened at the edges. */
  canvasBg:
    "radial-gradient(ellipse at 50% 40%, var(--canvas-lift) 0%, var(--color-bg) 72%)",
  /** Slightly lifted variant while focus mode isolates a neighborhood. */
  canvasBgFocus:
    "radial-gradient(ellipse at 50% 40%, color-mix(in srgb, var(--canvas-lift) 80%, var(--color-glow)) 0%, var(--color-bg) 72%)",
  panelBorder: "color-mix(in srgb, var(--color-glow) 24%, transparent)",
  /** Glass chrome for controls floating on the canvas. */
  glassBg: "color-mix(in srgb, var(--color-surface) 82%, transparent)",
  glassBorder: "color-mix(in srgb, var(--color-text) 10%, transparent)",
  glassIcon: "var(--color-text-dim)",
  glassHover: "color-mix(in srgb, var(--color-text) 8%, transparent)",
  /** Node label text on the canvas (halo comes from CSS text-shadow). */
  labelText: "var(--color-text)",
  labelDim: "var(--color-text-dim)",
  /** Starfield palette vars — resolved at runtime by GraphBackground
      (canvas 2D can't read var()). Density/opacity live in CSS vars too. */
  stars: [
    "var(--color-text)",
    "var(--color-text-dim)",
    "var(--color-glow)",
    "var(--color-text)",
    "var(--color-alpha)",
  ],
  /** Edges are hairline violet; the comet pulse only runs on live edges. */
  edge: {
    idleOpacity: 0.35,
    highlightOpacity: 0.9,
    dimOpacity: 0.06,
    idleWidth: 1.25,
    highlightWidth: 1.6,
    pulseMs: 2400,
  },
  /** How far non-neighbors recede when a node is hovered/selected. */
  dimmedNodeOpacity: 0.2,
  /** Activity labels fade out below this zoom (see --graph-zoom CSS var). */
  labelFadeZoom: 0.55,
} as const;

/**
 * Category → star-glow hue. All are hue rotations of violet-glow at the same
 * saturation/lightness, so the canvas stays one family — category is a tint
 * of the energy, not a different color system. Fallback: violet-glow.
 */
export const starHues: Record<string, string> = {
  creative: "var(--hue-creative)",
  mind: "var(--hue-mind)",
  tech: "var(--hue-tech)",
  outdoor: "var(--hue-outdoor)",
  nature: "var(--hue-nature)",
  craft: "var(--hue-craft)",
  fitness: "var(--hue-fitness)",
  social: "var(--hue-social)",
  community: "var(--hue-community)",
  culinary: "var(--hue-culinary)",
  adventure: "var(--hue-adventure)",
} as const;

/**
 * Date mode — a deliberately different theme so planning a date feels like
 * its own occasion: deep plum/wine evening tones, rose accent, candlelight
 * gold. Exploration stays indigo (`constellation`); date mode is warm.
 */
export const dateTheme = {
  /** Full-screen evening backdrop. */
  bg:
    "radial-gradient(ellipse 70% 50% at 15% 0%, #4A163055 0%, transparent 55%)," +
    "radial-gradient(ellipse 60% 45% at 90% 100%, #6E2A1E33 0%, transparent 60%)," +
    "radial-gradient(ellipse at 50% 35%, #241019 0%, #180A11 55%, #10060B 100%)",
  /** Cards / panels floating on the backdrop. */
  panelBg: "rgba(43,18,31,0.78)",
  panelBorder: "rgba(232,93,138,0.26)",
  inputBg: "rgba(16,6,11,0.65)",
  border: "rgba(232,93,138,0.16)",
  /** Rose — primary date-mode accent. */
  accent: "#E85D8A",
  accentDark: "#B03A62",
  accentSoft: "rgba(232,93,138,0.14)",
  /** Candlelight gold — highlights, matches, agreement. */
  gold: "#E8B44E",
  goldSoft: "rgba(232,180,78,0.14)",
  text: "#F7E9EF",
  textDim: "#C9A8B8",
  textFaint: "#8F6E7E",
} as const;
