"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { constellation, motionTokens } from "@/lib/theme";
import type { NodeVisualState } from "@/types/graph";

interface OrbitalActivityData {
  label: string;
  color: string;
  visualState: NodeVisualState;
}

function OrbitalActivityNode({ data, selected }: NodeProps) {
  const d = data as unknown as OrbitalActivityData;
  const { label, color } = d;
  const visualState = d.visualState ?? "idle";
  const hovered = visualState === "active" && !selected;
  const lit = hovered || selected || visualState === "neighbor";

  const ringSize = selected ? 34 : 24;
  const ringRadius = ringSize / 2;

  // Handle style centers on the ring regardless of ring size
  const handleStyle: React.CSSProperties = {
    opacity: 0,
    top: ringRadius,
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
    ? `0 0 0 5px ${color}30, 0 0 26px ${color}, 0 0 50px ${color}70`
    : hovered
      ? `0 0 20px ${color}CC, 0 0 40px ${color}55`
      : lit
        ? `0 0 14px ${color}99`
        : `0 0 10px ${color}66`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        cursor: "pointer",
        transform: hovered ? "scale(1.18)" : "scale(1)",
        transformOrigin: "center top",
        transition: `transform ${motionTokens.hoverMs}ms ease`,
      }}
    >
      {/* Handles centered on ring */}
      <Handle type="source" position={Position.Top} style={handleStyle} />
      <Handle type="target" position={Position.Top} style={handleStyle} />

      {/* Glowing orb: colored ring, tinted core, solid when selected */}
      <div
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: selected ? color : `${color}26`,
          border: `2.5px solid ${color}`,
          boxShadow: glow,
          transition: `all ${motionTokens.hoverMs}ms ease`,
        }}
      >
        <div
          style={{
            width: selected ? 8 : 6,
            height: selected ? 8 : 6,
            borderRadius: "50%",
            background: selected ? "white" : color,
            boxShadow: selected ? "0 0 6px white" : `0 0 6px ${color}`,
            transition: `all ${motionTokens.hoverMs}ms ease`,
          }}
        />
      </div>

      {/* Label chip — dark glass so it reads on the night canvas */}
      <div
        style={{
          fontSize: selected || hovered ? 12 : 11,
          fontWeight: selected || hovered ? 700 : 500,
          color: lit ? constellation.labelText : `${constellation.labelText}B8`,
          background: constellation.chipBg,
          border: `1px solid ${lit ? `${color}66` : "rgba(255,255,255,0.07)"}`,
          padding: "2px 8px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          lineHeight: 1.5,
          transition: `all ${motionTokens.hoverMs}ms ease`,
          letterSpacing: "0.01em",
          textShadow: lit ? `0 0 12px ${color}80` : "none",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default memo(OrbitalActivityNode);
