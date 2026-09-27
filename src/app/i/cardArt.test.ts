import { afterEach, describe, expect, it, vi } from "vitest";
import { cardArtUrl } from "./cardArt";
import { datePreview, posterQuery, previewFromQuery } from "../p/preview";

describe("the link preview's background", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the card-sized JPEG of the artwork in either layout", () => {
    expect(cardArtUrl({ layout: "full", art: "heart" }, "https://aspectniche.com")).toBe(
      "https://aspectniche.com/invite-art/heart-card.jpg",
    );
    expect(cardArtUrl({ layout: "banner", art: "heart" }, "https://aspectniche.com")).toBe(
      "https://aspectniche.com/invite-art/heart-card.jpg",
    );
    expect(cardArtUrl({ layout: "banner", art: "nope" }, "https://aspectniche.com")).toBeNull();
    expect(cardArtUrl(undefined, "https://aspectniche.com")).toBeNull();
  });

  it("uses the host's photo only from this site's own project", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://proj.supabase.co");
    expect(cardArtUrl({ layout: "full", art: "photo", photo: "Qx7_aB3k9LmN2pRt5vWz" }, "https://x")).toBe(
      "https://proj.supabase.co/storage/v1/object/public/invite-backgrounds/Qx7_aB3k9LmN2pRt5vWz.jpg",
    );
  });

  it("carries a date's background to its poster, and nothing else new", () => {
    const plan = {
      planId: "p",
      inviterName: "Ada",
      inviterInterestIds: [],
      activityIds: [],
      budget: { min: 0, max: 1_000_000 },
      dinnerOptionIds: [],
      windows: [{ id: "w", start: "2026-10-03T22:00:00.000Z" }],
      title: "Rooftop picnic",
      preferPublic: false,
      extras: {
        meetAt: "SENTINEL-home-address",
        meetUndecided: false,
        note: "",
        stops: [],
        bring: "",
        wear: "",
        access: "",
        background: { layout: "full" as const, art: "ribbons" },
      },
    };
    const q = posterQuery(datePreview(plan));
    expect(q).toContain("b=f4");
    expect(q).not.toContain("SENTINEL");
    expect(previewFromQuery(new URLSearchParams(q)).background).toEqual({ layout: "full", art: "ribbons" });
  });
});
