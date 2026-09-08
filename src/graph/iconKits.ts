import type { Category } from "@/lib/themes";

// Generated from the two supplied icon kits (aspect-niche-design-kit and
// aspect-niche-files-icons). Those folders are not vendored, so this file is
// now the record of what they contained: re-derive it from a fresh copy of the
// kits rather than hand-editing entries, and add the kit to the repo first if
// it is going to be regenerated more than once.
//
// Both kits draw the same subject on the same 24-unit box the app's own glyphs
// use (-12..12), so a mark can switch set without any call site resizing. The
// path is shared between them; what differs is which vertices stay lit. The
// Obsidian set keeps every node, the Files set keeps only the ones that read as
// part of the subject, because inside a document carrier a loose dot looks like
// a smudge rather than a star.

export type KitGlyph = {
  /** Stroked path on the -12..12 box. */
  d: string;
  /** Lit vertices for the Obsidian set: [cx, cy, r]. */
  dots?: [number, number, number][];
  /** Overrides `d` for the Files set, where the drawing differs. */
  filesD?: string;
  /** Lit vertices for the Files set. */
  filesDots?: [number, number, number][];
};

/** The four tab destinations, the only controls both kits draw. */
export type ControlId = "graph" | "discover" | "collection" | "profile";

export const KIT_CATEGORY_GLYPHS: Record<Category, KitGlyph> = {
  "adventure": { d: "M0 -10L9 -4 7 6 0 10-7 6-9 -4ZM0 -6L3 3-3 1 0 -6M0 10V5", dots: [[0, -10, 1.15], [0, 10, 1.15]], filesDots: [] },
  "community": { d: "M-10 7L-9 3-6 1-3 3M3 3L6 1 9 3 10 7M-5 9L-4 5 0 3 4 5 5 9Z", dots: [[-6, -3, 1.15], [6, -3, 1.15], [0, -1, 1.15]], filesDots: [[-6, -3, 1.265], [6, -3, 1.265], [0, -1, 1.265]] },
  "craft": { d: "M-8 -7L8 7M-8 7L8 -7M-9 -9L-5 -7-7 -5ZM5 7L7 5 9 9ZM-9 9L-5 7-7 5Z", dots: [[-8, 7, 1.15], [8, -7, 1.15]], filesDots: [] },
  "creative": { d: "M-8 -8H0M-8 -8V8H8V0M-4 4L-2 -2 6 -10 10 -6 2 2-4 4ZM-2 -2L2 2", dots: [[-8, 8, 1.15], [6, -10, 1.15]], filesDots: [] },
  "culinary": { d: "M-9 2H9L6 8H-6ZM-7 2L-4 -4H4L7 2M-2 -8H2M0 -8V-4", dots: [[-9, 2, 1.15], [9, 2, 1.15]], filesDots: [] },
  "fitness": { d: "M-5 -3V-7L-2 -10H2L5 -7V-3M-5 -3L-9 2-7 9H7L9 2 5 -3ZM-2 -6H2", dots: [[-5, -3, 1.15], [5, -3, 1.15]], filesDots: [] },
  "mind": { d: "M-5 7V3L-8 -2-5 -8H3L8 -3V3L4 6V9M-5 7H1M-3 -2L0 -5 4 -2 1 2-3 -2", dots: [[-3, -2, 1.15], [4, -2, 1.15]], filesDots: [] },
  "nature": { d: "M-8 8L-7 -1 0 -7 9 -8 8 1 1 7-8 8ZM-8 8L5 -5M-2 2V-3M2 -2H6", dots: [[-8, 8, 1.15], [9, -8, 1.15]], filesDots: [] },
  "outdoor": { d: "M-10 7L-4 -6 0 1 4 -3 10 7H-10M-6 -2L-4 0-2 -2", dots: [[6, -7, 1.15], [-4, -6, 1.15]], filesDots: [] },
  "social": { d: "M-10 -7H3V1H-3L-6 4V1H-10ZM6 -2H10V7H5L2 10V7H-1V4", dots: [[3, -7, 1.15], [10, 7, 1.15]], filesDots: [] },
  "tech": { d: "M-7 -7H7V7H-7ZM-3 -3H3V3H-3ZM-10 0H-7M7 0H10M0 -10V-7M0 7V10", dots: [[-7, -7, 1.15], [7, 7, 1.15]], filesDots: [] },
};

