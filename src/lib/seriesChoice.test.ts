import { describe, expect, it } from "vitest";
import { afterTap } from "@/lib/seriesChoice";
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

