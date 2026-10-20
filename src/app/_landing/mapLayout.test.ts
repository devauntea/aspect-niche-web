import { describe, expect, it } from "vitest";
import { CLUSTERS, HOBBIES, HOBBY_GLYPHS } from "./catalogue";
import { hubBox, layoutMap, MAP_HEIGHT, MAP_WIDTH, starBox } from "./mapLayout";

describe("the landing page's hobby map", () => {
  const { hubs, stars } = layoutMap();

  it("draws the whole catalogue: every hobby once, every cluster once", () => {
    expect(stars).toHaveLength(HOBBIES.length);
    expect(new Set(stars.map((s) => s.hobby.id)).size).toBe(HOBBIES.length);
    expect(hubs.map((h) => h.cluster.id).sort()).toEqual(
      CLUSTERS.map((c) => c.id).sort(),
    );
  });

  it("puts every hobby in at least one cluster, and has a pictogram for each", () => {
    for (const s of stars) {
      expect(s.clusterIds.length).toBeGreaterThan(0);
      expect(HOBBY_GLYPHS[s.hobby.id]).toBeDefined();
    }
  });

  it("keeps every star inside the frame", () => {
    for (const s of stars) {
      expect(s.x).toBeGreaterThan(0);
      expect(s.x).toBeLessThan(MAP_WIDTH);
      expect(s.y).toBeGreaterThan(0);
      expect(s.y).toBeLessThan(MAP_HEIGHT);
    }
  });

  it("leaves no two hobby labels on top of each other", () => {
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = Math.abs(stars[i].x - stars[j].x);
        const dy = Math.abs(stars[i].y - stars[j].y);
        const a = starBox(stars[i].hobby.label);
        const b = starBox(stars[j].hobby.label);
        // Inside both boxes on both axes at once is a collision.
        const hit = dx < (a.w + b.w) / 2 - 1 && dy < (a.h + b.h) / 2 - 1;
        expect(hit, `${stars[i].hobby.id} / ${stars[j].hobby.id}`).toBe(false);
      }
    }
  });

  it("keeps hobbies off the cluster hubs and their names", () => {
    for (const s of stars) {
      for (const h of hubs) {
        const dx = Math.abs(s.x - h.x);
        const dy = Math.abs(s.y - h.y);
        const a = starBox(s.hobby.label);
        const b = hubBox(h.cluster.label);
        const w = (a.w + b.w) / 2 - 1;
        const hh = (a.h + b.h) / 2 - 1;
        expect(dx < w && dy < hh, `${s.hobby.id} on ${h.cluster.id}`).toBe(
          false,
        );
      }
    }
  });

  it("is the same sky every time", () => {
    expect(layoutMap()).toEqual({ hubs, stars });
  });
});