export const KIT_HOBBY_GLYPHS: Record<string, KitGlyph> = {
  "3d-printing": { d: "M-9 7V-8H9V7M-6 -5H6M0 -5V-2L-2 0H2ZM-4 4L0 2 4 4V8L0 10-4 8ZM-4 4L0 6 4 4M0 6V10", dots: [[-9, 7, 1.15], [9, 7, 1.15]], filesDots: [] },
  "archery": { d: "M-5 -9L2 -4 4 0 2 4-5 9ZM-9 0H10M6 -4L10 0 6 4", dots: [[-5, -9, 1.15], [-5, 9, 1.15]], filesDots: [] },
  "astronomy": { d: "M-9 -1L4 -7 7 -1-6 5ZM-3 3L0 5 4 9M0 5L-4 10M4 -7L7 -8 10 -2 7 -1M-10 0L-8 4-6 5", dots: [[0, 5, 1.15], [8, -8, 1.15]], filesDots: [] },
  "baking": { d: "M-8 6L-10 1-8 -5-3 -8H3L8 -5 10 1 8 6ZM-8 6V9H8V6M-4 -4L-6 0M1 -5L-1 -1M6 -3L4 1", dots: [[-3, -8, 1.15], [8, 6, 1.15]], filesDots: [] },
  "birdwatching": { d: "M-10 4L-8 -7H-3L-1 4-4 9H-8ZM1 4L3 -7H8L10 4 8 9H4ZM-1 1H1M-9 3H-2M2 3H9", dots: [[-6, 6, 1.15], [6, 6, 1.15]], filesDots: [] },
  "blacksmithing": { d: "M-10 -1H10L5 3H0L2 7H6V9H-7V7H-3L-2 3-8 2ZM-5 -9L-2 -10 3 -5 0 -2ZM0 -5L5 -10", dots: [[-10, -1, 1.15], [10, -1, 1.15]], filesDots: [] },
  "board-games": { d: "M-8 -8H6L10 -4V8H-4L-8 4ZM-8 -8L-4 -4H10M-4 -4V8", dots: [[0, 0, 1.15], [6, 4, 1.15], [-5, -5, 1.15]], filesDots: [[0, 0, 1.265], [6, 4, 1.265]] },
  "bookbinding": { d: "M-8 -9H6L9 -6V9H-8ZM-4 -9V9M6 -9V-6H9M-10 -5H-6M-10 0H-6M-10 5H-6", dots: [[2, -3, 1.15], [2, 4, 1.15]], filesDots: [] },
  "calligraphy": { d: "M0 -10L7 2 0 10-7 2ZM0 -10V1M-7 2L0 5 7 2", dots: [[0, 1, 1.15], [0, 10, 1.15]], filesDots: [] },
  "chess": { d: "M-7 9V5L-2 1-3 -2-7 -2-5 -6 1 -9 5 -5 6 3 8 9ZM-5 -6H1M-7 6H7", dots: [[1, -5, 1.15], [1, -9, 1.15]], filesDots: [] },
  "coding": { d: "M-10 -7H10V9H-10ZM-10 -3H10M-6 1L-3 4-6 7M0 7H5", dots: [[-7, -5, 1.15], [-4, -5, 1.15]], filesDots: [] },
  "coffee": { d: "M-8 -4H5V3L1 7H-4L-8 3ZM5 -2H9V2L5 4M-10 10H7M-4 -8L-2 -10M1 -8L3 -10", dots: [[-8, -4, 1.15], [1, 7, 1.15]], filesDots: [] },
  "cooking": { d: "M-8 -2H8V5L4 9H-4L-8 5ZM-10 0H-8M8 0H10M-6 -5H6M0 -5V-7M-3 -10H3", dots: [[-8, -2, 1.15], [8, -2, 1.15]], filesDots: [] },
  "cooking-club": { d: "M-7 -1L-5 -5H5L7 -1 5 5H-5ZM-10 7H10M-8 -9V-5M-10 -7H-6M8 -9V-5M6 -7H10", dots: [[-7, -1, 1.15], [7, -1, 1.15]], filesDots: [] },
  "cycling": { d: "M-10 3L-7 -1-3 0-2 5-6 8-10 3ZM2 3L5 -1 9 0 10 5 6 8 2 3ZM-6 3L-1 -4 3 3H-6M-1 -4H4L6 3M-3 -7H0M4 -4L5 -8H8", dots: [[-6, 3, 1.15], [6, 3, 1.15]], filesDots: [] },
  "drawing": { d: "M-9 9L-7 2 4 -9 9 -4-2 7-9 9ZM-7 2L-2 7M1 -6L6 -1M-9 9L-6 8", dots: [[-7, 2, 1.15], [9, -4, 1.15]], filesDots: [] },
  "electronics": { d: "M-10 -7H-4V-2H2V5H10M-10 6H-4V1H-1M5 -8V-3H10M-7 -9V-5M-2 -4V0", dots: [[-10, -7, 1.15], [10, 5, 1.15], [5, -8, 1.15], [-10, 6, 1.15]], filesDots: [] },
  "fencing": { d: "M-8 9L6 -6 9 -9 8 -5-5 7M8 9L-6 -6-9 -9-8 -5 5 7M-9 3L-3 9M9 3L3 9", dots: [[0, 0, 1.15]], filesDots: [] },
  "fermentation": { d: "M-5 -10H5V-7L8 -3V8L5 10H-5L-8 8V-3L-5 -7ZM-8 0H8M-5 -7H5", dots: [[-4, 4, 1.15], [2, 2, 1.15], [4, 7, 1.15]], filesDots: [[-4, 4, 1.265], [2, 2, 1.265], [4, 7, 1.265]] },
  "foraging": { d: "M-9 0H9L6 9H-6ZM-5 0V-4L0 -7 5 -4V0M-3 3V6M3 3V6M0 -7L2 -10 7 -9 5 -6Z", dots: [[-9, 0, 1.15], [9, 0, 1.15]], filesDots: [] },
  "genealogy": { d: "M0 -7V-2M-7 -2H7M-7 -2V3M7 -2V3M-7 3V7M-10 7H-4M-10 7V10M-4 7V10M7 3V9", dots: [[0, -7, 1.15], [-7, 3, 1.15], [7, 3, 1.15], [-10, 10, 1.15], [-4, 10, 1.15], [7, 9, 1.15]], filesDots: [] },
  "geology": { d: "M-7 9L-10 -2-4 -8 2 -6 6 -10 10 -1 7 9ZM-4 -8L-3 2-7 9M2 -6L3 1 7 9M-10 -2L-3 2 3 1 10 -1", dots: [[-3, 2, 1.15], [3, 1, 1.15]], filesDots: [] },
  "glassblowing": { d: "M-10 -8L1 1M1 1L5 -1 9 2 9 7 5 10 1 7-1 3 1 1ZM3 3L6 2M-8 5L-6 1-4 5-6 8Z", dots: [[1, 1, 1.15], [9, 7, 1.15]], filesDots: [] },
  "hiking": { d: "M-8 -9H-2V-2L2 1 7 2 10 6V9H-8ZM-8 5H9M-2 -2L-5 0M2 1L0 3M5 2L3 4", dots: [[-8, -9, 1.15], [10, 6, 1.15]], filesDots: [] },
  "improv": { d: "M-10 -8L-1 -6V1L-5 5-10 1ZM0 -4L10 -6V5L5 9 0 5ZM-7 -1L-4 0M3 4L5 2 8 3", dots: [[-7, -4, 1.15], [-3, -3, 1.15], [3, -1, 1.15], [7, -2, 1.15]], filesDots: [[-7, -4, 1.265], [-3, -3, 1.265], [3, -1, 1.265], [7, -2, 1.265]] },
  "investing": { d: "M-9 9H10M-7 5V1M-2 5V-3M3 5V-1M8 5V-7M-9 -2L-3 -7 2 -4 9 -10M5 -10H9V-6", dots: [[-3, -7, 1.15], [2, -4, 1.15]], filesDots: [] },
  "journaling": { d: "M-9 -10H5V10H-9ZM-5 -10V10M-2 -6H2M-2 -2H2M1 7L3 2 8 -3 11 0 6 5 1 7ZM3 2L6 5", dots: [[-9, -10, 1.15], [5, 10, 1.15]], filesDots: [] },
  "kayaking": { d: "M-10 2L0 -1 10 2 5 6H-5ZM-8 -8L8 8M-8 -8L-5 -8-8 -5ZM8 8L5 8 8 5Z", dots: [[0, -1, 1.15], [5, 6, 1.15]], filesDots: [] },
  "language-learning": { d: "M-10 -8H4V3H-4L-8 7V3H-10ZM7 -4H10V8H4L1 10V7M-6 -1L-3 -6 0 -1M-5 -3H-1", dots: [[4, -8, 1.15], [10, 8, 1.15]], filesDots: [] },
  "leatherwork": { d: "M-8 -8L-2 -9 3 -6 9 -7 8 2 5 9-3 8-9 3ZM-5 -4L-3 -5M2 -3L4 -2M5 3L4 5M-2 5L-4 4", dots: [[9, -7, 1.15], [-9, 3, 1.15]], filesDots: [] },
  "marine-biology": { d: "M-9 0L-4 -5H3L9 0 3 5H-4ZM-9 0L-11 -4V4ZM-3 -4L-1 0-3 4M-2 8L2 7 6 8", dots: [[5, -1, 1.15], [-1, 0, 1.15]], filesDots: [[5, -1, 1.265]] },
  "meditation": { d: "M0 9L-4 2-3 -5 0 -10 3 -5 4 2 0 9ZM0 9L-7 5-10 -3-4 0M0 9L7 5 10 -3 4 0", dots: [[0, -10, 1.15], [0, 9, 1.15]], filesDots: [] },
  "music": { d: "M-4 5V-7L8 -9V3M-4 -3L8 -5M-4 5L-7 4-10 6-9 9-6 9-4 7ZM8 3L5 2 2 4 3 7 6 7 8 5Z", dots: [[-4, -7, 1.15], [8, -9, 1.15]], filesDots: [] },
  "mycology": { d: "M-10 0L-7 -6 0 -9 7 -6 10 0ZM-3 0V7L0 9 3 7V0M-8 0L0 -3 8 0", dots: [[0, -9, 1.15], [-5, -4, 1.15], [5, -4, 1.15]], filesDots: [] },
  "parkour": { d: "M0 -4L-3 -1-7 -2M-2 -1L2 1 6 -3M2 1L6 5 9 4M2 1L-1 6-6 6M-9 10V4H-5", dots: [[2, -7, 1.15], [6, -3, 1.15]], filesDots: [[2, -7, 1.265]] },
  "philosophy": { d: "M-9 -5L0 -10 9 -5ZM-7 -2V6M-2 -2V6M3 -2V6M8 -2V6M-10 9H10M-8 6H9", dots: [[0, -10, 1.15], [-10, 9, 1.15]], filesDots: [] },
  "photography": { d: "M-10 -4H-6L-4 -8H3L5 -4H10V8H-10ZM0 -2L4 1V5L0 7-4 5V1ZM6 -1H8", dots: [[0, 2, 1.15], [-10, 8, 1.15]], filesDots: [] },
  "pottery": { d: "M-5 -9H5L4 -5 8 1 6 8H-6L-8 1-4 -5ZM-8 1L0 5 8 1M-6 8H6", dots: [[0, 5, 1.15], [-5, -9, 1.15]], filesDots: [] },
  "rock-climbing": { d: "M-9 9L-5 -2 1 -9 9 9ZM-4 8L-1 3 3 1 1 -3 3 -5", dots: [[3, -5, 1.15], [-1, 3, 1.15]], filesDots: [] },
  "running": { d: "M2 -4L-1 0 3 4 1 9M-1 0L-5 5-9 4M0 -3L-5 -5-8 -2M0 -2L5 0 8 -3", dots: [[4, -7, 1.15], [1, 9, 1.15]], filesDots: [[4, -7, 1.265]] },
  "skateboarding": { d: "M-10 -1L-7 3H7L10 -1M-7 3L-6 7M7 3L6 7M-8 -5L7 -7", dots: [[-6, 7, 1.15], [6, 7, 1.15]], filesDots: [] },
  "surfing": { d: "M-10 7L-6 -1-1 -6H5L9 -2 8 2 4 4 1 1 3 -1M-10 9H8M-4 5L-1 2", dots: [[-1, -6, 1.15], [4, 4, 1.15]], filesDots: [] },
  "urban-exploration": { d: "M-9 9V-5L-3 -8V9M-3 9V-2L4 -5 9 -2V9M-9 9H9M1 9V3H5V9M-7 -3H-5M-7 1H-5", dots: [[-3, -8, 1.15], [9, -2, 1.15]], filesDots: [] },
  "volunteering": { d: "M-10 3L-6 2-2 5H4L7 3 10 4 5 9H-2L-8 6M0 1L-5 -4-4 -8-1 -9 2 -6 5 -9 8 -7 8 -4 2 2", dots: [[-10, 3, 1.15], [5, 9, 1.15]], filesDots: [] },
  "weaving": { d: "M-8 -8H8V8H-8ZM-4 -8V-3M-4 1V8M0 -8V1M0 5V8M4 -8V-3M4 1V8M-8 -4H8M-8 0H8M-8 4H8", dots: [[-8, -8, 1.15], [8, 8, 1.15]], filesDots: [] },
  "yoga": { d: "M0 -4V1L-5 5-9 7 0 9 9 7 5 5 0 1M-6 -1L-3 2H3L6 -1", dots: [[0, -7, 1.15], [-9, 7, 1.15], [9, 7, 1.15]], filesDots: [[0, -7, 1.265]] },
  "zumba": { d: "M0 -4L-2 1 1 5-4 9M1 5L6 8M-2 0L-7 -2-9 -6M-1 -2L5 -4 7 -8", dots: [[1, -7, 1.15], [-9, -6, 1.15], [7, -8, 1.15]], filesDots: [[1, -7, 1.265]] },
};

