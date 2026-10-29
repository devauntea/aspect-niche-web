// Making the date poster's words fit the poster.
//
// The poster puts "Aspect Niche" at the top and one block at the bottom: the
// headline ("<host> would love to take you out"), the title and the day. The
// title size used to be picked from its character count alone, so a title of
// wide letters ran to six lines and pushed the day off the bottom, and a long
// host name wrapped the headline up into "Aspect Niche". The title is capped
// at 80 characters and the host at 60 upstream (preview.ts), so this only has
// to choose a size, and cut only what still cannot fit.
//
// The measuring is shared with the invitation card, in ../../cardText.

import {
  clampToLines,
  lineCount,
  NORMAL_LEADING,
  TEXT_HEIGHT,
} from "../../cardText";

/** The title sizes to try, largest first. */
export const TITLE_SIZES = [120, 108, 96, 86, 76, 68, 60] as const;
const TITLE_LEADING = 1.05;
const MAX_TITLE_LINES = 3;

const BRAND_SIZE = 30;
const HEADLINE_SIZE = 40;
const MAX_HEADLINE_LINES = 2;
const DAY_SIZE = 44;
/** The `gap` between the headline, title and day. */
const GAP = 18;
/** Space kept between "Aspect Niche" and the block at the tightest. */
const MIN_GAP = 20;

export type PosterFit = { titleSize: number; title: string; headline: string };

export function fitPoster({
  headline,
  title,
  day,
}: {
  headline: string;
  title: string;
  day: string | null;
}): PosterFit {
  const head = clampToLines(headline, HEADLINE_SIZE, MAX_HEADLINE_LINES);
  const fixed =
    BRAND_SIZE * NORMAL_LEADING +
    MIN_GAP +
    lineCount(head, HEADLINE_SIZE) * HEADLINE_SIZE * NORMAL_LEADING +
    GAP +
    (day ? GAP + DAY_SIZE * NORMAL_LEADING : 0);
  const titleHeight = (t: string, size: number) =>
    lineCount(t, size) * size * TITLE_LEADING;

  for (const size of TITLE_SIZES) {
    if (lineCount(title, size) > MAX_TITLE_LINES) continue;
    if (fixed + titleHeight(title, size) <= TEXT_HEIGHT)
      return { titleSize: size, title, headline: head };
  }

  // Still too much: the smallest size, and the title cut to what is left.
  const size = TITLE_SIZES[TITLE_SIZES.length - 1];
  const lines = Math.max(
    1,
    Math.min(
      MAX_TITLE_LINES,
      Math.floor((TEXT_HEIGHT - fixed) / (size * TITLE_LEADING)),
    ),
  );
  return {
    titleSize: size,
    title: clampToLines(title, size, lines),
    headline: head,
  };
}
