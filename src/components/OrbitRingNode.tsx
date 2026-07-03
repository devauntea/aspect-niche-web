"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";

interface OrbitRingData {
  color: string;
}

// 260×260 SVG centered on the interest node (positioned at interest.x-70, interest.y-70)
// Two concentric dashed rings at r=72 (inner) and r=120 (outer)
function OrbitRingNode({ data }: NodeProps) {
  const { color } = data as unknown as OrbitRingData;

  return (
    <div
      style={{
        width: 260,
        height: 260,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <svg
        width="260"
        height="260"
        viewBox="0 0 260 260"
        fill="none"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <circle
          cx="130"
          cy="130"
          r="72"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 6"
          opacity="0.45"
        />
        <circle
          cx="130"
          cy="130"
          r="120"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 6"
          opacity="0.22"
        />
      </svg>
    </div>
  );
}

export default memo(OrbitRingNode);
