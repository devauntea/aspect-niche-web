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
  /** Spring-like ease shared by the dock slide and related transitions. */
  springEase: "cubic-bezier(0.32, 0.72, 0.28, 1)",
  /** Node hover scale/glow response. */
  hoverMs: 180,
  /** Nodes glide (never snap) to new layout positions. */
  settleMs: 550,
} as const;

/**
 * Dark constellation canvas — the graph panel is a night sky inside the
 * light app chrome (the blueprint's "dark canvas, soft node glow" language).
 * Node accents stay the shared palette above; these are canvas-only values.
 * Keep any hex mirrored into globals.css `.constellation` rules in sync.
 */
export const constellation = {
  /** Deep indigo night-sky panel, with faint nebula tints in the corners. */
  canvasBg:
    "radial-gradient(ellipse 80% 60% at 20% 0%, #241F4D33 0%, transparent 50%)," +
    "radial-gradient(ellipse 70% 50% at 90% 90%, #6E1F4222 0%, transparent 55%)," +
    "radial-gradient(ellipse at 50% 30%, #17152B 0%, #100E1F 55%, #0B0A16 100%)",
  /** Slightly lifted variant while focus mode isolates a neighborhood. */
  canvasBgFocus:
    "radial-gradient(ellipse at 50% 30%, #1C1A33 0%, #131126 55%, #0D0C1A 100%)",
  panelBorder: "rgba(127,119,221,0.28)",
  /** Dark glass chrome for controls floating on the canvas. */
  glassBg: "rgba(19,17,36,0.82)",
  glassBorder: "rgba(255,255,255,0.10)",
  glassIcon: "#B9B4E8",
  glassHover: "rgba(255,255,255,0.08)",
  /** Node label chips + text on the dark canvas. */
  chipBg: "rgba(11,10,22,0.72)",
  labelText: "#E9E6FF",
  /** Starfield palette (brighter pastels of the interest accents). */
  stars: ["#8FD8D8", "#E48FB0", "#F2C879", "#A79FF0", "#7FB8F0"],
  /** Edge treatment: faint at rest, alive when a neighborhood is active. */
  edge: {
    idleOpacity: 0.38,
    highlightOpacity: 0.95,
    dimOpacity: 0.07,
    idleWidth: 1.4,
    highlightWidth: 2.4,
    flowMs: 1600,
  },
  /** How far non-neighbors recede when a node is hovered/selected. */
  dimmedNodeOpacity: 0.22,
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
