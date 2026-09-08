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
// Obsidian: the vault. One lavender accent, no starfield, near-square
// corners, and category hues narrowed to a lavender-to-slate range — a rainbow
// would undo exactly the quality being borrowed.
export const obsidian: ThemeDefinition = {
  id: "obsidian",
  label: "Obsidian",
  description: "A quiet vault. One accent, and a graph that sits still",
  colors: {
    bg: "#15171C",
    surface: "#1B1E24",
    surfaceRaised: "#24282F",
    border: "#2E333C",
    text: "#EFEDE8",
    textDim: "#B1B3BF",
    glow: "#7F73C2",
    alpha: "#BDB1F9",
    success: "#7FD1A8",
    warning: "#E3C07B",
    danger: "#E88E8E",
  },
  graph: {
    edge: "#424650",
    edgeActive: "#BDB1F9",
    nodeGlow: "#7F73C2",
    categoryHues: {
      creative: "#BDB1F9",
      mind: "#A9A6E8",
      tech: "#94A9DC",
      outdoor: "#8FB8C9",
      nature: "#94C4B0",
      craft: "#C4A9E0",
      fitness: "#D4A0C4",
      social: "#D9A8B8",
      community: "#C9A0AC",
      culinary: "#D4B49C",
      adventure: "#C9A894",
    },
    starfieldDensity: 0,
    starfieldOpacity: 0,
    nebulaColor: "rgba(189, 177, 249, 0.07)",
  },
  motion: {
    micro: 110,
    standard: 220,
    scene: 380,
    spring: "calm",
  },
  shape: {
    radiusControl: 6,
    radiusCard: 8,
    radiusSheet: 16,
  },
  logoVariant: "glow",
};

// Pocket Tech: blue hour. Smoked glass and satin silver, with the three
// ribbon colours spread across the clusters. Narrow on purpose — a rainbow over
// a blue-hour ground stops it reading as one time of day.
export const pocketTech: ThemeDefinition = {
  id: "pocket-tech",
  label: "Pocket Tech",
  description: "Blue hour. Smoked glass and a pale status light",
  colors: {
    bg: "#071120",
    surface: "#172B41",
    surfaceRaised: "#1F3A55",
    border: "#2C4A68",
    text: "#EEF5FF",
    textDim: "#B1C3D7",
    glow: "#8ACDDD",
    alpha: "#BDDFF5",
    success: "#B8D7AD",
    warning: "#E3C07B",
    danger: "#E88E8E",
  },
  graph: {
    edge: "#2C4A68",
    edgeActive: "#BDDFF5",
    nodeGlow: "#8ACDDD",
    categoryHues: {
      creative: "#CBBAF1",
      mind: "#B9C2F3",
      tech: "#779CEC",
      outdoor: "#7FB6E4",
      nature: "#8ACDDD",
      craft: "#C2C0F2",
      fitness: "#9FD3E4",
      social: "#A8C4EE",
      community: "#B3BEEE",
      culinary: "#A7D6DC",
      adventure: "#93C2E8",
    },
    starfieldDensity: 0,
    starfieldOpacity: 0,
    nebulaColor: "transparent",
  },
  motion: {
    micro: 110,
    standard: 220,
    scene: 380,
    spring: "calm",
  },
  shape: {
    radiusControl: 10,
    radiusCard: 14,
    radiusSheet: 20,
  },
  logoVariant: "glow",
};

// Gallery: the app as a collection, the UI as its wall labels. Warm paper
// rather than white, and every category is one graphite — under this theme the
// mark's shape carries the meaning, never its colour.
export const gallery: ThemeDefinition = {
  id: "gallery",
  label: "Gallery",
  description: "Ink on paper. The collection, quietly hung",
  colors: {
    bg: "#F5F0E7",
    surface: "#FFFDF8",
    surfaceRaised: "#EDE7DA",
    border: "#BDB7AC",
    text: "#2C302E",
    textDim: "#5E5A54",
    glow: "#4A463F",
    alpha: "#A8342A",
    success: "#2C6046",
    warning: "#7A5300",
    danger: "#9B2C24",
  },
  graph: {
    edge: "#BDB7AC",
    edgeActive: "#2C302E",
    nodeGlow: "#4A463F",
    categoryHues: {
      creative: "#4A463F",
      mind: "#4A463F",
      tech: "#4A463F",
      outdoor: "#4A463F",
      nature: "#4A463F",
      craft: "#4A463F",
      fitness: "#4A463F",
      social: "#4A463F",
      community: "#4A463F",
      culinary: "#4A463F",
      adventure: "#4A463F",
    },
    starfieldDensity: 0,
    starfieldOpacity: 0,
    nebulaColor: "transparent",
  },
  motion: {
    micro: 110,
    standard: 180,
    scene: 260,
    spring: "none",
  },
  shape: {
    radiusControl: 2,
    radiusCard: 2,
    radiusSheet: 16,
  },
  logoVariant: "mono",
};

// Gallery Night: the same room after the lights go down. A charcoal with
// green in it rather than a neutral one, so it is still the gallery.
export const galleryNight: ThemeDefinition = {
  id: "gallery-night",
  label: "Gallery Night",
  description: "The collection after hours",
  colors: {
    bg: "#1B2020",
    surface: "#282E2D",
    surfaceRaised: "#333937",
    border: "#454B49",
    text: "#F6F0E5",
    textDim: "#C1BBAE",
    glow: "#8E8A83",
    alpha: "#DE786D",
    success: "#8FC9A6",
    warning: "#D6AB58",
    danger: "#E8837A",
  },
  graph: {
    edge: "#7B837D",
    edgeActive: "#F6F0E5",
    nodeGlow: "#9A958D",
    categoryHues: {
      creative: "#9A958D",
      mind: "#9A958D",
      tech: "#9A958D",
      outdoor: "#9A958D",
      nature: "#9A958D",
      craft: "#9A958D",
      fitness: "#9A958D",
      social: "#9A958D",
      community: "#9A958D",
      culinary: "#9A958D",
      adventure: "#9A958D",
    },
    starfieldDensity: 0,
    starfieldOpacity: 0,
    nebulaColor: "transparent",
  },
  motion: {
    micro: 110,
    standard: 180,
    scene: 260,
    spring: "none",
  },
  shape: {
    radiusControl: 2,
    radiusCard: 2,
    radiusSheet: 16,
  },
  logoVariant: "mono",
};

export const THEMES: ThemeDefinition[] = [
  midnight,
  obsidian,
  pocketTech,
  aurora,
  gallery,
  galleryNight,
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
