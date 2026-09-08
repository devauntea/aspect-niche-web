"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
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
import type { HobbyNode, HobbyEdge, NodeVisualState } from "@/types/graph";
import OrbitNode from "./OrbitNode";
import OrbitalActivityNode from "./OrbitalActivityNode";
import OrbitRingNode from "./OrbitRingNode";
import ProgressNode from "./ProgressNode";
import FlowEdge from "./FlowEdge";
import GraphBackground from "./GraphBackground";
import {
  motionTokens,
  constellation,
  starHues,
  nightSky,
  durations,
} from "@/lib/theme";

const nodeTypes = {
  orbitInterest: OrbitNode,
  orbitalActivity: OrbitalActivityNode,
  orbitRing: OrbitRingNode,
  // Only ever rendered on the flipped graph, in focus mode.
  progressPhoto: ProgressNode,
  progressNote: ProgressNode,
};

const edgeTypes = {
  flow: FlowEdge,
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

// Must be inside ReactFlow context to use useReactFlow.
// Two-stage focus: the camera eases onto the selected node + neighbors first
// (the graph reacts before the card arrives), then settles once the dock has
// reflowed the canvas width. Deselect eases back out to the whole graph.
function CameraFocus({
  selectedId,
  edges,
}: {
  selectedId: string | null;
  edges: HobbyEdge[];
}) {
  const { fitView } = useReactFlow();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedId === prevId.current) return;
    const isFirst = prevId.current === null && selectedId === null;
    prevId.current = selectedId;
    if (isFirst) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduced ? 0 : motionTokens.cameraMs;

    if (!selectedId) {
      // Release after the dock has slid out, so both motions read as one arc
      const t = setTimeout(
        () => {
          fitView({ padding: 0.35, duration });
        },
        reduced ? 0 : motionTokens.cardDurationMs,
      );
      return () => clearTimeout(t);
    }

    const targets = [{ id: selectedId }];
    for (const e of edges) {
      if (e.source === selectedId) targets.push({ id: e.target });
      if (e.target === selectedId) targets.push({ id: e.source });
    }
    // On narrow screens the card is a bottom sheet — bias the frame upward so
    // the focused node stays visible above it.
    const narrow = window.innerWidth < 768;
    const padding = narrow
      ? { top: 0.15, left: 0.15, right: 0.15, bottom: "55%" as const }
      : 0.4;

    // Stage 1: react immediately (next frame, so newly expanded nodes exist)
    const t1 = setTimeout(() => {
      fitView({ nodes: targets, padding, duration, maxZoom: 1.15 });
    }, 40);
    // Stage 2: the dock has finished reflowing the canvas — settle the frame
    const t2 = setTimeout(
      () => {
        fitView({
          nodes: targets,
          padding,
          duration: reduced ? 0 : 300,
          maxZoom: 1.15,
        });
      },
      reduced
        ? 60
        : motionTokens.cardDelayMs + motionTokens.cardDurationMs + 80,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [selectedId, edges, fitView]);

  return null;
}

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
            background: constellation.glassBg,
            border: `1px solid ${constellation.glassBorder}`,
            borderRadius: 12,
            padding: 4,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Reset Layout */}
          <button
            onClick={handleReset}
            title="Reset node positions"
            style={baseBtn}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.95)")
            }
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
                stroke="#B9B4E8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M10 1.5L10.5 4H13"
                stroke="#B9B4E8"
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.95)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3L6.5 6.5M13 3L9.5 6.5M3 13L6.5 9.5M13 13L9.5 9.5"
                stroke="#B9B4E8"
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
              background:
                focusMode && selectedId ? "var(--color-glow)30" : "transparent",
              opacity: selectedId ? 1 : 0.38,
              cursor: selectedId ? "pointer" : "default",
            }}
            onMouseEnter={(e) => {
              if (!selectedId) return;
              e.currentTarget.style.background = focusMode
                ? "var(--color-glow)40"
                : "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                focusMode && selectedId ? "var(--color-glow)30" : "transparent";
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
                stroke={focusMode && selectedId ? "#A79FF0" : "#B9B4E8"}
                strokeWidth="1.5"
              />
              <path
                d="M8 1.5V3.5M8 12.5V14.5M1.5 8H3.5M12.5 8H14.5"
                stroke={focusMode && selectedId ? "#A79FF0" : "#B9B4E8"}
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
              background: constellation.glassBg,
              border: `1px solid ${constellation.glassBorder}`,
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: constellation.glassIcon,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              backdropFilter: "blur(8px)",
              transition: "all 0.15s",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.95)")
            }
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
  const [posOverrides, setPosOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [focusMode, setFocusMode] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  // Hover takes precedence over selection for the live neighborhood, so
  // exploring stays responsive while a card is open.
  const activeId = hoveredId ?? selectedId;

  const connectedIds = useMemo(() => {
    if (!activeId) return null;
    const s = new Set<string>([activeId]);
    for (const e of hobbyEdges) {
      if (e.source === activeId) s.add(e.target);
      if (e.target === activeId) s.add(e.source);
    }
    return s;
  }, [activeId, hobbyEdges]);

  // Focus mode still isolates the *selected* node's neighborhood
  const focusIds = useMemo(() => {
    if (!selectedId) return null;
    const s = new Set<string>([selectedId]);
    for (const e of hobbyEdges) {
      if (e.source === selectedId) s.add(e.target);
      if (e.target === selectedId) s.add(e.source);
    }
    return s;
  }, [selectedId, hobbyEdges]);

  const visualStateFor = useCallback(
    (id: string): NodeVisualState => {
      if (!activeId) return "idle";
      if (id === activeId) return "active";
      return connectedIds?.has(id) ? "neighbor" : "dim";
    },
    [activeId, connectedIds],
  );

  const focusModeActive = focusMode && selectedId !== null;

  // Category → star-glow hue: interests own a hue, their activities inherit it
  const hueFor = useMemo(() => {
    const map: Record<string, string> = {};
    for (const n of hobbyNodes) {
      if (n.type === "interest")
        map[n.id] = starHues[n.id] ?? nightSky.violetGlow;
    }
    for (const e of hobbyEdges) {
      if (map[e.source] && !map[e.target]) map[e.target] = map[e.source];
    }
    return map;
  }, [hobbyNodes, hobbyEdges]);

  const flowNodes: Node[] = useMemo(() => {
    const result: Node[] = [];

    for (const n of hobbyNodes) {
      const isSelected = n.id === selectedId;
      const isInterest = n.type === "interest";
      const color = hueFor[n.id] ?? nightSky.violetGlow;
      const position = posOverrides[n.id] ?? n.position;
      const visualState = visualStateFor(n.id);
      const dimmed = visualState === "dim";
      const isHiddenByFocus =
        focusModeActive && focusIds !== null && !focusIds.has(n.id);

      if (n.type === "photo" || n.type === "note") {
        const entry = n.data as {
          kind: "photo" | "note";
          photo?: { uri: string };
          note?: { body: string };
        };
        result.push({
          id: n.id,
          position,
          type: n.type === "photo" ? "progressPhoto" : "progressNote",
          selected: isSelected,
          zIndex: isSelected ? 30 : 12,
          data: {
            label: n.label,
            sublabel: n.sublabel,
            labelAbove: n.labelAbove,
            thumbnail: entry.photo?.uri,
            noteExcerpt: entry.note?.body,
          },
        });
        continue;
      }

      if (isInterest) {
        const interest = n.data as { activityIds: string[] };

        result.push({
          id: n.id,
          position,
          type: "orbitInterest",
          selected: isSelected,
          hidden: isHiddenByFocus,
          zIndex: visualState === "active" ? 30 : 10,
          className:
            [
              n.id === newNodeId ? "node-new" : "",
              isSelected ? "node-ignite" : "",
            ]
              .join(" ")
              .trim() || undefined,
          style: {
            opacity: dimmed ? constellation.dimmedNodeOpacity : 1,
          },
          data: {
            label: n.label,
            color,
            isExpanded: expandedInterests.has(n.id),
            childCount: (interest.activityIds ?? []).length,
            visualState,
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
              opacity: dimmed ? constellation.dimmedNodeOpacity : 1,
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
          zIndex: visualState === "active" ? 30 : isSelected ? 20 : 5,
          className:
            [
              n.id === newNodeId ? "node-new" : "",
              isSelected ? "node-ignite" : "",
            ]
              .join(" ")
              .trim() || undefined,
          style: {
            opacity: dimmed ? constellation.dimmedNodeOpacity : 1,
          },
          data: {
            label: n.label,
            color,
            visualState,
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
    visualStateFor,
    focusIds,
    newNodeId,
    focusModeActive,
    hueFor,
  ]);

  const flowEdges: Edge[] = useMemo(
    () =>
      hobbyEdges.map((e) => {
        const touchesActive =
          activeId !== null && (e.source === activeId || e.target === activeId);
        const touchesSelected =
          selectedId !== null &&
          (e.source === selectedId || e.target === selectedId);
        const isHiddenByFocus = focusModeActive && !touchesSelected;
        const visualState: NodeVisualState = touchesActive
          ? "active"
          : activeId !== null
            ? "dim"
            : "idle";
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: "flow",
          hidden: isHiddenByFocus,
          data: {
            visualState,
            // Themes can tint edges toward the cluster hue (--edge-hue-mix)
            hue: hueFor[e.target] ?? hueFor[e.source] ?? null,
          },
        };
      }),
    [hobbyEdges, activeId, selectedId, focusModeActive, hueFor],
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      // Ring nodes are purely visual — ignore clicks on them
      if (node.id.startsWith("ring-")) return;
      onSelectNode(node.id);
    },
    [onSelectNode],
  );

  const handleNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    if (node.id.startsWith("ring-")) return;
    setHoveredId(node.id);
  }, []);

  const handleNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoveredId(null);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="constellation relative w-full overflow-hidden rounded-2xl"
      style={{
        height: "calc(100vh - 220px)",
        minHeight: 600,
        background: focusModeActive
          ? constellation.canvasBgFocus
          : constellation.canvasBg,
        border: `1px solid ${constellation.panelBorder}`,
        boxShadow: `inset 0 0 60px rgba(139,124,246,0.05), ${nightSky.raisedGlow}`,
        transition: "background 0.3s ease",
      }}
    >
      {/* Nebula — outer layer eases toward the selected cluster; the inner
          layer carries the theme's own drift animation (e.g. aurora), so the
          two transforms never fight. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-40%",
          pointerEvents: "none",
          transform: selectedId
            ? "translate(0%, 2%) scale(1.06)"
            : "translate(-10%, -9%) scale(1)",
          transition: `transform ${durations.scene}ms ease-out`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "var(--graph-nebula-layer, radial-gradient(ellipse 42% 38% at 50% 46%, var(--graph-nebula), transparent 68%))",
            animation: "var(--nebula-anim, none)",
          }}
        />
      </div>
      <GraphBackground />
      <div
        className="absolute inset-0"
        style={{ zIndex: 1 }}
        onKeyDown={(e) => {
          // React Flow makes nodes focusable but doesn't fire click on Enter —
          // complete the keyboard path: Enter/Space selects the focused node
          if (e.key !== "Enter" && e.key !== " ") return;
          const node = (e.target as HTMLElement).closest?.(
            ".react-flow__node",
          ) as HTMLElement | null;
          const id = node?.getAttribute("data-id");
          if (id && !id.startsWith("ring-")) {
            e.preventDefault();
            onSelectNode(id);
          }
        }}
      >
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          onNodesChange={handleNodesChange}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onPaneClick={() => onSelectNode(null)}
          onMove={(_, viewport) =>
            containerRef.current?.style.setProperty(
              "--graph-zoom",
              String(viewport.zoom),
            )
          }
          fitView
          fitViewOptions={{ padding: 0.35 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          style={{ background: "transparent" }}
        >
          <Background
            color="#8F89C9"
            gap={44}
            size={1}
            style={{ opacity: 0.14 }}
          />
          <Controls showInteractive={false} />
          <GraphControls
            selectedId={selectedId}
            focusMode={focusMode}
            onToggleFocusMode={() => setFocusMode((f) => !f)}
            onResetLayout={() => setPosOverrides({})}
            onCollapseAll={onCollapseAll}
          />
          <CameraFocus selectedId={selectedId} edges={hobbyEdges} />
        </ReactFlow>
      </div>
    </div>
  );
}
