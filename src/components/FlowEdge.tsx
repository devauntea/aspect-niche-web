"use client";

// Constellation edge: hairline violet at rest — calm by default. Edges in the
// active neighborhood brighten and carry a slow starlight pulse traveling
// along the path (.edge-comet in globals.css; removed under reduced motion).

import { memo } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";
import { constellation } from "@/lib/theme";
import type { NodeVisualState } from "@/types/graph";

interface FlowEdgeData {
  visualState: NodeVisualState;
  hue?: string | null;
}

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
  const { visualState, hue } = data as unknown as FlowEdgeData;
  // Themes opt into hue-tinted edges via --edge-hue-mix (0% = theme edge)
  const stroke = hue
    ? `color-mix(in srgb, ${hue} var(--edge-hue-mix, 0%), var(--graph-edge))`
    : "var(--graph-edge)";
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

  return (
    <g style={{ opacity, transition: "opacity 0.24s ease" }}>
      <path
        id={id}
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={highlighted ? edge.highlightWidth : edge.idleWidth}
        style={{
          filter: highlighted ? `drop-shadow(0 0 3px ${stroke})` : "none",
          transition: "stroke-width 0.24s ease",
        }}
      />
      {/* Traveling light-pulse — live edges only */}
      {highlighted && (
        <path
          className="edge-comet"
          d={path}
          fill="none"
          stroke="var(--graph-edge-active)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="14 220"
          style={{
            ["--edge-pulse-duration" as string]: `${edge.pulseMs}ms`,
          }}
        />
      )}
    </g>
  );
}

export default memo(FlowEdge);
