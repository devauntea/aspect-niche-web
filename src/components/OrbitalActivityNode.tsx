"use client";

// Activity node: a small glowing star-core with a haloed label beneath it.
// Category shows as the hue of the glow (data.color = starHue), never a loud
// fill. Selected nodes ignite (CSS .node-ignite) and gain a fine orbital ring.

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { constellation, motionTokens, nightSky } from "@/lib/theme";
import type { NodeVisualState } from "@/types/graph";

interface OrbitalActivityData {
  label: string;
  color: string;
  visualState: NodeVisualState;
}

const CORE = 12;
const CORE_SELECTED = 16;
const RING = 34;

function OrbitalActivityNode({ data, selected }: NodeProps) {
  const d = data as unknown as OrbitalActivityData;
  const { label, color } = d;
  const visualState = d.visualState ?? "idle";
  const hovered = visualState === "active" && !selected;
  const lit = hovered || selected || visualState === "neighbor";

  const core = selected ? CORE_SELECTED : CORE;

  // Handles sit at the star-core center
  const handleStyle: React.CSSProperties = {
    opacity: 0,
    top: RING / 2,
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1,
    height: 1,
    minWidth: 1,
    minHeight: 1,
    border: "none",
    background: "none",
  };

  const glow = selected
    ? `0 0 10px ${color}, 0 0 26px color-mix(in srgb, ${color} 67%, transparent), 0 0 48px color-mix(in srgb, ${color} 33%, transparent)`
    : hovered
      ? `0 0 8px color-mix(in srgb, ${color} 93%, transparent), 0 0 22px color-mix(in srgb, ${color} 53%, transparent)`
      : lit
        ? `0 0 7px color-mix(in srgb, ${color} 80%, transparent), 0 0 16px color-mix(in srgb, ${color} 33%, transparent)`
        : `0 0 6px color-mix(in srgb, ${color} 60%, transparent), 0 0 12px color-mix(in srgb, ${color} 20%, transparent)`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        transform: hovered
          ? "scale(var(--hover-scale-minor, 1.15))"
          : "scale(1)",
        transformOrigin: "center top",
        transition: `transform ${motionTokens.hoverMs}ms ease`,
      }}
    >
      <Handle type="source" position={Position.Top} style={handleStyle} />
      <Handle type="target" position={Position.Top} style={handleStyle} />

      {/* Ring slot keeps the label from shifting when the core resizes */}
      <div
        style={{
          width: RING,
          height: RING,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* Fine orbital ring — selected only */}
        {selected && (
          <svg
            width={RING}
            height={RING}
            viewBox={`0 0 ${RING} ${RING}`}
            className="orbital-ring"
            style={{ position: "absolute", inset: 0 }}
            aria-hidden
          >
            <circle
              cx={RING / 2}
              cy={RING / 2}
              r={RING / 2 - 1}
              fill="none"
              stroke={color}
              strokeWidth={1}
              strokeDasharray="3 5"
              opacity={0.85}
            />
          </svg>
        )}
        <div
          className="star-core"
          style={{
            width: core,
            height: core,
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 35%, ${nightSky.starlight}, ${color} 70%)`,
            boxShadow: glow,
            transition: `box-shadow ${motionTokens.hoverMs}ms ease, width ${motionTokens.hoverMs}ms ease, height ${motionTokens.hoverMs}ms ease`,
          }}
        />
      </div>

      {/* Label — Inter with a soft dark halo; minor labels fade at low zoom */}
      <div
        className="star-label-minor"
        style={{
          fontSize: lit ? 12.5 : 12,
          fontWeight: lit ? 600 : 400,
          color: lit ? constellation.labelText : constellation.labelDim,
          whiteSpace: "nowrap",
          lineHeight: 1.4,
          letterSpacing: "0.01em",
          textShadow:
            "0 0 6px var(--color-bg), 0 0 12px var(--color-bg), 0 1px 3px color-mix(in srgb, var(--color-bg) 90%, transparent)",
          transition: `color ${motionTokens.hoverMs}ms ease`,
          ...(lit ? { opacity: 1 } : null),
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default memo(OrbitalActivityNode);
