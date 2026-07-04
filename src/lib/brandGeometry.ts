// Canonical geometry of the Aspect Niche mark — a constellation rabbit whose
// brightest star is the cotton tail (the "alpha star"). Single source of
// truth: BrandMark.tsx renders it, LogoAnimation animates it, and the static
// files in public/brand/ are generated from it (scripts parse this file — keep
// the data shape exactly as-is).

export type MarkNode = { x: number; y: number };

// viewBox 0 0 360 380 — rabbit faces right, sitting.
export const MARK_NODES: MarkNode[] = [
  { x: 192, y: 52 }, // 0  ear-L tip
  { x: 228, y: 44 }, // 1  ear-R tip
  { x: 204, y: 76 }, // 2  ear-L mid
  { x: 242, y: 72 }, // 3  ear-R mid
  { x: 148, y: 84 }, // 4  brow
  { x: 196, y: 98 }, // 5  ear-L base
  { x: 232, y: 96 }, // 6  ear-R base
  { x: 256, y: 114 }, // 7  head top-right
  { x: 292, y: 135 }, // 8  cheek
  { x: 306, y: 158 }, // 9  snout
  { x: 282, y: 170 }, // 10 jaw
  { x: 250, y: 148 }, // 11 throat
  { x: 222, y: 132 }, // 12 upper back
  { x: 186, y: 138 }, // 13 mid back
  { x: 170, y: 162 }, // 14 hip
  { x: 124, y: 156 }, // 15 haunch top
  { x: 94, y: 178 }, // 16 haunch upper-left
  { x: 88, y: 208 }, // 17 haunch left
  { x: 112, y: 228 }, // 18 haunch bottom center
  { x: 148, y: 216 }, // 19 haunch lower-right
  { x: 152, y: 186 }, // 20 haunch center
  { x: 68, y: 246 }, // 21 ankle
  { x: 80, y: 280 }, // 22 foot mid
  { x: 92, y: 310 }, // 23 foot tip
  { x: 198, y: 200 }, // 24 belly
  { x: 226, y: 214 }, // 25 front thigh
  { x: 258, y: 200 }, // 26 front knee
  { x: 294, y: 212 }, // 27 front paw
  { x: 96, y: 146 }, // 28 COTTON TAIL — the alpha star, off the rump
];

/** Index of the cotton-tail alpha star in MARK_NODES. */
export const ALPHA_INDEX = 28;

/** Slightly larger "anchor" stars. */
export const MAJOR_STARS = [7, 12, 15, 18];

export const MARK_EDGES: [number, number][] = [
  [0, 2],
  [2, 5],
  [1, 3],
  [3, 6],
  [5, 6],
  [0, 1],
  [4, 5],
  [4, 12],
  [5, 7],
  [6, 7],
  [6, 11],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 7],
  [11, 12],
  [7, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [13, 15],
  [14, 20],
  [15, 16],
  [16, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [20, 15],
  [16, 20],
  [16, 18],
  [15, 18],
  [17, 20],
  [19, 18],
  [17, 21],
  [21, 22],
  [22, 23],
  [18, 21],
  [14, 24],
  [20, 24],
  [24, 25],
  [25, 26],
  [26, 27],
  [25, 10],
  [11, 25],
  [24, 19],
  [15, 28],
  [16, 28],
];

export const MARK_VIEWBOX = "0 0 360 380";