export const KIT_CONTROL_GLYPHS: Record<ControlId, KitGlyph> = {
  "collection": { d: "M-9 -7H-1L2 -4H10V9H-9ZM-9 -2H10M-6 -10H3L5 -7", dots: [[2, -4, 1.15]], filesD: "M-9 -6Q-9 -8-7 -8H-2L1 -5H8Q10 -5 10 -3V7Q10 9 8 9H-7Q-9 9-9 7ZM-9 -3H10", filesDots: [] },
  "discover": { d: "M0 -9L8 -4 9 3 3 9-5 7-9 0-5 -7ZM4 -4L1 3-4 4-1 -3Z", dots: [[0, 0, 1.15]], filesD: "M0 -9A9 9 0 1 1 0 9A9 9 0 1 1 0 -9M4 -4L1.5 1.5-4 4-1.5 -1.5Z", filesDots: [] },
  "graph": { d: "M-8 5L-2 -6 8 -2 4 8-8 5ZM-2 -6L4 8", dots: [[-8, 5, 1.15], [-2, -6, 1.15], [8, -2, 1.15], [4, 8, 1.15]], filesD: "M-7 5L-1 -6 8 -1 4 8-7 5M-1 -6L4 8", filesDots: [[-7, 5, 1.87], [-1, -6, 1.87], [8, -1, 1.87], [4, 8, 1.87]] },
  "profile": { d: "M-4 -5L-2 -9H3L5 -5 3 -1H-2ZM-9 9L-7 4 0 2 7 4 9 9Z", dots: [[0, 2, 1.15]], filesD: "M0 -9A4 4 0 1 1 0 -1A4 4 0 1 1 0 -9M-8 9Q-8 2 0 2Q8 2 8 9Z", filesDots: [] },
};

