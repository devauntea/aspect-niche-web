import { describe, it, expect } from "vitest";
import { mergePlan, resolvedPlan } from "./merge";
import type { DatePlan } from "./store";

// Real data ids: fitness → yoga/rock-climbing…, culinary → cooking/baking…
function basePlan(): DatePlan {
  return {
    id: "date-TEST01",
    createdAt: 0,
    status: "responded",
    inviter: { name: "Dev", interestIds: ["fitness", "culinary"] },
    guest: { name: "Alex", interestIds: ["culinary", "creative"] },
    proposal: {
      activityIds: ["yoga", "cooking", "rock-climbing"],
      budget: { min: 20, max: 80 },
      dinnerOptionIds: ["sushi", "italian", "tacos"],
      windows: [
        { id: "w1", start: "2026-07-11T18:00" },
        { id: "w2", start: "2026-07-12T12:00" },
      ],
    },
    response: {
      activityVotes: { cooking: "up", yoga: "down" },
      budget: { min: 40, max: 120 },
      dinnerVotes: ["italian", "ramen"],
      windowVotes: ["w2"],
    },
  };
}

describe("mergePlan", () => {
  it("finds shared and unique interests in stable order", () => {
    const m = mergePlan(basePlan());
    expect(m.sharedInterestIds).toEqual(["culinary"]);
    expect(m.inviterOnlyIds).toEqual(["fitness"]);
    expect(m.guestOnlyIds).toEqual(["creative"]);
  });

  it("picks the upvoted activity in a shared interest and skips downvotes", () => {
    const m = mergePlan(basePlan());
    expect(m.activityId).toBe("cooking"); // up + shared culinary
    expect(m.activityNote).toBe("both-in");
  });

  it("falls back to shared-interest candidates when nothing is upvoted", () => {
    const plan = basePlan();
    plan.response!.activityVotes = { yoga: "down" };
    const m = mergePlan(plan);
    expect(m.activityId).toBe("cooking"); // culinary is shared
    expect(m.activityNote).toBe("shared-interest");
  });

  it("intersects budgets", () => {
    const m = mergePlan(basePlan());
    expect(m.budget).toEqual({ min: 40, max: 80 });
    expect(m.budgetConflict).toBe(false);
  });

  it("flags a budget conflict when ranges do not overlap", () => {
    const plan = basePlan();
    plan.response!.budget = { min: 100, max: 200 };
    const m = mergePlan(plan);
    expect(m.budget).toBeNull();
    expect(m.budgetConflict).toBe(true);
  });

  it("agrees on the first dinner both picked, flags conflict otherwise", () => {
    expect(mergePlan(basePlan()).dinnerId).toBe("italian");
    const plan = basePlan();
    plan.response!.dinnerVotes = ["ramen"];
    const m = mergePlan(plan);
    expect(m.dinnerId).toBeNull();
    expect(m.dinnerConflict).toBe(true);
  });

  it("converges on the first window that works, flags conflict otherwise", () => {
    expect(mergePlan(basePlan()).windowId).toBe("w2");
    const plan = basePlan();
    plan.response!.windowVotes = [];
    const m = mergePlan(plan);
    expect(m.windowId).toBeNull();
    expect(m.timeConflict).toBe(true);
  });

  it("is deterministic for identical input", () => {
    expect(mergePlan(basePlan())).toEqual(mergePlan(basePlan()));
  });
});

describe("resolvedPlan", () => {
  it("applies manual resolutions and clears their conflicts", () => {
    const plan = basePlan();
    plan.response!.dinnerVotes = ["ramen"]; // dinner conflict
    plan.response!.windowVotes = []; // time conflict
    plan.resolutions = { dinnerId: "tacos", windowId: "w1" };
    const m = resolvedPlan(plan);
    expect(m.dinnerId).toBe("tacos");
    expect(m.dinnerConflict).toBe(false);
    expect(m.windowId).toBe("w1");
    expect(m.timeConflict).toBe(false);
  });
});
