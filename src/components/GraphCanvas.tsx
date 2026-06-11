"use client";

import { useMemo, useCallback, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { HobbyNode, HobbyEdge } from "@/types/graph";
import OrbitNode from "./OrbitNode";

const nodeTypes = { orbitInterest: OrbitNode };

type Props = {
  nodes: HobbyNode[];
  edges: HobbyEdge[];
  selectedId: string | null;
  expandedInterests: Set<string>;
  onSelectNode: (id: string) => void;
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
  surfing: "#378ADD",
  skateboarding: "#D85A30",
  archery: "#639922",
  fencing: "#7F77DD",
  parkour: "#D4537E",
  astronomy: "#7F77DD",
  geology: "#D85A30",
  mycology: "#639922",
  foraging: "#1D9E75",
  birdwatching: "#378ADD",
  "marine-biology": "#378ADD",
  calligraphy: "#7F77DD",
  bookbinding: "#D85A30",
  glassblowing: "#EF9F27",
  leatherwork: "#D85A30",
  blacksmithing: "#D85A30",
  weaving: "#D4537E",
  "language-learning": "#378ADD",
  philosophy: "#7F77DD",
  chess: "#1A1916",
  investing: "#639922",
  journaling: "#D4537E",
  meditation: "#7F77DD",
  volunteering: "#1D9E75",
  genealogy: "#EF9F27",
  "urban-exploration": "#D85A30",
};

export default function GraphCanvas({
  nodes: hobbyNodes,
  edges: hobbyEdges,
  selectedId,
  expandedInterests,
  onSelectNode,
}: Props) {
  const [posOverrides, setPosOverrides] = useState<Record<string, { x: number; y: number }>>({});

  // Map each interest node to its activity children for cluster dragging
  const interestChildMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const edge of hobbyEdges) {
      if (!map[edge.source]) map[edge.source] = [];
      map[edge.source].push(edge.target);
    }
    return map;
  }, [hobbyEdges]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setPosOverrides((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const change of changes) {
          if (change.type !== "position" || !change.position) continue;
          changed = true;
          const hobbyNode = hobbyNodes.find((n) => n.id === change.id);
          if (!hobbyNode || hobbyNode.type !== "interest") {
            next[change.id] = change.position;
            continue;
          }
          // Move interest node and all visible children together
          const prevPos = prev[change.id] ?? hobbyNode.position;
          const dx = change.position.x - prevPos.x;
          const dy = change.position.y - prevPos.y;
          next[change.id] = change.position;
          for (const childId of interestChildMap[change.id] ?? []) {
            const childNode = hobbyNodes.find((n) => n.id === childId);
            if (!childNode) continue;
            const childPos = prev[childId] ?? childNode.position;
            next[childId] = { x: childPos.x + dx, y: childPos.y + dy };
          }
        }
        return changed ? next : prev;
      });
    },
    [hobbyNodes, interestChildMap],
  );

  const flowNodes: Node[] = useMemo(
    () =>
      hobbyNodes.map((n) => {
        const isSelected = n.id === selectedId;
        const isInterest = n.type === "interest";
        const color = n.color ?? "#7F77DD";
        const position = posOverrides[n.id] ?? n.position;

        if (isInterest) {
          const interest = n.data as { activityIds: string[] };
          const childColors = (interest.activityIds ?? [])
            .slice(0, 6)
            .map((id: string) => ACTIVITY_COLORS[id] ?? color);

          return {
            id: n.id,
            position,
            type: "orbitInterest",
            selected: isSelected,
            data: {
              label: n.label,
              color,
              isExpanded: expandedInterests.has(n.id),
              childCount: (interest.activityIds ?? []).length,
              childColors,
            },
          };
        }

        // Activity node — standard styled
        return {
          id: n.id,
          position,
          data: { label: n.label },
          style: {
            background: isSelected ? color : "#FDFCF8",
            color: isSelected ? "#FFFFFF" : "#1A1916",
            border: isSelected
              ? `2px solid ${color}`
              : `1.5px solid ${color}40`,
            borderRadius: 12,
            padding: "7px 14px",
            fontWeight: isSelected ? 500 : 400,
            fontSize: 12,
            boxShadow: isSelected
              ? `0 0 0 4px ${color}28, 0 6px 20px ${color}35`
              : "0 1px 3px rgba(0,0,0,0.05)",
            transition: "all 0.18s ease",
            minWidth: 90,
            maxWidth: 130,
            textAlign: "center" as const,
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        };
      }),
    [hobbyNodes, selectedId, expandedInterests, posOverrides],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      hobbyEdges.map((e) => {
        const src = hobbyNodes.find((n) => n.id === e.source);
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          animated: false,
          style: {
            stroke: src?.color ?? "#D3D0C8",
            strokeWidth: 1.5,
            opacity: 0.35,
          },
        };
      }),
    [hobbyEdges, hobbyNodes],
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => onSelectNode(node.id),
    [onSelectNode],
  );

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-[#E8E4DA] bg-[#FDFCF8]">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodesChange={handleNodesChange}
        fitView
        fitViewOptions={{ padding: 0.45 }}
        minZoom={0.25}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#E8E4DA" gap={28} size={1} />
        <Controls
          showInteractive={false}
          style={{
            background: "white",
            border: "1px solid #E8E4DA",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        />
      </ReactFlow>
    </div>
  );
}
