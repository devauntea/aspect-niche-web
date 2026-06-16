"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

const ACCENT_DARK: Record<string, string> = {
  "#D4537E": "#993556",
  "#7F77DD": "#534AB7",
  "#EF9F27": "#854F0B",
  "#1D9E75": "#0F6E56",
  "#378ADD": "#185FA5",
  "#D85A30": "#993C1D",
  "#639922": "#3B6D11",
};

interface OrbitalActivityData {
  label: string;
  color: string;
}

function OrbitalActivityNode({ data, selected }: NodeProps) {
  const { label, color } = data as unknown as OrbitalActivityData;
  const darkColor = ACCENT_DARK[color] ?? color;

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
      }}
    >
      {/* Handles centered on ring */}
      <Handle type="source" position={Position.Top} style={handleStyle} />
      <Handle type="target" position={Position.Top} style={handleStyle} />

      {/* Ring */}
      <div
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          flexShrink: 0,
          background: selected ? color : "white",
          border: `3px solid ${color}`,
          boxShadow: selected
            ? `0 0 0 5px ${color}28, 0 4px 14px ${color}55`
            : `0 2px 8px ${color}40`,
          transition: "all 0.18s ease",
        }}
      />

      {/* Label chip */}
      <div
        style={{
          fontSize: selected ? 12 : 11,
          fontWeight: selected ? 700 : 500,
          color: darkColor,
          background: "rgba(253,251,246,0.9)",
          padding: "1px 6px",
          borderRadius: 6,
          whiteSpace: "nowrap",
          lineHeight: 1.5,
          transition: "all 0.18s ease",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default memo(OrbitalActivityNode);
