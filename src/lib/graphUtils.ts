import type { HobbyNode, HobbyEdge } from "@/types/graph";
import { interests, activities } from "@/data/activities";
import { interestColors, activityColors, colors } from "@/lib/theme";

export function buildInterestNodes(selectedIds: string[]): HobbyNode[] {
  const total = selectedIds.length;
  return selectedIds.map((id, idx) => {
    const interest = interests.find((i) => i.id === id)!;
    const angle = (idx / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
    const r = total === 1 ? 0 : total === 2 ? 220 : total === 3 ? 240 : 260;
    return {
      id,
      label: interest.label,
      type: "interest" as const,
      data: interest,
      color: interestColors[id] ?? colors.brand,
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
  const spread =
    total >= 5 ? Math.PI * 1.4 : Math.min(Math.PI * 1.4, (total - 1) * 0.45);

  return activityIds.flatMap((id, idx) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return [];
    const angle = toCenter + (idx / Math.max(total - 1, 1) - 0.5) * spread;
    const dist = idx % 2 === 0 ? 180 : 210;
    return [
      {
        id,
        label: activity.label,
        type: "activity" as const,
        data: activity,
        color: activityColors[id] ?? colors.brand,
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
