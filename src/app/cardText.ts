// Estimating how text wraps on the link-preview cards (/i/card, /p/card).
//
// Satori lays text out as it draws and gives nothing back, so a card has to
// guess before it draws how many lines a title will take. A flat average glyph
// width was the first guess and is wrong at the ends that matter: a title in
// capitals or full of w's and m's is half again as wide as one of l's and i's,
// and "WWWWWWWW" six times over pushed a plan card's date off the bottom.
// So each glyph is measured by the class it falls in, with a margin that errs
// toward a line too many -- a title one size smaller than it needed to be is
// fine; a clipped date is not.
//
// Pure on purpose, so the arithmetic is testable without rendering a PNG.

/** Both cards set their copy in a 1200px canvas with 76px padding each side. */
export const TEXT_WIDTH = 1200 - 76 * 2;
export const TEXT_HEIGHT = 630 - 76 * 2;

/** Satori's line height for text that sets none. */
export const NORMAL_LEADING = 1.2;

/** Measured widths run about 8% under these; the gap is the safety margin. */
const MARGIN = 1.06;

/** A glyph's advance as a fraction of the font size. */
function glyph(ch: string): number {
  if (ch === " ") return 0.28;
  if ("ijl|!.,:;'’".includes(ch)) return 0.28;
  if ("frt()-".includes(ch)) return 0.36;
  if ("MW".includes(ch)) return 0.95;
  if ("mw".includes(ch)) return 0.85;
  if (/[A-Z]/.test(ch)) return 0.68;
  if (/[0-9]/.test(ch)) return 0.58;
  if (/[a-z]/.test(ch)) return 0.55;
  return 0.62;
}

/** How wide `text` sets at `size`, in pixels, with the margin. */
export function textWidth(text: string, size: number): number {
  let em = 0;
  for (const ch of text) em += glyph(ch);
  return em * size * MARGIN;
}

/**
 * How many lines `text` wraps to at `size` within `width`, breaking between
 * words, and inside a word too long for a line (the cards set
 * `wordBreak: "break-word"` so Satori does the same instead of overflowing).
 */
export function lineCount(
  text: string,
  size: number,
  width = TEXT_WIDTH,
): number {
  const space = textWidth(" ", size);
  let lines = 1;
  let used = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const w = textWidth(word, size);
    const need = used === 0 ? w : used + space + w;
    if (need <= width) {
      used = need;
      continue;
    }
    if (used > 0) lines += 1;
    if (w <= width) {
      used = w;
      continue;
    }
    // Too long for any line: it fills lines glyph by glyph.
    used = 0;
    for (const ch of word) {
      const g = textWidth(ch, size);
      if (used + g > width) {
        lines += 1;
        used = 0;
      }
      used += g;
    }
  }
  return lines;
}

/** Cuts `text` with "..." so it wraps to no more than `lines` at `size`. */
export function clampToLines(
  text: string,
  size: number,
  lines: number,
  width = TEXT_WIDTH,
): string {
  if (lineCount(text, size, width) <= lines) return text;
  const fits = (cut: number) =>
    lineCount(`${text.slice(0, cut).trimEnd()}...`, size, width) <= lines;
  let cut = text.length;
  while (cut > 1 && !fits(cut)) cut -= 1;
  // End on a whole word when there is one to end on: "throwing..." can be
  // read back, "throwi..." cannot.
  const space = text.lastIndexOf(" ", cut);
  if (space > cut / 2) cut = space;
  return `${text
    .slice(0, cut)
    .trimEnd()
    .replace(/[,;:.-]+$/, "")}...`;
}
