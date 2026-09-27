import { afterEach, describe, expect, it, vi } from "vitest";
import { artUrl } from "./art";

describe("an invitation's background on the page", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("serves the app's own artwork from this site", () => {
    expect(artUrl({ layout: "banner", art: "heart" })).toBe("/invite-art/heart-banner.webp");
    expect(artUrl({ layout: "full", art: "graphite" })).toBe("/invite-art/graphite-full.webp");
    expect(artUrl({ layout: "full", art: "not-ours" })).toBeNull();
    expect(artUrl(undefined)).toBeNull();
  });

  it("builds a photo only from this site's own storage project", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://proj.supabase.co");
    expect(artUrl({ layout: "full", art: "photo", photo: "Qx7_aB3k9LmN2pRt5vWz" })).toBe(
      "https://proj.supabase.co/storage/v1/object/public/invite-backgrounds/Qx7_aB3k9LmN2pRt5vWz.jpg",
    );
    expect(artUrl({ layout: "full", art: "photo", photo: "https://evil.example/x" })).toBeNull();
  });

  it("draws no photo when the site has no project", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(artUrl({ layout: "banner", art: "photo", photo: "Qx7_aB3k9LmN2pRt5vWz" })).toBeNull();
  });
});
