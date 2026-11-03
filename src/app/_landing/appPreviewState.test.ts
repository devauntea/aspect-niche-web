import { describe, expect, it } from "vitest";
import { previewReducer, screenForProgress } from "./appPreviewState";

describe("guided app preview ownership", () => {
  it("does not overwrite an explicitly opened session while scrolling in either direction", () => {
    const state = previewReducer(
      { screen: "graph", manual: false },
      { type: "choose", screen: "session" },
    );
    expect(previewReducer(state, { type: "scroll", progress: 1 })).toBe(state);
    expect(previewReducer(state, { type: "scroll", progress: 0 })).toBe(state);
  });
  it("only resumes the scroll sequence when explicitly asked", () => {
    const resumed = previewReducer(
      { screen: "gallery", manual: true },
      { type: "follow", progress: 0.9 },
    );
    expect(resumed).toEqual({ screen: "progress", manual: false });
    expect(previewReducer(resumed, { type: "scroll", progress: 0 })).toEqual({
      screen: "graph",
      manual: false,
    });
  });
  it("handles bounds and non-finite scroll measurements", () => {
    expect(screenForProgress(-1)).toBe("graph");
    expect(screenForProgress(0.5)).toBe("plan");
    expect(screenForProgress(2)).toBe("progress");
    expect(screenForProgress(NaN)).toBe("graph");
    expect(screenForProgress(Infinity)).toBe("graph");
  });
});
