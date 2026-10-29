// Making the invitation card's words fit the card.
//
// The card is a fixed 1200x630 with the copy in two groups pushed apart:
// who/what/note at the top, date/place at the bottom. The title size used to
// be picked from its character count alone, which never asked how many LINES
// it would take -- "Morning photo walk" is only 18 characters, wrapped onto a
// second line at 116px, and pushed the place off the bottom edge. Satori
// cannot measure text for us before it draws, so this estimates the wrap from
// the glyphs' widths and picks the largest size where everything fits.
//
// The measuring is shared with the plan card, in ../../cardText.

import {
  clampToLines,
  lineCount,
  NORMAL_LEADING,
  TEXT_HEIGHT,
} from "../../cardText";

/** The title sizes to try, largest first. */
export const TITLE_SIZES = [116, 104, 92, 82, 74, 66, 60] as const;
const TITLE_LEADING = 1.05;
const MAX_TITLE_LINES = 3;

const NOTE_SIZE = 38;
const NOTE_LEADING = 1.3;
const NOTE_MAX = 84;

/** Space the two groups keep between them at the tightest. */
const MIN_GAP = 20;

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
