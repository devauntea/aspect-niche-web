"use client";

import { useMemo, useCallback, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  Panel,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { HobbyNode, HobbyEdge } from "@/types/graph";
import OrbitNode from "./OrbitNode";
import OrbitalActivityNode from "./OrbitalActivityNode";
import OrbitRingNode from "./OrbitRingNode";

const nodeTypes = {
  orbitInterest: OrbitNode,
  orbitalActivity: OrbitalActivityNode,
  orbitRing: OrbitRingNode,
};

type Props = {
  nodes: HobbyNode[];
  edges: HobbyEdge[];
  selectedId: string | null;
  expandedInterests: Set<string>;
  onSelectNode: (id: string | null) => void;
  newNodeId?: string | null;
  onCollapseAll: () => void;
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

// Must be inside ReactFlow context to use useReactFlow
function GraphControls({
  selectedId,
  focusMode,
  onToggleFocusMode,
  onResetLayout,
  onCollapseAll,
}: {
  selectedId: string | null;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  onResetLayout: () => void;
  onCollapseAll: () => void;
}) {
  const { fitView } = useReactFlow();
  const [spin, setSpin] = useState(false);

  function handleReset() {
    onResetLayout();
    setSpin(true);
    setTimeout(() => {
      fitView({ padding: 0.3 });
      setSpin(false);
    }, 60);
  }

  function handleCollapse() {
    onCollapseAll();
    setTimeout(() => fitView({ padding: 0.3 }), 100);
  }

  const baseBtn: React.CSSProperties = {
    width: 40,
    height: 40,
    minWidth: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    transition: "background 0.15s",
    flexShrink: 0,
  };

  return (
    <>
      <Panel position="top-left" style={{ margin: 8 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            background: "white",
            border: "1px solid #E8E4DA",
            borderRadius: 12,
            padding: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Reset Layout */}
          <button
            onClick={handleReset}
            title="Reset node positions"
            style={baseBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F0EDE6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                transition: spin ? "transform 0.4s ease" : "none",
                transform: spin ? "rotate(360deg)" : "rotate(0deg)",
              }}
            >
              <path
                d="M13.5 8A5.5 5.5 0 1 1 10.2 3.2"
                stroke="#5A5855"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M10 1.5L10.5 4H13"
                stroke="#5A5855"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Collapse All */}
          <button
            onClick={handleCollapse}
            title="Collapse all activities"
            style={baseBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F0EDE6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3L6.5 6.5M13 3L9.5 6.5M3 13L6.5 9.5M13 13L9.5 9.5"
                stroke="#5A5855"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Focus Mode */}
          <button
            onClick={selectedId ? onToggleFocusMode : undefined}
            title="Focus on selected node"
            style={{
              ...baseBtn,
              background: focusMode && selectedId ? "#7F77DD14" : "transparent",
              opacity: selectedId ? 1 : 0.38,
              cursor: selectedId ? "pointer" : "default",
            }}
            onMouseEnter={(e) => {
              if (!selectedId) return;
              e.currentTarget.style.background = focusMode ? "#7F77DD22" : "#F0EDE6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                focusMode && selectedId ? "#7F77DD14" : "transparent";
            }}
            onMouseDown={(e) => {
              if (selectedId) e.currentTarget.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="3"
                stroke={focusMode && selectedId ? "#7F77DD" : "#5A5855"}
                strokeWidth="1.5"
              />
              <path
                d="M8 1.5V3.5M8 12.5V14.5M1.5 8H3.5M12.5 8H14.5"
                stroke={focusMode && selectedId ? "#7F77DD" : "#5A5855"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </Panel>

      {focusMode && (
        <Panel position="top-right" style={{ margin: 8 }}>
          <button
            onClick={onToggleFocusMode}
            style={{
              background: "white",
              border: "1px solid #E8E4DA",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: "#5A5855",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Exit focus ×
          </button>
        </Panel>
      )}
    </>
  );
}

export default function GraphCanvas({
  nodes: hobbyNodes,
  edges: hobbyEdges,
  selectedId,
  expandedInterests,
  onSelectNode,
  newNodeId,
  onCollapseAll,
}: Props) {
  const [posOverrides, setPosOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const [focusMode, setFocusMode] = useState(false);
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);

  // Reset focus mode whenever the selected node changes (update-during-render)
  if (selectedId !== prevSelectedId) {
    setPrevSelectedId(selectedId);
    if (focusMode) setFocusMode(false);
  }

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
          // Skip derived ring nodes — their positions are re-computed from interest posOverrides
          if (change.id.startsWith("ring-")) continue;
          changed = true;
          const hobbyNode = hobbyNodes.find((n) => n.id === change.id);
          if (!hobbyNode || hobbyNode.type !== "interest") {
            next[change.id] = change.position;
            continue;
          }
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

  const connectedIds = useMemo(() => {
    if (!selectedId) return null;
    const s = new Set<string>([selectedId]);
    for (const e of hobbyEdges) {
      if (e.source === selectedId) s.add(e.target);
      if (e.target === selectedId) s.add(e.source);
    }
    return s;
  }, [selectedId, hobbyEdges]);

  const focusModeActive = focusMode && selectedId !== null;

  const flowNodes: Node[] = useMemo(() => {
    const result: Node[] = [];

    for (const n of hobbyNodes) {
      const isSelected = n.id === selectedId;
      const isInterest = n.type === "interest";
      const color = n.color ?? "#7F77DD";
      const position = posOverrides[n.id] ?? n.position;
      const dimmed = connectedIds !== null && !connectedIds.has(n.id);
      const isHiddenByFocus =
        focusModeActive && connectedIds !== null && !connectedIds.has(n.id);

      if (isInterest) {
        const interest = n.data as { activityIds: string[] };
        const childColors = (interest.activityIds ?? [])
          .slice(0, 6)
          .map((id: string) => ACTIVITY_COLORS[id] ?? color);

        result.push({
          id: n.id,
          position,
          type: "orbitInterest",
          selected: isSelected,
          hidden: isHiddenByFocus,
          zIndex: 10,
          className: n.id === newNodeId ? "node-new" : undefined,
          style: {
            opacity: dimmed ? 0.4 : 1,
            transition: "opacity 0.2s ease",
          },
          data: {
            label: n.label,
            color,
            isExpanded: expandedInterests.has(n.id),
            childCount: (interest.activityIds ?? []).length,
            childColors,
          },
        });

        // Orbit ring node — behind all other nodes, only when expanded
        if (expandedInterests.has(n.id) && !isHiddenByFocus) {
          result.push({
            id: `ring-${n.id}`,
            // Center the 260×260 ring on the interest node center (interest is 120×120, center = +60)
            position: { x: position.x - 70, y: position.y - 70 },
            type: "orbitRing",
            draggable: false,
            selectable: false,
            focusable: false,
            deletable: false,
            zIndex: -1,
            data: { color },
            style: {
              pointerEvents: "none" as const,
              opacity: dimmed ? 0.4 : 1,
              transition: "opacity 0.2s ease",
            },
          });
        }
      } else {
        // Activity / custom niche node → orbitalActivity
        result.push({
          id: n.id,
          position,
          type: "orbitalActivity",
          selected: isSelected,
          hidden: isHiddenByFocus,
          zIndex: isSelected ? 20 : 5,
          className: n.id === newNodeId ? "node-new" : undefined,
          style: {
            opacity: dimmed ? 0.35 : 1,
            transition: "opacity 0.2s ease",
          },
          data: {
            label: n.label,
            color,
          },
        });
      }
    }

    return result;
  }, [
    hobbyNodes,
    selectedId,
    expandedInterests,
    posOverrides,
    connectedIds,
    newNodeId,
    focusModeActive,
  ]);

  const flowEdges: Edge[] = useMemo(
    () =>
      hobbyEdges.map((e) => {
        const src = hobbyNodes.find((n) => n.id === e.source);
        const edgeColor = src?.color ?? "#D3D0C8";
        const isHighlighted =
          selectedId !== null &&
          (e.source === selectedId || e.target === selectedId);
        const isDimmed = selectedId !== null && !isHighlighted;
        const isHiddenByFocus = focusModeActive && !isHighlighted;
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          animated: false,
          hidden: isHiddenByFocus,
          style: {
            stroke: edgeColor,
            strokeWidth: isHighlighted ? 2 : 1.5,
            opacity: isHighlighted ? 0.7 : isDimmed ? 0.12 : 0.4,
            transition: "opacity 0.2s ease, stroke-width 0.2s ease",
          },
        };
      }),
    [hobbyEdges, hobbyNodes, selectedId, focusModeActive],
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      // Ring nodes are purely visual — ignore clicks on them
      if (node.id.startsWith("ring-")) return;
      onSelectNode(node.id);
    },
    [onSelectNode],
  );

  return (
    <div
      className="h-[500px] w-full overflow-hidden rounded-2xl border border-[#E8E4DA]"
      style={{
        background: focusModeActive ? "#F5F2EA" : "#FDFBF6",
        transition: "background 0.3s ease",
      }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodesChange={handleNodesChange}
        onPaneClick={() => onSelectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#E8E4DA" gap={32} size={1} />
        <Controls
          showInteractive={false}
          style={{
            background: "white",
            border: "1px solid #E8E4DA",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        />
        <GraphControls
          selectedId={selectedId}
          focusMode={focusMode}
          onToggleFocusMode={() => setFocusMode((f) => !f)}
          onResetLayout={() => setPosOverrides({})}
          onCollapseAll={onCollapseAll}
        />
      </ReactFlow>
    </div>
  );
}