// The Files carriers, lifted verbatim from the supplied SVGs. Every icon in
// that kit draws the same folder or the same sheet of paper and changes only
// the pictogram inside it, so the carrier is written once here rather than 58
// times. Coordinates are on the kit's own 0..80 box.
export const FILES_BOX = 80;

/** Interest clusters are folders: a back flap, a front pocket, one highlight. */
export const FILES_FOLDER = {
  back: "M7 21Q7 15 13 15H28Q31 15 34 19L37 22H67Q73 22 73 28V57Q73 64 66 64H14Q7 64 7 57Z",
  front: "M10 29H70Q76 29 75 35L72 61Q72 66 66 66H14Q8 66 8 61L5 35Q4 29 10 29Z",
  lip: "M11 30H69",
  backTop: "#33AAEA",
  backBottom: "#137DC9",
  frontTop: "#72D0FA",
  frontBottom: "#2799E5",
  lipStroke: "#C7EFFF",
  ink: "#07527E",
  /** Where the pictogram sits inside the pocket, and how big. */
  glyph: { x: 40, y: 47, scale: 1.03 },
} as const;

/** Hobbies are documents: a dropped shadow, the sheet, a folded corner. */
export const FILES_DOCUMENT = {
  shadow: "M20 9H48L62 23V67Q62 73 56 73H20Q14 73 14 67V15Q14 9 20 9Z",
  sheet: "M20 8H48L62 22V66Q62 72 56 72H20Q14 72 14 66V14Q14 8 20 8Z",
  fold: "M48 8V18Q48 22 52 22H62",
  rule: "M30 64H46",
  paperTop: "#FFFFFF",
  paperBottom: "#F0F3F6",
  edge: "#D6DCE5",
  foldFill: "#E0E7F0",
  foldEdge: "#D1D9E4",
  ruleStroke: "#CDD5E0",
  shadowFill: "#CCD3DD",
  ink: "#667084",
  glyph: { x: 38, y: 45, scale: 1.2 },
} as const;

/** Stroke weight the kits draw their pictograms at, in glyph units. */
export const KIT_STROKE = 1.35;
export const FILES_STROKE = 1.65;
