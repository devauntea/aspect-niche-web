import { describe, expect, it } from "vitest";
import { decodePlan, encodePlan } from "@/lib/planLink";
import type { DatePlan } from "@/lib/planTypes";
import { datePreview, posterQuery, previewFromQuery } from "./preview";

const plan: DatePlan = {
  id: "p",
  createdAt: 0,
  status: "invited",
  inviter: { name: "Dev", interestIds: [] },
  proposal: {
    activityIds: [],
    title: "Rooftop picnic",
    budget: { min: 0, max: 60 },
    dinnerOptionIds: [],
    windows: [{ id: "w", start: "2026-10-03T22:00:00.000Z" }],
  },
};

describe("the public link preview", () => {
  it("never carries the meeting point, the note or the itinerary", () => {
    const wire = decodePlan(
      encodePlan(plan, {
        meetAt: "SENTINEL-12 Elm Street, flat 3",
        meetUndecided: false,
        note: "SENTINEL-note",
        stops: [{ title: "SENTINEL-stop", place: "SENTINEL-place", note: "" }],
        bring: "",
        wear: "",
        access: "",
      }),
    );
    const preview = JSON.stringify(datePreview(wire));
    expect(preview).not.toContain("SENTINEL");
    expect(preview).toContain("Rooftop picnic");
    expect(datePreview(wire).headline).toBe("Dev would love to take you out");
  });

  it("hands the poster only the preview fields", () => {
    const q = posterQuery(datePreview(decodePlan(encodePlan(plan, {
      meetAt: "SENTINEL-home", meetUndecided: false, note: "SENTINEL-note", stops: [], bring: "", wear: "", access: "",
    }))));
    expect(q).not.toContain("SENTINEL");
    expect(previewFromQuery(new URLSearchParams(q)).title).toBe("Rooftop picnic");
  });

  it("falls back cleanly for a broken link", () => {
    expect(datePreview(null).title).toBe("A date");
  });
});
