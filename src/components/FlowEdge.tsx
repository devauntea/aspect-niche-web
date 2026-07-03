"use client";

import { memo } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";
import { constellation } from "@/lib/theme";
import type { NodeVisualState } from "@/types/graph";

interface FlowEdgeData {
  color: string;
  visualState: NodeVisualState;
}

// Constellation edge: a soft base stroke plus a drifting dash layer that makes
// the link feel alive. Neighborhood edges brighten and gain a glow; unrelated
// edges recede. The dash animation lives in globals.css (.edge-flow) and is
// disabled under prefers-reduced-motion.
function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const { color, visualState } = data as unknown as FlowEdgeData;
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const { edge } = constellation;
  const highlighted = visualState === "active" || visualState === "neighbor";
  const dimmed = visualState === "dim";

  const opacity = highlighted
    ? edge.highlightOpacity
    : dimmed
      ? edge.dimOpacity
      : edge.idleOpacity;
  const width = highlighted ? edge.highlightWidth : edge.idleWidth;

  return (
    <g style={{ opacity, transition: "opacity 0.25s ease" }}>
      {/* Base stroke */}
      <path
        id={id}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeOpacity={highlighted ? 0.55 : 0.4}
        style={{
          filter: highlighted ? `drop-shadow(0 0 4px ${color})` : "none",
          transition: "stroke-width 0.25s ease",
        }}
      />
      {/* Drifting flow layer — hidden entirely on dimmed edges */}
      {!dimmed && (
        <path
          className="edge-flow"
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeOpacity={highlighted ? 1 : 0.7}
          style={{
            ["--edge-flow-duration" as string]: highlighted
              ? `${edge.flowMs * 0.6}ms`
              : `${edge.flowMs}ms`,
          }}
        />
      )}
    </g>
  );
}

export default memo(FlowEdge);
