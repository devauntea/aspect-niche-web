import { describe, expect, it } from "vitest";
import { afterTap, answeredGames } from "@/lib/seriesChoice";
import type { SeriesAnswer } from "@/lib/series";

const G = "2026-10-15";

describe("afterTap", () => {
  it("records an answer where there was none", () => {
    expect(afterTap([], "Sam", G, "going")).toBe("going");
  });

  it("takes back the answer you gave when you press it again", () => {
    const answers: SeriesAnswer[] = [{ game: G, name: "Sam", status: "maybe" }];
    expect(afterTap(answers, "sam", G, "maybe")).toBeNull();
  });

  it("changes the answer when you press another", () => {
    const answers: SeriesAnswer[] = [{ game: G, name: "Sam", status: "maybe" }];
    expect(afterTap(answers, "Sam", G, "out")).toBe("out");
  });

  // Going because of "usually in" is not an answer to this game, so there is
  // nothing to take back: pressing it records one.
  it("records Going when it was only implied by usually in", () => {
    const answers: SeriesAnswer[] = [{ game: "usual", name: "Sam", status: "going" }];
    expect(afterTap(answers, "Sam", G, "going")).toBe("going");
  });

  it("only reads the answer for that game", () => {
    const answers: SeriesAnswer[] = [{ game: "2026-10-22", name: "Sam", status: "going" }];
    expect(afterTap(answers, "Sam", G, "going")).toBe("going");
  });
});

describe("answeredGames", () => {
  const answers: SeriesAnswer[] = [
    { game: "2026-10-22", name: "Sam", status: "out" },
    { game: "usual", name: "sam", status: "going" },
    { game: "2026-10-15", name: "Sam", status: "maybe" },
    { game: "2026-10-15", name: "Bo", status: "going" },
  ];

  // What "Take back my answers" sends a clear for: every row that name has.
  it("lists usual first, then each game the name answered, matched in any case", () => {
    expect(answeredGames(answers, "SAM")).toEqual(["usual", "2026-10-15", "2026-10-22"]);
  });

  it("is empty for a name with nothing, or no name", () => {
    expect(answeredGames(answers, "Cy")).toEqual([]);
    expect(answeredGames(answers, "  ")).toEqual([]);
  });
});
