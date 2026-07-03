import { describe, it, expect } from "vitest";
import {
  getWhyItFits,
  getBeginnerChecklist,
  getSimilarActivities,
} from "@/lib/recommendations";
import { interests, activities } from "@/data/activities";
import type { Activity, TagSet } from "@/types/graph";

// Build a synthetic activity so tag-logic tests don't depend on the catalog.
function makeActivity(tags: Partial<TagSet>, id = "test-activity"): Activity {
  return {
    id,
    label: "Test Activity",
    description: "",
    source: "curated",
    tags: {
      environment: "both",
      social: "either",
      difficulty: "intermediate",
      cost: "medium",
      timeCommitment: "moderate",
      ...tags,
    },
  };
}

describe("getWhyItFits", () => {
  it("returns the neutral fallback when no tag triggers a reason", () => {
    // All-neutral tags + no interest match → no reasons collected.
    const a = makeActivity({});
    expect(getWhyItFits(a, [])).toBe("A solid pick based on your interests.");
  });

  it("renders a single reason as 'It's X.'", () => {
    const a = makeActivity({ cost: "free" });
    expect(getWhyItFits(a, [])).toBe(
      "It's easy to start without spending much.",
    );
  });

  it("joins multiple reasons with commas and a trailing '— and'", () => {
    const a = makeActivity({
      cost: "free",
      difficulty: "beginner",
      social: "solo",
    });
    const result = getWhyItFits(a, []);
    expect(result.startsWith("It's ")).toBe(true);
    expect(result).toContain(", ");
    expect(result).toContain(" — and ");
    expect(result.endsWith(".")).toBe(true);
  });

  it("adds an interest-connection reason when the activity is in a selected cluster", () => {
    // Use real data so the interest-match branch exercises the catalog.
    const interest = interests[0];
    const activityId = interest.activityIds[0];
    const activity = activities.find((a) => a.id === activityId)!;
    const result = getWhyItFits(activity, [interest.id]);
    expect(result.toLowerCase()).toContain(
      `connects to your interest in ${interest.label.toLowerCase()}`,
    );
  });

  it("omits the interest reason when no matching interest is selected", () => {
    const a = makeActivity({ cost: "free" });
    expect(getWhyItFits(a, ["nonexistent-interest"])).not.toContain(
      "connects to your interest",
    );
  });
});

describe("getBeginnerChecklist", () => {
  it("always starts with a YouTube lookup step", () => {
    const steps = getBeginnerChecklist(makeActivity({}));
    expect(steps[0]).toBe('Look up "Test Activity for beginners" on YouTube');
  });

  it("recommends borrowing gear for medium/high cost activities", () => {
    const steps = getBeginnerChecklist(makeActivity({ cost: "high" }));
    expect(steps).toContain("Borrow or rent gear before buying anything");
    expect(steps).not.toContain(
      "You likely have everything you need — just start",
    );
  });

  it("reassures that no gear is needed for free/low cost activities", () => {
    const steps = getBeginnerChecklist(makeActivity({ cost: "free" }));
    expect(steps).toContain("You likely have everything you need — just start");
  });

  it("adds a location-scouting step only for outdoor activities", () => {
    const outdoor = getBeginnerChecklist(
      makeActivity({ environment: "outdoors" }),
    );
    const indoor = getBeginnerChecklist(
      makeActivity({ environment: "indoors" }),
    );
    const mapsStep =
      "Pick a specific nearby spot using Google Maps or AllTrails";
    expect(outdoor).toContain(mapsStep);
    expect(indoor).not.toContain(mapsStep);
  });
});

describe("getSimilarActivities", () => {
  it("never includes the input activity and respects the count cap", () => {
    const seed = activities[0];
    const result = getSimilarActivities(seed, [], 3);
    expect(result.every((a) => a.id !== seed.id)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("ranks same-cluster activities above unrelated ones when the cluster is selected", () => {
    // Pick an interest with at least two activities so a cluster-mate exists.
    const interest = interests.find((i) => i.activityIds.length >= 2)!;
    const seedId = interest.activityIds[0];
    const seed = activities.find((a) => a.id === seedId)!;
    const result = getSimilarActivities(seed, [interest.id]);
    const clusterMateIds = interest.activityIds.filter((id) => id !== seedId);
    // The top result should be one of the seed's cluster-mates (cluster weight = 3).
    expect(clusterMateIds).toContain(result[0].id);
  });
});
