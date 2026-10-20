import { CLUSTERS, HOBBIES, type Cluster, type Hobby } from "./catalogue";

// Where every star on the landing page's map sits.
//
// Pure and deterministic: the same catalogue always gives the same sky, on the
// server and in the browser, so there is no hydration mismatch and no layout
// jump. It runs once, at module load.
//
// The shape follows the catalogue rather than decoration:
//   - clusters sit on a ring, ordered so neighbours share hobbies (fitness
//     beside adventure, outdoor beside nature, craft beside creative);
//   - a hobby in one cluster orbits that cluster's hub on the outer side;
//   - a hobby in several sits between them, which is what "linked by what
//     they have in common" looks like;
//   - then everything is pushed apart until no two labels collide.

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 720;

/** Ring order, chosen so adjacent clusters overlap. */
const RING = [
  "fitness",
  "adventure",
  "outdoor",
  "nature",
  "tech",
  "mind",
  "community",
  "social",
  "culinary",
  "craft",
  "creative",
];

export type MapHub = { cluster: Cluster; x: number; y: number };
export type MapStar = {
  hobby: Hobby;
  clusterIds: string[];
  x: number;
  y: number;
};

/** Map units per CSS pixel, for the widths the map is drawn at (roughly
 *  900 to 1000 pixels across on a desktop). */
const UNITS_PER_PX = 1.1;

/** The room a star needs, in map units: its pictogram with the label under
 *  it, as wide as the label is long (0.72rem Inter runs about 6.3px a
 *  character). Sized per label, because "Chess" and "Urban Exploration" do
 *  not need the same room. */
export function starBox(label: string) {
  return {
    w: Math.max(44, label.length * 6.3 + 16) * UNITS_PER_PX,
    h: 52 * UNITS_PER_PX,
  };
}
/** A hub: a larger orb, and its name in the display face. */
export function hubBox(label: string) {
  return {
    w: Math.max(64, label.length * 7.4 + 18) * UNITS_PER_PX,
    h: 72 * UNITS_PER_PX,
  };
}

const MARGIN = { x: 56, y: 36 };

function clusterIdsOf(hobbyId: string): string[] {
  return CLUSTERS.filter((c) => c.hobbyIds.includes(hobbyId)).map((c) => c.id);
}

export function layoutMap(): { hubs: MapHub[]; stars: MapStar[] } {
  const cx = MAP_WIDTH / 2;
  const cy = MAP_HEIGHT / 2;
  const rx = 345;
  const ry = 238;

  const hubs: MapHub[] = RING.map((id, i) => {
    const cluster = CLUSTERS.find((c) => c.id === id)!;
    const angle = -Math.PI / 2 + (i / RING.length) * Math.PI * 2;
    return {
      cluster,
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    };
  });
  const hubAt = (id: string) => hubs.find((h) => h.cluster.id === id)!;

  // Seat single-cluster hobbies around their hub, fanned outward.
  const singles = new Map<string, Hobby[]>();
  for (const hobby of HOBBIES) {
    const ids = clusterIdsOf(hobby.id);
    if (ids.length === 1)
      singles.set(ids[0], [...(singles.get(ids[0]) ?? []), hobby]);
  }

  // Hobbies that share exactly the same clusters would start on exactly the
  // same point; fan each such group out around its centre first.
  const groups = new Map<string, Hobby[]>();
  for (const hobby of HOBBIES) {
    const key = clusterIdsOf(hobby.id).join("+");
    groups.set(key, [...(groups.get(key) ?? []), hobby]);
  }

  const stars: MapStar[] = HOBBIES.map((hobby) => {
    const clusterIds = clusterIdsOf(hobby.id);
    if (clusterIds.length > 1) {
      const xs = clusterIds.map((id) => hubAt(id));
      let x = xs.reduce((s, h) => s + h.x, 0) / xs.length;
      let y = xs.reduce((s, h) => s + h.y, 0) / xs.length;
      // Pull shared hobbies slightly toward the middle, so the ones that
      // bridge far-apart clusters read as bridges.
      x += (cx - x) * 0.12;
      y += (cy - y) * 0.12;
      const group = groups.get(clusterIds.join("+"))!;
      if (group.length > 1) {
        const a = (group.indexOf(hobby) / group.length) * Math.PI * 2;
        x += Math.cos(a) * 52;
        y += Math.sin(a) * 30;
      }
      return { hobby, clusterIds, x, y };
    }
    const hub = hubAt(clusterIds[0]);
    const siblings = singles.get(clusterIds[0])!;
    const k = siblings.indexOf(hobby);
    const outward = Math.atan2(hub.y - cy, hub.x - cx);
    const angle = outward + (k - (siblings.length - 1) / 2) * 0.62;
    return {
      hobby,
      clusterIds,
      x: hub.x + Math.cos(angle) * 98,
      y: hub.y + Math.sin(angle) * 64,
    };
  });

  // Seat each hobby at the free spot nearest its ideal one: search outward
  // from the ideal point in rings on a fine grid, and take the first spot
  // whose label box clears every hub and every hobby already seated. Hobbies
  // that bridge clusters are seated first, since their place carries the most
  // meaning. Collisions are impossible by construction, and the same
  // catalogue always yields the same sky.
  type Box = { x: number; y: number; w: number; h: number };
  const taken: Box[] = hubs.map((h) => ({
    x: h.x,
    y: h.y,
    ...hubBox(h.cluster.label),
  }));
  const clear = (x: number, y: number, me: { w: number; h: number }) =>
    x >= MARGIN.x &&
    x <= MAP_WIDTH - MARGIN.x &&
    y >= MARGIN.y &&
    y <= MAP_HEIGHT - MARGIN.y &&
    taken.every(
      (b) =>
        Math.abs(b.x - x) >= (b.w + me.w) / 2 ||
        Math.abs(b.y - y) >= (b.h + me.h) / 2,
    );

  const order = stars
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.clusterIds.length - a.s.clusterIds.length || a.i - b.i);
  const STEP = 6;
  for (const { s } of order) {
    const me = starBox(s.hobby.label);
    let placed = false;
    for (let ring = 0; ring < 120 && !placed; ring++) {
      // Candidates on this ring, nearest first.
      const candidates: [number, number][] = [];
      for (let gx = -ring; gx <= ring; gx++) {
        for (let gy = -ring; gy <= ring; gy++) {
          if (Math.max(Math.abs(gx), Math.abs(gy)) !== ring) continue;
          candidates.push([s.x + gx * STEP, s.y + gy * STEP * 0.6]);
        }
      }
      candidates.sort(
        (a, b) =>
          Math.hypot(a[0] - s.x, a[1] - s.y) -
          Math.hypot(b[0] - s.x, b[1] - s.y),
      );
      for (const [x, y] of candidates) {
        if (clear(x, y, me)) {
          s.x = Math.round(x * 10) / 10;
          s.y = Math.round(y * 10) / 10;
          placed = true;
          break;
        }
      }
    }
    taken.push({ x: s.x, y: s.y, ...me });
  }

  return { hubs, stars };
}

export const MAP = layoutMap();
