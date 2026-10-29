import { describe, expect, it } from "vitest";
import { lineCount, NORMAL_LEADING, TEXT_HEIGHT } from "../../cardText";
import { fitPoster, TITLE_SIZES } from "./fit";

const LARGEST = TITLE_SIZES[0];
const SMALLEST = TITLE_SIZES[TITLE_SIZES.length - 1];
const LONG_HOST =
  "Alexandria Montgomery-Fitzgerald-Worthington III would love to take you out";
const DAY = "Wednesday, September 30";

/** The poster's height for a fit, the same arithmetic the route draws. */
function height(f: ReturnType<typeof fitPoster>, day: string | null): number {
  return (
    30 * NORMAL_LEADING +
    20 +
    lineCount(f.headline, 40) * 40 * NORMAL_LEADING +
    18 +
    lineCount(f.title, f.titleSize) * f.titleSize * 1.05 +
    (day ? 18 + 44 * NORMAL_LEADING : 0)
  );
}

describe("fitPoster", () => {
  it("keeps a short title at the largest size", () => {
    const f = fitPoster({
      headline: "Dev would love to take you out",
      title: "Dinner",
      day: DAY,
    });
    expect(f.titleSize).toBe(LARGEST);
    expect(f.title).toBe("Dinner");
  });

  it("shrinks a title of wide letters instead of pushing the day off", () => {
    const title =
      "WWWWWWWW WWWWWWWW WWWWWWWW WWWWWWWW WWWWWWWW WWWWWWWW WWWWWWWW WWWWWWWW WWWWWWW";
    const f = fitPoster({ headline: LONG_HOST, title, day: DAY });
    expect(height(f, DAY)).toBeLessThanOrEqual(TEXT_HEIGHT);
    expect(lineCount(f.title, f.titleSize)).toBeLessThanOrEqual(3);
  });

  it("keeps a long host's headline to two lines", () => {
    const f = fitPoster({
      headline: LONG_HOST + " " + LONG_HOST,
      title: "Dinner",
      day: DAY,
    });
    expect(lineCount(f.headline, 40)).toBeLessThanOrEqual(2);
  });

  it("fits the longest title the link allows with the longest host", () => {
    const title =
      "An evening of tapas, live flamenco, and a late walk across the old bridge after";
    const f = fitPoster({ headline: LONG_HOST, title, day: DAY });
    expect(f.title).toBe(title);
    expect(height(f, DAY)).toBeLessThanOrEqual(TEXT_HEIGHT);
  });

  it("gives the title more room when there is no day", () => {
    const title =
      "Unforgettable,, Extraordinarily, Breathtakingly, Spectacularly, Wonderful";
    const withDay = fitPoster({ headline: LONG_HOST, title, day: DAY });
    const without = fitPoster({ headline: LONG_HOST, title, day: null });
    expect(without.titleSize).toBeGreaterThanOrEqual(withDay.titleSize);
    expect(height(without, null)).toBeLessThanOrEqual(TEXT_HEIGHT);
  });

  it("only cuts at the smallest size", () => {
    const f = fitPoster({
      headline: LONG_HOST,
      title: "W".repeat(80),
      day: DAY,
    });
    if (f.title.endsWith("...")) expect(f.titleSize).toBe(SMALLEST);
    expect(height(f, DAY)).toBeLessThanOrEqual(TEXT_HEIGHT);
  });
});
