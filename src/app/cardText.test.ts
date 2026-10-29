import { describe, expect, it } from "vitest";
import { clampToLines, lineCount, textWidth } from "./cardText";

describe("textWidth", () => {
  it("measures wide letters wider than narrow ones", () => {
    expect(textWidth("WWWW", 100)).toBeGreaterThan(textWidth("illi", 100) * 2);
  });

  it("errs wide of the measured width", () => {
    // "Morning photo" measured about 756px at 116px on the invitation card.
    expect(textWidth("Morning photo", 116)).toBeGreaterThan(756);
  });
});

describe("lineCount", () => {
  it("counts a wrap that a character count misses", () => {
    expect(lineCount("Morning photo walk", 116)).toBe(2);
    expect(lineCount("WWWWWWWW WWWWWWWW", 76)).toBeGreaterThan(
      lineCount("illillil illillil", 76),
    );
  });

  it("breaks a word too long for any line", () => {
    expect(
      lineCount("Supercalifragilisticexpialidocious", 120),
    ).toBeGreaterThan(1);
  });
});

describe("clampToLines", () => {
  it("leaves text that fits alone", () => {
    expect(clampToLines("Dinner", 120, 1)).toBe("Dinner");
  });

  it("cuts to the lines asked for, on a word", () => {
    const text =
      "An extremely long title for a weekend pottery wheel throwing class";
    const cut = clampToLines(text, 100, 1);
    expect(lineCount(cut, 100)).toBe(1);
    expect(cut.endsWith("...")).toBe(true);
    expect(text.startsWith(cut.replace(/\.\.\.$/, ""))).toBe(true);
    expect(text.split(" ")).toContain(
      cut
        .replace(/\.\.\.$/, "")
        .split(" ")
        .at(-1),
    );
  });
});
