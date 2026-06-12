import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceCenter,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { HobbyNode, HobbyEdge } from "@/types/graph";

type SimNode = SimulationNodeDatum & {
  id: string;
  type: "interest" | "activity";
};

type SimLink = SimulationLinkDatum<SimNode>;

export function applyForceLayout(
  nodes: HobbyNode[],
  edges: HobbyEdge[],
): HobbyNode[] {
  if (nodes.length === 0) return nodes;

  // Seed from provided positions (already arranged in a circle by buildInterestNodes)
  const simNodes: SimNode[] = nodes.map((n) => ({
    id: n.id,
    type: n.type,
    x: n.position.x,
    y: n.position.y,
  }));

  const simLinks: SimLink[] = edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  forceSimulation<SimNode>(simNodes)
    .force(
      "link",
      forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(200)
        .strength(0.4),
    )
    .force(
      "charge",
      forceManyBody<SimNode>().strength((d) =>
        d.type === "interest" ? -600 : -300,
      ),
    )
    .force("collide", forceCollide<SimNode>(80))
    .force("center", forceCenter(320, 280))
    .force("x", forceX<SimNode>(320).strength(0.05))
    .force("y", forceY<SimNode>(280).strength(0.05))
    .stop()
    .tick(300);

  const posMap = new Map(
    simNodes.map((n) => [n.id, { x: n.x ?? n.x ?? 320, y: n.y ?? 280 }]),
  );

  return nodes.map((n) => ({
    ...n,
    position: posMap.get(n.id) ?? n.position,
  }));
}
