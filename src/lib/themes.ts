// Multi-theme system: a theme is DATA, not code. Each ThemeDefinition below
// compiles to a [data-theme="id"] CSS block (themeCss()) rendered into <head>
// by the root layout. Components only ever read CSS variables, so adding a
// new theme is exactly one object in THEMES — no component edits.

export type Category =
  | "creative"
  | "mind"
  | "tech"
  | "outdoor"
  | "nature"
  | "craft"
  | "fitness"
  | "social"
  | "community"
  | "culinary"
  | "adventure";

export type SpringPersonality = "calm" | "bouncy" | "none";

export interface ThemeDefinition {
  id: string;
  label: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    surfaceRaised: string;
    border: string;
    text: string;
    textDim: string;
    glow: string;
    alpha: string;
    success: string;
    warning: string;
    danger: string;
  };
  graph: {
    edge: string;
    edgeActive: string;
    nodeGlow: string;
    categoryHues: Record<Category, string>;
    starfieldDensity: number;
    starfieldOpacity: number;
    nebulaColor: string;
  };
  motion: {
    micro: number;
    standard: number;
    scene: number;
    spring: SpringPersonality;
  };
  shape: {
    radiusControl: number;
    radiusCard: number;
    radiusSheet: number;
  };
  logoVariant: "glow" | "mono";
  /**
   * Optional raw CSS variables emitted verbatim into the theme block —
   * bespoke flourishes (aurora drift, horizon layer, hover scale, on-alpha
   * text) stay data. Keys must be valid custom property names.
   */
  cssExtras?: Record<string, string>;
}

/** Spring personality → easing curve (reduced motion is handled in CSS). */
const SPRING_EASE: Record<SpringPersonality, string> = {
  calm: "cubic-bezier(0.32, 0.72, 0.28, 1)",
  bouncy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  none: "ease-out",
};

export const midnight: ThemeDefinition = {
  id: "midnight",
  label: "Midnight",
  description: "The night-sky field guide",
  colors: {
    bg: "#0A0C18",
    surface: "#131629",
    surfaceRaised: "#1B1E36",
    border: "#1B1E36",
    text: "#F0EEFF",
    textDim: "#8B93C9",
    glow: "#8B7CF6",
    alpha: "#FFF7D6",
    success: "#7CE8B5",
    warning: "#FFD27C",
    danger: "#FF8B9E",
  },
  graph: {
    edge: "#8B7CF6",
    edgeActive: "#F0EEFF",
    nodeGlow: "#8B7CF6",
    categoryHues: {
      creative: "#8B7CF6",
      mind: "#7C85F6",
      tech: "#7CA6F6",
      outdoor: "#7CCFF6",
      nature: "#7CEFF6",
      craft: "#BC7CF6",
      fitness: "#E07CF6",
      social: "#F67CDB",
      community: "#F67CBE",
      culinary: "#F67C9E",
      adventure: "#F67C7D",
    },
    starfieldDensity: 40,
    starfieldOpacity: 0.35,
    nebulaColor: "rgba(139, 124, 246, 0.13)",
  },
  motion: { micro: 120, standard: 240, scene: 420, spring: "calm" },
  shape: { radiusControl: 10, radiusCard: 16, radiusSheet: 24 },
  logoVariant: "glow",
};

export const aurora: ThemeDefinition = {
  id: "aurora",
  label: "Aurora",
  description: "Northern lights over deep water",
  colors: {
    bg: "#071019",
    surface: "#0D1B26",
    surfaceRaised: "#142936",
    border: "#142936",
    text: "#EAF6F3",
    textDim: "#8FB3AC",
    glow: "#34E5C0",
    alpha: "#7CF6A8",
    success: "#7CE8B5",
    warning: "#FFD27C",
    danger: "#FF8B9E",
  },
  graph: {
    edge: "#34E5C0",
    edgeActive: "#EAF6F3",
    nodeGlow: "#34E5C0",
    // The maximally colorful theme: a curated 6-hue aurora set
    categoryHues: {
      creative: "#FF6EC7",
      mind: "#9D8CFF",
      tech: "#6EC7FF",
      outdoor: "#7CF6A8",
      nature: "#34E5C0",
      craft: "#FFC46E",
      fitness: "#FF6EC7",
      social: "#FFC46E",
      community: "#9D8CFF",
      culinary: "#FFC46E",
      adventure: "#7CF6A8",
    },
    starfieldDensity: 46,
    starfieldOpacity: 0.32,
    nebulaColor: "rgba(52, 229, 192, 0.12)",
  },
  motion: { micro: 120, standard: 240, scene: 420, spring: "calm" },
  shape: { radiusControl: 10, radiusCard: 16, radiusSheet: 24 },
  logoVariant: "glow",
  cssExtras: {
    // Edges pick up the hue of their (brighter) activity endpoint
    "--edge-hue-mix": "100%",
    // Slow-drifting northern lights, <=12% opacity, transform-only (GPU-cheap)
    "--graph-nebula-layer":
      "linear-gradient(115deg, rgba(52,229,192,0.12) 0%, rgba(255,110,199,0.10) 45%, rgba(124,246,168,0.12) 100%)",
    "--nebula-anim": "auroraDrift 60s ease-in-out infinite alternate",
  },
};

