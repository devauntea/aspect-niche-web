// "Down the rabbit hole" geometry — the running-hare constellation (Lepus
// style) and its dive. Single source of truth: RabbitHoleLoader renders it,
// the static mark uses it, and public/brand assets are generated from it
// (scripts parse this file — keep the data shape as-is).
//
// Canvas 640×440. The hare runs right; ground plane at y=396; the hole spans
// x 350–510 (cx 430). During the dive the nose crosses ground at x≈498.

export const HARE_VIEWBOX = "0 0 640 440";
export const GROUND_Y = 396;
export const HOLE = { cx: 430, cy: 396, rx: 80, ry: 13 };

export type HareStar = { x: number; y: number };

// 16 stars, ignition order: nose → head/ears → back → tail → legs
export const HARE_STARS: HareStar[] = [
  { x: 452, y: 316 }, // 0  nose
  { x: 430, y: 292 }, // 1  forehead
  { x: 406, y: 278 }, // 2  ear base
  { x: 378, y: 246 }, // 3  ear tip (near)
  { x: 356, y: 256 }, // 4  ear tip (far)
  { x: 388, y: 292 }, // 5  neck
  { x: 348, y: 288 }, // 6  shoulder
  { x: 300, y: 276 }, // 7  mid back
  { x: 252, y: 284 }, // 8  rump top
  { x: 224, y: 300 }, // 9  COTTON TAIL — alpha star
  { x: 248, y: 320 }, // 10 hind leg top
  { x: 198, y: 354 }, // 11 hind foot (extended back)
  { x: 306, y: 328 }, // 12 belly
  { x: 360, y: 320 }, // 13 chest
  { x: 398, y: 330 }, // 14 front knee
  { x: 436, y: 358 }, // 15 front paw (reaching forward)
];

export const HARE_ALPHA_INDEX = 9;

// Constellation lines, drawn point-to-point in this order
export const HARE_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [1, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [10, 12],
  [12, 13],
  [13, 5],
  [13, 14],
  [14, 15],
];

// The hare's shadow silhouette — a soft running-hare shape enclosing every
// star ("the oh, it's a rabbit moment"). Filled at low opacity.
export const HARE_SILHOUETTE =
  "M 467 318 C 466 305 458 305 445 290 C 432 275 403 238 389 229 C 375 22" +
  "1 380 231 363 237 C 346 243 309 260 288 267 C 267 275 252 275 237 281 " +
  "C 222 286 207 286 198 299 C 189 312 165 354 181 360 C 197 366 255 341 " +
  "294 337 C 332 333 385 331 412 336 C 438 341 442 370 452 367 C 461 364 " +
  "468 330 467 318 Z";

/**
 * The 7s beat sheet (percentages of the loop). Kept exactly per the brand
 * work order — reimplementations must preserve these timings.
 */
export const BEATS = {
  totalMs: 7000,
  stars: [0, 26], // 16 stars pop sequentially
  alpha: [28, 33], // cotton-tail ignites with cross-sparkle
  connect: [30, 42], // lines draw point-to-point
  reveal: [40, 50], // shadow fades in (0 → 0.15)
  hole: [50, 56], // hole opens, violet-rimmed
  jump: [58, 84], // crouch → leap → dive; clip swallows at the hole
  splash: [80, 90], // ripple + three star sparks
  reset: [90, 100], // hole closes, fade, loop
} as const;
