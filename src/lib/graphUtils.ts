import type { HobbyNode, HobbyEdge } from "@/types/graph";
import { interests, activities } from "@/data/activities";

const INTEREST_COLORS: Record<string, string> = {
  fitness: "#D4537E",
  creative: "#7F77DD",
  outdoor: "#1D9E75",
  tech: "#378ADD",
  social: "#EF9F27",
  culinary: "#D85A30",
};

const ACTIVITY_COLORS: Record<string, string> = {
  "rock-climbing": "#D4537E",
  zumba: "#EF9F27",
  cycling: "#1D9E75",
  yoga: "#7F77DD",
  running: "#D85A30",
  hiking: "#1D9E75",
  photography: "#7F77DD",
  drawing: "#D4537E",
  music: "#EF9F27",
  pottery: "#D85A30",
  kayaking: "#378ADD",
  coding: "#378ADD",
  "3d-printing": "#639922",
  electronics: "#EF9F27",
  "board-games": "#D4537E",
  improv: "#EF9F27",
  cooking: "#D85A30",
  baking: "#EF9F27",
  coffee: "#D85A30",
  fermentation: "#1D9E75",
  "cooking-club": "#D4537E",
};

export function buildInterestNodes(selectedIds: string[]): HobbyNode[] {
  const total = selectedIds.length;
  return selectedIds.map((id, idx) => {
    const interest = interests.find((i) => i.id === id)!;
    const angle = (idx / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
    const r = total === 1 ? 0 : total <= 3 ? 240 : 320;
    return {
      id,
      label: interest.label,
      type: "interest" as const,
      data: interest,
      color: INTEREST_COLORS[id] ?? "#7F77DD",
      position: {
        x: 300 + Math.cos(angle) * r,
        y: 260 + Math.sin(angle) * r,
      },
    };
  });
}

export function buildActivityNodes(
  interestId: string,
  interestPos: { x: number; y: number },
  centerX: number,
  centerY: number,
): HobbyNode[] {
  const interest = interests.find((i) => i.id === interestId);
  if (!interest) return [];

  const activityIds = interest.activityIds;
  const total = activityIds.length;
  const toCenter = Math.atan2(interestPos.y - centerY, interestPos.x - centerX);
  const spread = Math.min(Math.PI * 1.4, (total - 1) * 0.45);

  return activityIds.flatMap((id, idx) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return [];
    const angle = toCenter + (idx / Math.max(total - 1, 1) - 0.5) * spread;
    const dist = 210;
    return [
      {
        id,
        label: activity.label,
        type: "activity" as const,
        data: activity,
        color: ACTIVITY_COLORS[id] ?? "#7F77DD",
        position: {
          x: interestPos.x + Math.cos(angle) * dist,
          y: interestPos.y + Math.sin(angle) * dist,
        },
      } as HobbyNode,
    ];
  });
}

export function buildVisibleEdges(
  visibleIds: Set<string>,
  selectedInterestIds: string[],
): HobbyEdge[] {
  const edges: HobbyEdge[] = [];
  for (const interest of interests) {
    if (!selectedInterestIds.includes(interest.id)) continue;
    for (const actId of interest.activityIds) {
      if (visibleIds.has(actId)) {
        edges.push({
          id: `e-${interest.id}-${actId}`,
          source: interest.id,
          target: actId,
        });
      }
    }
  }
  return edges;
}
