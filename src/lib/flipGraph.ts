import { activities, interests } from "@/data/activities";
import type { Activity, HobbyEdge, HobbyNode } from "@/types/graph";
import {
  entryDate,
  focusLayout,
  progressEntries,
  type HobbyPhoto,
  type PinnedNote,
} from "@/lib/progress";
import { applyForceLayout } from "@/lib/forceLayout";

// The flipped side of the graph: what you have, rather than what there is.
//
// Ported from the mobile app. Two views. **Collected** is every hobby in the
// collection and nothing else.
// **Focus** is one of them with its own photos and pinned notes sprouting
// around it. Both build plain node and edge lists, which is all GraphCanvas
// wants, so the flip is a change of data rather than a second canvas.
//
// The rule that shapes both: nothing here is invented. The collected view keeps
// only the edges whose two ends are *both* collected, and draws nothing between
// hobbies that merely happen to be in the collection together. A record you can
// trust is the whole point of the side, and a graph that quietly connects two
// things you never connected is not one.

export type GraphView =
  | { kind: "discovery" }
  | { kind: "collected" }
  | { kind: "focus"; hobbyId: string };

/** Ring radius for the collected overview, before the force pass relaxes it. */
const SEED_RADIUS = 150;

/**
 * The collection as a graph.
 *
 * Seeded on a circle and then relaxed by the same force pass the discovery side
 * uses, so a collection with no shared clusters still spreads out evenly rather
 * than sitting in a perfect ring — a ring reads as a chart, and this is meant
 * to read as a constellation you built.
 */
export function collectedGraph(collectedIds: string[]): {
  nodes: HobbyNode[];
  edges: HobbyEdge[];
} {
  const owned = collectedIds
    .map((id) => activities.find((a) => a.id === id))
    .filter((a): a is Activity => !!a);
  if (owned.length === 0) return { nodes: [], edges: [] };

  const nodes: HobbyNode[] = owned.map((activity, i) => {
    const angle = (i / owned.length) * Math.PI * 2 - Math.PI / 2;
    // A lone hobby belongs in the middle, not out on a radius of its own.
    const radius = owned.length === 1 ? 0 : SEED_RADIUS;
    return {
      id: activity.id,
      label: activity.label,
      type: "activity",
      data: activity,
      // Around the origin: React Flow fits the viewport to the node bounds, so
      // unlike the app's fixed SVG world there is no centre to offset from.
      position: {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      },
    };
  });

  const present = new Set(owned.map((a) => a.id));
  const edges: HobbyEdge[] = [];
  const seen = new Set<string>();
  for (const interest of interests) {
    // Both ends collected, or no edge. Two hobbies sharing a cluster is a real
    // relationship; two hobbies sharing only your collection is not.
    const inside = interest.activityIds.filter((id) => present.has(id));
    for (let i = 0; i < inside.length; i += 1) {
      for (let j = i + 1; j < inside.length; j += 1) {
        const [a, b] = [inside[i], inside[j]].sort();
        const id = `col-${a}-${b}`;
        if (seen.has(id)) continue;
        seen.add(id);
        edges.push({ id, source: a, target: b });
      }
    }
  }

  return { nodes: applyForceLayout(nodes, edges), edges };
}

/**
 * One hobby and its record.
 *
 * The hobby sits at the origin and its entries ring it, at positions derived
 * from their index alone so the same hobby opens the same way every time. Every
 * edge runs from the hobby to an entry and never between entries: two photos
 * taken a month apart are both about the hobby, not about each other.
 */
export function focusGraph(
  hobbyId: string,
  photos: HobbyPhoto[],
  notes: PinnedNote[],
): { nodes: HobbyNode[]; edges: HobbyEdge[] } {
  const activity = activities.find((a) => a.id === hobbyId);
  if (!activity) return { nodes: [], edges: [] };

  const centre: HobbyNode = {
    id: activity.id,
    label: activity.label,
    type: "activity",
    data: activity,
    position: { x: 0, y: 0 },
  };

  const entries = progressEntries(photos, notes);
  const spots = focusLayout(entries.length);
  const nodes: HobbyNode[] = [centre];
  const edges: HobbyEdge[] = [];

  entries.forEach((entry, i) => {
    const { label, text } = entryDate(entry);
    nodes.push({
      id: entry.id,
      // The label is the kind; the date sits under it as its own line, which
      // is what keeps a long note from becoming the node.
      label: entry.kind === "photo" ? "Photo" : "Note",
      type: entry.kind,
      data: entry,
      position: { x: spots[i].x, y: spots[i].y },
      sublabel: text ? `${label} ${text}` : label,
      // An entry above the hobby has its edge running down from it, and a
      // label under the node would be written across that line.
      labelAbove: spots[i].y < 0,
    });
    edges.push({
      id: `focus-${activity.id}-${entry.id}`,
      source: activity.id,
      target: entry.id,
    });
  });

  return { nodes, edges };
}
