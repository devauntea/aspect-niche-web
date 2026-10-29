import { describe, expect, it } from "vitest";
import { lineCount } from "../../cardText";
import { fitCard, TITLE_SIZES } from "./fit";

const LARGEST = TITLE_SIZES[0];
const SMALLEST = TITLE_SIZES[TITLE_SIZES.length - 1];

describe("lineCount", () => {
  it("keeps a short title on one line", () => {
    expect(lineCount("Pottery", LARGEST)).toBe(1);
  });

  it("wraps a title that is short in characters but wide at size", () => {
    // The live bug: 18 characters, two lines at 116px.
    expect(lineCount("Morning photo walk", LARGEST)).toBe(2);
  });

  it("breaks a single word longer than a line", () => {
    expect(lineCount("x".repeat(60), LARGEST)).toBeGreaterThan(2);
  });
});

describe("fitCard", () => {
  const place = "Riverside Park";

  it("leaves a short title at the largest size", () => {
    expect(
      fitCard({ title: "Pottery", note: "Bring any camera", place }).titleSize,
    ).toBe(LARGEST);
  });

  it("shrinks a title that wraps, so the place stays on the card", () => {
    const fit = fitCard({
      title: "Morning photo walk",
      note: "Bring any camera",
      place,
    });
    expect(fit.titleSize).toBeLessThan(LARGEST);
    expect(fit.title).toBe("Morning photo walk");
    expect(fit.note).toBe("Bring any camera");
  });

  it("allows a larger title when there is no note or place", () => {
    const busy = fitCard({
      title: "Morning photo walk",
      note: "Bring any camera",
      place,
    });
    const bare = fitCard({ title: "Morning photo walk", note: "", place: "" });
    expect(bare.titleSize).toBeGreaterThan(busy.titleSize);
  });

  it("gives up the note's second line before cutting the title", () => {
    const fit = fitCard({
      title:
        "An extremely long title for a weekend pottery wheel throwing class",
      note: "Bring an apron, old clothes and a towel, plus a snack for the break and a water bottle",
      place: "The Community Ceramics Studio on Atlantic Avenue",
    });
    expect(lineCount(fit.note, 38)).toBe(1);
    expect(fit.note.endsWith("...")).toBe(true);
  });

  it("cuts an absurd title rather than overflow", () => {
    const fit = fitCard({
      title: "word ".repeat(80).trim(),
      note: "a note",
      place,
    });
    expect(fit.titleSize).toBe(SMALLEST);
    expect(fit.title.endsWith("...")).toBe(true);
    expect(lineCount(fit.title, SMALLEST)).toBeLessThanOrEqual(3);
  });

  it("cuts between words, not inside one", () => {
    const title =
      "An extremely long title for a weekend pottery wheel throwing class";
    const fit = fitCard({
      title,
      note:
        "x".repeat(20) +
        " Bring an apron, old clothes and a towel, plus a snack for the break",
      place: "The Community Ceramics Studio on Atlantic Avenue",
    });
    const kept = fit.title.replace(/\.\.\.$/, "").split(" ");
    const words = title.split(" ");
    expect(kept.every((w, i) => w === words[i])).toBe(true);
  });

  it("never changes the words of anything that fits", () => {
    const fit = fitCard({
      title: "Saturday sunrise hike up Bear Mountain",
      note: "Boots, water, a snack",
      place,
    });
    expect(fit.title).toBe("Saturday sunrise hike up Bear Mountain");
    expect(fit.note).toBe("Boots, water, a snack");
  });
});
