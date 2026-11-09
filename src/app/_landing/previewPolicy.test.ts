import { describe, expect, it } from "vitest";
import { decidePreview, type DeviceSignals } from "./previewPolicy";

const capable: DeviceSignals = {
  saveData: false,
  effectiveType: "4g",
  deviceMemory: 8,
  cores: 8,
  reducedMotion: false,
  seen: false,
};

describe("hobby scene preview policy", () => {
  it("loads and previews the full tour on a capable first visit", () => {
    expect(decidePreview(capable)).toEqual({
      autoload: true,
      preview: true,
      short: false,
    });
  });
  it("never replays once seen", () => {
    expect(decidePreview({ ...capable, seen: true }).preview).toBe(false);
  });
  it("respects reduced motion: the scene loads, the preview does not play", () => {
    expect(decidePreview({ ...capable, reducedMotion: true })).toMatchObject({
      autoload: true,
      preview: false,
    });
  });
  it("waits for an explicit tap when saving data, on 2G or on very low memory", () => {
    for (const change of [
      { saveData: true },
      { effectiveType: "slow-2g" },
      { effectiveType: "2g" },
      { deviceMemory: 2 },
    ]) {
      expect(decidePreview({ ...capable, ...change })).toMatchObject({
        autoload: false,
        preview: false,
      });
    }
  });
  it("abbreviates on slow devices", () => {
    expect(decidePreview({ ...capable, cores: 4 }).short).toBe(true);
    expect(decidePreview({ ...capable, deviceMemory: 4 }).short).toBe(true);
    expect(decidePreview({ ...capable, effectiveType: "3g" }).short).toBe(true);
  });
});
