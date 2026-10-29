// Making the invitation card's words fit the card.
//
// The card is a fixed 1200x630 with the copy in two groups pushed apart:
// who/what/note at the top, date/place at the bottom. The title size used to
// be picked from its character count alone, which never asked how many LINES
// it would take -- "Morning photo walk" is only 18 characters, wrapped onto a
// second line at 116px, and pushed the place off the bottom edge. Satori
// cannot measure text for us before it draws, so this estimates the wrap from
// an average glyph width and picks the largest size where everything fits.
//
// Pure on purpose, so the arithmetic is testable without rendering a PNG.

/** The width the copy is set in: the card less its 76px padding each side. */
export const TEXT_WIDTH = 1200 - 76 * 2;
/** The height the two groups share: the card less its 76px padding. */
export const TEXT_HEIGHT = 630 - 76 * 2;

/**
 * Average advance of a glyph, as a fraction of the font size. Measured at
 * about 0.50 on the card's own font; set higher so an estimate errs toward a
 * line too many (a size smaller than needed) rather than one too few (clipped).
 */
const EM = 0.55;

/** The title sizes to try, largest first. */
export const TITLE_SIZES = [116, 104, 92, 82, 74, 66, 60] as const;
const TITLE_LEADING = 1.05;
const MAX_TITLE_LINES = 3;

const NOTE_SIZE = 38;
const NOTE_LEADING = 1.3;
const NOTE_MAX = 84;

/** Satori's line height for text that sets none. */
const NORMAL_LEADING = 1.2;

/** Space the two groups keep between them at the tightest. */
const MIN_GAP = 20;

function charsPerLine(size: number): number {
  return Math.max(1, Math.floor(TEXT_WIDTH / (size * EM)));
}

/** How many lines `text` wraps to at `size`, breaking between words. */
export function lineCount(text: string, size: number): number {
  const per = charsPerLine(size);
  let lines = 1;
  let used = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    // A word longer than a line breaks mid-word, as Satori does.
    const len = word.length;
    const need = used === 0 ? len : used + 1 + len;
    if (need <= per) {
      used = need;
      continue;
    }
    if (used > 0) lines += 1;
    lines += Math.floor(Math.max(0, len - 1) / per);
    used = len % per || per;
  }
  return lines;
}

/** Cuts `text` with "..." so it wraps to no more than `lines` at `size`. */
function clampToLines(text: string, size: number, lines: number): string {
  if (lineCount(text, size) <= lines) return text;
  let cut = Math.min(text.length, charsPerLine(size) * lines);
  while (
    cut > 1 &&
    lineCount(`${text.slice(0, cut).trimEnd()}...`, size) > lines
  )
    cut -= 1;
  // End on a whole word when there is one to end on: "throwing..." can be
  // read back, "throwi..." cannot.
  const space = text.lastIndexOf(" ", cut);
  if (space > cut / 2) cut = space;
  return `${text
    .slice(0, cut)
    .trimEnd()
    .replace(/[,;:.-]+$/, "")}...`;
}

function shorten(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

export type CardFit = { titleSize: number; title: string; note: string };

/**
 * The largest title size at which the label, title, note, date and place all
 * fit, with the note and title as given. When nothing fits, the note drops to
 * one line, and then the title is cut to three lines at the smallest size.
 */
export function fitCard({
  title,
  note,
  place,
}: {
  title: string;
  note: string;
  place: string;
}): CardFit {
  const label = 36 * NORMAL_LEADING;
  const bottom =
    2 + 30 + 52 * NORMAL_LEADING + (place ? 14 + 40 * NORMAL_LEADING : 0);

  const height = (size: number, t: string, n: string) =>
    label +
    18 +
    lineCount(t, size) * size * TITLE_LEADING +
    (n ? 28 + lineCount(n, NOTE_SIZE) * NOTE_SIZE * NOTE_LEADING : 0) +
    MIN_GAP +
    bottom;

  const fullNote = shorten(note, NOTE_MAX);
  const oneLineNote = clampToLines(note, NOTE_SIZE, 1);

  for (const n of [fullNote, oneLineNote]) {
    for (const size of TITLE_SIZES) {
      if (lineCount(title, size) > MAX_TITLE_LINES) continue;
      if (height(size, title, n) <= TEXT_HEIGHT)
        return { titleSize: size, title, note: n };
    }
  }

  // Still too much: the smallest size, and the title cut to what is left.
  const size = TITLE_SIZES[TITLE_SIZES.length - 1];
  const room =
    TEXT_HEIGHT - height(size, "", oneLineNote) + size * TITLE_LEADING;
  const lines = Math.max(
    1,
    Math.min(MAX_TITLE_LINES, Math.floor(room / (size * TITLE_LEADING))),
  );
  return {
    titleSize: size,
    title: clampToLines(title, size, lines),
    note: oneLineNote,
  };
}