export const daybreak: ThemeDefinition = {
  id: "daybreak",
  label: "Daybreak",
  description: "Dawn on paper — ink and sun-gold",
  colors: {
    bg: "#F4F1E9",
    surface: "#FFFFFF",
    surfaceRaised: "#ECE8DC",
    border: "#ECE8DC",
    text: "#232742",
    // Spec said #6B7194 but it fails 4.5:1 on the paper bg (4.21) —
    // darkened per the "adjust the hue, not the rule" clause. 5.2:1.
    textDim: "#5D6383",
    glow: "#E8A33D",
    alpha: "#D98324",
    success: "#1F7A55",
    warning: "#8A5A00",
    danger: "#B3364B",
  },
  graph: {
    edge: "#232742",
    edgeActive: "#A85F07",
    nodeGlow: "#E8A33D",
    // Ink-family hues that hold up on paper (squint test > vibrancy)
    categoryHues: {
      creative: "#5B4EC9",
      mind: "#4C5AB8",
      tech: "#2D6FB5",
      outdoor: "#1F7A55",
      nature: "#247A70",
      craft: "#8A55B8",
      fitness: "#C2427A",
      social: "#A85F07",
      community: "#B3487F",
      culinary: "#C2503F",
      adventure: "#B3364B",
    },
    starfieldDensity: 0, // starfield off in daylight
    starfieldOpacity: 0,
    nebulaColor: "rgba(232, 163, 61, 0.10)",
  },
  motion: { micro: 120, standard: 240, scene: 420, spring: "calm" },
  shape: { radiusControl: 10, radiusCard: 16, radiusSheet: 24 },
  logoVariant: "mono",
  cssExtras: {
    // Faint horizon glow at the canvas base instead of a starfield
    "--graph-nebula-layer":
      "linear-gradient(to top, rgba(232,163,61,0.22), rgba(232,163,61,0.06) 32%, transparent 58%)",
    // A glow on paper must be subtle; text/focus need a darker gold
    "--color-on-alpha": "#232742",
    "--color-focus": "#965505",
    "--color-glow-text": "#965505",
  },
};

export const playground: ThemeDefinition = {
  id: "playground",
  label: "Playground",
  description: "Candy cosmos — bouncy and bright",
  colors: {
    bg: "#170F2B",
    surface: "#221743",
    surfaceRaised: "#2E2058",
    border: "#2E2058",
    text: "#FFF4FA",
    textDim: "#B9A6D9",
    glow: "#FF7AB6",
    alpha: "#FFD54A",
    success: "#7CE8B5",
    warning: "#FFD27C",
    danger: "#FF8B9E",
  },
  graph: {
    edge: "#FF7AB6",
    edgeActive: "#FFF4FA",
    nodeGlow: "#FF7AB6",
    categoryHues: {
      creative: "#FF7AB6",
      mind: "#B98CFF",
      tech: "#4DD6FF",
      outdoor: "#B6F35C",
      nature: "#B6F35C",
      craft: "#FFA94D",
      fitness: "#FF7AB6",
      social: "#FFA94D",
      community: "#B98CFF",
      culinary: "#FFA94D",
      adventure: "#4DD6FF",
    },
    starfieldDensity: 44,
    starfieldOpacity: 0.4,
    nebulaColor: "rgba(255, 122, 182, 0.13)",
  },
  // Playful = springier, not slower: same durations, bouncy ease
  motion: { micro: 120, standard: 240, scene: 420, spring: "bouncy" },
  shape: { radiusControl: 14, radiusCard: 20, radiusSheet: 28 },
  logoVariant: "glow",
  cssExtras: {
    "--hover-scale-minor": "1.24",
    "--hover-scale-major": "1.12",
  },
};

/** The registry. Order = order in the switcher. */
export const THEMES: ThemeDefinition[] = [
  midnight,
  aurora,
  daybreak,
  playground,
];

export const DEFAULT_THEME_ID = "midnight";
/** First visit with a light system preference lands here (once it exists). */
export const LIGHT_DEFAULT_THEME_ID = "daybreak";
export const THEME_STORAGE_KEY = "an-theme";

export function getTheme(id: string | null | undefined): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Compile one definition into its [data-theme] variable block. */
function themeBlock(t: ThemeDefinition): string {
  const c = t.colors;
  const g = t.graph;
  const hues = Object.entries(g.categoryHues)
    .map(([k, v]) => `  --hue-${k}: ${v};`)
    .join("\n");
  const extras = Object.entries(t.cssExtras ?? {})
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `[data-theme="${t.id}"] {
  --color-bg: ${c.bg};
  --color-surface: ${c.surface};
  --color-surface-raised: ${c.surfaceRaised};
  --color-border-t: ${c.border};
  --color-text: ${c.text};
  --color-text-dim: ${c.textDim};
  --color-glow: ${c.glow};
  --color-alpha: ${c.alpha};
  --color-success-t: ${c.success};
  --color-warning-t: ${c.warning};
  --color-danger-t: ${c.danger};
  --radius-control: ${t.shape.radiusControl}px;
  --radius-card: ${t.shape.radiusCard}px;
  --radius-sheet: ${t.shape.radiusSheet}px;
  --dur-micro: ${t.motion.micro}ms;
  --dur-standard: ${t.motion.standard}ms;
  --dur-scene: ${t.motion.scene}ms;
  --ease-spring: ${SPRING_EASE[t.motion.spring]};
  --spring: ${t.motion.spring};
  --canvas-lift: color-mix(in srgb, ${c.bg} 90%, ${c.glow});
  --graph-nebula: ${g.nebulaColor};
  --graph-edge: ${g.edge};
  --graph-edge-active: ${g.edgeActive};
  --graph-node-glow: ${g.nodeGlow};
  --starfield-density: ${g.starfieldDensity};
  --starfield-opacity: ${g.starfieldOpacity};
${hues}
${extras}
}`;
}

/** Full generated stylesheet for every registered theme. */
export function themeCss(): string {
  return THEMES.map(themeBlock).join("\n\n");
}
