import { describe, it, expect } from "vitest";
import {
  buildInterestNodes,
  buildActivityNodes,
  buildVisibleEdges,
} from "@/lib/graphUtils";
import { interests, activities } from "@/data/activities";

describe("buildInterestNodes", () => {
  it("centers a single interest at the graph origin (300, 260)", () => {
    const nodes = buildInterestNodes(["fitness"]);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe("fitness");
    expect(nodes[0].type).toBe("interest");
    expect(nodes[0].position).toEqual({ x: 300, y: 260 });
  });

  it("creates one node per selected interest", () => {
    const ids = interests.slice(0, 3).map((i) => i.id);
    const nodes = buildInterestNodes(ids);
    expect(nodes.map((n) => n.id)).toEqual(ids);
    expect(nodes.every((n) => n.type === "interest")).toBe(true);
  });
});

describe("buildActivityNodes", () => {
  it("returns one node per known activity in the interest cluster", () => {
    const interest = interests.find((i) => i.activityIds.length > 0)!;
    const known = interest.activityIds.filter((id) =>
      activities.some((a) => a.id === id),
    );
    const nodes = buildActivityNodes(interest.id, { x: 300, y: 260 }, 300, 260);
    expect(nodes).toHaveLength(known.length);
    expect(nodes.every((n) => n.type === "activity")).toBe(true);
  });

  it("returns nothing for an unknown interest id", () => {
    expect(
      buildActivityNodes("does-not-exist", { x: 0, y: 0 }, 300, 260),
    ).toEqual([]);
  });
});

describe("buildVisibleEdges", () => {
  it("emits edges only for selected interests whose activities are visible", () => {
    const interest = interests.find((i) => i.activityIds.length > 0)!;
    const actId = interest.activityIds[0];
    const visible = new Set<string>([interest.id, actId]);

    const edges = buildVisibleEdges(visible, [interest.id]);
    expect(edges).toContainEqual({
      id: `e-${interest.id}-${actId}`,
      source: interest.id,
      target: actId,
    });
  });

  it("omits edges for interests that are not selected", () => {
    const interest = interests.find((i) => i.activityIds.length > 0)!;
    const actId = interest.activityIds[0];
    const visible = new Set<string>([interest.id, actId]);

    const edges = buildVisibleEdges(visible, []); // nothing selected
    expect(edges).toHaveLength(0);
  });

  it("skips activities that are not in the visible set", () => {
    const interest = interests.find((i) => i.activityIds.length > 0)!;
    const visible = new Set<string>([interest.id]); // interest visible, no activities
    const edges = buildVisibleEdges(visible, [interest.id]);
    expect(edges).toHaveLength(0);
  });
});
